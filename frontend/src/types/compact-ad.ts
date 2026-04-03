import type { AdCategoryCode } from "./ad"

export type CompactAd = {
    id: number
    category: AdCategoryCode
    title: string
    price: number
    needsRevision: boolean
}

export type AdsGetCompactOut = {
    items: CompactAd[]
    total: number
}