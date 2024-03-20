using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading;
using Cysharp.Threading.Tasks;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class ScenarioView : MonoBehaviour
{
    // ScenarioMainImage
    [SerializeField] private RawImage _scenarioMainRawImage;
    // ScenarioText
    [SerializeField] private TMP_Text _scenarioText;
    // ScenarioNextSerifButton
    [SerializeField] private Button _scenarioNextSerifButton;
    // ScenarioOptionButtons
    [SerializeField] private Button[] _scenarioOptionButtons;
    // LifeText
    [SerializeField] private TMP_Text _lifeText;

    public async UniTask ExecuteAsync(MessageContent messageContent, bool isLast = false)
    {
        // 会話を表示
        foreach (var conversation in messageContent.Conversations)
        {
            if (conversation.Speaker == "ナレーション")
            {
                await TypeText(
                    $@"
{conversation.Text}
▼"
                    , CancellationToken.None);
            }
            else
            {
                await TypeText(
                    $@"
{conversation.Speaker}:
{conversation.Text}
▼"
                    , CancellationToken.None);
            }

            // 1秒待機
            await UniTask.Delay(1000);
            // ボタンが押されるまで待機
            await _scenarioNextSerifButton.OnClickAsync();
        }

        if (isLast)
        {
            return;
        }
        
        // 選択肢とボタンを表示
        await TypeText(
            $@"
1. {messageContent.Options[0]}
2. {messageContent.Options[1]}
3. {messageContent.Options[2]}"
            , CancellationToken.None);
        
        // 1秒待機
        await UniTask.Delay(1000);
        
        // 選択肢ボタンを表示
        foreach (var button in _scenarioOptionButtons)
        {
            button.gameObject.SetActive(true);
        }
    }

    public async UniTask<int> OnClickOptionButtonAsync()
    {
        // どれか一つの選択肢ボタンが押されるまで待機
        var selectedButton = await UniTask.WhenAny(
            _scenarioOptionButtons[0].OnClickAsync(),
            _scenarioOptionButtons[1].OnClickAsync(),
            _scenarioOptionButtons[2].OnClickAsync()
        );
        // 選択肢ボタンを表示
        foreach (var button in _scenarioOptionButtons)
        {
            button.gameObject.SetActive(false);
        }

        return selectedButton;
    }

    private async UniTask TypeText(string text, CancellationToken cancellationToken)
    {
        _scenarioText.text = ""; // テキストをクリア
        foreach (char c in text)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                // キャンセルされた場合はループを抜ける
                break;
            }

            _scenarioText.text += c; // 1文字ずつ追加
            await UniTask.Delay(200, cancellationToken: cancellationToken);
        }
    }
    
    // URLの画像をScenarioMainRawImageに表示
    public async UniTask InitAsync(string url, int life)
    {
        var request = UnityWebRequestTexture.GetTexture(url);
        await request.SendWebRequest();
        var texture = DownloadHandlerTexture.GetContent(request);
        _scenarioMainRawImage.texture = texture;
        var lifeString = "";
        if (life == 1)
        {
            lifeString = "●○○";
        }
        else if (life == 2)
        {
            lifeString = "●●○";
        }
        else if (life == 3)
        {
            lifeString = "●●●";
        }
        _lifeText.text = $"ライフ: {lifeString}";
    }
}
