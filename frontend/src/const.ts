import type { Ad, AdCategoryCode } from './types/ad'
import type { FieldConfig } from './types/ad-edit'
import type { SortOptionValue, AdsSortColumn, AdsSortDirection } from './types/sort-params';

export const AD_CATEGORY_LABELS: Record<AdCategoryCode, string> = {
	auto: 'Авто',
	electronics: 'Электроника',
	real_estate: 'Недвижимость',
}

export const AD_CATEGORY_OPTIONS: Array<{ value: AdCategoryCode; label: string }> = [
	{ value: 'auto', label: AD_CATEGORY_LABELS.auto },
	{ value: 'electronics', label: AD_CATEGORY_LABELS.electronics },
	{ value: 'real_estate', label: AD_CATEGORY_LABELS.real_estate },
]

export const SORT_QUERY_MAP: Record<SortOptionValue, { sortColumn: AdsSortColumn; sortDirection: AdsSortDirection }> = {
    'created-desc': { sortColumn: 'createdAt', sortDirection: 'desc' },
    'created-asc': { sortColumn: 'createdAt', sortDirection: 'asc' },
    'title-asc': { sortColumn: 'title', sortDirection: 'asc' },
    'title-desc': { sortColumn: 'title', sortDirection: 'desc' },
}

export const NameSpace = {
    ADS: 'ads',
    SINGLE_AD: 'single-ad'
} as const

export const AD_PARAM_LABELS: Record<string, string> = {
	description: 'Описание',
	type: 'Тип',
	brand: 'Бренд',
	model: 'Модель',
	condition: 'Состояние',
	color: 'Цвет',
	address: 'Адрес',
	area: 'Площадь',
	floor: 'Этаж',
	yearOfManufacture: 'Год выпуска',
	transmission: 'Коробка',
	mileage: 'Пробег',
	enginePower: 'Мощность',
}

export type AdParamKey = Exclude<keyof typeof AD_PARAM_LABELS, 'description'>

export const AD_CATEGORY_PARAM_KEYS: Record<Ad['category'], AdParamKey[]> = {
	auto: ['brand', 'model', 'yearOfManufacture', 'transmission', 'mileage', 'enginePower'],
	real_estate: ['type', 'address', 'area', 'floor'],
	electronics: ['type', 'brand', 'model', 'condition', 'color'],
}

export const AD_PARAM_VALUE_LABELS: Record<string, string> = {
	flat: 'Квартира',
	room: 'Комната',
	house: 'Дом',
	phone: 'Телефон',
	misc: 'Другое',
	new: 'Новое',
	used: 'Б/у',
	automatic: 'Автомат',
	manual: 'Механика',
}

type CategoryParamsMap = {
	[C in Ad['category']]: Extract<Ad, { category: C }>['params']
}

type CategoryFieldConfigMap = {
	[C in Ad['category']]: Array<FieldConfig<Extract<keyof CategoryParamsMap[C], string>>>
}

export const AD_CATEGORY_FIELDS: CategoryFieldConfigMap = {
	auto: [
		{ key: 'brand', label: 'Бренд' },
		{ key: 'model', label: 'Модель' },
		{ key: 'yearOfManufacture', label: 'Год выпуска' },
		{
			key: 'transmission',
			label: 'Коробка',
			selectOptions: [
				{ value: 'automatic', label: 'Автомат' },
				{ value: 'manual', label: 'Механика' },
			],
		},
		{ key: 'mileage', label: 'Пробег' },
		{ key: 'enginePower', label: 'Мощность' },
	],
	electronics: [
		{
			key: 'type',
			label: 'Тип',
			selectOptions: [
				{ value: 'phone', label: 'Телефон' },
				{ value: 'laptop', label: 'Ноутбук' },
				{ value: 'misc', label: 'Другое' },
			],
		},
		{ key: 'brand', label: 'Бренд' },
		{ key: 'model', label: 'Модель' },
		{
			key: 'color',
			label: 'Цвет',
		},
		{
			key: 'condition',
			label: 'Состояние',
			selectOptions: [
				{ value: 'new', label: 'Новое' },
				{ value: 'used', label: 'Б/у' },
			],
		},
	],
	real_estate: [
		{
			key: 'type',
			label: 'Тип',
			selectOptions: [
				{ value: 'flat', label: 'Квартира' },
				{ value: 'house', label: 'Дом' },
				{ value: 'room', label: 'Комната' },
			],
		},
		{ key: 'address', label: 'Адрес' },
		{ key: 'area', label: 'Площадь' },
		{ key: 'floor', label: 'Этаж' },
	],
}