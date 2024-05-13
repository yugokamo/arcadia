import './App.css';
import {
    Box,
    Flex,
    Heading,
    Stack,
    Text,
    Button,
    Input,
    useColorModeValue,
    BoxProps,
    Link,
    FlexProps,
    Drawer,
    DrawerContent, useDisclosure, useColorMode, Textarea
} from '@chakra-ui/react';
import {ReactText} from "react";


interface LinkItemProps {
    name: string;
}
const LinkItems: Array<LinkItemProps> = [
    { name: 'Home'},
    { name: 'Create'},
    { name: 'Library'},
    { name: 'Sign Up'},
];

interface SidebarProps extends BoxProps {
    onClose: () => void;
}
const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Kamishiv.ai
                </Text>
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    );
};
interface NavItemProps extends FlexProps {
    children: ReactText;
}
const NavItem = ({ children, ...rest }: NavItemProps) => {
    return (
        <Link href="#" style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.400',
                    color: 'white',
                }}
                {...rest}>
                {children}
            </Flex>
        </Link>
    );
};



function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { toggleColorMode } = useColorMode()
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
                    {/*<Button size="sm" onClick={toggleColorMode}>*/}
                    {/*    Toggle Mode*/}
                    {/*</Button>*/}
                    {/*<Stack>*/}
                    {/*    <Text fontSize="2xl">This is first paragraph</Text>*/}
                    {/*    <Text fontWeight="bold">This is second paragraph</Text>*/}
                    {/*    <Text fontStyle="italic">This is third paragraph</Text>*/}
                    {/*</Stack>*/}
                    <Stack spacing={3}>
                        <Heading size='lg' textAlign='left'>物語を入力してみよう</Heading>
                        <Textarea placeholder="1980年代のアメリカを舞台に、わらしべ長者で資産100万ドルを目指すゲーム" />
                        <Button colorScheme="green">物語生成</Button>
                    </Stack>
                    {/*<Flex>*/}
                    {/*    <Box bgColor="orange.500" color="white" p="4">*/}
                    {/*        This is the Box*/}
                    {/*    </Box>*/}
                    {/*    <Box bgColor="green.500" color="white" p="4">*/}
                    {/*        This is the Box*/}
                    {/*    </Box>*/}
                    {/*</Flex>*/}
                </Box>
            </Box>
        </div>
    );
}

export default App;