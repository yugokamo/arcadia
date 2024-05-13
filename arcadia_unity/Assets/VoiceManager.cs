using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Cysharp.Threading.Tasks;
using VoicevoxBridge; // UniTaskを使用するために必要

public class VoiceManager : MonoBehaviour
{
    public static VoiceManager Instance { get; private set; } // シングルトンインスタンス
    [SerializeField] private VOICEVOX _voiceVox;

    private void Awake()
    {
        // シングルトンの実装
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject); // シーン遷移しても破棄されないようにする
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // 音声を非同期でロード
    public async UniTask<Voice> CreateAsync(int speakerType, string text)
    {
        var speaker = 0;
        switch (speakerType)
        {
            case 1:
                speaker = 46;//小夜/SAYO
                break;
            case 2:
                speaker = 2;//もち子さん
                break;
            case 3:
                speaker = 9;//波音リツ
                break;
            case 4:
                speaker = 9;//波音リツ
                break;
            case 5:
                speaker = 12;//白上虎太郎
                break;
            case 6:
                speaker = 52;//雀松朱司
                break;
            case 7:
                speaker = 13;//青山龍星
                break;
            case 8:
                speaker = 53;//麒ヶ島宗麟
                break;
            default:
                return null;
        }
        return await _voiceVox.CreateVoice(speaker, text);
    }
    
    // 音声を再生
    public async UniTask PlayAsync(Voice voice)
    {
        await _voiceVox.Play(voice);
    }
    
    // 作成して再生
    public async UniTask PlayAsync(int speakerType, string text)
    {
        var voice = await CreateAsync(speakerType, text);
        await PlayAsync(voice);
    }
}