import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AxiosInstance } from 'axios'
import type { AdsGetCompactOut } from '../../../types/compact-ad'
import type { AdsGetIn } from '../../../types/sort-params'

export const fetchAdsAction = createAsyncThunk<
	AdsGetCompactOut,
	AdsGetIn | undefined,
	{
		extra: AxiosInstance
	}
>('fetchAds', async (query, { extra: api }) => {
	const { data } = await api.get<AdsGetCompactOut>('/items', {
		params: {
			q: query?.q,
			limit: query?.limit,
			skip: query?.skip,
			needsRevision: query?.needsRevision,
			categories: query?.categories?.join(','),
			sortColumn: query?.sortColumn,
			sortDirection: query?.sortDirection,
		},
	})

	return data
})