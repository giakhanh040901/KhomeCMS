import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IDropdown, ProjectPolicyConst, SellingPolicyConst, } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { SelectedFilter } from "@shared/interface/filter.model";
import { OpenSellPolicyService } from "@shared/services/open-sell-policy.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-open-sell-policy-dialog",
	templateUrl: "./open-sell-policy-dialog.component.html",
	styleUrls: ["./open-sell-policy-dialog.component.scss"],
})
export class OpenSellPolicyDialogComponent extends CrudComponentBase {
	public isLoading: boolean;
	public dataSource: any[] = [];
	public dataTable: any[] = [];
	public selectedData: any[] = [];
	public filter: SelectedFilter = {
		keyword: "",
		status: undefined,
		selected: "",
	};
	public statuses: IDropdown[] = [];
	ProjectPolicyConst = ProjectPolicyConst;
	SellingPolicyConst = SellingPolicyConst;
	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		private _openSellPolicyService: OpenSellPolicyService,
		public configDialog: DynamicDialogConfig
	) {
		super(injector, messageService);
	}
	openSellId: number;

	ngOnInit() {
		if (this.configDialog?.data?.openSellId) {
			this.openSellId = this.configDialog?.data?.openSellId;
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
		this._openSellPolicyService
			.findAll(this.page, this.openSellId, this.filter)
			.subscribe(
				(resList) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(resList, "")) {
						this.page.totalItems = resList.data.totalItems;
						if (resList.data?.items) {
							this.dataSource = resList?.data?.items;
							this.dataSource = this.dataSource.map((o) => ({
								...o,
								_isSellingPolicySelected: o.isSellingPolicySelected === "Y",
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
			if (item._isSellingPolicySelected) {
				this.selectedData.push(item.sellingPolicyTempId);
			}
		});

		if (event) {
			let body = {
				sellingPolicies: this.selectedData,
				openSellId: this.openSellId,
			};
			this._openSellPolicyService.addPolicy(body).subscribe(
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
}