import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FacturacionService} from './facturacion.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-facturacion',
    templateUrl: './facturacion.component.html',
    styleUrls: ['./facturacion.component.scss']
})
export class FacturacionComponent implements OnInit {
    public factruacionForm: FormGroup;
    public submitted = false;
    public actualizarCreditoFormData;
    public idCredito;
    public credito;
    public creditoAprobado;
    private mensaje: string;
    public cliente;

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _consultaCreditosService: FacturacionService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
    ) {
    }

    ngOnInit(): void {
        this.actualizarCreditoFormData = new FormData();
        this.route.params.subscribe((params: Params) => this.idCredito = params['id']);

        this._consultaCreditosService.consultarDatos(this.idCredito).subscribe(info => {
            this.credito = info;
            this.cliente = JSON.parse(this.credito.cliente);
            this.factruacionForm.patchValue({
                nombre: this.cliente.nombre + ' ' + this.cliente.apellido, //
                identificacion: this.cliente.identificacion, //
                celular: this.cliente.celular, //
                direccion: this.cliente.direccion, //
                correo: this.cliente.correo,
                descripcion: this.credito.descripcion,
                cantidad: this.credito.cantidad,
                valorTotal: this.credito.valorTotal,
                facturaComercial: this.credito.facturaComercial,
            });
        });
        this.factruacionForm = this._formBuilder.group({
            nombre: ['', [Validators.required]], //
            identificacion: ['', [Validators.required]], //
            celular: ['', [Validators.required]], //
            direccion: ['', [Validators.required]], //
            correo: ['', [Validators.required]], //
            descripcion: ['', [Validators.required]], //
            cantidad: ['', [Validators.required]], //
            valorTotal: ['', [Validators.required]], //
            facturaComercial: ['', [Validators.required]], //
        });

    }

    get facturacionControlsForm() {
        return this.factruacionForm.controls;
    }

    siguiente(modal) {
        this.submitted = true;
        if (this.factruacionForm.invalid) {
            return;
        }
        const data = {
            numeroIdentificacion: this.cliente.identificacion
        };
        this.creditoAprobado = this.factruacionForm.getRawValue();
        this.actualizarCreditoFormData.set('precio', this.creditoAprobado.valorTotal);
        this.actualizarCreditoFormData.set('cantidad', this.creditoAprobado.cantidad);
        this.actualizarCreditoFormData.set('descripcion', this.creditoAprobado.descripcion);
        this.actualizarCreditoFormData.set('cliente', JSON.stringify(this.cliente));
        this.actualizarCreditoFormData.set('credito_id', this.idCredito);
        this._consultaCreditosService.guardarDatos(this.actualizarCreditoFormData).subscribe((info) => {
        }, (error) => {
            this.mensaje = 'Error al guardar los datos' + error;
            this.modalOpenSLC(modal);
            return;
        });
        this._consultaCreditosService.consultarDatosaArchivos(data).subscribe((info) => {
            console.log('info?.error', info?.error);
            if (info?.error === 'No existe') {
                console.log('llega if');
                this._router.navigate(['/comercial/documentos-habilitantes', this.idCredito]);
            } else {
                console.log('llega else');
                this._router.navigate(['/comercial/saldo-contable']);
            }
        }, (error) => {
            this.mensaje = 'Error al guardar los datos' + error;
            if (error.error === 'No existe') {
                this._router.navigate(['/comercial/documentos-habilitantes', this.idCredito]);
            }
            return;
        });
    }

    subirDoc(event, key) {
        if (event.target.files && event.target.files[0]) {
            const doc = event.target.files[0];
            this.actualizarCreditoFormData.delete(`${key}`);
            this.actualizarCreditoFormData.append(`${key}`, doc, Date.now() + '_' + doc.name);
        }
    }

    modalOpenSLC(modalSLC = 'modalSLC') {
        this.modalService.open(modalSLC, {
                centered: true,
                size: 'lg' // size: 'xs' | 'sm' | 'lg' | 'xl'
            }
        );
    }
}
