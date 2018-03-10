export interface ColumnDefinition {
    id: string;
    el: string;
    header?: string;
    display?: ColumnDisplay;
    patchEl?: string;
}

export interface ColumnDisplay {
    readonly: boolean;
    hidden?: boolean;
}

export interface TableData {
    columns: ColumnDefinition[];
    rows: any[][];
}
