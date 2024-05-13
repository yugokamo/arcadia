using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using VoicevoxBridge;

// UnityWebRequestを使ってAPIを叩く
public class Api
{
    // APIのベースURL
    // private const string BaseUrl = "localhost:8000";
    private const string BaseUrl = "https://cloud-run-service-webapi-eumuzuktzq-an.a.run.app";
    
    // メッセージ送信
    public static async UniTask<MessageSendResponse> SendMessageAsync(List<Message> messages, bool init = false)
    {
        var url = $"{BaseUrl}/message/send";
        Debug.Log($"api request url: {url}");
        var request = UnityWebRequest.PostWwwForm(url, "");
        var requestBody = new MessageSendRequest()
        {
            Messages = messages,
            Init = init
        };
        var requestBodyJson = JsonSerializer.Serialize(requestBody);
        request.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(requestBodyJson));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        await request.SendWebRequest();
        if (request.result == UnityWebRequest.Result.ConnectionError)
        {
            throw new Exception(request.error);
        }
        var json = request.downloadHandler.text;
        Debug.Log($"api response url: {url}, response: {json}");
        var response = JsonSerializer.Deserialize<MessageSendResponse>(json);
        return response;
    }
}

public class MessageSendRequest
{
    //messages
    [JsonPropertyName("messages")]
    public List<Message> Messages { get; set; }
    //init
    [JsonPropertyName("init")]
    public bool Init { get; set; }
}

public class MessageSendResponse
{
    //messages
    [JsonPropertyName("messages")]
    public List<Message> Messages { get; set; }
    //prepared_messages
    [JsonPropertyName("prepared_messages")]
    public List<Message> PreparedMessages { get; set; }
}

public class Message
{
    //index
    [JsonPropertyName("index")]
    public int Index { get; set; }
    //user_type
    [JsonPropertyName("user_type")]
    public int UserType { get; set; }
    //user_id
    [JsonPropertyName("user_id")]
    public int UserId { get; set; }
    //content
    [JsonPropertyName("content")]
    public string Content { get; set; }
    //image_url
    [JsonPropertyName("image_url")]
    public string ImageUrl { get; set; }
}

public class MessageContent
{
    //items
    [JsonPropertyName("items")]
    public List<Item> Items { get; set; }
    //life
    [JsonPropertyName("life")]
    public int Life { get; set; }
    //conversations
    [JsonPropertyName("conversations")]
    public List<Conversation> Conversations { get; set; }
    //voices
    [JsonPropertyName("voices")]
    public Dictionary<string, int> Voices { get; set; }
    //options
    [JsonPropertyName("options")]
    public List<string> Options { get; set; }
    //tension
    [JsonPropertyName("tension")]
    public int Tension { get; set; }
    //crisis
    [JsonPropertyName("crisis")]
    public bool Crisis { get; set; }
    //finished
    [JsonPropertyName("finished")]
    public bool Finished { get; set; }
    //prompt
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; }
}

public class Item
{
    //name
    [JsonPropertyName("name")]
    public string Name { get; set; }
    //count
    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public class Conversation
{
    //speaker
    [JsonPropertyName("speaker")]
    public string Speaker { get; set; }
    //text
    [JsonPropertyName("text")]
    public string Text { get; set; }
}
