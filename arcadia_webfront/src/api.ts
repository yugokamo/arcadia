// api.ts
export interface Conversation {
    speaker: string;
    text: string;
}

export interface MessageContent {
    items?: Array<{ name: string; count: number }>;
    life?: number;
    conversations: Conversation[];
    voices?: Record<string, number>;
    options?: string[];
    tension?: number;
    crisis?: boolean;
    finished?: boolean;
    prompt?: string;
}

export interface Message {
    index: number;
    user_type: number;
    user_id: number;
    content: MessageContent | string; // MessageContent型
    image_url: string;
}

export interface ApiResponse {
    messages: Message[];
}

export const generateStory = async (story: string): Promise<ApiResponse> => {
    const requestBody = {
        messages: [
            {
                index: 1,
                user_type: 1,
                user_id: 1,
                content: story,
                image_url: ""
            }
        ],
        init: true
    };

    const response = await fetch('https://cloud-run-service-webapi-eumuzuktzq-an.a.run.app/message/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error('Story generation failed: ' + response.statusText);
    }

    const responseData = await response.json();
    console.log(responseData);

    const parsedMessages: Message[] = responseData.messages.map((message: any) => {
        // AIの返答をパースしてMessageContent型に変換
        if (typeof message.content === 'string' && message.user_type === 2) {
            message.content = JSON.parse(message.content) as MessageContent;
        }
        return message as Message;
    });

    return { messages: parsedMessages };
};
