import { Component, Injector, ViewChild } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { TradingProviderServiceProxy } from '@shared/service-proxies/setting-service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { TabView } from 'primeng/tabview';


@Component({
	selector: 'app-trading-provider-detail',
	templateUrl: './trading-provider-detail.component.html',
	styleUrls: ['./trading-provider-detail.component.scss']
})
export class TradingProviderDetailComponent extends CrudComponentBase {

	constructor(
		injector: Injector,

		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private tradingProviderService: TradingProviderServiceProxy,
		private breadcrumbService: BreadcrumbService
	) {
		super(injector, messageService);

		this.breadcrumbService.setItems([
			{ label: 'Trang chủ', routerLink: ['/home'] },
			{ label: 'Đại lý', routerLink: ['/setting/trading-provider'] },
			{ label: 'Chi tiết đại lý', },
		]);

		this.tradingProviderId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));

	}

	tradingProviderId: number;
	tradingProviderDetail: any;
	isEdit = false;
	labelButtonEdit = "Chỉnh sửa";

	nations = [
		{
			name: "Việt Nam",
			code: "VN",
		},
		{
			name: "Thái Lan",
			code: "TL",
		},
		{
			name: "Trung Quốc",
			code: "TQ",
		}
	];

	tabViewActive = {
		'thongTinChung': true,
		'taiKhoanDangNhap': false,
	};
	
	@ViewChild(TabView) tabView: TabView;

	ngOnInit(): void {
		this.isLoading = true;
		this.tradingProviderService.findById(this.tradingProviderId).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, '')) {
					this.tradingProviderDetail = res.data;
				}
			}, (err) => {
				this.isLoading = false;
				console.log('Error-------', err);
				
			});
	}

	changeTabview(e) {
		let tabHeader = this.tabView.tabs[e.index].header;
		this.tabViewActive[tabHeader] = true;
	}

	changeEdit() {
		if (this.isEdit) {
			let body = {...this.tradingProviderDetail};
			this.tradingProviderService.update(body).subscribe((response) => {
				if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
					this.isEdit = !this.isEdit;
					this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
				} 
			});
		} else {
			this.isEdit = !this.isEdit;
			this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
		}
	}
}
