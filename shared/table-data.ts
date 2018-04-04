export enum CellType {
    INTEGER = 1, // avoid using 0 value to distinguish from 'undefined' in: col.cellType || CellType.FLOAT
    FLOAT,
    TIME,
    STRING
}
export type CellData = string | number;
export type RowData = CellData[];

export interface ColumnDefinition {
    id: string;
    el: string;
    cellType?: CellType;
    header?: string;
    patchEl?: string;
    readonly?: boolean;
    hidden?: boolean;
}
export interface TableData {
    columns: ColumnDefinition[];
    rows: RowData[];
    /**
     * The display rows are what the table
     * shows after possible ordering and filtering
     * [ 3, 7, 5 ] means that the displayed rows are
     * rows[3] rows[7] and rows[5] out of rows[0..10]
     * for instance
     */
    displayRows?: number[];
}
