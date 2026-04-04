import { useEffect } from 'react'
import { Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Link as RouterLink, useParams } from 'react-router-dom'
import type { AdParamValue } from '../types/ad'
import { AD_CATEGORY_PARAM_KEYS, AD_PARAM_LABELS, AD_PARAM_VALUE_LABELS } from '../const'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAdByIdAction, getAd, getIsFetchingAdStatus } from '../store/slices/single-ad'
import type { AdParamKey } from '../types/ad-edit'

const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoDate))

const formatParamValue = (value: unknown): string => {
    if (typeof value === 'string' && AD_PARAM_VALUE_LABELS[value]) {
        return AD_PARAM_VALUE_LABELS[value]
    }

    if (typeof value === 'number') {
        return String(value)
    }

    return String(value ?? '-')
}

function AdPage() {
    const dispatch = useAppDispatch()
    const { id } = useParams()
    const ad = useAppSelector(getAd)
    const isFetchingAd = useAppSelector(getIsFetchingAdStatus)
    const adId = Number(id)
    const hasValidId = Number.isFinite(adId)

    useEffect(() => {
        if (hasValidId) {
            dispatch(fetchAdByIdAction(adId))
        }
    }, [adId, dispatch, hasValidId])

    if (isFetchingAd) {
        return (
            <Box sx={{ bgcolor: '#F7F5F8', minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 3 }}>
                <CircularProgress size={40} thickness={5} sx={{ color: '#3c97ff' }} />
            </Box>
        )
    }

    if (!hasValidId || !ad) {
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

    const params = ad.params as Record<string, AdParamValue>
    const missingParams: (AdParamKey | 'description')[] = AD_CATEGORY_PARAM_KEYS[ad.category].filter((paramKey) => {
        const value = params[paramKey]
        return value === undefined || value === null || value === ''
    })

    if (!ad.description?.trim()) {
        missingParams.unshift('description')
    }

    const visibleEntries = Object.entries(ad.params)

    return (
        <Box sx={{ bgcolor: '#F7F5F8', minHeight: '100dvh', p: 3 }}>
            <Box
                sx={{
                    maxWidth: 1300,
                    mx: 'auto',
                    borderRadius: 2,
                    p: 3,
                }}
            >

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: 30, lineHeight: 1.15, fontWeight: 500, color: '#2E2E33' }}>
                        {ad.title}
                    </Typography>
                    <Typography sx={{ fontSize: 30, lineHeight: 1.2, fontWeight: 500, color: '#2E2E33' }}>
                        {ad.price} ₽
                    </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            component={RouterLink}
                            to="/ads"
                            sx={{
                                textTransform: 'none',
                                color: '#4E5057',
                                bgcolor: '#FFFFFF',
                                border: '1px solid #E6E7EB',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#F3F4F7' },
                            }}
                        >
                            <ArrowBackRoundedIcon />
                        </Button>
                        <Button
                            component={RouterLink}
                            to={`/ads/${adId}/edit`}
                            variant="contained"
                            endIcon={<EditOutlinedIcon />}
                            sx={{ textTransform: 'none', bgcolor: '#2A8BF2', borderRadius: 1.5, boxShadow: 'none', fontWeight: 300, alignSelf: 'flex-start' }}
                        >
                            Редактировать
                        </Button>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: '#8B8C93', fontWeight: 300 }}>Опубликовано: {formatDate(ad.createdAt)}</Typography>
                        <Typography sx={{ color: '#8B8C93', fontWeight: 300 }}>Отредактировано: {formatDate(ad.updatedAt)}</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ borderColor: '#ECECEF', mb: 3 }} />

                <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            width: 430,
                            height: 320,
                            bgcolor: '#F0F1F4',
                            borderRadius: 1,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <ImageOutlinedIcon sx={{ fontSize: 140, color: '#9E9FA7' }} />
                    </Box>

                    <Box sx={{ width: 512 }}>
                        {missingParams.length > 0 && (
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: '#F9F1E6',
                                    border: '1px solid #EEE5D8',
                                    mb: 3,
                                }}
                            >
                                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                    <ErrorOutlineRoundedIcon sx={{ color: '#F0A43A', mt: 0.2 }} />
                                    <Box>
                                        <Typography sx={{ fontWeight: 500, color: '#2F3037' }}>Требуются доработки</Typography>
                                        <Typography sx={{ color: '#000000d4', mt: 0.25, fontWeight: 300, fontSize: 14 }}>У объявления не заполнены поля:</Typography>
                                        <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#000000d4', fontWeight: 300, fontSize: 14, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
                                            {missingParams.map((param) => (
                                                <Box component="li" key={param}>{AD_PARAM_LABELS[param] ?? param}</Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Stack>
                            </Paper>
                        )}

                        <Typography sx={{ fontSize: 24, lineHeight: 1.2, fontWeight: 500, color: '#2F3037', mb: 1.2 }}>
                            Характеристики
                        </Typography>
                        <Stack spacing={0.8}>
                            {visibleEntries.length > 0 ? (
                                visibleEntries.map(([key, value]) => (
                                    <Stack direction="row" spacing={3} key={key}>
                                        <Typography sx={{ minWidth: 160, color: '#8B8C93', fontWeight: 300 }}>
                                            {AD_PARAM_LABELS[key] ?? key}
                                        </Typography>
                                        <Typography sx={{ color: '#2F3037', fontWeight: 300 }}>
                                            {formatParamValue(value)}
                                        </Typography>
                                    </Stack>
                                ))
                            ) : (
                                <Typography sx={{ color: '#8B8C93' }}>Характеристики не заполнены</Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>

                <Typography sx={{ fontSize: 24, lineHeight: 1.2, fontWeight: 500, color: '#2F3037', mb: 1.2 }}>
                    Описание
                </Typography>
                <Typography sx={{ color: '#2F3037', maxWidth: 560, fontWeight: 300 }}>
                    {ad.description || 'Отсутствует'}
                </Typography>
            </Box>
        </Box>
    )
}

export default AdPage
