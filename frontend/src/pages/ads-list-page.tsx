import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    Checkbox,
    Collapse,
    CircularProgress,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    Divider,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded'
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import AdCard from '../components/ad-card'
import type { AdCategoryCode } from '../types/ad'
import { AD_CATEGORY_OPTIONS, SORT_QUERY_MAP } from '../const'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAdsAction, getAds, getAdsTotal, getIsFetchingAdsStatus } from '../store/slices/ads-list'
import type { SortOptionValue } from '../types/sort-params'

const NON_PAGINATED_LIMIT = 1000
const ADS_VIEW_MODE_STORAGE_KEY = 'ads-list:view-mode'
const ADS_PAGINATION_STORAGE_KEY = 'ads-list:pagination-enabled'

type ViewMode = 'grid' | 'list'

const getInitialViewMode = (): ViewMode => {
    if (typeof window === 'undefined') {
        return 'list'
    }

    const stored = window.localStorage.getItem(ADS_VIEW_MODE_STORAGE_KEY)
    return stored === 'grid' || stored === 'list' ? stored : 'list'
}

const getInitialPaginationEnabled = (): boolean => {
    if (typeof window === 'undefined') {
        return true
    }

    const stored = window.localStorage.getItem(ADS_PAGINATION_STORAGE_KEY)
    if (stored === 'true') {
        return true
    }

    if (stored === 'false') {
        return false
    }

    return true
}

