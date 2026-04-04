# Test Task: Frontend + Server + Ollama

Проект состоит из 3 частей:
- frontend: React + Vite (порт 5173)
- server: Fastify API (порт 8080)
- ollama: локальная LLM (порт 11434)

## Требования
- Docker Desktop
- Docker Compose

## Клонирование репозитория

```bash
git clone https://github.com/LEVALEXEEV/test-task.git
```

## Быстрый запуск через Docker

1. Перейдите в папку проекта:

```bash
cd test-task
```

2. Соберите и запустите сервисы:

```bash
docker compose up --build -d
```

3. Дождитесь первого запуска (модель Ollama подтянется автоматически).

Примечание: первый старт может занять несколько минут, потому что `llama3:latest` скачивается внутри Docker.

4. Откройте приложение:
- http://localhost:5173

## Остановка Docker-окружения

Остановить контейнеры:

```bash
docker compose down
```

Остановить и удалить том с моделями Ollama:

```bash
docker compose down -v
```


## Структура

```text
frontend/
server/
docker-compose.yml
README.md
```

## Доработки 

- На страницу со списком объявлений добавлена кнопка включения/выключения пагинации
- Режимы отображения карточек сохраняются в localstorage
- На страницу объявления добавлена кнопка возврата на начальную страницу