export interface Location {
    type: 'Factory/Warehouse' | 'Business Address' | 'Port' | 'Airport'
    country: string
    city: string
    zip: string
}

export interface Load {
    mode: 'LCL' | 'FCL' | 'Air'
    units: number
    packageType: 'Pallets' | 'Boxes' | 'Crates'
    dims: { l: string; w: string; h: string; unit: 'cm' | 'in' }
    weight: { value: string; unit: 'kg' | 'lb' }
    containerType: '20FT' | '40FT' | '40HC' | '45HC'
    overweight: boolean
}

export interface Goods {
    value: string
    currency: 'USD' | 'EUR' | 'CNY'
    isPersonal: boolean
    isHazardous: boolean
    readyDate: string
}
