from dto.message import Message
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import os


class AiService:
    def __init__(self, gpt_model_name: str, claude_model_name: str):
        self.__gpt_model_name = gpt_model_name
        self.__claude_model_name = claude_model_name
        self.__openai_client = AsyncOpenAI()
        self.__anthropic_client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"), )

    async def chatGPT(self, messages: list[Message]) -> Message:
        roles = ["system", "user", "assistant"]
        schema_messages = [{"role": roles[message.user_type], "content": message.content} for message in messages]
        response = await self.__openai_client.chat.completions.create(
            model=self.__gpt_model_name,
            messages=schema_messages,
            response_format={"type": "json_object"}
        )
        return Message(index=len(messages), user_type=2, user_id=1, content=response.choices[0].message.content)

    async def chatClaude(self, messages: list[Message]) -> Message:
        roles = ["system", "user", "assistant"]
        schema_messages = [{"role": roles[message.user_type], "content": message.content} for message in messages]
        response = await self.__anthropic_client.messages.create(
            model=self.__claude_model_name,
            messages=schema_messages
        )
        return Message(index=len(messages), user_type=2, user_id=1, content=response.content[0])

    async def generate_image(self, prompt: str) -> str:
        response = await self.__openai_client.images.generate(
            model="dall-e-2",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return image_url
