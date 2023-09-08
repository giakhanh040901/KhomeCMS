import { Component, Injector } from "@angular/core";
import { BusinessCustomerConst, FormNotificationConst, TradingProviderConst, AtributionConfirmConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { TradingProviderServiceProxy } from "@shared/service-proxies/setting-service";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { Router } from "@angular/router";
import { DialogService } from "primeng/dynamicdialog";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { NationalityConst } from "@shared/nationality-list";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FilterBusinessCustomerComponent } from "src/app/components/filter-business-customer/filter-business-customer.component";

@Component({
	selector: "app-trading-provider",
	templateUrl: "./trading-provider.component.html",
	styleUrls: ["./trading-provider.component.scss"],
})
export class TradingProviderComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private confirmationService: ConfirmationService,
		private router: Router,
		private dialogService: DialogService,
		private tradingProviderService: TradingProviderServiceProxy,
		private breadcrumbService: BreadcrumbService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Cài đặt" },
			{ label: "Đại lý" },
		]);
	}

	ref: DynamicDialogRef;
	modalDialog: boolean;

	deleteItemDialog: boolean = false;

	confirmRequestDialog: boolean = false;
	rows: any[] = [];

	BusinessCustomerConst = BusinessCustomerConst;
	NationalityConst = NationalityConst;
	TradingProviderConst = TradingProviderConst;

	businessCustomer: any = {};

	tradingProvider: any = {
		businessCustomerId: null,
		aliasName: null,
	};

	businessCustomerId: number;

	listAction: any[] = [];
	submitted: boolean;

	statuses: any[];

	page = new Page();
	offset = 0;
	//
	actions: any[] = []; // list button actions
	actionsDisplay: any[] = [];
	row: any;
	col: any;

	cols: any[];
	_selectedColumns: any[];

	minWidthTable: string;

	ngOnInit(): void {
        this.minWidthTable = '1800px';

		this.setPage({ page: this.offset });

		this.cols = [
			{ field: "taxCode", header: "Mã số thuế", width: "10rem", isPin: true },
			{ field: "name", header: "Tên đại lý", isPin: true },
			{ field: "shortName", header: "Tên viết tắt"},
			{
				field: "email",
				header: "Email",
			},
			{
				field: "phone",
				header: "SĐT",
				width: "10rem",
			},
		];

		// this._selectedColumns = this.cols;
		this._selectedColumns =
			this.getLocalStorage("tradingProviderRst") ?? this.cols;
	}

	setColumn(col, _selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, "tradingProviderRst");
			}
		});
	}

	genListAction(data = []) {
		this.listAction = data.map((tradingProviderItem) => {
			const actions = [];

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateDaiLy_ThongTinDaiLy,
				])
			) {
				actions.push({
					data: tradingProviderItem,
					label: "Thông tin chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data);
					},
				});
			}

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateDaiLy_KichHoatOrHuy,
				])
			) {
				actions.push({
					data: tradingProviderItem,
					label:
						tradingProviderItem.status == TradingProviderConst.KICH_HOAT
							? "Đóng"
							: "Kích hoạt",
					icon:
						tradingProviderItem.status == TradingProviderConst.KICH_HOAT
							? "pi pi-lock"
							: "pi pi-lock-open",
					command: ($event) => {
						this.changeStatus($event.item.data);
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStateDaiLy_Xoa])) {
				actions.push({
					data: tradingProviderItem,
					label: "Xoá",
					icon: "pi pi-trash",
					command: ($event) => {
						this.delete($event.item.data);
					},
				});
			}

			return actions;
		});
	}

	create() {
		this.tradingProvider = {};
		this.businessCustomer = {};
		this.submitted = false;
		this.modalDialog = true;
	}

	detail(tradingProvider) {
		this.router.navigate([
			"/setting/trading-provider/detail",
			this.cryptEncode(tradingProvider?.tradingProviderId),
		]);
	}

	confirmDelete() {
		this.deleteItemDialog = false;
		this.tradingProviderService
			.delete(this.tradingProvider.tradingProviderId)
			.subscribe(
				(response) => {
					if (this.handleResponseInterceptor(response, "Xóa thành công")) {
						this.setPage();
						this.tradingProvider = {};
					}
				},
				() => {
					this.messageError(`Không xóa được tài khoản ${this.tradingProvider.name}`);
				}
			);
	}

	showBusinessCustomer() {
		const ref = this.dialogService.open(FilterBusinessCustomerComponent, {
			header: "Tìm kiếm khách hàng doanh nghiệp",
			width: "1000px",
		});
		//
		ref.onClose.subscribe((businessCustomer) => {
			if (businessCustomer) {
				this.tradingProvider.businessCustomerId =
					businessCustomer.businessCustomerId;
				this.businessCustomer = { ...businessCustomer };
			}
		});
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.isLoading = true;

		this.tradingProviderService
			.getAllTradingProvider(this.page, this.status)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.page.totalItems = res?.data?.totalItems;
						this.rows = res?.data?.items;
						this.genListAction(this.rows);
					}
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
	}

	changeStatus(tradingProvider) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: tradingProvider.status == TradingProviderConst.KICH_HOAT ? "Đóng đại lý" : "Kích hoạt đại lý",
				icon: tradingProvider.status == TradingProviderConst.KICH_HOAT ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.isLoading = true;
				console.log("tradingProvider", tradingProvider);

				this.tradingProviderService.updateStatus(tradingProvider).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Cập nhật thành công")
						) {
							this.isLoading = false;
							this.setPage();
						}
						this.isLoading = false;
					},
					(err) => {
						this.isLoading = false;
					}
				);
			} else {
				this.isLoading = false;
			}
		});
	}

	delete(tradingProvider) {
		this.confirmationService.confirm({
			message: `Bạn có chắc chắn xóa ${tradingProvider?.name} này?`,
			...AtributionConfirmConst,
			accept: () => {
				this.tradingProviderService
					.delete(tradingProvider?.tradingProviderId)
					.subscribe(
						(response) => {
							if (this.handleResponseInterceptor(response, "Xóa thành công")) {
								this.setPage();
								this.tradingProvider = {};
							}
						},
						() => {
							this.messageError(`Không xóa được ${tradingProvider?.name}`);
						}
					);
			},
			reject: () => {},
		});
	}

	hideDialog() {
		this.modalDialog = false;
		this.submitted = false;
	}

	changeFilter() {
		this.setPage({ page: this.offset });
	}

	save() {
		this.submitted = true;
		this.tradingProviderService.create(this.tradingProvider).subscribe(
			(response) => {
				if (this.handleResponseInterceptor(response, "Thêm thành công")) {
					this.submitted = false;
					this.hideDialog();
					this.isLoadingPage = true;
					setTimeout(() => {
						this.isLoadingPage = false;
						this.router.navigate([
							"/setting/trading-provider/detail",
							this.cryptEncode(response.data.tradingProviderId),
						]);
					}, 1000);
				}
				this.submitted = false;
			},
			() => {
				this.submitted = false;
				this.messageError("Không lấy được dữ liệu");
			}
		);
	}

	validForm(): boolean {
		const validRequired = this.businessCustomer?.code;

		return validRequired;
	}
}
