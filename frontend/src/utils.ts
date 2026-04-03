
export const toOptionalNumber = (value: string): number | undefined => {
    const normalized = value.trim().replace(/\s+/g, '')

    if (!normalized) {
        return undefined
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : undefined
}

export const toOptionalString = (value: string | undefined): string | undefined => {
    const normalized = (value ?? '').trim()
    return normalized === '' ? undefined : normalized
}

export const buildAiPrompt = (context: string, mode: 'description' | 'pricing') => {
    if (mode === 'description') {
        return [
            'Ты помощник по созданию объявлений.',
            'Сгенерируй одно краткое и убедительное описание на русском языке (максимум 1000 символов).',
            'Верни только текст описания на русском языке, без заголовков, списков и кавычек.',
            context,
        ].join('\n\n')
    }

    return [
        `Ты помощник по оценке рыночной цены объявления.
        Дай краткий комментарий на русском (3-5 строк) по текущей цене и диапазону корректной цены.
        Верни только ответ на русском языке, без заголовков, списков и кавычек.`,
        context,
    ].join('\n\n')
}