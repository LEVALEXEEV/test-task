import { Box, Chip, Paper, Typography } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { AD_CATEGORY_LABELS } from '../const'
import type { CompactAd } from '../types/compact-ad'

function AdCard({ item, viewMode }: { item: CompactAd; viewMode: 'grid' | 'list' }) {
    const isList = viewMode === 'list'
    return (
        <Paper
            component={RouterLink}
            to={`/ads/${item.id}`}
            elevation={0}
            sx={{
                borderRadius: 2,
                border: '1px solid #F0F0F0',
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                display: 'flex',
                flexDirection: isList ? 'row' : 'column',
                alignSelf: 'start',
                height: isList ? 160 : 250,
                textDecoration: 'none',
                transition: 'border-color .15s ease, box-shadow .15s ease',
                '&:hover': {
                    borderColor: '#dfe1e7',
                    boxShadow: '0 4px 14px rgba(16, 24, 40, 0.06)',
                },
            }}
        >
            <Box
                sx={{
                    flex: isList ? '0 0 215px' : '0 0 55%',
                    bgcolor: '#f0f1f4',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <ImageOutlinedIcon sx={{ fontSize: 64, color: '#9e9fa7' }} />
            </Box>

            <Box
                sx={{
                    px: isList ? 3 : 1.5,
                    pb: 1.5,
                    pt: isList ? 1.5 : 0,
                    mt: isList ? 0 : -1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                }}
            >
                {isList ? <Typography sx={{ color: '#848388' }}>{AD_CATEGORY_LABELS[item.category]}</Typography>
                    :
                    (<Chip
                        label={AD_CATEGORY_LABELS[item.category]}
                        size="small"
                        variant="outlined"
                        sx={{ color: '#595c65', borderColor: '#d9d9d9', borderRadius: '6px', bgcolor: '#FFFFFF', flexGrow: 0, alignSelf: 'flex-start' }}
                    />)
                }
                <Typography
                    noWrap
                    sx={{ color: '#32343c', lineHeight: 1.3, mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', }}
                >
                    {item.title}
                </Typography>
                <Typography sx={{ color: '#00000066', fontWeight: 700, mt: 0.3 }}>{item.price} ₽</Typography>
                {item.needsRevision && (
                    <Chip
                        label={
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                    component="span"
                                    sx={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: '50%',
                                        backgroundColor: 'currentColor',
                                        display: 'inline-block',
                                    }}
                                />
                                <Box component="span">Требует доработок</Box>
                            </Box>
                        }
                        size="small"
                        sx={{
                            borderRadius: '6px',
                            mt: 'auto',
                            color: '#eca119',
                            bgcolor: '#f6efe6',
                            fontWeight: 400,
                            alignSelf: 'flex-start',
                            '& .MuiChip-label': {
                                display: 'flex',
                                alignItems: 'center',
                            }
                        }}
                    />
                )}
            </Box>
        </Paper>
    )
}

export default AdCard