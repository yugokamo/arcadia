using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Cysharp.Threading.Tasks;
using DG.Tweening;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using UnityEngine.Serialization;
using UnityEngine.UI;
using UnityEngine.Video;
using VoicevoxBridge;

public class Presenter : MonoBehaviour
{
    [SerializeField] private VideoPlayer _topLoopVideoPlayer;
    [SerializeField] private VideoPlayer _topTutorialVideoPlayer;
    [SerializeField] private VideoPlayer _topTransitionVideoPlayer;
    
    [SerializeField] private GameObject _topPage;
    [SerializeField] private Image _topBlackImage;
    [SerializeField] private CanvasGroup _topSplashCanvasGroup;
    [SerializeField] private CanvasGroup _topTitleCanvasGroup;
    [SerializeField] private Button _topTitleStartButton;
    [SerializeField] private CanvasGroup _topScenarioSelectCanvasGroup;
    [SerializeField] private TMP_InputField _topScenarioSelectInputField;
    [SerializeField] private Button _topScenarioSelectYesButton;
    [SerializeField] private CanvasGroup _topUserNameCanvasGroup;
    [SerializeField] private CanvasGroup _topTransitionToScenarioCanvasGroup;
    [SerializeField] private ScenarioView _scenarioView1;
    [SerializeField] private ScenarioView _scenarioView2;
    [SerializeField] private CanvasGroup _scenarioSuccessCanvasGroup;
    [SerializeField] private CanvasGroup _scenarioFailureCanvasGroup;
    [SerializeField] private TMP_Text _endRollText;
    [SerializeField] private TMP_Text _thankYouText;
    
    
    private CanvasGroup _currentCanvasGroup;

    async void Start()
    {
        await UniTask.Delay(2000);
        await ExecuteGameAsync();
    }

    async UniTask ExecuteGameAsync()
    {
        _currentCanvasGroup = _topSplashCanvasGroup;
        await VoiceManager.Instance.PlayAsync(1, "プロジェクト・アルカディア");
        await UniTask.Delay(1000);
        SoundManager.Instance.PlayBGM(0);
        // スプラッシュイメージをフェードアウトしてタイトル画面を表示
        await UniTask.Delay(3000);
        await ChangeCanvasGroupAsync(_topTitleCanvasGroup, 3f);
        _topTitleStartButton.gameObject.SetActive(true);
        
        // タイトルスタートボタンを押すとシナリオ選択画面を表示
        await _topTitleStartButton.OnClickAsync();
        await ChangeCanvasGroupAsync(_topScenarioSelectCanvasGroup);
        
        // シナリオ選択決定ボタンを押すと次に進む
        await _topScenarioSelectYesButton.OnClickAsync();
        // ストーリータイトルを取得
        var storyTitle = _topScenarioSelectInputField.text;
        
        var messages = new List<Message>() {new() {Index = 1, UserType = 1, UserId = 1, Content = storyTitle, ImageUrl = ""}};
        MessageSendResponse scenarioResponse = null;
        await UniTask.WhenAll(
            UniTask.Create(async () =>
            {
                // シナリオ生成APIを実行しつつ
                scenarioResponse = await Api.SendMessageAsync(messages, true);
            }),
            // 同時に、ユーザー名入力とその後のシナリオ遷移画面を表示
            UniTask.Create(async () => 
            {
                await _topBlackImage.DOFade(0f, 1f);
                _topTutorialVideoPlayer.gameObject.SetActive(true);
                _topLoopVideoPlayer.gameObject.SetActive(false);
                await ChangeCanvasGroupAsync(_topUserNameCanvasGroup);
                await UniTask.Delay(35000);
                // アニメーション実行
                await AnimationTransitionFromTopToScenarioAsync();
                // BGMをフェードアウト
                await SoundManager.Instance.FadeOut(5f);
            }));
        messages = scenarioResponse.Messages;
        // 最後のメッセージを取得
        var lastMessage = messages.Last();
        Debug.Log(lastMessage.ImageUrl);
        Debug.Log(lastMessage.Content);
        // 最後のメッセージのmessageContent(AIが生成したJSON文字列)をデシリアライズ
        var messageContent = JsonSerializer.Deserialize<MessageContent>(lastMessage.Content);

        while (true)
        {
            // 終了フラグが立っていたらシナリオ画面を表示するのみ
            if (messageContent.Finished)
            {
                await ExecuteScenarioAndWaitUntilSelect(lastMessage.ImageUrl, messageContent);
                break;
            }
            var selectedOption = -1;
            await UniTask.WhenAll(
                UniTask.Create(async () =>
                {
                    // シナリオ生成APIを実行しつつ
                    scenarioResponse = await Api.SendMessageAsync(messages);
                }),
                UniTask.Create(async () =>
                {
                    // 同時に、シナリオ画面を表示して、選択肢が選ばれるまでまつ
                    selectedOption = await ExecuteScenarioAndWaitUntilSelect(lastMessage.ImageUrl, messageContent);
                }));
            // 選択肢が選ばれた瞬間ユーザーメッセージが確定
            var userMessage = new Message()
            {
                Index = messages.Count,
                UserType = 1,
                UserId = 1,
                // 選択肢が回答
                Content = messageContent.Options[selectedOption],
                ImageUrl = ""
            };
            messages.Add(userMessage);

            // 候補のメッセージの中から選ばれたものがアシスタントのメッセージ
            var assistantMessage = scenarioResponse.PreparedMessages[selectedOption];
            assistantMessage.Index = messages.Count;
            messages.Add(assistantMessage);
            // 最後のメッセージを取得
            lastMessage = messages.Last();
            // 最後のメッセージのmessageContent(AIが生成したJSON文字列)をデシリアライズ
            try
            {
                messageContent = JsonSerializer.Deserialize<MessageContent>(lastMessage.Content);
            }
            catch (Exception e)
            {
                Debug.Log(lastMessage.Content);
                Debug.LogError(e);
                throw;
            }
        }
        Debug.Log("終了");

        await ChangeToEndingAsync(messageContent.Life);
        
        // 終了。スプラッシュ画面に戻る
        await ChangeCanvasGroupAsync(_topSplashCanvasGroup);
        
        await UniTask.Delay(2000);
        
        SceneManager.LoadScene (SceneManager.GetActiveScene().name);
        
        return;
        
        // ローカル関数: トップ画面からシナリオ画面への遷移アニメーション
        async UniTask AnimationTransitionFromTopToScenarioAsync()
        {
            await UniTask.Delay(4000);
            _topTransitionVideoPlayer.gameObject.SetActive(true);
            _topTutorialVideoPlayer.gameObject.SetActive(false);
            await ChangeCanvasGroupAsync(_topTransitionToScenarioCanvasGroup);
            await UniTask.Delay(2000);
            Destroy(_topLoopVideoPlayer);
            Destroy(_topTutorialVideoPlayer);
            await UniTask.Delay(3000);
            await _topBlackImage.DOFade(1f, 3f);
        }
    }
    
