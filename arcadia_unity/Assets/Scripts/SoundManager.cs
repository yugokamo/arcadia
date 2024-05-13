using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Cysharp.Threading.Tasks;
using DG.Tweening; // UniTaskを使用するために必要

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance { get; private set; } // シングルトンインスタンス

    [SerializeField] private AudioSource _audioSource; // AudioSourceコンポーネント
    [SerializeField] private AudioClip[] _audioClips; // 音声ファイルを格納する配列

    private void Awake()
    {
        // シングルトンの実装
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject); // シーン遷移しても破棄されないようにする
            _audioSource = GetComponent<AudioSource>();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // 音声を非同期でロードし、再生するメソッド
    public void PlayBGM(int tension)
    {
        AudioClip clip = _audioClips[tension];
        if (clip != null)
        {
            _audioSource.volume = 0.8f;
            _audioSource.loop = true;
            _audioSource.PlayOneShot(clip);
        }
    }
    
    public void SetVolume(float volume, float duration)
    {
        _audioSource.DOFade(volume, duration);
    }

    // n秒間かけて曲をフェードアウトさせるメソッド
    public async UniTask FadeOut(float duration)
    {
        float startVolume = _audioSource.volume;

        for (float t = 0; t < duration; t += Time.deltaTime)
        {
            _audioSource.volume = Mathf.Lerp(startVolume, 0, t / duration);
            await UniTask.Yield(PlayerLoopTiming.Update); // 次のフレームまで待機
        }

        _audioSource.volume = 0; // 最後に音量を0にする
        _audioSource.Stop(); // 曲の再生を停止
    }
}