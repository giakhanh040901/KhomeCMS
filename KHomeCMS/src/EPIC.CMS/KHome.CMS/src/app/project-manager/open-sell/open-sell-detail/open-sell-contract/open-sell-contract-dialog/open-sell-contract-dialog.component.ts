import { Component, Injector, Input, OnInit } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService, ConfirmationService } from "primeng/api";
import { forkJoin } from "rxjs";
import {
	ActiveDeactiveConst,
	ContractFormConst,
	DistributionContractTemplateConst,
	IDropdown,
	PolicyDetailTemplateConst,
	SampleContractConst,
	YesNoConst,
} from "@shared/AppConsts";
import {
	DialogService,
	DynamicDialogConfig,
	DynamicDialogRef,
} from "primeng/dynamicdialog";
import { Page } from "@shared/model/page";
import { OpenSellContractService } from "@shared/services/open-sell-contract.service";

@Component({
	selector: "app-open-sell-contract-dialog",
	templateUrl: "./open-sell-contract-dialog.component.html",
	styleUrls: ["./open-sell-contract-dialog.component.scss"],
	providers: [DialogService],
})
export class OpenSellContractDialogComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public configDialog: DynamicDialogConfig,
		public ref: DynamicDialogRef,
		private _openSellContractService: OpenSellContractService
	) {
		super(injector, messageService);
	}

	isCreateDetail: boolean;
	isCreateContractTemp: boolean;
	rows: any[] = [];
	//
	YesNoConst = YesNoConst;
	ContractFormConst = ContractFormConst;
	SampleContractConst = SampleContractConst;
	DistributionContractTemplateConst = DistributionContractTemplateConst;

	depositForm: any = {
		openSellId: 0,
		contractType: 0,
	};

	contractTypes: any;
	contractTypesPartner = [...SampleContractConst.contractType];
	contractTypesTrading = [
		{
			name: "Hợp đồng đặt cọc",
			code: 4,
		},
	];

	submitted: boolean;

	policies = [];
	contractCodeTemplates: any = [];
	configContract: any = [];
	sampleContract: any = [];

	page = new Page();
	offset = 0;

	contractTemplateChoose: any = {};

	ngOnInit(): void {
		this.depositForm.openSellId = this.configDialog?.data?.openSellId;
		if (this.configDialog?.data?.depositForm) {
			this.depositForm = this.configDialog?.data?.depositForm;
		}
		this.depositForm.depositContractFormType = this.depositForm?.partnerId
			? this.SampleContractConst.DOI_TAC
			: this.SampleContractConst.DAI_LY;
		if (
			this.depositForm.depositContractFormType == SampleContractConst.DAI_LY
		) {
			this.contractTypes = this.contractTypesTrading;
		} else {
			this.contractTypes = this.contractTypesPartner;
		}

		if (this.configDialog?.data?.openSellId) {
			this.isLoading = true;
			forkJoin([
				this._openSellContractService.getAllSellingPolicy(
					this.configDialog?.data?.openSellId,
					ActiveDeactiveConst.ACTIVE,
				),
				this._openSellContractService.getAllSampleContract(
					this.page,
					this.depositForm.contractType,
					this.depositForm.depositContractFormType
				),
				this._openSellContractService.getAllConfig(
					this.page,
					this.depositForm.depositContractFormType
				),
			]).subscribe(
				([resPolicy, resSampleContract, resConfig]) => {
					this.isLoading = false;

					// Danh sách chính sách
					if (this.handleResponseInterceptor(resPolicy, "")) {
						this.policies = resPolicy?.data;
					}
					// Danh sách mẫu cấu trúc hợp đồng
					if (this.handleResponseInterceptor(resConfig, "")) {
						this.configContract = resConfig?.data?.items;
					}

					// Danh sách mẫu hợp đồng
					if (this.handleResponseInterceptor(resSampleContract, "")) {
						this.sampleContract = resSampleContract.data?.items;
						if (this.configDialog?.data?.depositForm) {
							this.sampleContract.filter((item) => {
								if (item.id === this.depositForm.contractTemplateTempId) {
									this.depositForm.contractType = item.contractType;
								}
							});
						}
					}
				},
				(err) => {
					console.log("err__", err);
				}
			);
		}
	}

	getSampleContract(pageInfo?: any) {
		this.isLoading = true;
		if (
			this.depositForm.depositContractFormType == SampleContractConst.DAI_LY
		) {
			this.contractTypes = this.contractTypesTrading;
		} else {
			this.contractTypes = this.contractTypesPartner;
		}
		this._openSellContractService
			.getAllSampleContract(
				this.page,
				this.depositForm.contractType,
				this.depositForm.depositContractFormType
			)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.sampleContract = res.data?.items;
					}
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
	}

	getAllConfig(pageInfo?: any) {
		this.isLoading = true;
		this._openSellContractService
			.getAllConfig(this.page, this.depositForm.depositContractFormType)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.configContract = res?.data?.items;
					}
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
	}

	save() {
		this.submitted = true;
		let body = this.depositForm;
		if (this.depositForm.id) {
			this._openSellContractService.update(body).subscribe(
				(response) => {
					if (
						this.handleResponseInterceptor(response, "Cập nhật thành công!")
					) {
						this.ref.close(true);
					}
					this.submitted = false;
				},
				(err) => {
					console.log("err----", err);
					this.submitted = false;
				}
			);
		} else {
			this._openSellContractService.create(body).subscribe(
				(response) => {
					if (
						this.handleResponseInterceptor(response, "Cập nhật thành công!")
					) {
						this.ref.close(true);
					}
					this.submitted = false;
				},
				(err) => {
					console.log("err----", err);
					this.submitted = false;
				}
			);
		}
	}

	close() {
		this.ref.close();
	}
}
