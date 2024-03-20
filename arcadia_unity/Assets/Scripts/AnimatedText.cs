using System.Collections;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using TMPro;
using UnityEngine;

public class AnimatedText : MonoBehaviour
{
    [SerializeField] private bool _autoStart = false;
    async void Start()
    {
        if (_autoStart)
        {
            var content = GetComponent<TextMeshPro>().text;
            GetComponent<TextMeshPro>().text = string.Empty;
            await AnimateAsync(content);
        }
    }

    public async UniTask AnimateAsync(string content)
    {
        await UniTask.Delay(500);
        
    }
}
