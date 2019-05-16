import {
    Component, Input, Output, EventEmitter, ViewChild, OnDestroy, ViewEncapsulation, OnChanges, SimpleChanges
} from '@angular/core';
import * as Quagga from 'quagga';
import { mapToReader } from './barcode-types';
import { DEFAULT_CONFIG } from './barcode-scanner-livestream.config';

@Component({
    selector: 'barcode-scanner-livestream',
    templateUrl: './barcode-scanner-livestream.component.html',
    styleUrls: ['./barcode-scanner-livestream.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BarecodeScannerLivestreamComponent implements OnChanges, OnDestroy {
    // Inputs
    @Input() type: string;
    @Input() settings: any;

    // Outputs
    @Output() valueChanges = new EventEmitter();

    @ViewChild('BarecodeScanner') barecodeScanner;

    private started = false;

    private configQuagga = DEFAULT_CONFIG;

    ngOnDestroy(): void {
        this.stop();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.retart();
    }

    private _init() {
        return new Promise((resolve, reject) => {
            console.log('* barcode-scanner-livestream.component.ts _init()');
            if(this.settings) {
                console.log('* barcode-scanner-livestream.component.ts configQuagga: '+JSON.stringify(this.configQuagga));
                console.log('* barcode-scanner-livestream.component.ts settings: '+JSON.stringify(this.settings));
                this.configQuagga = Object.assign(this.configQuagga, this.settings);
                console.log('* barcode-scanner-livestream.component.ts configQuagga NEW: '+JSON.stringify(this.configQuagga));
            }

            Quagga.onProcessed((result) => this.onProcessed(result));

            Quagga.onDetected((result) => this.onDetected(result));

            this.configQuagga.inputStream.target = this.barecodeScanner.nativeElement;

            if (this.type) {
                this.configQuagga.decoder.readers = mapToReader(this.type);
            }

            Quagga.init(this.configQuagga, (err) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                resolve();
            });
        });
    }

    start() {
        if (!this.started) {
            return this._init().then(() => {
                Quagga.start();
                this.started = true;
                console.log('started')
            })
        }

        return Promise.resolve();
    }

    stop() {
        if (this.started) {
            Quagga.stop();
            this.started = false;
            console.log('stopped')
        }
    }

    retart() {
        if (this.started) {
            this.stop();
            this.start();
        }
    }

    isStarted() {
        return this.started;
    }

    onProcessed(result: any): any {
        let drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1,
                    }, drawingCtx, {
                            color: 'green',
                            lineWidth: 2,
                        });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1,
                }, drawingCtx, {
                        color: '#00F',
                        lineWidth: 2,
                    });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y',
                }, drawingCtx, {
                        color: 'red',
                        lineWidth: 3,
                    });
            }

        }
    }

    onDetected(result) {
        this.valueChanges.next(result);
    }

}