    // ChangeToEnding
    async UniTask ChangeToEndingAsync(int life)
    {
        // 音楽をフェードアウト
        await SoundManager.Instance.FadeOut(2f);
        // シナリオが終了したらライフを見て成功か失敗かを表示
        if (life > 0)
        {
            await ChangeCanvasGroupAsync(_scenarioSuccessCanvasGroup);
            SoundManager.Instance.PlayBGM(6);
        }
        else
        {
            await ChangeCanvasGroupAsync(_scenarioFailureCanvasGroup);
            SoundManager.Instance.PlayBGM(6);
        }
        
        // EndRollTextを上方向にスクロール
        _endRollText.rectTransform.DOLocalMoveY(2170, 32f).SetEase(Ease.Linear).ToUniTask();

        await UniTask.Delay(29000);
        
        // EndRollTextをフェードアウト
        await _endRollText.DOFade(0f, 3f).ToUniTask();
        
        // ThankYouTextを表示
        _thankYouText.gameObject.SetActive(true);
        
        await UniTask.Delay(15000);
    }


    // シナリオ演出をする
    async UniTask<int> ExecuteScenarioAndWaitUntilSelect(string imageUrl, MessageContent messageContent)
    {
        var currentScenarioView = _currentCanvasGroup.GetComponent<ScenarioView>();
        var nextScenarioView = currentScenarioView != _scenarioView1 ? _scenarioView1 : _scenarioView2;
        
        // 音楽をフェードアウト
        await SoundManager.Instance.FadeOut(2f);
        
        // 先に画像をセットしてから
        await nextScenarioView.InitAsync(imageUrl, messageContent.Life);
        
        // シナリオに遷移
        await ChangeCanvasGroupAsync(nextScenarioView.GetComponent<CanvasGroup>());
        
        // 音楽を再生
        SoundManager.Instance.PlayBGM(messageContent.Finished ? 2 : messageContent.Tension);
        
        // シナリオを実行
        await nextScenarioView.ExecuteAsync(messageContent, messageContent.Finished);

        // 最後のシナリオだったら終了
        if (messageContent.Finished)
        {
            return -1;
        }
        
        // 選択肢ボタンが押されるまで待機
        var selectedOption = await nextScenarioView.OnClickOptionButtonAsync();
        return selectedOption;
    }

    async UniTask ChangeCanvasGroupAsync(CanvasGroup next, float duration = 1)
    {
        next.gameObject.SetActive(true);
        await UniTask.WhenAll(
            _currentCanvasGroup.DOFade(0f, duration).ToUniTask(),
            next.DOFade(1f, duration).ToUniTask()
        );
        _currentCanvasGroup.gameObject.SetActive(false);
        _currentCanvasGroup = next;
    }

}
