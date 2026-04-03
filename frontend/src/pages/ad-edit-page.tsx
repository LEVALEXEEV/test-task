import { type MouseEvent, useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import type { Ad, AdUpdateIn } from '../types/ad'
import type { AdParamKey, FormState, NoticeState } from '../types/ad-edit'
import { AD_CATEGORY_FIELDS, AD_CATEGORY_OPTIONS, AD_PARAM_VALUE_LABELS } from '../const'
import AiResponsePopover from '../components/ai-response-popover'
import LabeledInputField from '../components/labeled-input-field'
import { generateWithOllama } from '../api/ollama'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAdByIdAction, getAd, getIsFetchingAdStatus, updateAdByIdAction } from '../store/slices/single-ad'
import { buildAiPrompt, toOptionalNumber, toOptionalString } from '../utils'

const AD_PARAM_CODE_BY_LABEL = Object.fromEntries(
    Object.entries(AD_PARAM_VALUE_LABELS).map(([code, label]) => [label, code])
) as Record<string, string>

const NUMERIC_PARAM_KEYS = new Set<AdParamKey>(['yearOfManufacture', 'mileage', 'enginePower', 'area', 'floor'])
const AD_EDIT_DRAFT_STORAGE_KEY_PREFIX = 'ad-edit-draft:'

const mapParamToFormValue = (value: unknown): string => {
    const raw = String(value ?? '')
    return AD_PARAM_CODE_BY_LABEL[raw] ?? raw
}

const CATEGORY_PARAMS_BUILDERS = {
    auto: (params: FormState['params']) => ({
        brand: toOptionalString(params.brand),
        model: toOptionalString(params.model),
        yearOfManufacture: toOptionalNumber(params.yearOfManufacture ?? ''),
        transmission: toOptionalString(params.transmission) as 'automatic' | 'manual' | undefined,
        mileage: toOptionalNumber(params.mileage ?? ''),
        enginePower: toOptionalNumber(params.enginePower ?? ''),
    }),
    real_estate: (params: FormState['params']) => ({
        type: toOptionalString(params.type) as 'flat' | 'house' | 'room' | undefined,
        address: toOptionalString(params.address),
        area: toOptionalNumber(params.area ?? ''),
        floor: toOptionalNumber(params.floor ?? ''),
    }),
    electronics: (params: FormState['params']) => ({
        type: toOptionalString(params.type) as 'phone' | 'laptop' | 'misc' | undefined,
        brand: toOptionalString(params.brand),
        model: toOptionalString(params.model),
        condition: toOptionalString(params.condition) as 'new' | 'used' | undefined,
        color: toOptionalString(params.color),
    }),
} as const

function AdEditPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const ad = useAppSelector(getAd)
    const isFetchingAd = useAppSelector(getIsFetchingAdStatus)
    const adId = Number(id)
    const hasValidId = Number.isFinite(adId)
    const draftStorageKey = `${AD_EDIT_DRAFT_STORAGE_KEY_PREFIX}${id ?? ''}`

    const getDraftFromStorage = (): FormState | null => {
        if (typeof window === 'undefined') {
            return null
        }

        const rawDraft = window.localStorage.getItem(draftStorageKey)
        if (!rawDraft) {
            return null
        }

        try {
            return JSON.parse(rawDraft) as FormState
        } catch {
            window.localStorage.removeItem(draftStorageKey)
            return null
        }
    }

    const saveDraftToStorage = (draft: FormState) => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft))
    }

    const clearDraftFromStorage = () => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.removeItem(draftStorageKey)
    }


    const buildUpdatePayload = (currentForm: FormState): AdUpdateIn | null => {
        const { category, title, description, params, price: rawPrice } = currentForm
        const price = toOptionalNumber(rawPrice)

        if (price === undefined) {
            return null
        }

        const commonFields = {
            category,
            title: title.trim(),
            description,
            price,
        }

        return {
            ...commonFields,
            params: CATEGORY_PARAMS_BUILDERS[category](params),
        } as AdUpdateIn
    }

    const initialForm = useMemo<FormState | null>(() => {
        if (!ad) {
            return null
        }

        const params = Object.fromEntries(
            Object.entries(ad.params).map(([key, value]) => [key, mapParamToFormValue(value)])
        )

        return {
            category: ad.category,
            title: ad.title,
            price: String(ad.price),
            description: ad.description,
            params: params as Partial<Record<AdParamKey, string>>,
        }
    }, [ad])

    const [form, setForm] = useState<FormState | null>(initialForm)
    const [notice, setNotice] = useState<NoticeState>({
        open: false,
        severity: 'success',
        message: '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [focusedField, setFocusedField] = useState<'title' | 'price' | null>(null)
    const [aiPopoverAnchor, setAiPopoverAnchor] = useState<HTMLButtonElement | null>(null)
    const [descriptionPopoverAnchor, setDescriptionPopoverAnchor] = useState<HTMLButtonElement | null>(null)
    const [pricingResponseText, setPricingResponseText] = useState('')
    const [isPricingLoading, setIsPricingLoading] = useState(false)
    const [pricingErrorMessage, setPricingErrorMessage] = useState<string | null>(null)
    const [hasPricingRequest, setHasPricingRequest] = useState(false)

    const [descriptionResponseText, setDescriptionResponseText] = useState('')
    const [isDescriptionLoading, setIsDescriptionLoading] = useState(false)
    const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string | null>(null)
    const [hasDescriptionRequest, setHasDescriptionRequest] = useState(false)

    useEffect(() => {
        if (hasValidId && (!ad || ad.id !== adId)) {
            dispatch(fetchAdByIdAction(adId))
        }
    }, [ad, adId, dispatch, hasValidId])

    useEffect(() => {
        if (!initialForm) {
            setForm(initialForm)
            return
        }

        const draft = getDraftFromStorage()
        setForm(draft ?? initialForm)
    }, [initialForm])

    useEffect(() => {
        if (!form) {
            return
        }

        saveDraftToStorage(form)
    }, [form])

    if (isFetchingAd && !ad) {
        return (
            <Box sx={{ bgcolor: '#F7F5F8', minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
                <CircularProgress size={40} thickness={5} sx={{ color: '#3c97ff' }} />
            </Box>
        )
    }

    if (!hasValidId || !ad || !form) {
        return (
            <Box sx={{ bgcolor: '#F7F5F8', minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
                <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #F0F0F0' }}>
                    <Typography sx={{ mb: 2, color: '#2F3037' }}>Объявление не найдено</Typography>
                    <Button component={RouterLink} to="/ads" variant="contained" sx={{ textTransform: 'none' }}>
                        Вернуться к объявлениям
                    </Button>
                </Paper>
            </Box>
        )
    }

    const fields = AD_CATEGORY_FIELDS[form.category]

    const clearFieldValue = (key: string) => {
        if (key === 'title' || key === 'price' || key === 'description') {
            setForm((prev) => (prev ? { ...prev, [key]: '' } : prev))
            return
        }

        if (key.startsWith('params.')) {
            const paramKey = key.replace('params.', '')
            updateField(paramKey as AdParamKey, '')
        }
    }

    const showClearButton = (currentValue: string) => currentValue.trim() !== ''
    const titleIsEmpty = form.title.trim() === ''
    const priceIsEmpty = form.price.trim() === ''

    const titleError = focusedField !== 'title' && titleIsEmpty
    const priceError = focusedField !== 'price' && priceIsEmpty

    const handleSave = async () => {
        const adData = buildUpdatePayload(form)

        if (!adData) {
            setNotice({
                open: true,
                severity: 'error',
                message: 'Введите корректную цену',
            })
            return
        }

        setIsSaving(true)

        try {
            await dispatch(updateAdByIdAction({ id: ad.id, adData })).unwrap()
            clearDraftFromStorage()

            setNotice({
                open: true,
                severity: 'success',
                message: 'Изменения сохранены',
            })

            setTimeout(() => {
                navigate(`/ads/${ad.id}`)
            }, 850)
        } catch {
            setNotice({
                open: true,
                severity: 'error',
                message: 'Ошибка сохранения. Попробуйте еще раз или зайдите позже.',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const updateField = (key: AdParamKey, value: string) => {
        setForm((prev) => {
            if (!prev) {
                return prev
            }

            return {
                ...prev,
                params: {
                    ...prev.params,
                    [key]: value,
                },
            }
        })
    }

    const handleCategoryChange = (nextCategory: Ad['category']) => {
        setForm((prev) => {
            if (!prev) {
                return prev
            }

            const nextKeys = AD_CATEGORY_FIELDS[nextCategory].map((item) => item.key)
            const nextParams: Partial<Record<AdParamKey, string>> = {}
            const prevParams = prev.params

            nextKeys.forEach((key) => {
                nextParams[key] = prevParams[key] ?? ''
            })

            return {
                ...prev,
                category: nextCategory,
                params: nextParams,
            }
        })
    }

    const isAiPopoverOpen = Boolean(aiPopoverAnchor)

    const requestAiResponse = async (mode: 'description' | 'pricing') => {
        if (mode === 'pricing') {
            setHasPricingRequest(true)
            setIsPricingLoading(true)
            setPricingErrorMessage(null)
        } else {
            setHasDescriptionRequest(true)
            setIsDescriptionLoading(true)
            setDescriptionErrorMessage(null)
        }

        try {
            const paramsText = AD_CATEGORY_FIELDS[form.category]
                .map((field) => {
                    const value = form.params[field.key]?.trim()
                    return `${field.label}: ${value || 'не указано'}`
                })
                .join('\n')

            const baseContext = [
                `Категория: ${form.category}`,
                `Название: ${form.title || 'без названия'}`,
                `Цена: ${form.price || 'не указана'}`,
                `Характеристики:\n${paramsText}`,
                `Описание: ${form.description || 'пусто'}`,
            ].join('\n\n')

            const prompt = buildAiPrompt(baseContext, mode)
            const responseText = await generateWithOllama(prompt)
            if (mode === 'pricing') {
                setPricingResponseText(responseText)
            } else {
                setDescriptionResponseText(responseText)
            }
        } catch {
            if (mode === 'pricing') {
                setPricingErrorMessage('Не удалось получить ответ от Ollama. Проверьте, что сервер Ollama запущен.')
            } else {
                setDescriptionErrorMessage('Не удалось получить ответ от Ollama. Проверьте, что сервер Ollama запущен.')
            }
        } finally {
            if (mode === 'pricing') {
                setIsPricingLoading(false)
            } else {
                setIsDescriptionLoading(false)
            }
        }
    }

    const applyAiResponseToDescription = () => {
        if (!descriptionResponseText) {
            return
        }

        setForm((prev) => (prev ? { ...prev, description: descriptionResponseText.slice(0, 1000) } : prev))
        setDescriptionPopoverAnchor(null)
    }

    const handleOpenAiPopover = (event: MouseEvent<HTMLButtonElement>) => {
        setAiPopoverAnchor(event.currentTarget)
        requestAiResponse('pricing')
    }

    const handleCloseAiPopover = () => {
        setAiPopoverAnchor(null)
    }

    const isDescriptionPopoverOpen = Boolean(descriptionPopoverAnchor)

    const handleOpenDescriptionPopover = (event: MouseEvent<HTMLButtonElement>) => {
        setDescriptionPopoverAnchor(event.currentTarget)
        requestAiResponse('description')
    }

    const handleCloseDescriptionPopover = () => {
        setDescriptionPopoverAnchor(null)
    }

    const priceButtonLabel = isPricingLoading ? 'Выполняется запрос' : hasPricingRequest ? 'Повторить запрос' : 'Узнать рыночную цену'
    const descriptionButtonLabel = isDescriptionLoading
        ? 'Выполняется запрос'
        : hasDescriptionRequest
            ? 'Повторить запрос'
            : form.description.trim() === ''
                ? 'Придумать описание'
                : 'Улучшить описание'

    return (
        <Box sx={{ minHeight: '100dvh', py: 2, px: 2 }}>
            <Box
                sx={{
                    maxWidth: 1300,
                    mx: 'auto',
                    p: 2.5,
                }}
            >
                <Typography sx={{ fontSize: 30, lineHeight: 1.1, fontWeight: 500, color: '#2E2E33', mb: 2 }}>
                    Редактирование объявления
                </Typography>

                <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ position: 'relative' }}>
                    <Box sx={{ width: 700 }}>
                        <LabeledInputField
                            label={
                                <Typography sx={{ fontWeight: 500, color: '#2F3037', mb: 0.6 }}>
                                    <Box component="span" sx={{ color: '#DE3730', mr: 0.5 }}>* </Box>
                                    Категория
                                </Typography>
                            }
                            required
                            value={form.category}
                            onChange={(value) => handleCategoryChange(value as Ad['category'])}
                            selectOptions={AD_CATEGORY_OPTIONS}
                            wrapperSx={{ mb: 1.5 }}
                        />

                        <Divider sx={{ borderColor: '#E6E7EB', mb: 1.8 }} />

                        <LabeledInputField
                            label={
                                <Typography sx={{ fontWeight: 500, color: '#2F3037', mb: 0.6 }}>
                                    <Box component="span" sx={{ color: '#DE3730', mr: 0.5 }}>* </Box>
                                    Название
                                </Typography>
                            }
                            required
                            value={form.title}
                            onChange={(value) => setForm((prev) => (prev ? { ...prev, title: value } : prev))}
                            onFocus={() => setFocusedField('title')}
                            onBlur={() => setFocusedField(null)}
                            error={titleError}
                            helperText={titleError ? 'Название должно быть заполнено' : ' '}
                            showClear={showClearButton(form.title)}
                            onClear={() => clearFieldValue('title')}
                            wrapperSx={{ mb: 1.1 }}
                        />

                        <LabeledInputField
                            label={
                                <Typography sx={{ fontWeight: 500, color: '#2F3037', mb: 0.6 }}>
                                    <Box component="span" sx={{ color: '#DE3730', mr: 0.5 }}>* </Box>
                                    Цена
                                </Typography>
                            }
                            required
                            value={form.price}
                            onChange={(value) => setForm((prev) => (prev ? { ...prev, price: value } : prev))}
                            digitsOnly
                            onFocus={() => setFocusedField('price')}
                            onBlur={() => setFocusedField(null)}
                            error={priceError}
                            helperText={priceError ? 'Цена должна быть заполнена' : ' '}
                            showClear={showClearButton(form.price)}
                            onClear={() => clearFieldValue('price')}
                            wrapperSx={{ mb: 1.8 }}
                            textFieldSx={{
                                anchorName: '--price-anchor',
                            }}
                        />

                        <Divider sx={{ borderColor: '#E6E7EB', mb: 1.8 }} />

                        <Typography sx={{ fontWeight: 500, color: '#2F3037', mb: 1.2 }}>
                            Характеристики
                        </Typography>

                        <Stack spacing={1.2}>
                            {fields.map((field) => {
                                const paramValue = form.params[field.key] ?? ''
                                const isParamEmpty = paramValue.trim() === ''

                                return (
                                    <LabeledInputField
                                        key={field.key}
                                        label={field.label}
                                        value={paramValue}
                                        onChange={(value) => updateField(field.key, value)}
                                        digitsOnly={NUMERIC_PARAM_KEYS.has(field.key)}
                                        selectOptions={field.selectOptions}
                                        isEmpty={isParamEmpty}
                                        showClear={!field.selectOptions && showClearButton(paramValue)}
                                        onClear={() => clearFieldValue(`params.${field.key}`)}
                                    />
                                )
                            })}
                        </Stack>

                        <Divider sx={{ borderColor: '#E6E7EB', my: 1.8 }} />

                        <Typography sx={{ fontWeight: 500, color: '#2F3037', mb: 1.2 }}>
                            Описание
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            value={form.description}
                            onChange={(event) =>
                                setForm((prev) => (prev ? { ...prev, description: event.target.value.slice(0, 1000) } : prev))
                            }
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: form.description.trim() === '' ? '#FFF7ED' : '#F4F4F5' } }}
                        />

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Button
                                startIcon={<AutoAwesomeOutlinedIcon />}
                                onClick={handleOpenDescriptionPopover}
                                disabled={isDescriptionLoading}
                                sx={{
                                    px: 3,
                                    height: 40,
                                    minHeight: 40,
                                    textTransform: 'none',
                                    color: '#E5932E',
                                    bgcolor: '#F9F1E6',
                                    '&:hover': { bgcolor: '#F8E7D1' },
                                }}
                            >
                                {descriptionButtonLabel}
                            </Button>
                            <AiResponsePopover
                                open={isDescriptionPopoverOpen}
                                anchorEl={descriptionPopoverAnchor}
                                onClose={handleCloseDescriptionPopover}
                                adTitle={form.title}
                                responseText={descriptionResponseText}
                                isLoading={isDescriptionLoading}
                                errorMessage={descriptionErrorMessage}
                                onApply={applyAiResponseToDescription}
                                applyLabel="Вставить"
                            />
                            <Typography sx={{ color: '#A4A5AB' }}>{form.description.length} / 1000</Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                disabled={isSaving || titleIsEmpty || priceIsEmpty}
                                onClick={handleSave}
                                sx={{ textTransform: 'none', boxShadow: 'none' }}
                            >
                                Сохранить
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/ads/${ad.id}`)}
                                sx={{
                                    textTransform: 'none',
                                    bgcolor: '#D7D9DE',
                                    color: '#4E5057',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#CBCED5', boxShadow: 'none' },
                                }}
                            >
                                Отменить
                            </Button>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            positionAnchor: '--price-anchor',
                            top: 'anchor(top)',
                            left: 'anchor(right)',
                            ml: 2,
                        }}
                    >
                        <Button
                            startIcon={<ReplayRoundedIcon />}
                            onClick={handleOpenAiPopover}
                            disabled={isPricingLoading}
                            sx={{
                                px: 3,
                                height: 40,
                                minHeight: 40,
                                textTransform: 'none',
                                color: '#E5932E',
                                bgcolor: '#F9F1E6',
                                '&:hover': { bgcolor: '#F8E7D1' },
                            }}
                        >
                            {priceButtonLabel}
                        </Button>

                        <AiResponsePopover
                            open={isAiPopoverOpen}
                            anchorEl={aiPopoverAnchor}
                            onClose={handleCloseAiPopover}
                            adTitle={form.title}
                            responseText={pricingResponseText}
                            isLoading={isPricingLoading}
                            errorMessage={pricingErrorMessage}
                            showApplyButton={false}
                        />
                    </Box>
                </Stack>
            </Box>

            <Snackbar
                open={notice.open}
                autoHideDuration={2600}
                onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotice((prev) => ({ ...prev, open: false }))}
                    severity={notice.severity}
                    variant="outlined"
                    sx={{ width: '100%' }}
                >
                    {notice.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default AdEditPage
