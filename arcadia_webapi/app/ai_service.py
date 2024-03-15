from dto.message import Message
from openai import AsyncOpenAI


class AiService:
    def __init__(self, model_name: str):
        self.__model_name = model_name
        self.__client = AsyncOpenAI()

    async def chat(self, messages: list[Message]) -> Message:
        roles = ["system", "user", "assistant"]
        schema_messages = [{"role": roles[message.user_type], "content": message.content} for message in messages]
        response = await self.__client.chat.completions.create(
            model=self.__model_name,
            messages=schema_messages,
            response_format={"type": "json_object"}
        )
        return Message(index=len(messages), user_type=2, user_id=1, content=response.choices[0].message.content)

    async def generate_image(self, prompt: str) -> str:
        response = await self.__client.images.generate(
            model="dall-e-2",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return image_url
