import {
    Component, OnInit, Input, ElementRef, NgZone,
    AfterViewInit, ChangeDetectorRef, HostListener, enableProdMode, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { ScrollService, StickyScrollable } from '../scroll/scroll.service';
import { TableData, CellData, ColumnDefinition, CellType } from '@punchcontrol/shared/table-data';
import { Output } from '@angular/core';
import { LOGGING } from '../../../util/logging';

const LOGGER = LOGGING.getLogger('TableComponent');

export interface CellValueChangeEvent {
    row: number;
    col: number;
    oldValue: CellData;
    newValue: CellData;
}

interface CellRef {
    row: number;
    col: number;
}
interface Range {
    startCol: number;
    endCol: number;
    startRow: number;
    endRow: number;
    equals(other: Range | null): boolean;
    contains(cell: CellRef);
    containsCol(col: number);
}
class ColumnRange implements Range {
    constructor(public start: number, public end: number, private rows) { }

    get startCol(): number {
        return this.start;
    }
    get endCol(): number {
        return this.end;
    }
    get startRow(): number {
        return 0;
    }
    get endRow(): number {
        return this.rows.length - 1;
    }
    equals(other: Range): boolean {
        if (other === null) {
            return false;
        } else if (!(other instanceof ColumnRange)) {
            return false;
        }
        return this.start === other.start && this.end === other.end;
    }
    contains(cell: CellRef) {
        return this.containsCol(cell.col);
    }
    containsCol(col: number) {
        return col >= this.start && col <= this.end;
    }
}
class CellRange implements Range {
    constructor(public start: CellRef, public end: CellRef) { }

    get startCol(): number {
        return this.start.col;
    }
    get endCol(): number {
        return this.end.col;
    }
    get startRow(): number {
        return this.start.row;
    }
    get endRow(): number {
        return this.end.row;
    }
    equals(other: Range | null): boolean {
        if (other === null) {
            return false;
        } else if (!(other instanceof CellRange)) {
            return false;
        }
        return this.start === other.start && this.end === other.end;
    }
    contains(cell: CellRef) {
        return cell.row >= this.start.row &&
            cell.col >= this.start.col &&
            cell.row <= this.end.row &&
            cell.col <= this.end.col;
    }
    containsCol(col: number) {
        return false;
    }
}

function getTargetCell(event: Event): Element {
    let el = event.target as Element;
    while (el && el.tagName !== 'TD' && el.tagName !== 'TH') {
        el = el.parentElement;
    }
    if (!el) {
        LOGGER.warnc(() => `Could not find any th/td (target is ${event.target}`);
    }
    return el;
}

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges, AfterViewInit, StickyScrollable {
    @Input() data: TableData;
    @Output() edit = new EventEmitter<CellValueChangeEvent>();
    sticky: boolean;
    top: number;
    tableWidth: number;
    private selectionRange: Range | null = null;
    private selectionStart: CellRef | null = null;
    private editedCell: Element | null = null;
    /**
     * This is the (sorting-column + 1) * (-1)^^(how many times the user clicked)
     * This way, we can both compare if the sorting column changed and know
     * in which direction we want to sort.
     */
    private sortOrder = 0;
    private bottomElem: Element;
    constructor(scrollService: ScrollService,
        private elementRef: ElementRef,
        private zone: NgZone,
        private detectorRef: ChangeDetectorRef) {
        scrollService.register(this).subscribe(([sticky, top]) => {
            this.top = top;
            this.sticky = sticky;
            const table = this.getTable();

            if (table) {
                if (sticky) {
                    if (!this.tableWidth) {
                        this.tableWidth = table.clientWidth;
                    }
                    table.classList.remove('nosticky');
                } else {
                    table.classList.add('nosticky');
                }
            }
        });
    }

    ngOnInit() {
        this.bottomElem = this.elementRef.nativeElement.querySelector('.bottom');
    }

    ngAfterViewInit(): void {
        this.onResize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        LOGGER.info(() => `Received table with ${this.data.rows.length} lines`);
        this.data.displayRows = this.data.rows.map((r, i) => i); // initially unfiltered, unsorted
    }


    get offsetTop(): number {
        return this.elementRef.nativeElement.offsetTop;
    }

    get offsetBottom(): number {
        return (this.bottomElem as any).offsetTop; // wrong typings
    }

    @HostListener('window:resize')
    onResize(): void {
        const table = this.getTable();
        if (table) {
            this.tableWidth = table.clientWidth;
            // required because the table layout is required for the width
            // to be computed however, the td width depends on it to fill
            // the full table width.
            this.detectorRef.detectChanges();
        }
    }

    onMouseDown(event: MouseEvent): void {
        const el = getTargetCell(event);
        if (!el) {
            return;
        }
        this.unEditCell(el);
        const col = parseInt(el.getAttribute('data-col'), 10);
        if (isNaN(col)) {
            LOGGER.warnc(() => `Could not find data-col attr (target is ${event.target}`);
            return;
        }
        if (el.tagName === 'TH') {
            this.selectionStart = { row: -1, col };
            this.selectionRange = new ColumnRange(col, col, this.data.rows);
        } else {
            // select cell
            const row = parseInt(el.parentElement.getAttribute('data-row'), 10);
            this.selectionStart = { row, col };
            this.selectionRange = new CellRange(this.selectionStart, this.selectionStart);
        }
        this.select(el);
    }

    onMouseUp(event: MouseEvent): void {
        this.selectionStart = null;
    }

    onMouseLeave(event: MouseEvent): void {
        this.selectionStart = null;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.selectionStart == null) {
            return;
        }
        const el = getTargetCell(event);
        if (!el) {
            return;
        }
        const col = parseInt(el.getAttribute('data-col'), 10);
        if (isNaN(col)) {
            LOGGER.warnc(() => `Could not find data-col attr (target is ${event.target}`);
            return;
        }
        let newSelectionRange: Range;
        if (this.selectionStart.row !== -1) {
            const row = parseInt(el.parentElement.getAttribute('data-row'), 10);

            const start = { row: Math.min(row, this.selectionStart.row), col: Math.min(col, this.selectionStart.col) };
            const end = { row: Math.max(row, this.selectionStart.row), col: Math.max(col, this.selectionStart.col) };
            newSelectionRange = new CellRange(start, end);
        } else {
            const start = Math.min(col, this.selectionStart.col);
            const end = Math.max(col, this.selectionStart.col);
            newSelectionRange = new ColumnRange(start, end, this.data.rows);
        }
        if (!newSelectionRange.equals(this.selectionRange)) {
            this.selectionRange = newSelectionRange;
            this.select(el);
        }
    }

    private unEditCell(selectedElem?: Element): boolean {
        const isSameCell = this.editedCell === selectedElem;
        if (!isSameCell && this.editedCell != null) {
            (this.editedCell as any).contentEditable = false;
            this.editedCell = null;
        }
        return isSameCell;
    }
    onDoubleClick(event: MouseEvent) {
        const el = getTargetCell(event);
        if (!el || el.tagName === 'TH' || el.classList.contains('readonly')) {
            return;
        }
        const isSameCell = this.unEditCell(el);
        if (!isSameCell) {
            this.editedCell = el;
            (el as any).contentEditable = true; // typings issue
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    onDiscardEdit(event: KeyboardEvent) {
        event.preventDefault();
        const el = getTargetCell(event);
        if (!el || el !== this.editedCell) {
            return;
        }
        const col = parseInt(el.getAttribute('data-col'), 10);
        const row = parseInt(el.parentElement.getAttribute('data-row'), 10);
        if (isNaN(col) || isNaN(row)) {
            LOGGER.warnc(() => `Could not find col-row attributes ${col}-${row} (target is ${event.target}`);
            return;
        }
        const oldValue = this.data.rows[row][col];
        el.innerHTML = `${oldValue}`; // FIXME format properly (dates, numbers etc...)
        this.unEditCell();
    }

    onKeyPress(event: KeyboardEvent) {
        const handleEvent = ['Enter'].includes(event.key);
        if (handleEvent) {
            event.preventDefault();
            const el = getTargetCell(event);
            if (!el || el.tagName === 'TH') {
                return;
            }
            const col = parseInt(el.getAttribute('data-col'), 10);
            const row = parseInt(el.parentElement.getAttribute('data-row'), 10);
            if (isNaN(col) || isNaN(row)) {
                LOGGER.warnc(() => `Could not find col-row attributes ${col}-${row} (target is ${event.target}`);
                return;
            }
            const realRow = this.data.displayRows[row];
            const oldValue = this.data.rows[realRow][col];

            if (event.key === 'Enter') {
                const newValue = (el as any).innerText;
                if (oldValue !== newValue) {
                    this.edit.next({ row: realRow, col, oldValue, newValue });
                }
            } else if (event.key === 'Escape') {
                el.innerHTML = `${oldValue}`; // FIXME format properly (dates, numbers etc...)
            }
            this.unEditCell();
        }
    }

    onCopy(event: ClipboardEvent) {
        // do not interfere with the copy if there is already something selected
        if (window.getSelection().isCollapsed) {
            let output = '';
            if (this.selectionRange) {
                // if more than one line, add headers
                if (this.selectionRange.startRow !== this.selectionRange.endRow) {
                    const headers = this.data.columns
                        .slice(this.selectionRange.startCol, this.selectionRange.endCol + 1)
                        .map(col => col.header || '');
                    output += headers.join('\t');
                }
                for (let row = this.selectionRange.startRow; row <= this.selectionRange.endRow; row++) {
                    if (output) {
                        output += '\n';
                    }
                    const dataRow = this.data.rows[row];
                    const cols = dataRow.slice(this.selectionRange.startCol, this.selectionRange.endCol + 1);
                    output += cols.join('\t');
                }
            }
            event.clipboardData.setData('text/plain', output);
            event.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
        }
    }

    isSelected(row: number, col: number): boolean {
        return this.selectionRange !== null && this.selectionRange.contains({ row, col });
    }

    isColSelected(col: number): boolean {
        return this.selectionRange !== null && this.selectionRange.containsCol(col);
    }
    private getTable(): Element {
        return this.elementRef.nativeElement.querySelector('table');
    }

    private select(td: Element): void {
        // there must be something that gets the selection
        // for the onCopy() to be called, however, selecting
        // something out of the view port would scroll
        // up/down to display it, so we pick up the last
        // selected <td> and we rely on the collapsed selection
        // to avoid any side effect.
        const selection = window.getSelection();
        selection.collapse(td, 0);
    }

    get columns(): ColumnDefinition[] {
        return this.data.columns.filter(c => !c.hidden);
    }

    sortColumn(col: number) {
        if (Math.abs(this.sortOrder) !== col + 1) {
            this.sortOrder = col + 1;
        } else {
            this.sortOrder *= -1;
        }
        const colDef = this.data.columns[col];
        const type = colDef.cellType || CellType.STRING;
        let sortFunc: (left: CellData[], right: CellData[]) => number;
        switch (type) {
            case CellType.STRING:
                sortFunc = (left, right) => this.sortOrder * new Intl.Collator('fr').compare(left[col] as string, right[col] as string);
                break;
            case CellType.INTEGER:
            case CellType.FLOAT:
                sortFunc = (left, right) => this.sortOrder * ((left[col] as number) - (right[col] as number));
                break;
            default:
                sortFunc = (left, right) => this.sortOrder * new Intl.Collator('fr').compare(`${left[col]}`, `${right[col]}`);
                break;
        }
        this.data.displayRows = this.data.rows
            .sort(sortFunc)
            .map((r, i) => i);

    }
    getRow(rowidx: number): any[] {
        return this.data.rows[this.data.displayRows[rowidx]].filter((row, colindex) => {
            const c = this.data.columns[colindex];
            return !c.hidden;
        });
    }
}
