import { Component, Injector, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormNotificationConst, OrderConst, OrderPaymentConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderPaymentServiceProxy, OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { DistributionService } from "@shared/services/distribution.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { environment } from "src/environments/environment";
import { FunctionForDevComponent } from "./function-for-dev/function-for-dev.component";

@Component({
	selector: "app-order-payment",
	templateUrl: "./order-payment.component.html",
	styleUrls: ["./order-payment.component.scss"],
})
export class OrderPaymentComponent extends CrudComponentBase {
constructor(
	injector: Injector,
	messageService: MessageService,
	private routeActive: ActivatedRoute,
	private _orderPaymentService: OrderPaymentServiceProxy,
	private _dialogService: DialogService,
	private _orderService: OrderServiceProxy,
) {
	super(injector, messageService);
    this.orderId = this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));
}

	orderId: string;
	@Input() orderDetail: any = {};

	ref: DynamicDialogRef;

	modalDialog: boolean;
	deleteItemDialog: boolean = false;
	confirmRequestDialog: boolean = false;
	
	rows: any[] = [];

	OrderPaymentConst = OrderPaymentConst;
	YesNoConst = YesNoConst;
	OrderConst = OrderConst;

	orderPayment: any = {
		"id": 0,  // id
		"codeId": 0,
		"tranDate": null, //tranDate
		"tranType": 1, // Kiểu giao dịch
		"tranClassify": 1,  // Loại giao dịch
		"paymentType": null,  // Loại thanh toán
		"orderId": 0,  // id orderId
		"paymentAmount": null,  // Số tiền paymentAmount
		"description": null, // Mô tả
		"status" : null,
		"partnerBankAccountId": null,
		"tradingBankAccountId": null
	}

	itemTradingProviderInfo = {};
	
	submitted: boolean;
	//
	page = new Page();
	offset = 0;
	//
	bondInfos: any = [];
	tradingProviders: any = [];
	bondTypes: any = [];
	tradingProviderInfo: any = {};
	productBondPrimaryInfo: any = {};
	paymentCurrencyInfo = {
	  'total': 0, // Tổng giá trị
	  'paid': 0,  // Đã thanh toán
	  'remain': 0, // Còn lại
	};
	isLoadingModal: boolean = false;
  
	paymentAccountTradingProvider: string ='';
	environment = environment;
	isDetail = false;
	isEdit = false;
	actionsDisplay: any[] = [];
	actions: any[] = [];
	listAction: any[] = [];
	listBanks: any[] = [];
	disableButtonPayment = false;
	
	ngOnInit(): void {
		this.listBanks = this.orderDetail.orderPaymentBanks.map( (bank, index) => {
			bank.labelName = bank?.bankAccount?.bankName + ' - ' + bank?.bankAccount?.bankAccNo + ' - ' + bank?.bankAccount?.bankAccName;
			bank.chooseId = index
			return bank;
		})
		this.paymentCurrencyInfo.total = this.orderDetail?.depositPrice ?? this.orderDetail?.productItemPrice?.depositPrice;
		this.getPaymentInfo();
		this.setPage();
	}

	funcForDev() {
    const ref = this._dialogService.open(FunctionForDevComponent, {
		header: "Giả lập MSB",
		width: "800px",
		data: {
			orderDetail: this.orderDetail,
		},
    });
    //
    ref.onClose.subscribe((res) => {
      this.setPage();
    });
  }

	genListAction(data = []) {
		this.listAction = data.map(orderItem => {
		  	const actions = [];
			if (this.isGranted([this.PermissionRealStateConst.RealStateMenuSoLenh_ThongTinThanhToan_ChiTiet]) && (orderItem.status == this.OrderPaymentConst.PAYMENT_CLOSE || orderItem.status == this.OrderPaymentConst.PAYMENT_SUCCESS)) {
				actions.push({
					data: orderItem,
					label: 'Chi tiết thanh toán',
					icon: 'pi pi-info-circle',
					command: ($event) => {
					this.detail($event.item.data);
					}
				});
			}
	
			if (this.isGranted([this.PermissionRealStateConst.RealStateMenuSoLenh_ThongTinThanhToan_ChinhSua]) && orderItem.status == this.OrderPaymentConst.PAYMENT_TEMP) {
				actions.push({
				data: orderItem,
				label: 'Sửa',
				icon: 'pi pi-pencil',
				command: ($event) => {
					this.edit($event.item.data);
				}
				})
			}
		
			if (this.isGranted([this.PermissionRealStateConst.RealStateMenuSoLenh_ThongTinThanhToan_PheDuyetOrHuy]) &&orderItem.status == this.OrderPaymentConst.PAYMENT_TEMP) {
				actions.push({
				data: orderItem,
				label: 'Phê duyệt',
				icon: 'pi pi-check',
				statusActive: [this.OrderPaymentConst.PAYMENT_TEMP],
				command: ($event) => {
					this.approve($event.item.data);
				}
				})
			}
	
		  if (this.isGranted([this.PermissionRealStateConst.RealStateMenuSoLenh_ThongTinThanhToan_PheDuyetOrHuy]) && orderItem.status == this.OrderPaymentConst.PAYMENT_SUCCESS) {
			actions.push({
			  data: orderItem,
			  label: 'Hủy phê duyệt',
			  icon: 'pi pi-times',
			  command: ($event) => {
				this.cancel($event.item.data);
			  }
			})
		  }
	
		//   if (orderItem.status == this.OrderPaymentConst.PAYMENT_SUCCESS && this.isGranted([this.PermissionGarnerConst.GarnerHDPP_SoLenh_TTCT_TTThanhToan_GuiThongBao])) {
		// 	actions.push({
		// 	  data: orderItem,
		// 	  label: 'Gửi thông báo',
		// 	  icon: 'pi pi-send',
		// 	  command: ($event) => {
		// 		this.resentNotify($event.item.data);
		// 	  }
		// 	});
		//   }
	
		  if (this.isGranted([this.PermissionRealStateConst.RealStateMenuSoLenh_ThongTinThanhToan_Xoa]) && orderItem.status == this.OrderPaymentConst.PAYMENT_TEMP) {
			actions.push({
			  data: orderItem,
			  label: 'Xóa',
			  icon: 'pi pi-trash',
			  command: ($event) => {
				this.delete($event.item.data);
			  }
			});
		}
		  
		  	return actions;
		});
	  }


	changeBank(value){
		this.orderPayment.partnerBankAccountId = this.listBanks[value]?.partnerBankAccountId;
		this.orderPayment.tradingBankAccountId = this.listBanks[value]?.tradingBankAccountId;
	}

	detail(orderPayment) {
		this.orderPayment = {};
		this.isDetail = true;
		this.orderPayment = {
			...orderPayment,
		};

		this.modalDialog = true;
	}

	edit(orderPayment) {
		this.orderPayment = {};
		this.isDetail = false;
		this.orderPayment = {
		  ...orderPayment,
		  tradingBankAccountId: this.orderDetail?.orderPaymentFirstBank?.tradingBankAccountId,
		  partnerBankAccountId: this.orderDetail?.orderPaymentFirstBank?.partnerBankAccountId
		};
	
		this.modalDialog = true;
	}

	approve(orderPayment) {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn phê duyệt thanh toán này?",
						icon: FormNotificationConst.IMAGE_APPROVE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
			if (dataCallBack?.accept) {
        this._orderPaymentService.approve(orderPayment.id).subscribe((response) => {
          if (this.handleResponseInterceptor(response,"Phê duyệt thanh toán thành công")) {
            this.setPage();
          }
        });
      }
		});
	}
  //
  cancel(orderPayment) {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn hủy phê duyệt thanh toán này?",
						icon: FormNotificationConst.IMAGE_CLOSE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
			if (dataCallBack?.accept) {
        this._orderPaymentService.cancel(orderPayment.id).subscribe((response) => {
          if (this.handleResponseInterceptor(response,"Hủy phê duyệt thanh toán thành công")) {
            this.setPage();
          }
        });
			}
		});
	}

	delete(orderPayment) {
		const ref = this._dialogService.open(
				FormNotificationComponent,
				{
					header: "Thông báo",
					width: '600px',
					data: {
						title : "Bạn có chắc chắn xóa thanh toán này?",
						icon: FormNotificationConst.IMAGE_CLOSE,
					},
				}
			);
		ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
			if (dataCallBack?.accept) {
			this._orderPaymentService.delete(orderPayment.id).subscribe((response) => {
			  if (this.handleResponseInterceptor(response,"Xóa thanh toán thành công")) {
				  this.setPage();
			  }
			});
			} 
		});
	}

	getPaymentInfo() {
		let paid = 0;
		for(let row of this.rows) {
		  if(row.status == this.OrderPaymentConst.PAYMENT_SUCCESS && row?.tranType == OrderPaymentConst.THU) {
			paid = paid + row.paymentAmount;
		  }
		}
		//
		this.paymentCurrencyInfo.paid = paid;
		
		this.paymentCurrencyInfo.remain = this.paymentCurrencyInfo.total - this.paymentCurrencyInfo.paid;
		if(this.paymentCurrencyInfo.remain <= 0) {
		  this.disableButtonPayment = true;
		} else {
		  this.disableButtonPayment = false;
		}
	}

	create() {
		this.getBanks();
		this.isDetail = false;
		this.orderPayment = {};
		this.orderPayment.codeId = new Date().getTime();
		this.orderPayment.orderId = +this.orderId;
		this.orderPayment.description = 'TT/HĐ'+ this.orderDetail?.contractCode+'MBLI';
		this.orderPayment.paymentAmount = this.paymentCurrencyInfo.remain > 0 ? this.paymentCurrencyInfo.remain : null;
		this.orderPayment.tranDate = this.getDateNow();
		
		if(this.orderDetail.orderPaymentFirstBank) {
		  this.orderPayment.tradingBankAccountId = this.orderDetail?.orderPaymentFirstBank?.tradingBankAccountId;
		  this.orderPayment.partnerBankAccountId = this.orderDetail?.orderPaymentFirstBank?.partnerBankAccountId;
		}
	
		this.submitted = false;
		this.modalDialog = true;
	}

	getBanks() {
		// this.isLoadingModal = true;
		// forkJoin([this._distributionService.getBankList({ distributionId: this.orderDetail.distributionId, type: OrderPaymentConst.THU })]).subscribe(([resBank]) => {
		//   this.isLoadingModal = false;
		//   if(this.handleResponseInterceptor(resBank)) {
		// 	this.listBanks = resBank.data.map(bank => {
		// 	  bank.labelName = bank?.bankAccNo + ' - ' + bank.bankAccName + ' - ' + bank.bankName;
		// 	  return bank;
		// 	});
		//   }
		//   console.log("this.listBanks",this.listBanks);
		// }, (err) => {
		//   this.isLoadingModal = false;
		// });
	}

	getBankInfo(bank): string {
		if(bank) {
		  return bank?.bankAccount?.bankName + ' - ' + bank?.bankAccount?.bankAccNo + ' - ' + bank?.bankAccount?.bankAccName;
		}
		return '';
	}

	 
	header(): string {
		return !this.orderPayment?.status ? 'Thêm thanh toán' : this.orderPayment?.status == OrderPaymentConst.PAYMENT_TEMP ? 'Sửa thanh toán' : 'Chi tiết thanh toán';
	}

	hideDialog() {
		this.modalDialog = false;
		this.submitted = false;
	}
	

	save() {
		this.submitted = true;
		//
		let body = this.orderPayment;
		//
		if (this.orderPayment.id) {
		  this._orderPaymentService.update(body).subscribe((response) => {
			//
			if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
			  this.submitted = false;
			  this.setPage();
			  this.hideDialog();
			} else {
			  this.submitted = false;
			}
		  }, () => {
			this.submitted = false;
		  }
		  );
		} else {
		  this._orderPaymentService.create(body).subscribe(
			(response) => {
			  if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
				this.submitted = false;
				this.setPage();
				this.hideDialog();
			  } else {
				this.submitted = false;
			  }
			}, () => {
			  this.submitted = false;
			}
		  );
		}
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		forkJoin([this._orderService.get(+this.orderId), this._orderPaymentService.getAll(this.page, this.orderId)]).subscribe(([resOrder, resOrderPayment]) => {
		  this.isLoading = false;
		  if(this.handleResponseInterceptor(resOrder)) {
			this.orderDetail.status = resOrder?.data?.status;
			this.orderDetail.distributionId = resOrder?.data?.distributionId;
			this.orderDetail.orderPaymentFirstBank = resOrder?.data?.orderPaymentFirstBank;
			this.paymentAccountTradingProvider = this.getBankInfo(this.orderDetail?.orderPaymentFirstBank);
		  }
		  //
		  if (this.handleResponseInterceptor(resOrderPayment, '')) {
			this.page.totalItems = resOrderPayment.data.totalItems;
			this.rows = resOrderPayment.data.items.filter(i => i.tranType == OrderPaymentConst.THU);
			//
			if(this.rows.length) {
			  this.getPaymentInfo();
			  this.genListAction(this.rows);
			}
		  }
		}, (err) => {
		  this.isLoading = false;
		});
	}

	validForm(): boolean {
		const validRequired = this.orderPayment?.paymentType && this.orderPayment?.paymentAmount && this.orderPayment?.tranDate;
		return validRequired;
	}
}
