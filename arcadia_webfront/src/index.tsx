import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';

const theme = {
    config: {
        initialColorMode: 'dark', // ダークモードをデフォルトに設定
        useSystemColorMode: false, // OSの設定を使わせない
    }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={extendTheme(theme)}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);