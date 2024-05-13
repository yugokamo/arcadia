# arcadia_webfront

## Docker
### ローカルでの確認手順
arcadia_webfront直下で
1. イメージをビルド
   ```sh
   $ docker build -t arcadia-webfront:latest .
   ```
2. コンテナを起動
   ```sh
   $ docker run --name arcadia-webfront -d -p 3000:3000 arcadia-webfront:latest
   ```
3. ブラウザで下記URLにアクセスしてトップページに遷移することを確認
    * http://localhost:3000/
