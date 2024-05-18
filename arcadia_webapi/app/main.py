from fastapi import FastAPI
from dto.custommessage import CustomMessage
from dto.custommessage import MessageSendRequest
from dotenv import load_dotenv
from os.path import join, dirname
from ai_service import AiService
import json
import asyncio
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(verbose=True)
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
GPT_MODEL_NAME = "gpt-4-o"
CLAUDE_MODEL_NAME = "claude-3-opus-20240229"
app = FastAPI()

origins = [
    "https://cloud-run-service-webfront-eumuzuktzq-an.a.run.app",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

system_prompt = """
あなたはテキストシミュレーションゲームのゲームマスターです。ユーザーからの入力に対して、json形式で回答を返してください。（```などで囲む必要はありません）
最初にユーザーから指定された物語をベースにしつつ物語を進めてください。実在しない物語の場合は、与えられたタイトルから自由に面白い物語を作成してください。

### ユーザーの最初の入力例
赤ずきん

### あなたの出力例
{
    "items": [{"name":"お菓子の詰め合わせ", "count":1}, {"name":"ワイン","count":1}],
    "life":3,
    "conversations": [
        {"speaker":"ナレーション", "text":"おばあさんのお見舞いのため、森の中の家に向かう赤ずきんの物語が今始まります。ライフポイントが0になる前にオオカミを倒すことができればゲームクリアです。"},
        {"speaker":"母親", "text":"赤ずきん、これをおばあさんに届けてきなさい。森は危ないからまっすぐ行くのよ。"},
        {"speaker":"赤ずきん", "text":"わかったわお母さん。気をつけるわ。"},
        {"speaker":"ナレーション", "text":"赤ずきんは意気揚々と森の中に入っていった。小鳥のさえずりと木漏れ日が心地よい。"},
        {"speaker":"赤ずきん", "text":"あっ、かわいい花が咲いているわ！ちょっと摘んでいこうかな。"}
    ],
    "voices": {
        "赤ずきん": 1,
        "母親": 2,
    },
    "options":["花を摘んでおばあさんにあげよう","まっすぐおばあさんの家に急ごう","花の写真を撮って記念にしておこう"],
    "tension": 0,
    "crisis":false,
    "finished": false,
    "prompt": "Create an image with a photorealistic quality that looks like a scene from a movie, capturing a pivotal moment in the story of Little Red Riding Hood as narrated. This scene unfolds as Little Red Riding Hood ventures into the forest to visit her grandmother, carrying a basket for her. The atmosphere is serene yet foreboding, with birds chirping and sunlight filtering through the trees. She is momentarily distracted by beautiful flowers, contemplating picking some. This image should capture the beauty and tension of the moment, using cinematic lighting to highlight the contrast between innocence and the lurking dangers of the forest."
}

### あなたの出力のjsonについての説明
#### items
- 所持しているアイテム。物語の進行でアイテムを入手したら増やし、消費したら減らしてください。アイテムを入手・消費した場合は、その旨をconversationsのナレーションで説明してください
#### life
- ライフポイント。初期値は3で0になったらゲームオーバーです。物語の進行でダメージを受けたと判断したら減らし、回復したら増やしてください。ライフポイントが増減した場合は、その旨をconversationsのナレーションで説明してください
#### conversations
- 会話。誰の会話でもない地の文の場合はspeakerには「ナレーション」が入ります
- テキストは全編日本語でお願いします
- conversationの会話履歴は毎回リセットしてください。出力例でいうと、２回目以降の出力では、再び導入ナレーションから始めないでください
#### voices
- 会話の登場人物のボイスを1~8で設定してください。ボイスの種類は以下の通りです。
  - 1: 女の子の声
  - 2: 若い女性の声
  - 3: 中年女性の声
  - 4: 老いた女性の声
  - 5: 男の子の声
  - 6: 若い男性の声
  - 7: 中年男性の声
  - 8: 老いた男性の声
#### options
- ユーザーに提示する選択肢。必ず3択で提示してください。
- 各選択肢には主人公のセリフが入ります。
- 選択肢のうち1つは1つはアイテムの消費に関わるものを含めてください。
- 選択された選択肢に応じて物語を進めてください。
- finished == trueの時は空配列としてください。
#### tension
- その場面の緊張感を1から5の間で設定してください。1が最も緊張感がなく、5が最も緊張感が高いです。
#### crisis
- 危機が発生した場合はtrueにしてください
#### finished
- ゲーム終了時のみtrueにしてください
#### prompt
- 画像生成のためのプロンプト。必ず英語で書いてください
- 物語の情景に合わせて最適なのプロンプトを設定してください
- 物語に適したテイストでクオリティの高い画像を生成するように工夫してください。
- 同じキャラクターを別人として描かないように、登場人物の特徴を細かく指定してください。
- 画像生成のコンテンツポリシーに違反するようなプロンプトを設定しないでください。具体的には、IPの固有名詞などをなるべく避けてください。

### ユーザーからの回答例
自分より弱いやついじめて楽しいか？

### シナリオ（conversations）に関するルール
- あなたの最初の出力のconversationsにて、ナレーションによりユーザーのゲームクリア条件を設定してください。ゲームオーバーの条件はライフポイントが0になることで固定です。
- 指定された物語をベースにしつつも、意外でドラマチックな展開を用意してください
- 物語は緊張と緩和のリズムを持たせてください
- 物語はあまり長引かせず５、６回程度のやり取りで終了するようにしてください
"""


@app.get("/")
async def read_root():
    return {"Hello": "Arcadia"}


# スレッドにメッセージを送信するAPI
@app.post("/message/send")
async def send_message(request: MessageSendRequest):
    ai_service = AiService(GPT_MODEL_NAME, CLAUDE_MODEL_NAME)
    messages = request.messages
    messages.insert(0, CustomMessage(index=0, user_type=0, user_id=0, content=system_prompt))
    last_message = messages[-1]

    # 最後のメッセージがユーザーのメッセージであればAIの返答を生成する
    if last_message.user_type == 1:
        last_message = await generate_ai_messages(ai_service, messages)
        messages.append(last_message)

    if request.init:
        return {"messages": messages[1:], "prepared_messages": []}

    # 最後のAIのメッセージの内容をパースする
    parsed_content = json.loads(last_message.content)

    # 4つの選択肢に対して、先にAIの返答を作成しておく。
    # 理由はクライアントからのリクエストを待ってから生成しては時間がかかるので、クライアントの演出中に先んじて生成しておくことでユーザー体験を向上させるため
    futures = []
    for option in parsed_content["options"]:
        new_messages = messages.copy()
        new_messages.append(CustomMessage(index=len(new_messages), user_type=1, user_id=1, content=option))
        futures.append(generate_ai_messages(ai_service, new_messages))

    # 並列で実行し全てが完了するのを待つ
    prepared_messages = await asyncio.gather(*futures)
    return {"messages": messages[1:], "prepared_messages": prepared_messages}



async def generate_ai_messages(ai_service: AiService, messages: list[CustomMessage]):
    retries = 3  # 最大リトライ回数
    for attempt in range(retries):
        try:
            # 文言の生成
            generated_message = await ai_service.chatGPT(messages)
            # 生成された文言のパース
            parsed_content = json.loads(generated_message.content)
            # 画像の生成
            image_url = await ai_service.generate_image(parsed_content["prompt"])
            generated_message.image_url = image_url
            return generated_message
        except Exception as e:
            if attempt < retries - 1:  # 最後の試行でなければ、リトライする
                await asyncio.sleep(2 ** attempt)  # 指数的バックオフ
            else:
                return CustomMessage(index=len(messages), user_type=2, user_id=1, content=e)


