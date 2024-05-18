import {Flex, FlexProps, Link} from "@chakra-ui/react";
import {ReactText} from "react";

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
export default NavItem;