function AdsListPage() {
    const dispatch = useAppDispatch()
    const Ads = useAppSelector(getAds)
    const totalAds = useAppSelector(getAdsTotal)
    const isFetchingAds = useAppSelector(getIsFetchingAdsStatus)

    const [isCategoryOpen, setIsCategoryOpen] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
    const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>(getInitialPaginationEnabled)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<AdCategoryCode[]>([])
    const [showOnlyNeedsRevision, setShowOnlyNeedsRevision] = useState(false)
    const [sortOption, setSortOption] = useState<SortOptionValue>('created-desc')

    const itemsPerPage = viewMode === 'list' ? 3 : 10
    const hasCategoryFilters = selectedCategories.length > 0
    const requestSkip = isPaginationEnabled ? (currentPage - 1) * itemsPerPage : 0
    const requestLimit = isPaginationEnabled ? itemsPerPage : NON_PAGINATED_LIMIT
    const normalizedQuery = searchQuery.trim()

    useEffect(() => {
        dispatch(
            fetchAdsAction({
                q: normalizedQuery || undefined,
                limit: requestLimit,
                skip: requestSkip,
                needsRevision: showOnlyNeedsRevision ? true : undefined,
                categories: hasCategoryFilters ? selectedCategories : undefined,
                ...SORT_QUERY_MAP[sortOption],
            })
        )
    }, [
        currentPage,
        dispatch,
        hasCategoryFilters,
        itemsPerPage,
        normalizedQuery,
        requestLimit,
        requestSkip,
        selectedCategories,
        showOnlyNeedsRevision,
        sortOption,
    ])

    const toggleCategory = (category: AdCategoryCode) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
        )
    }

    const totalPages = useMemo(() => {
        if (!isPaginationEnabled) {
            return 1
        }

        return Math.max(1, Math.ceil(totalAds / itemsPerPage))
    }, [isPaginationEnabled, itemsPerPage, totalAds])

    useEffect(() => {
        setCurrentPage(1)
    }, [viewMode, isPaginationEnabled, searchQuery, selectedCategories, showOnlyNeedsRevision, sortOption])

    const handleSortChange = (event: SelectChangeEvent<SortOptionValue>) => {
        setSortOption(event.target.value as SortOptionValue)
    }

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    useEffect(() => {
        window.localStorage.setItem(ADS_VIEW_MODE_STORAGE_KEY, viewMode)
    }, [viewMode])

    useEffect(() => {
        window.localStorage.setItem(ADS_PAGINATION_STORAGE_KEY, String(isPaginationEnabled))
    }, [isPaginationEnabled])

    return (
        <Box
            sx={{
                bgcolor: '#F7F5F8',
                height: '100dvh',
                pt: 4,
                pb: 1,
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <Box sx={{ maxWidth: 1300, mx: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ fontWeight: 500, color: '#1f1f25', mb: 0.5 }}>
                    Мои объявления
                </Typography>
                <Typography sx={{ color: '#8b8c93', mb: 3 }}>{totalAds} объявления</Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid #F0F0F0',
                        bgcolor: '#FFFFFF',
                        mb: 1.5,
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="stretch">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Найти объявление...."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            sx={{
                                bgcolor: '#f1f2f5',
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: '#edf0f4' },
                                '& .MuiOutlinedInput-root': { height: 40 },
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchRoundedIcon fontSize="small" sx={{ color: '#4a4a50' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                            <Stack
                                direction="row"
                                alignItems="center"
                                sx={{
                                    height: 40,
                                    bgcolor: '#F0F0F0',
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('grid')}
                                    sx={{
                                        borderRadius: 0,
                                        width: 40,
                                        aspectRatio: '1 / 1',
                                        color: viewMode === 'grid' ? '#2196f3' : '#7f8087',
                                        bgcolor: viewMode === 'grid' ? '#eaf3ff' : 'transparent',
                                    }}
                                >
                                    <GridViewRoundedIcon fontSize="small" />
                                </IconButton>
                                <Box sx={{ width: 1.5, height: 30, bgcolor: '#FFFFFF' }} />
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('list')}
                                    sx={{
                                        borderRadius: 0,
                                        width: 40,
                                        aspectRatio: '1 / 1',
                                        color: viewMode === 'list' ? '#2196f3' : '#7f8087',
                                        bgcolor: viewMode === 'list' ? '#eaf3ff' : 'transparent',
                                    }}
                                >
                                    <ViewListRoundedIcon fontSize="small" />
                                </IconButton>
                            </Stack>

                            <IconButton
                                size="small"
                                onClick={() => setIsPaginationEnabled((prev) => !prev)}
                                sx={{
                                    borderRadius: 1.5,
                                    width: 40,
                                    aspectRatio: '1 / 1',
                                    color: isPaginationEnabled ? '#2196f3' : '#7f8087',
                                    bgcolor: isPaginationEnabled ? '#eaf3ff' : '#F0F0F0',
                                }}
                            >
                                <ViewWeekRoundedIcon fontSize="small" />
                            </IconButton>

                            <Select
                                size="small"
                                value={sortOption}
                                onChange={handleSortChange}
                                sx={{
                                    minWidth: 215,
                                    height: 40,
                                    bgcolor: '#FFFFFF',
                                    color: '#41434a',
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '100%',
                                        py: 0,
                                        boxSizing: 'border-box',
                                    },
                                    '& fieldset': { border: '5px solid #f1f2f5', borderRadius: 2 },
                                }}
                            >
                                <MenuItem value="created-desc">По дате (сначала новые)</MenuItem>
                                <MenuItem value="created-asc">По дате (сначала старые)</MenuItem>
                                <MenuItem value="title-asc">По имени (А-Я)</MenuItem>
                                <MenuItem value="title-desc">По имени (Я-А)</MenuItem>
                            </Select>
                        </Stack>
                    </Stack>
                </Paper>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        alignItems: 'stretch',
                        flexDirection: 'row',
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    <Box sx={{ width: 250, alignSelf: 'flex-start' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid #F0F0F0',
                                bgcolor: '#FFFFFF',
                                display: 'block',
                            }}
                        >
                            <Typography sx={{ fontWeight: 500, color: '#22232a', mb: 1.5 }}>Фильтры</Typography>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mb: 1, cursor: 'pointer' }}
                                onClick={() => setIsCategoryOpen((prev) => !prev)}
                            >
                                <Typography sx={{ color: '#3d3f46' }}>Категория</Typography>
                                {isCategoryOpen ? (
                                    <ExpandLessRoundedIcon sx={{ color: '#4d4f57' }} />
                                ) : (
                                    <ExpandMoreRoundedIcon sx={{ color: '#4d4f57' }} />
                                )}
                            </Stack>

                            <Collapse in={isCategoryOpen} timeout="auto">
                                <Stack spacing={0.75} sx={{ pb: 2 }}>
                                    {AD_CATEGORY_OPTIONS.map((category) => (
                                        <Stack key={category.value} direction="row" alignItems="center" spacing={0.75}>
                                            <Checkbox
                                                size="small"
                                                checked={selectedCategories.includes(category.value)}
                                                onChange={() => toggleCategory(category.value)}
                                                sx={{ p: 0.2, '& .MuiSvgIcon-root': { fontSize: 20, color: '#c2c4cc' } }}
                                            />
                                            <Typography sx={{ color: '#4a4c54' }}>{category.label}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Collapse>
                            <Divider sx={{ borderColor: '#E6E7EB'}} />
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1.5 }}>
                                <Typography sx={{ fontWeight: 500, color: '#2f3037', lineHeight: 1.3 }}>Только требующие доработок</Typography>
                                <Switch checked={showOnlyNeedsRevision} onChange={(event) => setShowOnlyNeedsRevision(event.target.checked)} />
                            </Stack>
                        </Paper>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                setSelectedCategories([])
                                setSearchQuery('')
                                setShowOnlyNeedsRevision(false)
                            }}
                            sx={{
                                height: 50,
                                mt: 1,
                                textTransform: 'none',
                                boxShadow: 'none',
                                borderRadius: 2,
                                border: '1px solid #F0F0F0',
                                bgcolor: '#FFFFFF',
                                fontWeight: 400,
                                color: '#9d9ea5',
                                '&:hover': { boxShadow: 'none', bgcolor: '#e4e4e8' },
                            }}
                        >
                            Сбросить фильтры
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            overflowY: isPaginationEnabled ? 'hidden' : 'scroll',
                            height: '100%',
                        }}
                    >
                        {isFetchingAds ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'transparent',
                                }}
                            >
                                <CircularProgress size={40} thickness={5} sx={{ color: '#3c97ff' }} />
                            </Paper>
                        ) : Ads.length === 0 ? (
                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: '#8b8c93',
                                }}
                            >
                                <Typography>Ничего не нашлось</Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        viewMode === 'list'
                                            ? '1fr'
                                            : 'repeat(5, 1fr)',
                                    alignItems: 'start',
                                    alignContent: 'start',
                                    gap: 1.5,
                                    flex: isPaginationEnabled ? 1 : 'none',
                                    minHeight: isPaginationEnabled ? 0 : 'max-content',
                                    overflowY: isPaginationEnabled ? 'auto' : 'visible',
                                    pr: 0.5,
                                }}
                            >
                                {Ads.map((item, index) => (
                                    <AdCard key={index} item={item} viewMode={viewMode} />
                                ))}
                            </Box>
                        )}


                        {isPaginationEnabled && totalPages !== 1 && (
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mt: 1.5,
                                    flexShrink: 0
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    disabled={!isPaginationEnabled || currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    sx={{
                                        minWidth: 40,
                                        width: 40,
                                        height: 40,
                                        p: 0,
                                        borderRadius: 1.5,
                                        border: '1px solid #F0F0F0',
                                        bgcolor: '#FFFFFF',
                                    }}
                                >
                                    <ChevronLeftRoundedIcon fontSize="small" sx={{ color: !isPaginationEnabled || currentPage === 1 ? '#bec0c8' : '#6b6d75' }} />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    const isActive = page === currentPage

                                    return (
                                        <Button
                                            key={page}
                                            variant="outlined"
                                            onClick={() => setCurrentPage(page)}
                                            sx={{
                                                minWidth: 40,
                                                width: 40,
                                                height: 40,
                                                p: 0,
                                                borderRadius: 1.5,
                                                borderColor: isActive ? '#3c97ff' : '#F0F0F0',
                                                bgcolor: isActive ? '#eaf3ff' : '#FFFFFF',
                                                color: isActive ? '#2196f3' : '#30333a',
                                                fontWeight: 400,
                                                fontSize: 14,
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    )
                                })}

                                <Button
                                    variant="outlined"
                                    disabled={!isPaginationEnabled || currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    sx={{
                                        minWidth: 40,
                                        width: 40,
                                        height: 40,
                                        p: 0,
                                        borderRadius: 1.5,
                                        border: '1px solid #F0F0F0',
                                        bgcolor: '#FFFFFF',
                                    }}
                                >
                                    <ChevronRightRoundedIcon fontSize="small" sx={{ color: !isPaginationEnabled || currentPage === totalPages ? '#bec0c8' : '#6b6d75' }} />
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default AdsListPage
