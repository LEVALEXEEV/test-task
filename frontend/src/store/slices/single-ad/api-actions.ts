import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AxiosInstance } from 'axios'
import type { Ad, AdUpdateIn } from '../../../types/ad'

export const fetchAdByIdAction = createAsyncThunk<
    Ad | null,
    number,
    {
        extra: AxiosInstance
    }
>('fetchAdById', async (id, { extra: api }) => {
    const { data } = await api.get<Ad & { needsRevision: boolean }>(`/items/${id}`)
    const { needsRevision: _needsRevision, ...ad } = data
    return ad
})

export const updateAdByIdAction = createAsyncThunk<
    void,
    { id: number; adData: AdUpdateIn },
    {
        extra: AxiosInstance
    }
>('updateAdById', async ({ id, adData }, { extra: api }) => {
    await api.put<{ success: true }>(`/items/${id}`, adData)
})