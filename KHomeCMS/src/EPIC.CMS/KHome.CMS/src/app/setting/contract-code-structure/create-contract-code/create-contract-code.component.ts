import { Component, Injector, Input, OnInit } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { PageBondPolicyTemplate } from '@shared/model/pageBondPolicyTemplate';
import { ContractFormConst, PolicyDetailTemplateConst, YesNoConst } from '@shared/AppConsts';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PolicyTemplateService } from '@shared/services/policy-template.service';
import { ContractFormService } from '@shared/services/contract-form.service';
import { Page } from '@shared/model/page';
import { ContractCodeStructureService } from '@shared/services/contract-code-structure.service';
import { ConfigContractCodeDetail } from '@shared/interface/config-contract-code-detail.model';
import { KeyConfigContractCodeDetail } from '@shared/consts/config-contract-code.const';

@Component({
  selector: 'app-create-contract-code',
  templateUrl: './create-contract-code.component.html',
  styleUrls: ['./create-contract-code.component.scss'],
})
export class CreateContractCodeComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private _contractCodeStructureService: ContractCodeStructureService,
    private dialogService: DialogService,
    public configDialog: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public confirmationService: ConfirmationService,
  ) {
    super(injector, messageService);
  }

  fieldErrors: any = {};
  isCreateDetail: boolean;
  isCreateContractTemp: boolean;
  rows: any[] = [];
  index = 0;
  YesNoConst = YesNoConst;
  ContractFormConst = ContractFormConst;

  row: any;
  col: any;

  contractForm: any = {

    'status': null,
    'name': null,   
    'configContractCodeDetails' : [],
  }
  isView: boolean;

  policyTempId: number;

  blockText: RegExp = /[0-9,.]/;
  submitted: boolean;
  isContractTemp: boolean;
  //
  cols: any[];

  page = new Page();
  offset = 0;

  listRepeatFixedDate = [];

  isCollapse = false;
  configContractCodeDetails: any = [];
  isUpdateId: any;

  dataSeedKey = {
    [KeyConfigContractCodeDetail.ORDER_ID]: 999,
    [KeyConfigContractCodeDetail.ORDER_ID_PREFIX_0]: 999,
    [KeyConfigContractCodeDetail.BUY_DATE]: "14/02/2023",
    [KeyConfigContractCodeDetail.PAYMENT_FULL_DATE]: "14/02/2023",
    [KeyConfigContractCodeDetail.PRODUCT_NAME]: "DU_AN_PRO",
    [KeyConfigContractCodeDetail.RST_PRODUCT_ITEM_CODE ]: "MA_CAN_HO",
    [KeyConfigContractCodeDetail.PRODUCT_CODE]: "SPP",
    [KeyConfigContractCodeDetail.POLICY_NAME]: "CHINH_SACH_PRO",
    [KeyConfigContractCodeDetail.POLICY_CODE]: "CSP",
    [KeyConfigContractCodeDetail.SHORT_NAME]: "NGUYEN_TIEN_DUNG",
}

  ngOnInit(): void {
    this.isView = this.configDialog?.data?.isView
  
    if( this.configDialog?.data?.contractCodeStructure) {
      this.contractForm = this.configDialog?.data?.contractCodeStructure;
      this.configContractCodeDetails = this.contractForm?.configContractCodeDetails
    } 
    //
    this.genContractCodeStructure();
  }


  onReorder(){
    this.genContractCodeStructure();
  }

  configTemplate = '';
  genContractCodeStructure() {    
    this.configTemplate = '';
    this.contractForm.contractCodeStructure = '';
    this.configContractCodeDetails.forEach(element => {
        this.contractForm.contractCodeStructure += '<'+ (element?.value ? element.value : element?.key) +'>';
        this.configTemplate += element?.value || this.dataSeedKey[element?.key];

    });
  }

  addvalue() {
    this.configContractCodeDetails.push({ configContractCodeId: 0});
  }

  removeElement(index) {
    this.confirmationService.confirm({
      message: 'Xóa giá trị này?',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.configContractCodeDetails.splice(index, 1);
        this.genContractCodeStructure();
      }
    });
  }

  collapse() {
    this.isCollapse = !this.isCollapse;
  }

  save() {
    let index = 0;
    this.configContractCodeDetails = this.configContractCodeDetails.map(configContractCodeDetail => {
      configContractCodeDetail.sortOrder =  index++;
      return configContractCodeDetail;
    });
    this.contractForm.configContractCodeDetails = this.configContractCodeDetails;
    this.contractForm.configContractCodeDetails.forEach((element) => {
      if (element.configContractCodeId != 0 && element.configContractCodeId) {
        this.isUpdateId = element.configContractCodeId;
      }
    });
    
    this.submitted = true;

    if (this.contractForm.id) {
      this.contractForm.configContractCodeDetails = this.contractForm.configContractCodeDetails.map(configContractCodeDetail => {
        configContractCodeDetail.configContractCodeId =  this.isUpdateId;
        return configContractCodeDetail;
      });
      let body = {...this.contractForm};
      
      this._contractCodeStructureService.update(body).subscribe((response) => {
          if (this.handleResponseInterceptor(response)) {
            this.ref.close({ data: response, accept: true });
            this.submitted = false;
          } else {
            this.submitted = false;
          }
        }, (err) => {
          this.submitted = false;
        }
      );
    } else {
      this._contractCodeStructureService.create(this.contractForm).subscribe((response) => {
          if (this.handleResponseInterceptor(response)) {
            this.ref.close({ data: response, accept: true });
            this.submitted = false;
          } else {
            this.submitted = false;
          }
  
        }, (err) => {
          this.submitted = false;
        }
      );
    }
  }

  close() {
    this.ref.close();
  }
}


