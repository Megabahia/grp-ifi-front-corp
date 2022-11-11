import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {GuiaRemisionService} from './guia-remision.service';

@Component({
    selector: 'app-guia-remision',
    templateUrl: './guia-remision.component.html',
    styleUrls: ['./guia-remision.component.scss']
})
export class GuiaRemisionComponent implements OnInit {
    public envioDocumentosForm: FormGroup;
    public submitted = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _consultaCreditosService: GuiaRemisionService
    ) {
    }


    ngOnInit(): void {
        this.envioDocumentosForm = this._formBuilder.group({
            numeroGuia: ['', [Validators.required]], //
            fecha: ['', [Validators.required]], //
            courier: ['', [Validators.required]], //
            direccionEntrega: ['', [Validators.required]], //
            cooperativaAsignada: ['', [Validators.required]], //
        });
    }

    get facturacionControlsForm() {
        return this.envioDocumentosForm.controls;
    }

    guardar() {
        this.submitted = true;
        if (this.envioDocumentosForm.invalid) {
            return;
        }
        const data = {
            numeroEnvio: this.envioDocumentosForm.getRawValue().numeroGuia,
            fechaEnvio: this.envioDocumentosForm.getRawValue().fecha,
            courierResponsable: this.envioDocumentosForm.getRawValue().courier,
            direccionEntrega: this.envioDocumentosForm.getRawValue().direccionEntrega,
            cooperativaEntrega: this.envioDocumentosForm.getRawValue().cooperativaAsignada
        };
        this._consultaCreditosService.guardarDatos(data).subscribe((info) => {
            this._router.navigate(['/comercial/envios-realizados']);
        });
    }
}
