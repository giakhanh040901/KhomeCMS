import { Component, Injector } from "@angular/core";
import { MessageErrorConst, PolicyDetailTemplateConst, PolicyTemplateConst, SellingPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { DistributionService } from "@shared/services/distribution.service";
import { PolicyTemplateService } from "@shared/services/policy-template.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-create-selling-policy-temp",
	templateUrl: "./create-selling-policy-temp.component.html",
	styleUrls: ["./create-selling-policy-temp.component.scss"],
	providers: [ConfirmationService],
})
export class CreateSellingPolicyTempComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _policyTemplateService: PolicyTemplateService,
		public configDialog: DynamicDialogConfig,
		public ref: DynamicDialogRef,
		public confirmationService: ConfirmationService,
		private _distributionService: DistributionService
	) {
		super(injector, messageService);
	}

	isCreateDetail: boolean;
	rows: any[] = [];
	// Data Init
  
	PolicyTemplateConst = PolicyTemplateConst;
	PolicyDetailTemplateConst = PolicyDetailTemplateConst;
	SellingPolicyConst = SellingPolicyConst;
	row: any;
	col: any;
  
	sellingPolicy: any = {
	  'code': null,   // Mã chính sách
	  'name': null,   // Tên chính sách
	}
  
	policyTempId: number;
  
	blockText: RegExp = /[0-9,.]/;
	submitted: boolean;
	//
	cols: any[];
  
	classifies: any[] = [];
  
	listActionPolicyDetail: any[] = [];
  
	page = new Page();
	offset = 0;
	isView: boolean;
	
	ngOnInit(): void {
		this.isView = this.configDialog?.data?.isView
		if (this.configDialog?.data?.policy) {
		  this.sellingPolicy = this.configDialog?.data?.policy;
		}
	}

	myUploader(event) {
		if (event?.files[0]) {
		  this._distributionService.uploadFileGetUrl(event?.files[0], "selling-policy-temp").subscribe((response) => {
			console.log({ response });
			if (this.handleResponseInterceptor(response, 'Upload thành công!')) {
			  this.sellingPolicy.fileUrl = response.data;
			}
		  },
			(err) => {
			  this.messageError("Có sự cố khi upload!");
			}
		  );
		}
	}

	deleteFile(){
		this.sellingPolicy.fileName = null;
		this.sellingPolicy.fileUrl = null;
	}
	
	save() {
		if (this.validForm()) {
			this.submitted = true;
			if (this.sellingPolicy.id) {
			this._policyTemplateService.update(this.sellingPolicy).subscribe((response) => {
				if (this.handleResponseInterceptor(response)) {
				this.ref.close({ data: response, accept: true });
				this.submitted = false;
				} else {
				this.submitted = false;
				}
			}, (err) => {
				console.log('err----', err);
				this.submitted = false;
			}
			);
			} else {
			console.log(this.sellingPolicy);
			this._policyTemplateService.create(this.sellingPolicy).subscribe((response) => {
				if (this.handleResponseInterceptor(response)) {
				this.ref.close({ data: response, accept: true });
				this.submitted = false;
				} else {
				this.submitted = false;
				}
			}, (err) => {
				console.log('err----', err);
				this.submitted = false;
			}
			);
			}
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	close() {
		this.ref.close();
	}

	validForm(): boolean {
		const validRequired = this.sellingPolicy?.code
			&& this.sellingPolicy?.name
			&& ((this.sellingPolicy?.toValue && this.sellingPolicy?.fromValue && this.sellingPolicy.sellingPolicyType == SellingPolicyConst.AP_DUNG_THEO_GIA_TRI_CAN_HO) || this.sellingPolicy.sellingPolicyType == SellingPolicyConst.AP_DUNG_TAT_CA_CAC_CAN);
		return validRequired;
	}

}
	
	
