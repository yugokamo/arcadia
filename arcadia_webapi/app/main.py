from fastapi import FastAPI
from dto.custommessage import CustomMessage
from dto.custommessage import MessageSendRequest
from dotenv import load_dotenv
from os.path import join, dirname
from ai_service import AiService
import json
import asyncio

load_dotenv(verbose=True)
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
GPT_MODEL_NAME = "gpt-4-turbo-preview"
CLAUDE_MODEL_NAME = "claude-3-sonnet-20240229"
app = FastAPI()

system_prompt = """
あなたはテキストシミュレーションゲームのゲームマスターです。ユーザーからの入力に対して、json形式で回答を返してください。（```などで囲む必要はありません）
最初にユーザーから指定された物語をベースにしつつ物語を進めてください。

### ユーザーの最初の入力例
浦島太郎

### あなたの出力例
{
    "items": [{"name":"角砂糖", "count":3}, {"name":"釣竿","count":1}],
    "life":3,
    "conversations": [
        {"speaker":"ナレーション", "text":"ユーザーは浦島太郎としてこの世界を旅します。ライフが残った状態で玉手箱を封印できたらゲームクリアです。"},
        {"speaker":"太郎", "text":"今日は良い天気だな"},
        {"speaker":"太郎", "text":"ん？何か騒がしいな、海辺の方か"},
        {"speaker":"子供A", "text":"ハッハッハ！こいつノロマでやんのー！"},
        {"speaker":"太郎", "text":"あいつら亀をいじめてやがるのか"}
    ],
    "options":["自分より弱いやついじめて楽しいか？","まぁ俺には関係ねえか","角砂糖やるから見逃してやってくれ"],
    "finished": false
    "prompt": "In a serene and picturesque setting by the sea, the timeless Japanese folktale character approaches a sea turtle surrounded by curious children on a sandy beach."
}

### あなたの出力のjsonについての説明
#### items
- 所持しているアイテム。物語の進行でアイテムを入手したら増やし、消費したら減らしてください
#### life
- ライフポイント。初期値は3で0になったらゲームオーバーです。物語の進行でダメージを受けたと判断したら減らし、回復したら増やしてください
#### conversations
- 会話。誰の会話でもない地の文の場合はspeakerには「ナレーション」が入ります
- conversationの会話履歴は毎回リセットしてください。出力例でいうと、２回目以降の出力では、再び導入ナレーションから始めないでください。
#### options
- ユーザーに提示する選択肢。必ず3択で提示してください。
- 各選択肢には主人公のセリフが入ります。
- 選択肢のうち1つは1つはアイテムの消費に関わるものを含めてください。
- 選択された選択肢に応じて物語を進めてください。
- finished == trueの時は空配列としてください。
#### finished
- ゲーム終了時のみtrueにしてください
#### prompt
- 画像生成のためのプロンプト。物語の情景に合わせて最適なのプロンプトを設定してください
- ただし3DCGゲーム用のクオリティの高い画像を生成するように工夫してください
- 画像生成のコンテンツポリシーに違反するようなプロンプトを設定しないでください。具体的には、IPの固有名詞などをなるべく避けてください。

### ユーザーからの回答例
自分より弱いやついじめて楽しいか？

### シナリオ（conversations）に関するルール
- あなたの最初の出力のconversationsにて、ナレーションによりユーザーのゲームクリア条件を設定してください
- 指定された物語をベースにしつつも、意外でドラマチックな展開を用意してください
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
    # 文言の生成
    generated_message = await ai_service.chatClaude(messages)
    # 生成された文言のパース
    parsed_content = json.loads(generated_message.content)
    # 画像の生成
    image_url = await ai_service.generate_image(parsed_content["prompt"])
    generated_message.image_url = image_url
    # generated_message.image_url = ''
    return generated_message

