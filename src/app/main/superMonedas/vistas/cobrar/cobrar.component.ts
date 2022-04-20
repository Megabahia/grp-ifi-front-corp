import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'app/auth/models';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { Subject } from 'rxjs';
import { CobroMonedas, CobroConCodigo, GenerarCobro } from '../../models/superMonedas';
import { CobrarService } from './cobrar.service';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-cobrar',
  templateUrl: './cobrar.component.html',
  styleUrls: ['./cobrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' },
  providers: [DatePipe]
})
export class CobrarComponent implements OnInit {
  @ViewChild('preautorizacionCobroMdl') preautorizacionCobroMdl;
  @ViewChild('confirmacionCobroMdl') confirmacionCobroMdl;
  @ViewChild('mensajeModal') mensajeModal;
  @ViewChild(NgbPagination) paginator: NgbPagination;


  // public
  public cobroForm: FormGroup;

  public page = 1;
  public page_size: any = 10;
  public maxSize;
  public collectionSize;
  public contentHeader: object;
  public cobroConCodigo: CobroConCodigo;
  public generarCobro: GenerarCobro;
  public listaCobros;
  public codigoCobro = "";
  public mensaje = "";
  public wishlist;
  public cartList;
  public relatedProducts;
  public productos;
  public producto;
  private _unsubscribeAll: Subject<any>;
  public cobroSubmitted = false;
  public cargarCobro = false;
  public cargarBusquedaCobro = false;
  public swiperResponsive: SwiperConfigInterface;

  public cantidadMonedas;
  public usuario: User;
  public cobrar: boolean = true;
  public montoSupermonedas;

  constructor(
    private _cobrarService: CobrarService,
    private _coreMenuService: CoreMenuService,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private _formBuilder: FormBuilder,

  ) {
    this._unsubscribeAll = new Subject();
    this.usuario = this._coreMenuService.grpCorpUser;
    this.cobroConCodigo = this.inicializarCobroConCodigo();
    this.generarCobro = this.inicializarGenerarCobro();
  }
  inicializarCobroConCodigo() {
    return {
      id: "",
      identificacion: "",
      autorizacion: "",
      nombres: "",
      apellidos: "",
      fechaCobro: this.transformarFecha(Date.now()),
      codigoPreautorizacion: "",
      montoTotalFactura: null,
      montoSupermonedas: null,
      codigoCobro: ""
    }

  }
  inicializarGenerarCobro() {
    return {
      user_id: "",
      empresa_id: this.usuario.empresa._id,
      codigoCobro: "",
      montoTotalFactura: null,
      montoSupermonedas: null,
      nombres: null,
      apellidos: null,
      identificacion: null,
      whatsapp: null,
    }

  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  get cobForm() {
    return this.cobroForm.controls;
  }
  ngOnInit(): void {
    this.cobroForm = this._formBuilder.group({
      montoTotal: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1)]],
      montoSuperMonedas: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1)]]
    });
  }
  obtenerCobro() {
    this.cobrar = true;
    this._cobrarService.obtenerCobro({ codigoCobro: this.codigoCobro, empresa_id: this.usuario.empresa._id }).subscribe(
      (info) => {
        if (info.error) {
          if(info.error.message){
            this.mensaje = info.error.message;
          }else{
            this.mensaje = info.error.tiempo + "</br>Estado: " + info.error.estado;
          }
          this.abrirModal(this.mensajeModal);
        } else {
          this.cobroConCodigo = info;
          this.cobroConCodigo.fechaCobro = this.transformarFecha(Date.now());
          this.cobroConCodigo.autorizacion = info._id;
          this.cobroConCodigo.codigoCobro = this.codigoCobro;
          this.generarCobro.user_id = info.user_id;
          this.generarCobro.codigoCobro = this.codigoCobro;
          this.generarCobro.empresa_id = this.usuario.empresa._id;
          this.generarCobro.nombres = info.nombres;
          this.generarCobro.apellidos = info.apellidos;
          this.generarCobro.whatsapp = info.whatsapp;
          this.generarCobro.identificacion = info.identificacion;
          this.montoSupermonedas = info.monto;
          this.cobrar = false;
        }
      }, (error) => {

      });
  }

  // obtenerListaCobros() {
  //   this._cobrarService.obtenerListaCobros({
  //     ...this.cobroMonedas, page_size: this.page_size, page: this.page - 1
  //   }).subscribe(info => {

  //     this.collectionSize = info.cont;
  //     this.listaCobros = info.info;
  //   });
  // }

  // comprarProducto() {
  //   this.modalService.dismissAll();
  //   this.modalService.open(this.CanjearProducto, {
  //     centered: true,
  //     size: 'lg'
  //   });
  // }
  // preautorizarCobro() {
  //   this.cerrarModal();
  //   this._cobrarService.preautorizarCobro({
  //     id: this.idCobro,
  //     estado: "Pre-autorizado",
  //     user_id:this.usuario.id
  //   }).subscribe((info) => {
  //     this.mensaje = "Cobro Pre-autorizado"
  //     this.abrirModal(this.mensajeModal);
  //     this.obtenerListaCobros();
  //   },
  //     (error) => {
  //       let errores = Object.values(error);
  //       let llaves = Object.keys(error);
  //       this.mensaje = "";
  //       errores.map((infoErrores, index) => {
  //         this.mensaje += llaves[index] + ": " + infoErrores + "<br>";
  //       });
  //       this.abrirModal(this.mensajeModal);
  //     })
  // }
  procesarCobro() {
    // this.idCobro = id;
    this.cobroSubmitted = true;
    if (this.cobroForm.invalid) {
      return;
    }

    if(this.montoSupermonedas != this.generarCobro.montoSupermonedas){
      this.mensaje = 'El monto que ingreso no coincide con el monto del comprobante.';
      this.abrirModal(this.mensajeModal);
      return;
    }

    this.cobroConCodigo.montoSupermonedas = this.generarCobro.montoSupermonedas;
    this.cobroConCodigo.montoTotalFactura = this.generarCobro.montoTotalFactura;
    this.abrirModal(this.preautorizacionCobroMdl);
  }
  nuevoCobro() {
    this.codigoCobro = "";
    this.cobroConCodigo = this.inicializarCobroConCodigo();
    this.generarCobro = this.inicializarGenerarCobro();
    this.cerrarModal();
  }
  confirmarCobro() {
    // this.idCobro = id;
    this._cobrarService.guardarCobro(this.generarCobro).subscribe((info) => {
      this.abrirModal(this.confirmacionCobroMdl);
    },
    (error)=>{
      this.mensaje = "Error en guardar cobro, revise su crédito";
      this.abrirModal(this.mensajeModal);

    });
  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
