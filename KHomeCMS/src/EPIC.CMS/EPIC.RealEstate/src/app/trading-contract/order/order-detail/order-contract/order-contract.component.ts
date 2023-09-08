import { Component, Inject, Injector, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppConsts, BusinessTypeConst, DistributionContractTemplateConst, FormNotificationConst, IsSignPdfConst, OrderConst, PermissionRealStateConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies-base";
import { ContractTemplateServiceProxy, OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
selector: "app-order-contract",
templateUrl: "./order-contract.component.html",
styleUrls: ["./order-contract.component.scss"],
})
export class OrderContractComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private _contractTemplateServiceProxy: ContractTemplateServiceProxy,
		private _orderServiceProxy: OrderServiceProxy,
		private _dialogService: DialogService,

		@Inject(API_BASE_URL) baseUrl?: string
	) {
		super(injector, messageService);
		//
		this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
		this.orderId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get("id"));
	}

	private baseUrl: string;
	orderId: number;

	AppConsts = AppConsts;
    PermissionRealStateConst = PermissionRealStateConst;
	@Input() orderDetail: any = {};

    ref: DynamicDialogRef;
    modalDialog: boolean;
    modalDialogPDF: boolean;
    rows: any[] = [];

    BusinessTypeConst = BusinessTypeConst;
    IsSignPdfConst = IsSignPdfConst;
    DistributionContractTemplateConst = DistributionContractTemplateConst;
    OrderConst = OrderConst;

    contractTemplate: any = {
        id: 0,
        code: null,
        name: "",
        type: null,
        contractTempUrl: "",
        businessType: BusinessTypeConst.B2B,
        status: null,
        deleted: null,
        orderContractFileId: null,
        fileScanUrl: null,
        fileTempUrl: null,
        fileSignatureUrl: null
    };

    orderContractFile: any = {
        orderContractFileId: 0,
        orderId: 0,
        ContractTempId: 0,
        fileScanUrl: null
    };

    page = new Page();
    offset = 0;
    actionsDisplay: any[] = [];
    actions: any[] = [];
    uploadedFiles: any[] = [];
    submitted: boolean;
    urlfilePDF:string = '';

    isSignAll: boolean = true;
    haveSign: boolean = false

	ngOnInit(): void {
		this.setPage();
	}

	
    updateOrderContract(isMessage = true) {
        this.isLoading = true;
        this._orderServiceProxy.updateOrderContract(this.orderId).subscribe((res) => {
            this.isLoading = false;
            if(this.handleResponseInterceptor(res, (isMessage ? 'Update thành công' : ''))) {
                this.setPage();
            } 
        }, () => {
            this.isLoading = false;
        });
    }

    downloadFile(contractTemplate) {
        this.isLoading = true;
        this._orderServiceProxy.downloadFile(this.orderId, contractTemplate.id).subscribe((res) => {
            this.isLoading = false;
            this.handleResponseInterceptor(res);
        }, () => {
            this.isLoading = false;
        });
    }

    downloadFileTempContract(contractTemplate) {
        if (contractTemplate.id > 0) {
            this.isLoading = true;
            this._orderServiceProxy.downloadFileTempContract(contractTemplate.id).subscribe((res) => {
                this.isLoading = false;
                this.handleResponseInterceptor(res);
            }, () => {
                this.isLoading = false;
            });
        } else {
            this.messageError("Chưa cập nhật hồ sơ!");
        }

    }

    downloadFileTempPdfContract(contractTemplate) {
        if (contractTemplate.id > 0) {
            this.isLoading = true;
            this._orderServiceProxy.downloadFileTempPdfContract(contractTemplate.id).subscribe((res) => {
                this.isLoading = false;
                this.handleResponseInterceptor(res);
            }, () => {
                this.isLoading = false;
            });
        } else {
            this.messageError("Chưa cập nhật hồ sơ!");
        }
    }

    downloadFileSignatureContract(contractTemplate) {
        if (contractTemplate.id > 0) {
            this.isLoading = true;
            this._orderServiceProxy.downloadFileSignatureContract(contractTemplate.id).subscribe((res) => {
                this.isLoading = false;
                this.handleResponseInterceptor(res);
            }, () => {
                this.isLoading = false;
            });
        } else {
            this.messageError("Chưa cập nhật hồ sơ!");
        }
    }

    downloadFileScanUrl() {
         window.open(this.urlfilePDF, "_blank");        
    }

    viewFile(fileUrl) {
        this.urlfilePDF = '/' + fileUrl;
        if(!fileUrl){
            this.messageError("Không có file hồ sơ", "")
        }else{
            if(this.utils.isPdfFile(fileUrl)){
                this._orderServiceProxy.viewFilePDF(this.urlfilePDF + '&download=true').subscribe()
            } else {
                this.messageError("Hệ thống hiện tại chỉ hỗ trợ xem file PDF", "")
            }
        }
    }

    activeOnline() {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn muốn đổi sang Chuyển online?",
						icon: FormNotificationConst.IMAGE_APPROVE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
        console.log({ dataCallBack });
			if (dataCallBack?.accept) {
                this._orderServiceProxy.activeOnline(this.orderDetail.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Chuyển Online thành công")) {
                        this.setPage();
                    }
                });
			}
		});
	}

    approve() {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn duyệt hồ sơ sổ lệnh này?",
						icon: FormNotificationConst.IMAGE_APPROVE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
        console.log({ dataCallBack });
			if (dataCallBack?.accept) {
                this._orderServiceProxy.approve(this.orderDetail.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Duyệt hồ sơ thành công")) {
                        this.setPage();
                    }
                });
			}
		});
	}

    cancel() {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn hủy duyệt hồ sơ sổ lệnh này?",
						icon: FormNotificationConst.IMAGE_CLOSE,
					},
				}
			);
		    ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
			if (dataCallBack?.accept) {
                this._orderServiceProxy.cancel(this.orderDetail.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Hủy duyệt hồ sơ thành công")) {
                        this.setPage();
                    }
                });
			}
		});
	}

    getOrderDetail() {
        this._orderServiceProxy.get(this.orderDetail.id).subscribe((resOrder) => {
            if (this.handleResponseInterceptor(resOrder, '')) {
                this.orderDetail = resOrder?.data;
            }
        });
    }

    setPage(pageInfo?: any) {
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
        this.page.keyword = this.keyword;
        this.isLoading = true;
        this.isSignAll = true;
        this.haveSign = false;

        forkJoin([this._contractTemplateServiceProxy.getByOrder(this.page, this.orderId),this._orderServiceProxy.get(this.orderId)]).subscribe(([resContract, resOrder]) => {
            this.isLoading = false;
            if(this.handleResponseInterceptor(resOrder)) {
                this.orderDetail.status = resOrder?.data?.status;
                this.orderDetail.source = resOrder?.data?.source;
            }
            //
            if(this.handleResponseInterceptor(resContract, '')) {
                // this.page.totalItems = resContract.data.totalItems;
                this.rows = resContract.data.map((item) => {
                    item.isFileUrl = item.fileScanUrl ? true : false;
                    return item;
                });
            }
        }, () => {
            this.isLoading = false;
        });
    }

    showModalUpload(row) {
        this.submitted = false;
        this.modalDialog = true;
        this.contractTemplate = { ...row };
        
        this.orderContractFile = {
            id: this.contractTemplate.id,
            fileScanUrl: this.contractTemplate.fileScanUrl
        };
    }

    hideDialog() {
        this.modalDialog = false;
        this.submitted = false;
        this.modalDialogPDF = false;
    }

    saveOrderContractFile() {
        this.submitted = true;
        if (this.contractTemplate.id > 0) {
            this._orderServiceProxy.updateOrderContractFile(this.orderContractFile).subscribe(
                (response) => {
                    if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
                        this.hideDialog();
                        this.setPage();
                    } 
                    this.submitted = false;
                },() => {
                    this.submitted = false;
                }
            );
        } else {
            this._orderServiceProxy.createOrderContractFile(this.orderContractFile).subscribe(
                (response) => {
                    if (this.handleResponseInterceptor(response, "Thêm thành công")) {
                        this.hideDialog();
                        this.setPage();
                    }
                    this.submitted = false;
                },() => {
                    this.submitted = false;
                }
            );
        }
    }

    validForm(): boolean {
        return this.orderContractFile?.fileScanUrl?.trim() !== "";
    }

    myUploader(event) {
        if (event?.files[0]) {
            this._contractTemplateServiceProxy.uploadFileGetUrl(event?.files[0], "order-contract").subscribe((response) => {
                    console.log({response});  
                    if (this.handleResponseInterceptor(response, 'Tải lên thành công!')) {
                        this.orderContractFile.fileScanUrl = response.data;
                    }
                },(err) => {
                    this.messageError("Có sự cố khi upload!");
                }
            );
        }
    }
}
