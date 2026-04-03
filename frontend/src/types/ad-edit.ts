import type { Ad, AutoItemParams, ElectronicsItemParams, RealEstateItemParams } from './ad'

type UnionKeys<T> = T extends unknown ? keyof T : never

export type AdParamKey = Extract<UnionKeys<AutoItemParams | RealEstateItemParams | ElectronicsItemParams>, string>

export type FieldConfig<K extends string = AdParamKey> = {
    key: K
    label: string
    selectOptions?: Array<{ value: string; label: string }>
}

export type NoticeState = {
    open: boolean
    severity: 'success' | 'error'
    message: string
}

export type FormState = Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'price' | 'params'> & {
    price: string
    params: Partial<Record<AdParamKey, string>>
}
