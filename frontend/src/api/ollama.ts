type OllamaGenerateResponse = {
    response: string
}

type OllamaErrorResponse = {
    error?: string
}

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? 'http://127.0.0.1:11434'
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? 'llama3:latest'

const OLLAMA_GENERATE_PATH = OLLAMA_URL.endsWith('/api') ? 'generate' : 'api/generate'

export async function generateWithOllama(prompt: string): Promise<string> {
    const response = await fetch(`${OLLAMA_URL}/${OLLAMA_GENERATE_PATH}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
        }),
    })

    if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as OllamaErrorResponse | null
        const details = errorPayload?.error ? `: ${errorPayload.error}` : ''
        throw new Error(`Ollama request failed with status ${response.status}${details}`)
    }

    const data = (await response.json()) as OllamaGenerateResponse

    if (!data.response) {
        throw new Error('Ollama returned an empty response')
    }

    return data.response.trim()
}