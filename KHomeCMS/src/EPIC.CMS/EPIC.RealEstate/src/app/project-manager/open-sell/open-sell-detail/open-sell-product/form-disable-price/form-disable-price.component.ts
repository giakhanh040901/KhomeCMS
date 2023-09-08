import { Component, Injector, OnInit } from "@angular/core";
import { AppConsts, FormNotificationConst } from "@shared/AppConsts";
import { OBJECT_CONFIRMATION_DIALOG } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { OpenSellService } from "@shared/services/open-sell.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

const { DEFAULT_IMAGE } = OBJECT_CONFIRMATION_DIALOG;
export const TYPE_OPTIONS = {
	HOTLINE: 1,
	KHAC: 2,
};
@Component({
	selector: "app-form-disable-price",
	templateUrl: "./form-disable-price.component.html",
	styleUrls: ["./form-disable-price.component.scss"],
})
export class FormDisablePriceComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
   		messageService: MessageService,
		public ref: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
		private openSellService: OpenSellService,
	) {
		super(injector, messageService);
	}

	AppConsts = AppConsts;
  	DEFAULT_IMAGE = DEFAULT_IMAGE;

	default: any;
 	submitted = false;

	showApproveBy: boolean = false;
  	acceptStatus: boolean = true;
	contractTypes: any;
	data: any =  {
		title: null,
		icon: null,
		contractType: null,
		contractPhone: null,
	};

	
	hotline: any;

	ngOnInit(): void {
		this.data.title = this.configDialog.data.title;
    	this.default = this.configDialog.data.icon;
		if(this.default == FormNotificationConst.IMAGE_APPROVE){
			this.data.icon = DEFAULT_IMAGE.IMAGE_APPROVE;
		} else if(this.default == FormNotificationConst.IMAGE_CLOSE) {
			this.data.icon = DEFAULT_IMAGE.IMAGE_CLOSE;
		}
    	this.hotline = this.configDialog.data.hotline;
		this.data.id = this.configDialog.data.id;
		if (this.hotline == null){
			this.contractTypes = [{name: 'Khác',code: TYPE_OPTIONS.KHAC}];
		} else {
			this.contractTypes = [
				{
					name: `Hotline - ${this.hotline}`,
					code: TYPE_OPTIONS.HOTLINE
				},
				{
					name: 'Khác',
					code: TYPE_OPTIONS.KHAC
				}
			];
		}
	}

	public get TYPE_OPTIONS() {
		return TYPE_OPTIONS;
	  }
	
  	hideDialog() {}

	accept() {
		this.acceptStatus = true;
		this.onAccept();
	}

	cancel() {
		this.acceptStatus = false;
		this.onAccept();
	}

	onAccept() {
		if (this.data.contractType == TYPE_OPTIONS.HOTLINE){
			this.data.contractPhone = this.hotline;
		}
		this.openSellService.hidePrice(this.data).subscribe((res) => {
            if (this.handleResponseInterceptor(res, 'Ẩn hiện giá thành công')) {
        
				this.ref.close({data: this.data,accept: this.acceptStatus});
            }
          }, (err) => {
            console.log('err', err);
          });
		
	}
}
