import { CrudComponentBase } from '@shared/crud-component-base';
import { Component, Injector} from '@angular/core';
import { Page } from '@shared/model/page';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { ContractorConst, FormNotificationConst, AppConsts, ActiveDeactiveConst, SearchConst } from '@shared/AppConsts';
import { Router } from "@angular/router"
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { OwnerServiceProxy } from '@shared/service-proxies/owner-service';
import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';
import { GeneralContractorServiceProxy } from '@shared/service-proxies/setting-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadImageComponent } from 'src/app/components/upload-image/upload-image.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})

export class OwnerComponent extends CrudComponentBase {

	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private router: Router,
		private generalContractorService: GeneralContractorServiceProxy,
		private breadcrumbService: BreadcrumbService,
		private _dialogService: DialogService,
		private ownerService: OwnerServiceProxy,
		private fb: FormBuilder,

	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: 'Trang chủ', routerLink: ['/home'] },
			{ label: 'Cài đặt'},
			{ label: 'Chủ đầu tư' },
		]);
	}

	owner: any = {
		businessCustomerId: null,
		businessTurnover: null,	// Doanh thu
		businessProfit: null,	// Lợi nhuận
		roa: null,
		roe: null,
		fanpage: null,
		hotline: null,
		image: null,
		descriptionContentType: "",
		descriptionContent: ""
	};
	status = null;

	expandedRows = {};

	ref: DynamicDialogRef;

	modalDialog: boolean;

	deleteItemDialog: boolean = false;

	confirmRequestDialog: boolean = false;

	rows: any[] = [];
	row: any;
	col: any;

	cols: any[];
	_selectedColumns: any[];
	listAction: any[] = [];
	actions: any[] = [];  // list button actions
	actionsDisplay: any[] = [];
	statusSearch = ContractorConst.status;

	ContractorConst = ContractorConst;
	ActiveDeactiveConst = ActiveDeactiveConst;
	businessCustomer: any = {};
	customers: any
	businessCustomerId: number;

	submitted: boolean;

	page = new Page();
	offset = 0;

	statuses: any[];
	// frozenCols: any[];

	isRefresh = true;
	customerFind: string = "";

	postForm: FormGroup;
    caretPos: number = 0;
    baseUrl: string;

	htmlMarkdownOptions: any = [
        {
        value: "MARKDOWN",
        name: "MARKDOWN",
        },
        {
        value: "HTML",
        name: "HTML",
        },
    ];

    minWidthTable: string;

	ngOnInit() {
        this.minWidthTable = '1800px';
        this.subject.keyword.pipe(debounceTime(SearchConst.DEBOUNCE_TIME)).subscribe(() => {
            if (this.keyword === "") {
                this.setPage();
            } else {
                this.setPage();
            }
        });

		this.subject.customerFind.pipe(debounceTime(SearchConst.DEBOUNCE_TIME)).subscribe(() => {
            if (this.customerFind === "") {
                this.getInfoCustomer();
            } else {
                this.getInfoCustomer();
            }
        });

        this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.postForm = this.fb.group({
			descriptionContent: [{ value: "", disabled: false }],
			descriptionContentType: [ "HTML", [Validators.required]],
		}); 

		console.log('this.postForm: ', this.postForm);
		

		this.setPage({ page: this.offset });

		this.cols = [
			{ field: 'taxCode', header: 'Mã số thuế', width: '8rem' },
			{ field: 'name', header: 'Tên doanh nghiệp'},
			{ field: 'shortName', header: 'Tên viết tắt' },
			{ field: 'email', header: 'Email'},
			{ field: 'phone', header: 'SĐT', width : '9rem'},
    	];
		//
		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
		this._selectedColumns = this.getLocalStorage('ownerRst') ?? this.cols;
	}

	isChooseCustomer(row) {
		this.owner.businessCustomerId = row.businessCustomerId
		this.owner.image = 'api bo truong nay'
		this.businessCustomer = row;
	}

	clearDataCustomer() {
        this.customerFind = '';
		this.owner = {}
		this.businessCustomer = {}
        this.customers = [];
        //
    }

	getInfoCustomer() {
			this.isLoading = true;
			this.generalContractorService.getByTaxCode(this.customerFind?.trim()).subscribe((res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, '') && res?.data) {
				  this.page.totalItems = res.data.totalItems;
				  this.customers = [res?.data];
				  if (!this.customers) this.messageError('Không tìm thấy dữ liệu');
				  console.log();
				  
				} else {
				  this.messageError('Không tìm thấy dữ liệu');
				}
			  }, () => {
				this.isLoading = false;
			  });

    }

	changeStatus(){
		this.setPage({ page: this.page.pageNumber });
	}

	setColumn(col,_selectedColumns){
		console.log('cols:', col);
		
		console.log('_selectedColumns', _selectedColumns);
		
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			console.log('dataCallBack', dataCallBack);
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function(a,b){
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, 'ownerRst')
			}
		});
	}

	insertImage() {
        const ref = this.dialogService.open(UploadImageComponent, {
          data: {
            inputData: [],
            showOrder: false
          },
          header: 'Chèn hình ảnh',
          width: '600px',
          
        });
        ref.onClose.subscribe(images => {
          let imagesUrl = "";
          images.forEach(image => {
            imagesUrl += `![](${this.baseUrl}/${image.data}) \n`;
          })
    
          let oldContentValue = this.postForm.value.descriptionContent;
          let a = oldContentValue.slice(0, this.caretPos) + imagesUrl + oldContentValue.slice(this.caretPos); 
          this.postForm.controls['descriptionContent'].setValue(a);
    
        })
    }
	
    getCaretPos(oField) {
        if (oField.selectionStart || oField.selectionStart == '0') {
          this.caretPos = oField.selectionStart;
          console.log("this.caretPos",this.caretPos);
        }
    }

	genListAction(data = []) {
		this.listAction = data.map(ownerItem => {
			const actions = [];

			if(this.isGranted([this.PermissionRealStateConst.RealStateChuDT_ThongTinChuDauTu])) {
				actions.push({
					data: ownerItem,
					label: 'Xem chi tiết',
					icon: 'pi pi-eye',
					command: ($event) => {
						this.detail($event.item.data);
					}
				})
			}

			if(this.isGranted([this.PermissionRealStateConst.RealStateChuDT_Xoa])) {
				actions.push({
					data: ownerItem,
					label: ownerItem.status == ContractorConst.KICH_HOAT ? "Hủy kích hoạt" : "Kích hoạt",
					icon: ownerItem.status == ContractorConst.KICH_HOAT ? "pi pi-times-circle" : "pi pi-check-circle",
					command: ($event) => {
						this.changeStatusOwner($event.item.data);
					}
				})
			}

			if(this.isGranted([this.PermissionRealStateConst.RealStateChuDT_Xoa])) {
				actions.push({
					data: ownerItem,
					label: 'Xoá',
					icon: 'pi pi-trash',
					command: ($event) => {
						this.delete($event.item.data);
					}
				})
			}

			return actions;
		});
	}

	changeStatusOwner(item) {
		const ref = this.dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '400px',
                data: {	
                    title: item.status == ContractorConst.KICH_HOAT ? `Bạn có chắc chắn muốn hủy kích hoạt chủ đầu tư ${item.businessCustomer.name} không ?` : `Bạn có chắc chắn muốn kích hoạt chủ đầu tư ${item.businessCustomer.name} không ?`,
                    icon: item.status == ContractorConst.KICH_HOAT ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            if (dataCallBack?.accept) {
				let status = item.status == ContractorConst.KICH_HOAT ? ContractorConst.HUY_KICH_HOAT : ContractorConst.KICH_HOAT;
                this.ownerService.changeStatus(item.id, status).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Cập nhật thành công")) {
                        this.setPage({ page: this.page.pageNumber });
                    }
                }, (err) => {
                    console.log('err____', err);
                });
            } 
        });
	}

	create() {
		this.customerFind = "";
		this.customers = [];
		this.owner = {};
		this.businessCustomer = {};
		this.submitted = false;
		this.modalDialog = true;
	}

	delete(owner) {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn xóa nhà đâu tư này?",
						icon: FormNotificationConst.IMAGE_CLOSE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
			if (dataCallBack?.accept) {
			this.ownerService.delete(owner?.id).subscribe((response) => {
			  if (
				this.handleResponseInterceptor(
				  response,
				  "Xóa nhà đâu tư thành công"
				)
			  ) {
				  this.setPage({ page: this.page.pageNumber });
				  this.owner = {};
			  }
			});
			} else { 
				reject: () => {

				}
			}

		});
	  }

	detail(owner) {
		this.router.navigate(['/setting/owner/detail', this.cryptEncode(owner?.id)]);
	}
	
	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;

		this.page.keyword = this.keyword;
		this.isLoading = true;

		this.ownerService.getAllOwner(this.page, this.status).subscribe((res) => {
			this.isLoading = false;
			if(this.callBackData(res) && this.isRefresh) {
				this.isRefresh = false;
				this.setPage();
			} else {
				if (this.handleResponseInterceptor(res, '')) {
					this.page.totalItems = res.data.totalItems;
					this.rows = res.data.items;
					this.genListAction(this.rows);
					console.log({ rows: res.data.items, totalItems: res.data.totalItems });
				}
			}
		}, (err) => {
			console.log('err-------', err);
			this.isLoading = false;
			
		});
	}

	hideDialog() {
		this.modalDialog = false;
		this.submitted = false;
	}

	save() {
		this.submitted = true;
		this.owner.descriptionContentType = this.postForm?.value?.descriptionContentType;
		this.owner.descriptionContent = this.postForm?.value?.descriptionContent;
		console.log('owner: ', this.owner);
		
		this.ownerService.create(this.owner).subscribe(
			(response) => {
				if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
					this.submitted = false;
					this.hideDialog();
					this.isLoadingPage = true;
					this.setPage();
					setTimeout(() => {
						this.isLoadingPage = false;
						// this.router.navigate(['/setting/owner/detail', this.cryptEncode(response.data.id)]);
					}, 1000);
				} else {
					this.submitted = false;
				}
			}, () => {
				this.submitted = false;
			}
		);
	}

	validForm(): boolean {
		const validRequired = this.businessCustomer?.code;
		 
		return validRequired;
	  }
}