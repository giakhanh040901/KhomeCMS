import { OpenSellService } from "@shared/services/open-sell.service";
import { Component, EventEmitter, Injector, Input, Output } from "@angular/core";
import { COMPARE_TYPE, IActionTable, IHeaderColumn, OpenSellConst, PermissionRealStateConst, ProductConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { MessageService } from "primeng/api";
import { ProjectOverviewService } from "@shared/services/project-overview.service";

@Component({
	selector: "app-open-sell-general-information",
	templateUrl: "./open-sell-general-information.component.html",
	styleUrls: ["./open-sell-general-information.component.scss"],
})
export class OpenSellGeneralInformationComponent extends CrudComponentBase {
	public dataSource: ProductListModel[] = [];
	public page: Page = new Page();
	public listAction: IActionTable[][] = [];
	public isSelectAll: boolean = false;
	public isEdit: boolean = false;

	constructor(
		injector: Injector,
		messageService: MessageService,
		private openSellService: OpenSellService,
		private projectService: ProjectOverviewService
	) {
		super(injector, messageService);
	}

	openSellInfo: any = {
		quantity: null,
		project: {
			contractorName: null,
			code: null,
		},
		openSellBanks: [],
		fromType: null,
	};

	openSellBanks: any[] = [];
	@Input() openSellId: number;

	ProductConst = ProductConst;
	OpenSellConst = OpenSellConst;
	PermissionRealStateConst = PermissionRealStateConst;

	@Input() rows = [];
	@Output() getOpenSellProduct = new EventEmitter<any>();
	//
	selectedColumns = [];
	headerColumns: IHeaderColumn[] = [];
	selectedItems = [];
	projects = [];
	bankList = [];
	// Group Bank
	listBankNew = [];
	listBankTrading = {
		label: "Tài khoản đại lý",
		value: OpenSellConst.TK_DAI_LY,
		items: [],
	};
	listBanksOwner = {
		label: "Tài khoản chủ đầu tư",
		value: OpenSellConst.TK_DOI_TAC,
		items: [],
	};

	ngOnInit() {
		this.getProjectByTrading();
		this.setPage({ page: this.offset });
	}

	changeValue(item) {
		this.openSellInfo.keepTime = Number.isInteger(item)
			? item
			: Math.round(item);
	}

	changeBankTypes(value?) {
		if (this.openSellInfo.fromType == OpenSellConst.TAT_CA_TK) {
			this.listBankNew = [];
			if (this.listBankTrading.items.length > 0)
				this.listBankNew.push(this.listBankTrading);
			if (this.listBanksOwner.items.length > 0)
				this.listBankNew.push(this.listBanksOwner);
		} else if (this.openSellInfo.fromType == OpenSellConst.TK_DAI_LY) {
			this.listBankNew = [this.listBankTrading];
		} else if (this.openSellInfo.fromType == OpenSellConst.TK_DOI_TAC) {
			this.listBankNew = [this.listBanksOwner];
		}
	}

	changeProject(projectId) {
		let item = this.projects.find((element) => element.id === projectId);
		if (item) {
			this.openSellInfo.project.code = item.code;
			this.openSellInfo.project.quantitySold = item.quantitySold;
			this.openSellInfo.project.quantity = item.quantity;
			this.openSellInfo.project.quantityDeposit = item.quantityDeposit;
		}
	}

	setStatusEdit() {
		this.isEdit = !this.isEdit;
	}

	changeEdit() {
		const arrTemp = this.bankList.map((obj) => {
			const match = this.openSellInfo.openSellBanks.find(
				(item) =>
					item.tradingBankAccountId === obj.tradingBankAccountId &&
					item.partnerBankAccountId === obj.partnerBankAccountId
			);

			if (match) {
				return { ...obj, id: match.id };
			} else {
				return { ...obj, id: null };
			}
		});

		this.openSellInfo.openSellBanks = arrTemp.filter((obj) => {
			return this.openSellBanks.includes(obj.bankAccountId);
		});
		if (this.isEdit) {
			let isValid: boolean = true;
			if (this.openSellInfo.startDate && this.openSellInfo.endDate) {
				if (
					this.compareDate(
						new Date(this.openSellInfo.endDate),
						new Date(this.openSellInfo.startDate),
						COMPARE_TYPE.LESS
					)
				) {
					isValid = false;
					this.messageError("Ngày kết thúc không được nhỏ hơn Ngày mở bán");
				}
			}
			if (isValid) {
				if (this.openSellInfo.fromType == OpenSellConst.TK_DAI_LY) {
					this.openSellInfo.openSellBanks =
						this.openSellInfo.openSellBanks.filter(function (bank) {
							return bank.tradingBankAccountId != null;
						});
				}
				if (this.openSellInfo.fromType == OpenSellConst.TK_DOI_TAC) {
					this.openSellInfo.openSellBanks =
						this.openSellInfo.openSellBanks.filter(function (bank) {
							return bank.partnerBankAccountId != null;
						});
				}
				let body = {
					...this.openSellInfo,
					keepTime: this.openSellInfo.keepTime * 60, // Đổi thời gian sang giây
				};

				this.openSellService.updateOpenSell(body).subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
						this.setStatusEdit();
						this.setPage();
					}
				});
			}
		} else {
			this.setStatusEdit();
		}
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.openSellService.getProjectDetail(this.openSellId).subscribe((res) => {
			this.isLoading = false;
			this.openSellBanks = [];
			if (this.handleResponseInterceptor(res)) {
				this.openSellInfo = {
					...res?.data,
					projectId: res?.data?.project.id,
					keepTime: res?.data?.keepTime / 60, // Quy đổi ra phút
					fromType: res?.data?.fromType, // Loại tại khoản
					openSellBanks: res?.data?.openSellBanks.map((bank) => {
						bank.bankAccountId =
							bank?.partnerBankAccountId || bank?.tradingBankAccountId;
						this.openSellBanks.push(bank.bankAccountId);
						return bank;
					}),
				};
				this.getBankList();
			}
		});
		this.isLoading = false;
	}

	getBankList() {
		this.openSellService.getBankList(this.openSellInfo.projectId).subscribe(
			(res) => {
				this.bankList = res?.data.map((bank) => {
					bank.labelName = bank?.bankAccount?.bankName + " - " + bank?.bankAccount?.bankAccNo + " - " + bank?.bankAccount?.bankAccName;
					bank.bankAccountId = bank?.partnerBankAccountId || bank?.tradingBankAccountId;
					return bank;
				});

				//
				this.listBankTrading.items = [];
				this.listBanksOwner.items = [];

				res?.data?.map((bank) => {
					if (bank.tradingBankAccountId) {
						this.listBankTrading.items.push({
							labelName: bank?.bankAccount?.bankName + " - " + bank?.bankAccount?.bankAccNo + " - " + bank?.bankAccount?.bankAccName,
							bankAccountId: bank.tradingBankAccountId,
						});
					}
					if (bank.partnerBankAccountId) {
						this.listBanksOwner.items.push({
							labelName: bank?.bankAccount?.bankName + " - " + bank?.bankAccount?.bankAccNo + " - " + bank?.bankAccount?.bankAccName,
							bankAccountId: bank.partnerBankAccountId,
						});
					}
				});
				this.changeBankTypes();
			},
			(err) => {}
		);
	}

	getProjectByTrading() {
		this.isLoading = true;
		this.projectService.getAllByTrading().subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "")) {
					this.projects = res?.data;
				}
			},
			(err) => {
				this.isLoading = false;
			}
		);
	}
}
