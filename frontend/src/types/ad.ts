export type AdCategoryCode = 'auto' | 'electronics' | 'real_estate'

export type AdParamValue = string | number

export type AdUpdateIn = Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>

export type AutoItemParams = {
    brand?: string
    model?: string
    yearOfManufacture?: number
    transmission?: 'automatic' | 'manual'
    mileage?: number
    enginePower?: number
}

export type RealEstateItemParams = {
    type?: 'flat' | 'house' | 'room'
    address?: string
    area?: number
    floor?: number
}

export type ElectronicsItemParams = {
    type?: 'phone' | 'laptop' | 'misc'
    brand?: string
    model?: string
    condition?: 'new' | 'used'
    color?: string
}

export type Ad = {
    id: number
    title: string
    description: string
    price: number
    createdAt: string
    updatedAt: string
} & (
        | {
            category: 'auto'
            params: AutoItemParams;
        }
        | {
            category: 'real_estate'
            params: RealEstateItemParams;
        }
        | {
            category: 'electronics'
            params: ElectronicsItemParams;
        }
    );


