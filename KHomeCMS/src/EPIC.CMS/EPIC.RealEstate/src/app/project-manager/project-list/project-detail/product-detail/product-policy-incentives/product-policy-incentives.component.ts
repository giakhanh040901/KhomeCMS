import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActiveDeactiveConst, FormNotificationConst, IDropdown, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProductPolicyIncentivesService } from "@shared/services/product-policy-incentives.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { ManageProductPolicyIncentivesComponent } from "./manage-product-policy-incentives/manage-product-policy-incentives.component";
import { SelectedFilter } from "@shared/interface/filter.model";

@Component({
	selector: "app-product-policy-incentives",
	templateUrl: "./product-policy-incentives.component.html",
	styleUrls: ["./product-policy-incentives.component.scss"],
})
export class ProductPolicyIncentivesComponent extends CrudComponentBase {
	public filter: SelectedFilter = {
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
		private _productPolicyIncentivesService: ProductPolicyIncentivesService,
		private _routeActive: ActivatedRoute
	) {
		super(injector, messageService);
		this.productId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("productId")
		);
	}
	productId: number;
	ActiveDeactiveConst = ActiveDeactiveConst;
	ProjectPolicyConst = ProjectPolicyConst;

	ngOnInit() {
		this.setPage({ page: this.offset });
	}

	public changeFilter(event: any) {
		this.setPage({ page: this.offset });
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this.isLoading = false;
		this._productPolicyIncentivesService.findAll(this.page, this.productId, this.filter).subscribe((resSelected) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(resSelected, "")) {
				this.page.totalItems = resSelected.data.totalItems;
				if (resSelected.data?.items) {
					this.dataSelected = resSelected?.data?.items;
					this.genListAction(this.dataSelected);
				}
			}},
			(err) => {
				this.isLoading = false;
				console.log("Error-------", err);
			}
		);
	}

	public genListAction(data = []) {
		this.listAction = data.map((data, index) => {
			const actions = [];

			if (
				this.isGranted([
					this.PermissionRealStateConst
						.RealStateMenuProjectListDetail_ChinhSach_DoiTrangThai,
				])
			) {
				actions.push({
					data: data,
					index: index,
					label:
						data.status == ActiveDeactiveConst.ACTIVE ? "Khóa" : "Kích hoạt",
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

	changeActionStatus(data) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title:
					data.status == ActiveDeactiveConst.ACTIVE
						? "Khóa chính sách"
						: "Kích hoạt chính sách",
				icon:
					data.status == ActiveDeactiveConst.ACTIVE
						? FormNotificationConst.IMAGE_CLOSE
						: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this.isLoading = true;
				this._productPolicyIncentivesService.updateStatus(data).subscribe(
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
			const ref = this._dialogService.open(
				ManageProductPolicyIncentivesComponent,
				{
					header: "Chính sách ưu đãi CĐT",
					width: "800px",
					data: {
						productId: this.productId,
					},
				}
			);
			ref.onClose.subscribe((response: any) => {
				if (response) {
					this.messageSuccess("Đã lưu thành công chính sách")
					this.setPage({ page: this.offset });
				}
			});
		}
	}
}
