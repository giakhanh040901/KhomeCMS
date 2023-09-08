import { Component, Injector, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HistoryConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProductService } from "@shared/services/product.service";
import { MessageService } from "primeng/api";

@Component({
	selector: "app-product-history",
	templateUrl: "./product-history.component.html",
	styleUrls: ["./product-history.component.scss"],
})
export class ProductHistoryComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _routeActive: ActivatedRoute,
		private _productService: ProductService
	) {
		super(injector, messageService);
		this.productItemId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get('productId'));
	}

	productItemId: number;
	page = new Page();
	rows: any[] = [];

	HistoryConst = HistoryConst;

	fieldName = [
		{ name: 'Khóa căn', code: 'STATUS'},
		{ name: 'Loại sổ đỏ', code: 'RED_BOOK_TYPE'},
		{ name: 'Diện tích sàn xây dựng', code: 'FLOOR_BUILDING_AREA'},
		{ name: 'Phân loại sản phẩm', code: 'CLASSIFY_TYPE'},
		{ name: 'Mã căn/ Mã SP', code: 'CODE'},
		{ name: 'Số căn / Tên', code: 'NAME'},
		{ name: 'Tầng số', code: 'NO_FLOOR'},
		{ name: 'Số tầng', code: 'NUMBER_FLOOR'},
		{ name: 'Số lượng phòng', code: 'ROOM_TYPE'},
		{ name: 'Hướng cửa', code: 'DOOR_DIRECTION'},
		{ name: 'Hướng ban công', code: 'BALCONY_DIRECTION'},
		{ name: 'Vị trí SP / Căn', code: 'PRODUCT_LOCATION'},
		{ name: 'Hướng ban công', code: 'PRODUCT_TYPE'},
		{ name: 'Căn ghép', code: 'COMPOUND_ROOM'},
		{ name: 'Tầng ghép', code: 'COMPOUND_FLOOR'},
		{ name: 'Loại bàn giao', code: 'HANDING_TYPE'},
		{ name: 'Hướng view', code: 'VIEW_DESCRIPTION'},
		{ name: 'Thời gian bàn giao', code: 'HANDOVER_TIME'},
		{ name: 'Diện tích thông thủy', code: 'CARPET_AREA'},
		{ name: 'Diện tích tim tường', code: 'BUILT_UP_AREA'},
		{ name: 'Diện tích tính giá', code: 'PRICE_AREA'},
		{ name: 'Đơn giá bán', code: 'UNIT_PRICE'},
		{ name: 'Giá bán', code: 'PRICE'},
		{ name: 'Diện tích mặt đất', code: 'LAND_AREA'},
		{ name: 'Diện tích xây dựng', code: 'CARPETAREA'},
		{ name: 'Mật độ xây dựng', code: 'BUILDING_DENSITY_ID'},
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
		this._productService.getHistory(this.page,this.productItemId).subscribe((res) => {
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
