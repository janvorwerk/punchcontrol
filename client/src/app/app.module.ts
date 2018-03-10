import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HotTableModule } from '@handsontable/angular';
import { AppComponent } from './app.component';
import { SampleService } from './sample.service';
import { WebSocketService } from './websocket.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        HotTableModule.forRoot()
    ],
    providers: [SampleService, WebSocketService],
    bootstrap: [AppComponent]
})
export class AppModule { }
