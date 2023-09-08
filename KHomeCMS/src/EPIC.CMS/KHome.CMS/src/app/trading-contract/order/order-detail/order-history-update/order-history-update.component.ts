import { Component, Injector, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DistributionConst, HistoryConst, StatusCoupon } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { MessageService } from "primeng/api";

@Component({
	selector: "app-order-history-update",
	templateUrl: "./order-history-update.component.html",
	styleUrls: ["./order-history-update.component.scss"],
})
export class OrderHistoryUpdateComponent extends CrudComponentBase  {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private _orderService: OrderServiceProxy,
	) {
		super(injector, messageService);
		this.orderId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));
	}

	orderId: number;
	couponInfo: any = {};
	page = new Page();

	DistributionConst = DistributionConst;
	StatusCoupon = StatusCoupon;
	HistoryConst = HistoryConst;
	rows: any[] = [];
	
	ngOnInit(): void {
		this.setPage();
	}

	
	setPage(pageInfo?:any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this._orderService.getHistory(this.page,this.orderId).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, '')) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items
				console.log({ coupon: res });
			}
		}, () => {
			this.isLoading = false;
		});
	}
}
