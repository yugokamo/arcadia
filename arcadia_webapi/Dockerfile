FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9
COPY ./app /app
RUN pip install --upgrade pip &&\
    pip install --no-cache-dir -r /app/requirements.txt
