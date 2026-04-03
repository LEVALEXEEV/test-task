import { Box, IconButton, InputAdornment, MenuItem, TextField, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type React from 'react'
import type { SxProps, Theme } from '@mui/material'

type SelectOption = {
    value: string
    label: string
}

type LabeledInputFieldProps = {
    label: string | React.ReactNode
    value: string
    onChange: (value: string) => void
    digitsOnly?: boolean
    selectOptions?: SelectOption[]
    required?: boolean
    error?: boolean
    helperText?: string
    onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
    isEmpty?: boolean
    showClear?: boolean
    onClear?: () => void
    wrapperSx?: SxProps<Theme>
    labelSx?: SxProps<Theme>
    textFieldSx?: SxProps<Theme>
}

function LabeledInputField({
    label,
    value,
    onChange,
    digitsOnly = false,
    selectOptions,
    error = false,
    helperText,
    onFocus,
    onBlur,
    isEmpty = false,
    showClear = false,
    onClear,
    wrapperSx,
    labelSx,
    textFieldSx,
}: LabeledInputFieldProps) {
    return (
        <Box sx={wrapperSx}>
            {typeof label === 'string' ? (
                <Typography sx={{ fontWeight: 300, color: '#2F3037', mb: 0.6, ...labelSx }}>{label}</Typography>
            ) : (
                label
            )}
            <TextField
                select={Boolean(selectOptions)}
                fullWidth
                size="small"
                value={value}
                onChange={(event) => {
                    const nextValue = digitsOnly ? event.target.value.replace(/\D/g, '') : event.target.value
                    onChange(nextValue)
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                error={error}
                helperText={helperText}
                inputProps={
                    digitsOnly
                        ? {
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                          }
                        : undefined
                }
                slotProps={{
                    input: {
                        endAdornment:
                            !selectOptions && showClear && onClear ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={onClear}>
                                        <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : undefined,
                    },
                    formHelperText: {
                        sx: { mt: 0.5 },
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        fontWeight: 300,
                        pr: 0.5,
                        bgcolor: isEmpty ? '#FFF7ED' : '#F4F4F5',
                    },
                    ...textFieldSx,
                }}
            >
                {selectOptions?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    )
}

export default LabeledInputField