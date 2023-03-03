import {Component, OnInit} from '@angular/core';
import {EnviosRealizadosService} from '../envios-realizados/envios-realizados.service';

@Component({
    selector: 'app-solicitudes-pagos',
    templateUrl: './solicitudes-pagos.component.html',
    styleUrls: ['./solicitudes-pagos.component.scss']
})
export class SolicitudesPagosComponent implements OnInit {

    public page_size: any = 10;
    public collectionSize;
    public page = 0;
    public envios = [];
    public cliente;

    constructor(
        private _consultaCreditosService: EnviosRealizadosService,
    ) {
    }

    ngOnInit(): void {
        this._consultaCreditosService.listarEnvios({page_size: this.page_size, page: this.page})
            .subscribe((data) => {
                this.envios = data.info;
            });
    }

}
