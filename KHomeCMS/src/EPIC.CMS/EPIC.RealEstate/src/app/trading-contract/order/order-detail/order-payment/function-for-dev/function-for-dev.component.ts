import { Component, Injector } from "@angular/core";
import { OrderPaymentConst, SampleContractConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { FunctionForDevService } from "@shared/services/function-for-dev.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-function-for-dev",
	templateUrl: "./function-for-dev.component.html",
	styleUrls: ["./function-for-dev.component.scss"],
})
export class FunctionForDevComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public ref: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
		private _functionForDevService: FunctionForDevService,
	) {
		super(injector, messageService);
	}

	giaLapMSB: any = {
		// tranSeq: "123",
		vaCode: "",
		vaNumber: "",
		fromAccountName: "test gia lap MSB",
		fromAccountNumber: "test gia lap MSB",
		toAccountName: "test gia lap MSB",
		toAccountNumber: "test gia lap MSB",
		tranAmount: "",
		tranRemark: "test gia lap MSB",
		tranDate: "",
		signature: "test gia lap MSB",
	};
	SampleContractConst = SampleContractConst;
	row: any;
	col: any;
	listBanks: any[] = [];
	developer: any = {
		name: null,
		contractType: null,
		contractSource: null,
		fileInvestor: null,
		fileBusinessCustomer: null,
		tradingBankAccId: null,
	};
	tradingBankAccId: any;

	blockText: RegExp = /[0-9,.]/;
	submitted: boolean;
	cols: any[];
	statuses: any[];
	OrderPaymentConst = OrderPaymentConst;
	orderDetail: any;
	ngOnInit(): void {
		if (this.configDialog?.data?.orderDetail) {
			this.orderDetail = this.configDialog?.data?.orderDetail;
			this.listBanks = this.orderDetail.orderPaymentBanks.map((bank, index) => {
				bank.labelName =
					bank?.bankAccount?.bankName +
					" - " +
					bank?.bankAccount?.bankAccNo +
					" - " +
					bank?.bankAccount?.bankAccName;
				bank.chooseId = index;
				return bank;
			});
			// this.getBanks();
		}
	}

	receiveNotification() {
		this.giaLapMSB.tranSeq = new Date().getTime().toString();
		this.giaLapMSB.vaCode = this.developer.prefixMsb.toString().slice(0, 6);
		this.giaLapMSB.vaNumber =
			this.developer.prefixMsb + `EH` + this.orderDetail.id;
		// this.giaLapMSB.tranDate = moment(this.giaLapMSB.tranDate).format('YYMMDDHHmmss');

		this._functionForDevService.receive(this.giaLapMSB).subscribe(
			(response) => {
				if (
					this.handleResponseInterceptor(response, "Gọi thông báo thành công")
				) {
					// this.ref.close(true);
				}
				this.submitted = false;
			},
			(err) => {
				console.log("err---", err);
				this.messageError("Gửi thất bại!");
				this.submitted = false;
			}
		);
	}

	changeBank(bankId) {
		this.getBankInfo(bankId);
	}

	getBankInfo(bankId) {
		this._functionForDevService.getAllNoPermisson(bankId).subscribe(
			(resBank) => {
				if (this.handleResponseInterceptor(resBank)) {
					this.developer = resBank?.data;
					console.log("resBank", resBank);
				}
			},
			(err) => {}
		);
	}

	// getBanks() {
	//   this.isLoading = true;
	//   forkJoin([this._orderService.getBankList({distributionId: this.orderDetail.distributionId, type: OrderPaymentConst.THU})]).subscribe(([resBank]) => {
	//     this.isLoading = false;
	//     if(this.handleResponseInterceptor(resBank)) {
	//       this.listBanks = resBank.data.map(bank => {
	//         bank.labelName = bank?.bankAccNo + ' - ' + bank.bankAccName + ' - ' + bank.bankName;
	//         return bank;
	//       });
	//     }
	//     console.log("this.listBanks",this.listBanks);
	//   }, (err) => {
	//     this.isLoading = false;
	//   });
	// }

	close() {
		this.ref.close();
	}

	save() {}

	validForm(): boolean {
		const validRequired = this.developer?.name;

		return validRequired;
	}
}
