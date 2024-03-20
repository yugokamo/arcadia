using System.Collections;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using DG.Tweening;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class CommonModal : MonoBehaviour
{
    [SerializeField] private TMP_Text _contentText;
    [SerializeField] private Button _closeButton;
    
    public async UniTask ShowAsync(string content)
    {
        _contentText.text = content;
        gameObject.SetActive(true);
        await GetComponent<CanvasGroup>().DOFade(1f, 0.5f);
        // ボタンが押されるまで待機
        await _closeButton.OnClickAsync();
        await GetComponent<CanvasGroup>().DOFade(0f, 0.5f);
        _contentText.text = "";
        gameObject.SetActive(false);
    }

}
