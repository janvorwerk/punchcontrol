export interface ElRegularExpression<T> {
    re: RegExp;
    getField(match: RegExpMatchArray, field: T): string;
    has(match: RegExpMatchArray, field: T): boolean;

}


const patch_fields = {
    'entity': 1, 'id': 2, 'field': 3
}
export const PATCH_EL_RE: ElRegularExpression<'entity' | 'id' | 'field'> = {
    re: /(\w+)#(\w+)\.(.*)/,
    getField(match: RegExpMatchArray, field: 'entity' | 'id' | 'field'): string {
        return match[patch_fields[field]]
    },
    has(match: RegExpMatchArray, field: 'entity' | 'id' | 'field') {
        return true;
    }

};

const query_fields = {
    'entity': 1, 'join': 2, 'field': 2, 'relation': 3
}
export const QUERY_EL_RE: ElRegularExpression<'entity' | 'field' | 'relation'> = {
    re: /(\w+)\.(\w+)(?:\>(.*)){0,1}/,
    getField(match: RegExpMatchArray, field: 'entity' | 'field' | 'relation'): string {
        return match[query_fields[field]]
    },
    has(match: RegExpMatchArray, field: 'entity' | 'field' | 'relation') {
        if (field === 'relation') {
            return match[query_fields[field]] != null;
        } else {
            return true;
        }
    }
};

export interface PatchDto {
    id: number;
    patchEl: string;
    oldVal: any;
    newVal: any;
}
