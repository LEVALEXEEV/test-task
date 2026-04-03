import { createSlice } from '@reduxjs/toolkit'
import type { Ad } from '../../../types/ad'
import { fetchAdByIdAction } from './api-actions'

type AdState = {
    ad: Ad | null
    isFetchingAdStatus: boolean
}

const initialState: AdState = {
    ad: null,
    isFetchingAdStatus: false,
}

export const adSlice = createSlice({
    name: 'single-ad',
    initialState,
    reducers: {},

    extraReducers(builder) {
        builder
            .addCase(fetchAdByIdAction.fulfilled, (state, action) => {
                state.ad = action.payload;
                state.isFetchingAdStatus = false;
            })
            .addCase(fetchAdByIdAction.pending, (state) => {
                state.ad = null;
                state.isFetchingAdStatus = true;
            })
            .addCase(fetchAdByIdAction.rejected, (state) => {
                state.ad = null;
                state.isFetchingAdStatus = false;
            })
    },
})
