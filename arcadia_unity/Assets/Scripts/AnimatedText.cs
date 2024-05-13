using System.Collections;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using TMPro;
using UnityEngine;
using UnityEngine.Serialization;

public class AnimatedText : MonoBehaviour
{
    [SerializeField] private bool _autoStart = false;
    [SerializeField] private List<string> _serifs = new List<string>();
    [SerializeField] private TMP_Text _scenarioText;
    async void Start()
    {
        _scenarioText = GetComponent<TMP_Text>();
        if (_autoStart)
        {
            await AnimateAsync();
        }
    }

    public async UniTask AnimateAsync()
    {
        for (int i = 0; i < _serifs.Count; i++)
        {
            var serif = _serifs[i];
            await TypeText(serif);
        }
    }
    
    private async UniTask TypeText(string serif)
    {
        await UniTask.Delay(500);
        GetComponent<TMP_Text>().text = string.Empty;
        foreach (char c in serif)
        {
            _scenarioText.text += c; // 1文字ずつ追加
            await UniTask.Delay(160);
        }
    }
}
