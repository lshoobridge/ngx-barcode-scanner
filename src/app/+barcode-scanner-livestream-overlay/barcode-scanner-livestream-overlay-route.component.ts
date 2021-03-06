import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarecodeScannerLivestreamOverlayComponent } from 'ngx-barcode-scanner';

@Component({
    selector: 'app-barcode-scanner-livestream-overlay',
    templateUrl: './barcode-scanner-livestream-overlay-route.component.html',
    styleUrls: ['./barcode-scanner-livestream-overlay-route.component.scss']
})
export class BarcodeScannerOverlayRouteComponent implements OnInit {

    @ViewChild(BarecodeScannerLivestreamOverlayComponent)
    barecodeScannerOverlay: BarecodeScannerLivestreamOverlayComponent;

    barcodeValue;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
    }

    startBarecodeScannerOverlay() {
        this.barecodeScannerOverlay.show();
    }

    onValueChanges(result) {
        this.barcodeValue = result.codeResult.code;
    }

}
