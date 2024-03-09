# arcadia

## Docker Compose
```bash
docker compose up -d
```

## ローカル環境実行
デバッグ用にコンテナではなくローカルで動かしたい時用。上記docker-compose後に、arcadia-webapiコンテナだけ止めてから実施
```bash
uvicorn main:app --reload 
```

## OpenAPI Document
http://localhost:80/docs