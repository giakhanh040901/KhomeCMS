import { Component, Injector, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HistoryConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OpenSellService } from "@shared/services/open-sell.service";
import { ProductService } from "@shared/services/product.service";
import { MessageService } from "primeng/api";

@Component({
selector: "app-open-sell-history",
templateUrl: "./open-sell-history.component.html",
styleUrls: ["./open-sell-history.component.scss"],
})
export class OpenSellHistoryComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _routeActive: ActivatedRoute,
		private _openSellService: OpenSellService
	) {
		super(injector, messageService);
        this.openSellDetailId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get("openSellDetailId"));
	}

	openSellDetailId: number;
	page = new Page();
	rows: any[] = [];

	HistoryConst = HistoryConst;
	@Input() productData: any = {};
	fieldName = [
		{ name: 'Phê duyệt hợp đồng', code: 'APPROVE'},
		{ name: 'Trạng thái', code: 'STATUS'},
	];

	ngOnInit(): void {
		this.setPage();
	}

	getNameField(code){
		const field = this.fieldName.find(f => f.code == code);
		return field ? field.name : null;
	}


	setPage(pageInfo?:any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this._openSellService.getHistory(this.page, this.openSellDetailId).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, '')) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items
			}
		}, () => {
			this.isLoading = false;
		});
	}
}
