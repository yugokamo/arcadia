import './App.css';
import {
    Box,
    Heading,
    Stack,
    Button,
    useColorModeValue,
    Drawer,
    Text,
    Image,
    Spinner,
    DrawerContent, useDisclosure, useColorMode, Textarea
} from '@chakra-ui/react';
import SidebarContent from "./SidebarContent";
import {useState} from "react";

// 型の定義
interface Conversation {
    speaker: string;
    text: string;
}

interface MessageContent {
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

interface Message {
    index: number;
    user_type: number;
    user_id: number;
    content: MessageContent;
    image_url: string;
}

interface ApiResponse {
    messages: Message[];
}

function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { toggleColorMode } = useColorMode();
    const [story, setStory] = useState("");
    const [responseContent, setResponseContent] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStory(e.target.value);
    };

    const handleStoryGeneration = async () => {
        setIsLoading(true);
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

        try {
            const response = await fetch('https://cloud-run-service-webapi-eumuzuktzq-an.a.run.app/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const responseData: ApiResponse = await response.json();
                console.log('Story generated successfully:', responseData);
                const messages = responseData.messages;
                const lastMessage = messages[messages.length - 1];

                // contentをパースする
                let parsedContent: MessageContent;
                if (typeof lastMessage.content === 'string') {
                    parsedContent = JSON.parse(lastMessage.content);
                } else {
                    parsedContent = lastMessage.content;
                }

                setResponseContent({
                    ...lastMessage,
                    content: parsedContent
                });
            } else {
                console.error('Story generation failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelection = (optionIndex: number) => {
        console.log(`Option ${optionIndex} selected`);
        // ここにオプション選択後の処理を追加できます
    };

    return (
        <div className="App">
            <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
                <SidebarContent
                    onClose={() => onClose}
                    display={{ base: 'none', md: 'block' }}
                />
                <Drawer
                    autoFocus={false}
                    isOpen={isOpen}
                    placement="left"
                    onClose={onClose}
                    returnFocusOnClose={false}
                    onOverlayClick={onClose}
                    size="full">
                    <DrawerContent>
                        <SidebarContent onClose={onClose} />
                    </DrawerContent>
                </Drawer>
                {/* mobilenav */}
                {/*<MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />*/}
                <Box ml={{ base: 0, md: 60 }} p="4">
                    <Stack spacing={3}>
                        {!responseContent ? (
                            isLoading ? (
                                <>
                                    <Text fontSize="xl" textAlign='left'>物語生成中…</Text>
                                    <Spinner size="xl" />
                                </>
                            ) : (
                                <>
                                    <Heading size='lg' textAlign='left'>物語を入力してみよう</Heading>
                                    <Textarea
                                        placeholder="1980年代のアメリカを舞台に、わらしべ長者で資産100万ドルを目指すゲーム"
                                        value={story}
                                        onChange={handleTextareaChange}
                                    />
                                    <Button colorScheme="green" onClick={handleStoryGeneration}>物語生成</Button>
                                </>
                            )
                        ) : (
                            <>
                                {/*<Heading size='lg' textAlign='left'>生成された物語</Heading>*/}
                                {responseContent.image_url && (
                                    <Image boxSize="512px" src={responseContent.image_url} alt="Generated Story" />
                                )}
                                {responseContent.content && responseContent.content.conversations && responseContent.content.conversations.length > 0 ? (
                                    responseContent.content.conversations.map((conv, index) => (
                                        <Text key={index} textAlign='left'><strong>{conv.speaker}:</strong> {conv.text}</Text>
                                    ))
                                ) : (
                                    <Text>物語の内容がありません</Text>
                                )}
                                {responseContent.content && responseContent.content.options && responseContent.content.options.length > 0 && (
                                    <Stack spacing={2} mt={4}>
                                        {responseContent.content.options.map((option, index) => (
                                            <Text key={index} textAlign='left'>{index+1}. {option}</Text>
                                        ))}
                                        <Stack direction="row" spacing={4}>
                                            {responseContent.content.options.map((_, index) => (
                                                <Button key={index} colorScheme="blue" onClick={() => handleOptionSelection(index + 1)}>
                                                    {index + 1}
                                                </Button>
                                            ))}
                                        </Stack>
                                    </Stack>
                                )}
                            </>
                        )}
                    </Stack>
                </Box>
            </Box>
        </div>
    );
}

export default App;
