import { Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { BusinessCustomerConst, ErrorBankConst, FormNotificationConst, KeyFilter, MSBPrefixAccountConst, SearchConst, YesNoConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { Page } from '@shared/model/page';
import { BankServiceProxy } from '@shared/service-proxies/bank-service';
import { ContractTemplateServiceProxy, DistributionContractFileServiceProxy } from '@shared/service-proxies/bond-manager-service';
import { BusinessCustomerBankServiceProxy } from '@shared/service-proxies/business-customer-service';
import { InvestorServiceProxy } from '@shared/service-proxies/investor-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime } from "rxjs/operators";
import { CreateOrUpdateBussinessCustomerBankComponent } from 'src/app/business-customer/business-customer/business-customer-bank/create-or-update-bussiness-customer-bank/create-or-update-bussiness-customer-bank.component';
import { FormNotificationComponent } from 'src/app/form-notification/form-notification.component';

@Component({
  selector: 'app-business-customer-bank-approve',
  templateUrl: './business-customer-bank-approve.component.html',
  styleUrls: ['./business-customer-bank-approve.component.scss']
})
export class BusinessCustomerBankApproveComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _contractTemplateService: ContractTemplateServiceProxy,
    private _businessCustomerBankService: BusinessCustomerBankServiceProxy,
    private routeActive: ActivatedRoute,
    private router: Router,
    private _investorService: InvestorServiceProxy,
    private _bankService: BankServiceProxy,
    private _dialogService: DialogService,
  ) {
    super(injector, messageService);

    this.businessCustomerId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));
  }

  businessCustomerId: number;
  @Input() businessCustomerDetail: any = {};

  ref: DynamicDialogRef;

  modalDialog: boolean;
  deleteItemDialog: boolean = false;

  confirmRequestDialog: boolean = false;

  rows: any[] = [];
  banks: any = {};

  BusinessCustomerConst = BusinessCustomerConst;
  YesNoConst = YesNoConst;
  MSBPrefixAccountConst = MSBPrefixAccountConst;
  ErrorBankConst = ErrorBankConst;
  businessCustomerBank: any = {};

  fieldErrors = {};
  submitted: boolean;

  isDetail = false;
  actionsDisplay: any[] = [];
  actions: any[] = [];
  KeyFilter = KeyFilter;
  isLoadingBank: boolean;
  page = new Page();
  offset = 0;

  ngOnInit() {
    this.setPage();
    this.getAllBank();
    this.subject.keyword.pipe(debounceTime(SearchConst.DEBOUNCE_TIME)).subscribe(() => {
			if (this.businessCustomerBank.bankId) {
				this.keyupBankAccount();
			} 
				
			
		});
  }

  changeBankId(value) {
		this.businessCustomerBank.bankAccNo= ''
		this.businessCustomerBank.bankAccName= ''
		console.log("value",value);
    this.businessCustomerBank.bankId = value
	}

  keyupBankAccount() {
		console.log("this.investorBank",this.businessCustomerBank);
    this.isLoadingBank = true;
		this.businessCustomerBank.ownerAccount ='';
			this._investorService.getBankAccount(this.businessCustomerBank.bankId,this.businessCustomerBank.bankAccNo ).subscribe(
				(res) => {
					this.isLoadingBank = false;
          if(res.code === ErrorBankConst.LOI_KET_NOI_MSB|| res.code === ErrorBankConst.SO_TK_KHONG_TON_TAI) {
						this.messageService.add({
							severity: 'error',
							summary: '',
							detail: 'Không tìm thấy thông tin chủ tài khoản, vui lòng kiểm tra lại (FE)',
							life: 3000,
						});
						this.businessCustomerBank.bankAccName = res?.data;
					} else
					if (this.handleResponseInterceptor(res)) {
						console.log("res",res);
						this.businessCustomerBank.bankAccName = res?.data;
					}
				},
				() => {
					this.isLoadingBank = false;
				}
			);
	}

  getAllBank() {
    this.page.keyword = this.keyword;
    this.isLoading = true;
    this._bankService.getAllBank(this.page).subscribe(
      (res) => {
        this.isLoading = false;
        if (this.handleResponseInterceptor(res, "")) {
          this.page.totalItems = res.data.totalItems;
          this.banks = res.data.items;
          console.log({ banks: res.data.items, totalItems: res.data.totalItems });
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  genListAction(data = []) {
    this.actions = data.map(item => {
      const action = [
        // {
        //   data: item,
        //   label: 'Sửa',
        //   icon: 'pi pi-pencil',
        //   statusActive: [1, 2, 3, 4],
        //   permission: this.isGranted([]),
        //   command: ($event) => {
        //     this.edit($event.item.data);
        //   }
        // },
      ];

      if (this.isGranted([this.PermissionCoreConst.CoreDuyetKHDN_TKNH_SetDefault]) && (item.isDefault !== this.YesNoConst.YES)) {
        action.push({
          data: item,
          label: 'Chọn mặc định',
          icon: 'pi pi-check',
          statusActive: [1, 2, 3, 4],
          permission: this.isGranted([]),
          command: ($event) => {
            this.setDefault($event.item.data);
          }
        });
      }
      // {
      //   data: item,
      //   label: 'Xóa',
      //   icon: 'pi pi-trash',
      //   statusActive: [1, 2, 3, 4],
      //   permission: this.isGranted([]),
      //   command: ($event) => {
      //     this.delete($event.item.data);
      //   }
      // }
      return action;
    });
  }


  setPage(pageInfo?: any) {
    this.page.pageNumber = pageInfo?.page ?? this.offset;
    this.page.keyword = this.keyword;
    this.isLoading = true;

    this._businessCustomerBankService.getAllApprove(this.businessCustomerDetail.businessCustomerTempId, this.page).subscribe((res) => {
      if (this.handleResponseInterceptor(res, '')) {
        this.page.totalItems = res?.data?.totalItems;
        this.rows = res?.data;
        this.genListAction(this.rows);
        setTimeout(() => {
          console.log('----', this.actions);
        }, 2000);
        console.log({ rowsBankTemp: res.data.items, totalItems: res.data.totalItems });
      }
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  setFieldError() {
    for (const [key, value] of Object.entries(this.businessCustomerBank)) {
      this.fieldErrors[key] = false;
    }
    console.log({ filedError: this.fieldErrors });
  }

  header(): string {
    return !this.businessCustomerBank?.businessCustomerId ? 'Thêm tài khoản ngân hàng' : 'Sửa tài khoản ngân hàng';
  }

  create() {
    const ref = this._dialogService.open(CreateOrUpdateBussinessCustomerBankComponent, {
      header: "Thêm mới tài khoản ngân hàng",
      width: '600px',
      contentStyle: { "max-height": "600px", overflow: "auto", "margin-bottom": "60px", },
      baseZIndex: 10000,
      data: {
        businessCustomerDetail: this.businessCustomerDetail,
        isApprove: true
      },
  });
  //
  ref.onClose.subscribe((res) => {
      this.setPage();
  });
  }

  edit(row) {
    this.businessCustomerBank = {
      ...row,
    };
    console.log({ businessCustomerBank: this.businessCustomerBank });
    this.modalDialog = true;
  }

  setDefault(row) {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					contentStyle: { "max-height": "600px", "overflow": "auto", "padding-bottom": "50px" },
					styleClass: 'p-dialog-custom',
					baseZIndex: 10000,
					data: {
						title : "Bạn muốn chọn tài khoản này thành mặc định?",
						icon: FormNotificationConst.IMAGE_APPROVE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
			this._businessCustomerBankService.setDefaultTemp(row).subscribe((response) => {
			  if (
				this.handleResponseInterceptor(
				  response,
				  "Chọn tài khoản này thành mặc định thành công"
				)
			  ) {
				this.setPage();
			  }
			});
			}
		});
	  }

  detail() {
    this.isDetail = true;
    this.businessCustomerBank = {
      ...this.businessCustomerBank,
    };

    console.log({ businessCustomerBank: this.businessCustomerBank });
    this.modalDialog = true;
  }

  delete(row) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn xóa tài khoản ngân hàng này?',
      header: 'Xóa thanh toán',
      acceptLabel: "Đồng ý",
			rejectLabel: "Hủy",
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._businessCustomerBankService.delete(row.businessCustomerBankId).subscribe((response) => {
          if (this.handleResponseInterceptor(response, "")) {
            this.messageService.add({ severity: 'success', summary: '', detail: 'Xóa thành công', life: 1500 });
            this.setPage();
          }
        });
      },
      reject: () => {

      },
    });
  }

  hideDialog() {
    this.modalDialog = false;
    this.submitted = false;
  }

  resetValid(field) {
    this.fieldErrors[field] = false;
  }

  save() {
    this.submitted = true;
    //
    console.log({ businessCustomerBank: this.businessCustomerBank });
    //
    this.businessCustomerBank.bankAccName = this.removeVietnameseTones(this.businessCustomerBank.bankAccName).toUpperCase();

    if (this.businessCustomerBank.id) {
      this._businessCustomerBankService.updateApprove(this.businessCustomerBank).subscribe((response) => {
        if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
          this.submitted = false;
          this.setPage({ page: this.page.pageNumber });
          this.hideDialog();
        } else {
          this.submitted = false;
        }
      }, () => {
        this.submitted = false;
      });
    } else {
      const body = {
        ...this.businessCustomerBank,
        businessCustomerId: this.businessCustomerDetail.businessCustomerTempId
      }
      this._businessCustomerBankService.create(body).subscribe((response) => {
          if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
            this.submitted = false;
            this.setPage();
            this.hideDialog();
          } else {
            this.submitted = false;
          }
        }, () => {
          this.submitted = false;
        });
    }
  }

  validForm(): boolean {
    const validRequired = this.businessCustomerBank?.bankAccNo?.trim()
                          && this.businessCustomerBank?.bankAccName?.trim()
                          && this.businessCustomerBank?.bankId;
    return validRequired;
  }

}
