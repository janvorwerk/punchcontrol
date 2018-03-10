export interface PersonDto {
    externalKey?: string,
    ecard?: string,
    firstName: string,
    lastName: string,
    sex?: 'M' | 'F',
    birthYear?: number
}
