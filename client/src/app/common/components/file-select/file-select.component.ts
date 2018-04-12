import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-file-select',
    templateUrl: './file-select.component.html',
    styleUrls: ['./file-select.component.scss']
})
export class FileSelectComponent implements OnInit {
    @Input() label = '';
    @Output() select = new EventEmitter<File[]>();

    textContent: string;

    constructor(private element: ElementRef) {
    }
    ngOnInit() {
        this.resetText();
    }
    dragEnter(event) {
        this.textContent = '';
        event.stopPropagation();
        event.preventDefault();
    }
    dragExit(event) {
        this.resetText();
        event.stopPropagation();
        event.preventDefault();
    }
    dragOver(event) {
        event.stopPropagation();
        event.preventDefault();
    }
    doDrop(event) {
        event.stopPropagation();
        event.preventDefault();

        const dt = event.dataTransfer;
        const files = dt.files;
        this.select.next(files);

        const count = files.length;
        this.output('File Count: ' + count + '\n');
    }

    private output(text) {
        this.textContent += text;
    }
    private resetText() {
        this.textContent = this.label;
    }

}
