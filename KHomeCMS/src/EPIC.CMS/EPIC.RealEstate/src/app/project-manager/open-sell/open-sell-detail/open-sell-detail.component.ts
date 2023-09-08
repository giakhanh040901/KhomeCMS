import { OpenSellService } from "@shared/services/open-sell.service";
import { Component, Injector, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService } from "primeng/api";
import { TabView } from "primeng/tabview";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { OpenSellConst, PermissionRealStateConst } from "@shared/AppConsts";
import { FormRequestComponent } from "src/app/form-general/form-request-approve-cancel/form-request/form-request.component";
import { DialogService } from "primeng/dynamicdialog";
import { FormApproveComponent } from "src/app/form-general/form-request-approve-cancel/form-approve/form-approve.component";
@Component({
	selector: "app-open-sell-detail",
	templateUrl: "./open-sell-detail.component.html",
	styleUrls: ["./open-sell-detail.component.scss"],
})
export class OpenSellDetailComponent extends CrudComponentBase {
	tabViewActive: {
		generalInfor: boolean;
		productList: boolean;
		policy: boolean;
		contract: boolean;
		file: boolean;
	} = {
		generalInfor: true,
		productList: false,
		policy: false,
		contract: false,
		file: false,
	};

	@ViewChild(TabView) tabView: TabView;

	// CONST
	OpenSellConst = OpenSellConst;
	PermissionRealStateConst = PermissionRealStateConst;

	constructor(
		injector: Injector,
		messageService: MessageService,
		private breadcrumbService: BreadcrumbService,
		private _routeActive: ActivatedRoute,
		private openSellService: OpenSellService,
		private dialogService: DialogService,
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Quản lý dự án", routerLink: ["/home"] },
			{ label: "Mở bán", routerLink: ["/project-manager/project-sale"] },
			{ label: "Chi tiết mở bán" },
		]);
		//
		this.openSellId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("id")
		);
	}

	openSellId: number;
	openSellInfo: any = {};
	products = [];
	public routerBackLink = "/project-manager/open-sell";

	ngOnInit() {
		this.getDetail();
	}

	getDetail() {
		this.isLoading = true;
		this.openSellService.findById(this.openSellId).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res)) {
				this.openSellInfo = {
					...res?.data,
					startDate: this.formatDate(res?.data?.startDate),
					endDate: this.formatDate(res?.data?.endDate),
					keepTime: res?.data?.keepTime / 60, // Quy đổi ra phút
				};
			}
		});
	}

	changeTab(event: any) {
		let tabHeader = this.tabView.tabs[event.index].header;
		this.tabViewActive[tabHeader] = true;
	}

	// TRÌNH DUYỆT PHÂN PHỐI SẢN PHẨM
	requestApprove() {
		const params = {
			id: this.openSellId,
			summary: "Mở bán sản phẩm",
			data: this.openSellInfo,
			type: "openSellInfo",
		};
		//
		const ref = this.dialogService.open(
			FormRequestComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.openSellService
					.requestApprove(dataCallBack.data)
					.subscribe((response) => {
						if (
							this.handleResponseInterceptor(
								response,
								"Trình duyệt thành công!"
							)
						) {
							this.getDetail();
						}
					});
			}
		});
	}

	// PHÊ DUYỆT PHÂN PHỐI
	approve() {
		const params = {
			id: this.openSellId,
			summary: "Mở bán sản phẩm",
			data: this.openSellInfo,
			type: "openSellInfo",
		};
		//
		const ref = this.dialogService.open(
			FormApproveComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.openSellService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove).subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Thao tác thành công!")
					) {
						this.getDetail();
					}
					});
			}
		});
	}
}
