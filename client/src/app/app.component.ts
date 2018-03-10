import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { PATCH_EL_RE, PatchDto } from '@punchcontrol/shared/patching';
import { TableData, ColumnDefinition } from '@punchcontrol/shared/table-data';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import { HotTableRegisterer } from '@handsontable/angular';
import { SampleService } from './sample.service';
import { LOGGING } from './util/logging';
import { WebSocketService } from './websocket.service';
import * as Handsontable from 'handsontable';
import { HttpErrorResponse } from '@angular/common/http';

const LOGGER = LOGGING.getLogger('app.component');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
    hotId = 'my-table';
    columns: ColumnDefinition[];
    headers: string[];
    data: any[][];
    hot: Handsontable;
    hotcolumns: any[] = [];

    constructor(private sampleService: SampleService,
        private websocketService: WebSocketService,
        private hotRegisterer: HotTableRegisterer,
        private elementRef: ElementRef) {
        this.sampleService.teamMembers.subscribe(
            (data: TableData) => {
                this.columns = data.columns;
                this.hotcolumns = this.columns
                    // filtering works fine because hidden columns are at the end
                    .filter(col => !(col.display && col.display.hidden))
                    .map(col => ({
                        readOnly: col.display && col.display.readonly,
                    }));

                this.headers = data.columns.map(col => col.header || col.id);
                this.data = [...data.rows];
                LOGGER.infoc(() => `Received data ${this.data.length} rows / showing ${this.hotcolumns.length} columns`);
            },
            (err) => console.error(err)
        );
        this.websocketService.receive.subscribe((msg: WebSocketMessage) => {
            if (msg.path === '/data/update') {
                LOGGER.infoc(() => `Receiving websocket ${msg.path}`);
                const patches: PatchDto[] = msg.body;
                for (const p of patches) {
                    const found = p.patchEl.match(PATCH_EL_RE.re);
                    if (found) {
                        const idColumn = this.columns.findIndex(c => c.id === PATCH_EL_RE.getField(found, 'id'));
                        const valueColumn = this.columns.findIndex(c => c.patchEl === p.patchEl);
                        this.data.forEach((line: any[], index: number) => {
                            if (line[idColumn] === p.id && line[valueColumn] !== p.newVal) {
                                LOGGER.infoc(() => `Receiving websocket ${msg.path}: found matching line: ${JSON.stringify(line)}`);
                                const row = this.hot.toVisualRow(index);
                                this.hot.setDataAtCell(row, valueColumn, p.newVal, 'ObserveChanges.me.concurent');
                            }
                        });
                    }
                }
            }
        });
    }

    ngAfterViewInit(): void {
        this.hot = this.hotRegisterer.getInstance(this.hotId);
        const maxCol = this.hot.countCols();
        const el: Element = this.elementRef.nativeElement;
    }

    get whoami() {
        return this.sampleService.data;
    }
    afterTableChange(params: any[]): void {
        const changes: any[] = params[0], source: string = params[1];
        if (source !== 'loadData' && !source.startsWith('ObserveChanges')) {
            LOGGER.debugc(() => `entering table.afterChange() => ${JSON.stringify(changes)}`);
            const patches: PatchDto[] = changes
                .filter(ev => {
                    const [row, col, oldVal, newVal] = ev;
                    // tslint:disable-next-line
                    return oldVal != newVal; // we need 2 == "2" when entering and exiting a numeric cell
                })
                .map(ev => {
                    const [row, col, oldVal, newVal] = ev;
                    const physicalRow = this.hot.toPhysicalRow(row);
                    const patchEl: string = this.columns[col].patchEl;
                    const found = patchEl.match(PATCH_EL_RE.re);
                    if (!found) {
                        LOGGER.errorc(() => `Could not match patch EL '${patchEl}' - ignoring...`);
                        return null;
                    } else {
                        const updateCol = this.headers.indexOf(PATCH_EL_RE.getField(found, 'id'));
                        return { id: this.data[physicalRow][updateCol], patchEl, oldVal, newVal };
                    }
                })
                .filter(ev => !!ev);
            if (patches.length > 0) {
                LOGGER.debugc(() => `table.afterChange() filtered: ${source}: ${JSON.stringify(patches)}`);
                this.sampleService.patch(patches).subscribe(
                    (resp) => { LOGGER.info(`Patched OK for ${patches.length} changes`); },
                    (error: HttpErrorResponse) => {
                        LOGGER.error(`Patched KO for ${patches.length} changes: ${error.message}`);
                        this.restore(params);
                    }
                );
            }
        }
    }
    private restore(params: any[]): void {
        const changes: any[] = params[0], source: string = params[1];
        for (const c of changes) {
            const [row, col, oldVal, newVal] = c;
            this.hot.setDataAtCell(row, col, oldVal, 'ObserveChanges.me.restore');
        }
    }
}
