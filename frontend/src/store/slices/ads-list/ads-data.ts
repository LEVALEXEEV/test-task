import { createSlice } from '@reduxjs/toolkit'
import type { CompactAd } from '../../../types/ad'
import { fetchAdsAction } from './api-actions'
import { NameSpace } from '../../../const'

type AdsState = {
    ads: CompactAd[]
    total: number
    isFetchingAdsStatus: boolean
}

const initialState: AdsState = {
    ads: [],
    total: 0,
    isFetchingAdsStatus: false,
}

export const adsSlice = createSlice({
    name: NameSpace.ADS,
    initialState,
    reducers: {},

    extraReducers(builder) {
        builder
            .addCase(fetchAdsAction.fulfilled, (state, action) => {
                state.ads = action.payload.items;
                state.total = action.payload.total;
                state.isFetchingAdsStatus = false;
            })
            .addCase(fetchAdsAction.pending, (state) => {
                state.isFetchingAdsStatus = true;
            })
            .addCase(fetchAdsAction.rejected, (state) => {
                state.isFetchingAdsStatus = false;
            })
    },
})
