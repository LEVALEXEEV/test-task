import type { Ad, AdCategoryCode } from "./ad"
export type AdsSortColumn = Extract<keyof Ad, 'title' | 'createdAt'>;

export type AdsSortDirection = 'asc' | 'desc'

export type AdsGetIn = {
    q?: string
    limit?: number
    skip?: number
    needsRevision?: boolean
    categories?: AdCategoryCode[]
    sortColumn?: AdsSortColumn
    sortDirection?: AdsSortDirection
}

export type SortOptionValue = 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc'
