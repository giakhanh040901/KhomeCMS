import { Component, Injector } from "@angular/core";
import { IDropdown, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductUtilityService } from "@shared/services/product-utility.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "manage-product-utility",
	templateUrl: "./manage-product-utility.component.html",
	styleUrls: ["./manage-product-utility.component.scss"],
})
export class ManageProductUtilityComponent extends CrudComponentBase {
	public isLoading: boolean;
	public dataSource: any[] = [];
	public dataTable: any[] = [];
	public selectedData: any[] = [];
	public filter: {
		keyword?: string;
		status?: number;
		selected?: string;
	} = {
		keyword: "",
		status: undefined,
		selected: "",
	};
	public statuses: IDropdown[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		public _productUtilityService: ProductUtilityService,
		public configDialog: DynamicDialogConfig
	) {
		super(injector, messageService);
	}
	productId: number;

	ngOnInit() {
		if (this.configDialog?.data?.productId) {
			this.productId = this.configDialog?.data?.productId;
		}
		this.setPage({ page: this.offset });
		this.statuses = [
			{
				code: "",
				name: "Tất cả",
			},
			{
				code: "Y",
				name: "Đã chọn",
			},
		];
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this._productUtilityService
			.findAll(this.page, this.productId, this.filter)
			.subscribe(
				(resList) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(resList, "")) {
						if (resList?.data) {
							this.dataSource = resList?.data?.items;
							this.selectedData = this.dataSource
								.filter((item) => item.isProductItemSelected === YesNoConst.YES)
								.map((item) => ({ ...item, isChecked: true }));
						}
					}
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
	}

	public close(event: any) {
		event && this.ref.close();
	}

	public save(event: any) {
		const selectedProjectUtilityExtendIds = this.selectedData.map((e: any) => e.id).filter((item) => item !== null);
		const selectedProjectUtilityIds = this.selectedData.map((e: any) => e.utilityId).filter((item) => item !== null);
		if (event) {
			let body = {
				projectUtilityExtends: selectedProjectUtilityExtendIds,
				productItemUtilities: selectedProjectUtilityIds,
				productItemId: this.productId,
			};
			this._productUtilityService.updateUtility(body).subscribe(
				(response) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(response, "")) {
						this.selectedData = [];
						this.ref.close(true);
					}
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
		}
	}
}
