import { Component, Injector } from "@angular/core";
import { MessageErrorConst, PolicyDetailTemplateConst, PolicyTemplateConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { PolicyTemplateService } from "@shared/services/policy-template.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-create-distribution-policy-temp",
	templateUrl: "./create-distribution-policy-temp.component.html",
	styleUrls: ["./create-distribution-policy-temp.component.scss"],
})
export class CreateDistributionPolicyTempComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _policyTemplateService: PolicyTemplateService,
		public configDialog: DynamicDialogConfig,
		public ref: DynamicDialogRef,
		public confirmationService: ConfirmationService
	) {
		super(injector, messageService);
	}

	isCreateDetail: boolean;
	rows: any[] = [];
  
	PolicyTemplateConst = PolicyTemplateConst;
	PolicyDetailTemplateConst = PolicyDetailTemplateConst;
  
	row: any;
	col: any;
  
	policyTemplate: any = {
	  'code': null,  
	  'name': null,   // Tên chính sách
	  'paymentType': 1,   // Loại thanh toán- DÙng tạm đợi back bỏ rào thì xóa
	  'depositType': null,  // Loại hình đặt cọc
	  'depositValue': null, // Giá trị đặt cọc
	  'lockType': null,  // Loại hình lock căn
	  'lockValue': null, // Giá trị lock căn
	  'description': null, // Mô tả
	}
  
	policyTempId: number;
  
	blockText: RegExp = /[0-9,.]/;
	submitted: boolean;
	//
	cols: any[];
	characters: any = '%';
	classifies: any[] = [];
  
	listActionPolicyDetail: any[] = [];
  
	page = new Page();
	offset = 0;

 	ngOnInit(): void {
		if( this.configDialog?.data?.policyTemplate) {
			this.policyTemplate = this.configDialog?.data?.policyTemplate;
		}
	}

	changeDepositValue(value?: number){
		this.policyTemplate.lockValue = value ?? this.policyTemplate.depositValue;
	}

	changeDepositType() {
		this.policyTemplate.depositValue = 0;
		if(this.policyTemplate.depositType == PolicyTemplateConst.GIA_CO_DINH) {
			this.characters = 'VND'
		} else if(this.policyTemplate.depositType == PolicyTemplateConst.THEO_GIA_TRI_CAN_HO) {
			this.characters = '%'
		}
		
	}
	
	save() {
		if (this.validForm()){
		  this.submitted = true;
		  this.policyTemplate.lockType = this.policyTemplate.depositType;
		  this.policyTemplate.lockValue = this.policyTemplate.depositValue;
		  if (this.policyTemplate.id) {
			this._policyTemplateService.updatePartnerTemp(this.policyTemplate).subscribe((response) => {
				if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
				  this.ref.close(true);
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
			this._policyTemplateService.createPartnerTemp(this.policyTemplate).subscribe((response) => {
				if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
				  this.ref.close(true);
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
		}else {
				this.messageError(MessageErrorConst.message.Validate);
			}
	}
	
	close() {
		this.ref.close();
	}
	
	validForm(): boolean {
		const validRequired = this.policyTemplate?.name
							// && this.policyTemplate?.paymentType
							&& this.policyTemplate?.depositType
							&& this.policyTemplate?.depositValue
		return validRequired;
	}
	
}
