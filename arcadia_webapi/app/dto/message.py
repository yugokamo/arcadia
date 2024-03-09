import datetime

from pydantic import BaseModel


class Message(BaseModel):
    index: int
    user_type: int
    user_id: int
    content: str
    image_url: str = ""


class Item(BaseModel):
    name: str
    count: int


class Conversation(BaseModel):
    speaker: str
    text: str


class ParsedContent(BaseModel):
    items: list[Item]
    life: int
    money: int
    conversations: list[Conversation]
    options: list[str]
    finished: bool


class MessageSendRequest(BaseModel):
    messages: list[Message]