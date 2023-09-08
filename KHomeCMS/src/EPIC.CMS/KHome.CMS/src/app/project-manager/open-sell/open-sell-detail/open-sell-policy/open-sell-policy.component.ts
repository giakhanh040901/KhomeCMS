import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActiveDeactiveConst, FormNotificationConst, PermissionRealStateConst, ProjectPolicyConst, SellingPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OpenSellPolicyService } from "@shared/services/open-sell-policy.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreateSellingPolicyTempComponent } from "src/app/setting/selling-policy-temp/create-selling-policy-temp/create-selling-policy-temp.component";
import { OpenSellPolicyDialogComponent } from "./open-sell-policy-dialog/open-sell-policy-dialog.component";
@Component({
	selector: "app-open-sell-policy",
	templateUrl: "./open-sell-policy.component.html",
	styleUrls: ["./open-sell-policy.component.scss"],
})
export class OpenSellPolicyComponent extends CrudComponentBase {
	public filter: {
		keyword?: string;
		status?: number;
		selected?: string;
	} = {
		keyword: "",
		status: undefined,
		selected: "y",
	};
	public isLoading: boolean = false;
	public page: Page;
	public dataSource: any[] = [];
	public dataSelected: any[] = [];
	public listAction: any[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		private _dialogService: DialogService,
		private _openSellPolicyService: OpenSellPolicyService,
		private _routeActive: ActivatedRoute
	) {
		super(injector, messageService);
		this.openSellId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("id")
		);
	}
	openSellId: number;
	ActiveDeactiveConst = ActiveDeactiveConst;
	ProjectPolicyConst = ProjectPolicyConst;
	SellingPolicyConst = SellingPolicyConst;

	ngOnInit() {
		this.setPage({ page: this.offset });
	}

	public changeFilter(event: any) {
		if (event) {
			this.setPage({ page: this.offset });
		}
	}

	public setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this.isLoading = false;
		this._openSellPolicyService.findAll(this.page, this.openSellId, this.filter).subscribe((resSelected) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(resSelected, "")) {
					this.page.totalItems = resSelected.data.totalItems;
					if (resSelected.data?.items) {
						this.dataSelected = resSelected?.data?.items;
						this.genListAction(this.dataSelected);
					}
				}
			},
			(err) => {
				this.isLoading = false;
				console.log("Error-------", err);
			}
		);
	}

	public genListAction(data = []) {
		this.listAction = data.map((data, index) => {
			const actions = [];

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_ChinhSach_ChiTiet])) {
				actions.push({
					data: data,
					index: index,
					label: "Xem chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data);
					},
				});
			}

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_ChinhSach_DoiTrangThai])) {
				actions.push({
					data: data,
					index: index,
					label:
						data.status == ActiveDeactiveConst.ACTIVE ? "Đóng" : "Kích hoạt",
					icon:
						data.status == ActiveDeactiveConst.ACTIVE
							? "pi pi-lock"
							: "pi pi-lock-open",
					command: ($event) => {
						this.changeActionStatus($event.item.data);
					},
				});
			}

			return actions;
		});
	}

	detail(policy) {
		this._openSellPolicyService
			.findById(policy?.sellingPolicyTempId)
			.subscribe((res) => {
				this.isLoading = false;
				if (res?.data) {
					const ref = this._dialogService.open(
						CreateSellingPolicyTempComponent,
						{
							header: "Thông tin chính sách",
							width: "900px",
							data: {
								policy: res?.data,
								isView: true,
							},
						}
					);
					//
					ref.onClose.subscribe((res) => {});
				}
			});
	}

	changeActionStatus(data) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: data.status == ActiveDeactiveConst.ACTIVE ? "Đóng chính sách" : "Kích hoạt chính sách",
				icon: data.status == ActiveDeactiveConst.ACTIVE ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this.isLoading = true;
				this._openSellPolicyService.updateStatus(data).subscribe(
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

	public clickInfo(event: any) {
		if (event) {
			const ref = this._dialogService.open(OpenSellPolicyDialogComponent, {
				header: "Chính sách ưu đãi đại lý",
				width: "800px",
				data: {
					openSellId: this.openSellId,
				},
			});
			ref.onClose.subscribe((response: any) => {
				if (response) {
					this.messageSuccess("Đã lưu thành công chính sách");
					this.setPage({ page: this.offset });
				}
			});
		}
	}
}





