import { Component, EventEmitter, Injector, Output } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-filter-sale",
	templateUrl: "./filter-sale.component.html",
	styleUrls: ["./filter-sale.component.scss"],
})
export class FilterSaleComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private readonly dialogRef: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
		private _orderService: OrderServiceProxy
	) {
		super(injector, messageService);
	}
	@Output() onCloseDialog = new EventEmitter<any>();

	rows: any[] = [];
	page = new Page();
	offset = 0;
	ngOnInit(): void {
		this.rows = [];
	}

	isChoose(row) {
		this.dialogRef.close(row);
	}

	setPage(pageInfo?: any) {
		let keywordSearch;
		this.isLoading = true;
		if (this.keyword) {
			keywordSearch = this.keyword;
		}
		this._orderService.getByTradingProvider(keywordSearch).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "") && res?.data) {
					this.rows[0] = res?.data;
				} else {
					this.rows = [];
					this.messageError("Không tìm thấy dữ liệu");
				}
			},
			() => {
				this.isLoading = false;
			}
		);
	}
}