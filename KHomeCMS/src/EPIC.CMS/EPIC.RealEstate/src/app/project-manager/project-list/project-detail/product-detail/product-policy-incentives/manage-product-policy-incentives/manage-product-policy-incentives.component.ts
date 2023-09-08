import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IDropdown, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductPolicyIncentivesService } from "@shared/services/product-policy-incentives.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-manage-product-policy-incentives",
	templateUrl: "./manage-product-policy-incentives.component.html",
	styleUrls: ["./manage-product-policy-incentives.component.scss"],
})
export class ManageProductPolicyIncentivesComponent extends CrudComponentBase {
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
	ProjectPolicyConst = ProjectPolicyConst;
	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		private changeDetectorRef: ChangeDetectorRef,
		private _productPolicyIncentivesService: ProductPolicyIncentivesService,
		private _routeActive: ActivatedRoute,
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
		this._productPolicyIncentivesService
			.findAll(this.page, this.productId, this.filter)
			.subscribe(
				(resList) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(resList, "")) {
						this.page.totalItems = resList.data.totalItems;
						if (resList.data?.items) {
							this.dataSource = resList?.data?.items;
							this.dataSource = this.dataSource.map((o) => ({
								...o,
								_isProductItemSelected: o.isProductItemSelected === "Y",
							}));
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
		this.selectedData = [];
		this.dataSource.filter((item) => {
			if (item._isProductItemSelected) {
				this.selectedData.push(item.projectPolicyId);
			}
		});

		if (event) {
			let body = {
				productItemProjectPolicies: this.selectedData,
				productItemId: this.productId,
			};
			this._productPolicyIncentivesService.addPolicy(body).subscribe(
				(response) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(response, "")) {
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

	public changeFilter(event: any) {
		if (event) {
			this.setPage({ page: this.offset });
		}
	}
}
