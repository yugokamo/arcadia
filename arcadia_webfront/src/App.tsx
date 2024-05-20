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
    Textarea, Divider
} from '@chakra-ui/react';
import SidebarContent from "./SidebarContent";
import { useState, useEffect, useRef } from "react";
import { generateStory, Message, MessageContent } from './api'; // api.tsからインポート

function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [story, setStory] = useState("");
    const [responseMessage, setResponseMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayBodyText, setDisplayBodyText] = useState<string>("");
    const [displayOptionText, setDisplayOptionText] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);

    // const currentIndexRef = useRef(0);
    const intervalRef = useRef<number | null>(null);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStory(e.target.value);
    };

    const handleStoryGeneration = async () => {
        setIsLoading(true);

        try {
            const responseData = await generateStory(story);
            console.log('Story generated successfully:', responseData);
            const messages = responseData.messages;
            const lastMessage = messages[messages.length - 1];

            const parsedContent = lastMessage.content as MessageContent;

            setResponseMessage({
                ...lastMessage,
                content: parsedContent as MessageContent
            });

            setDisplayBodyText("");
            // 選択肢は最初は非表示にしておく
            setShowOptions(false);
            // setIntervalがまだ動いていたら止める
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // 本文 (話者: セリフ...)
            const conversationsText = parsedContent.conversations.map(conv => `${conv.speaker}:  ${conv.text}`).join("\n");
            // 選択肢 (1. 選択肢1の内容...)
            const optionsText = parsedContent.options ? parsedContent.options.map((option, index) => `${index + 1}. ${option}`).join("\n") : "";

            // currentIndexRef.current = 0;
            let currentIndexVal = 0;

            intervalRef.current = window.setInterval(() => {
                // 非同期関数setDisplayText内でcurrentIndexを参照するため、ここで値をキャプチャする
                // const currentIndex = currentIndexRef.current;
                const currentIndex = currentIndexVal;

                // テキストを全て表示したらsetIntervalを止めて、選択肢を表示する
                if (currentIndex < conversationsText.length) {
                    setDisplayBodyText(prev => prev + conversationsText[currentIndex]);
                } else if (currentIndex < conversationsText.length + optionsText.length) {
                    setDisplayOptionText(prev => prev + optionsText[currentIndex - conversationsText.length]);
                } else {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    setShowOptions(true);
                    return;
                }
                // currentIndexRef.current++;
                currentIndexVal++;
            }, 100);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                        {!responseMessage ? (
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

                                {responseMessage.image_url && (
                                    <Image boxSize="512px" src={responseMessage.image_url} alt="Generated Story" />
                                )}
                                {/*本文と選択肢内容の表示*/}
                                <Text textAlign='left' whiteSpace="pre-line">{displayBodyText}</Text>
                                {/*選択肢の文字列が空でなければ罫線と選択肢文字列を表示する*/}
                                {displayOptionText && (
                                    <>
                                        <Divider />
                                        <Text textAlign='left' whiteSpace="pre-line">{displayOptionText}</Text>
                                    </>
                                )}
                                {/*選択肢ボタンの表示*/}
                                {showOptions && typeof responseMessage.content !== 'string' && responseMessage.content.options && responseMessage.content.options.length > 0 && (
                                    <Stack spacing={2} mt={4}>
                                        <Stack direction="row" spacing={4}>
                                            {responseMessage.content.options.map((_, index) => (
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
