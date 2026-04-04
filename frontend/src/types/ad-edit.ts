import type { Ad, AutoItemParams, ElectronicsItemParams, RealEstateItemParams } from './ad'

export type AdParamKey = Extract<keyof AutoItemParams | keyof RealEstateItemParams | keyof ElectronicsItemParams, string>

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

export type CategoryParamsMap = {
	[C in Ad['category']]: Extract<Ad, { category: C }>['params']
}

export type CategoryFieldConfigMap = {
	[C in Ad['category']]: Array<FieldConfig<Extract<keyof CategoryParamsMap[C], string>>>
}