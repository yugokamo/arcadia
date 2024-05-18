import {Box, BoxProps, Flex, Text, useColorModeValue} from "@chakra-ui/react";
import NavItem from "./NavItem";

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
interface LinkItemProps {
    name: string;
}
const LinkItems: Array<LinkItemProps> = [
    { name: 'Home'},
    { name: 'Create'},
    { name: 'Library'},
    { name: 'Sign Up'},
];

export default SidebarContent;