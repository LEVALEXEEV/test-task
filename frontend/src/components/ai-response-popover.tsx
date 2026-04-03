import { Button, Paper, Popover, Stack, Typography } from '@mui/material'
import { useRef } from 'react'

type AiResponsePopoverProps = {
    open: boolean
    anchorEl: HTMLButtonElement | null
    onClose: () => void
    adTitle: string
    responseText: string
    isLoading: boolean
    errorMessage: string | null
    onApply?: () => void
    applyLabel?: string
    showApplyButton?: boolean
}

function AiResponsePopover({
    open,
    anchorEl,
    onClose,
    adTitle,
    responseText,
    isLoading,
    errorMessage,
    onApply,
    applyLabel = 'Применить',
    showApplyButton = true,
}: AiResponsePopoverProps) {
    const paperRef = useRef<HTMLDivElement | null>(null)

    const blurFocusedElementInsidePopover = () => {
        const activeElement = document.activeElement
        if (!activeElement || !(activeElement instanceof HTMLElement)) {
            return
        }

        if (paperRef.current?.contains(activeElement)) {
            activeElement.blur()
        }
    }

    const handleClose = () => {
        blurFocusedElementInsidePopover()
        onClose()
    }

    const handleApply = () => {
        blurFocusedElementInsidePopover()
        onApply?.()
    }

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            sx={{ mt: -1 }}
        >
            <Paper
                ref={paperRef}
                elevation={2}
                sx={{
                    width: 380,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E7E8EC',
                    p: 1.2,
                }}
            >
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.6 }}>Ответ AI:</Typography>
                {isLoading ? (
                    <Typography sx={{ color: '#8B8C93', fontSize: 13, mb: 1 }}>Генерирую ответ для {adTitle || 'объявления'}...</Typography>
                ) : errorMessage ? (
                    <Typography sx={{ color: '#c62828', fontSize: 13, mb: 1 }}>{errorMessage}</Typography>
                ) : (
                    <Typography sx={{ color: '#2F3037', fontSize: 13, whiteSpace: 'pre-line', mb: 1 }}>
                        {responseText || 'Нажмите кнопку генерации, чтобы получить ответ.'}
                    </Typography>
                )}
                <Stack direction="row" spacing={1}>
                    {showApplyButton && (
                        <Button
                            variant="contained"
                            size="small"
                            sx={{ textTransform: 'none', minWidth: 86 }}
                            onClick={handleApply}
                            disabled={!onApply || isLoading || Boolean(errorMessage) || !responseText}
                        >
                            {applyLabel}
                        </Button>
                    )}
                    <Button variant="text" size="small" onClick={handleClose} sx={{ textTransform: 'none', minWidth: 74 }}>
                        Закрыть
                    </Button>
                </Stack>
            </Paper>
        </Popover>
    )
}

export default AiResponsePopover