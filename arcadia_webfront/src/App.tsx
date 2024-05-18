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
    DrawerContent,
    useDisclosure,
    useColorMode,
    Textarea
} from '@chakra-ui/react';
import SidebarContent from "./SidebarContent";
import { useState, useEffect, useRef } from "react";

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
    const [displayText, setDisplayText] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);

    const currentIndexRef = useRef(0); // currentIndexをuseRefで管理
    const intervalRef = useRef<number | null>(null);

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

                // optionsがオブジェクトであれば文字列に変換する
                if (parsedContent.options && !Array.isArray(parsedContent.options)) {
                    parsedContent.options = Object.values(parsedContent.options);
                }

                setResponseContent({
                    ...lastMessage,
                    content: parsedContent
                });

                // テキスト表示を初期化
                setDisplayText("");
                setShowOptions(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }

                // テキストを0.1秒に1文字ずつ表示
                const conversationsText = parsedContent.conversations.map(conv => `${conv.speaker}: ${conv.text}`).join(" ");
                const optionsText = parsedContent.options ? parsedContent.options.map((option, index) => `${index + 1}. ${option}`).join("\n") : "";
                const fullText = conversationsText + (optionsText ? "\n" + optionsText : "");
                console.log('Full Text:', fullText);

                currentIndexRef.current = 0; // currentIndexを初期化

                intervalRef.current = window.setInterval(() => {
                    const currentIndex = currentIndexRef.current;

                    if (currentIndex >= fullText.length) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }
                        setShowOptions(true);
                        return;
                    }
                    console.log('Before setDisplayText:', currentIndex, fullText[currentIndex]);
                    setDisplayText(prev => {
                        console.log(`Inside setDisplayText - currentIndex: ${currentIndex}, char: ${fullText[currentIndex]}`);
                        return prev + fullText[currentIndex];
                    });
                    console.log('After setDisplayText:', currentIndex);
                    currentIndexRef.current++;
                }, 100);
            } else {
                console.error('Story generation failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('displayText updated:', displayText);
        if (displayText.includes("undefined")) {
            console.log("displayText includes undefined:", displayText);
        }
    }, [displayText]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

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
                                <Text textAlign='left' whiteSpace="pre-line">{displayText}</Text>
                                {showOptions && responseContent.content && responseContent.content.options && responseContent.content.options.length > 0 && (
                                    <Stack spacing={2} mt={4}>
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
