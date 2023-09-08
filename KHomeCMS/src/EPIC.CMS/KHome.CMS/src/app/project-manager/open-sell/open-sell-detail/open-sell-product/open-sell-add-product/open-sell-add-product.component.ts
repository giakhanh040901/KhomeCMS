import { OpenSellService } from './../../../../../../shared/services/open-sell.service';
import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, IHeaderColumn, ProductConst, SearchConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { DistributionService } from "@shared/services/distribution.service";
import { ProductService } from "@shared/services/product.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-open-sell-add-product",
  templateUrl: "./open-sell-add-product.component.html",
  styleUrls: ["./open-sell-add-product.component.scss"],
})
export class OpenSellAddProductComponent extends CrudComponentBase {
  
    page: Page = new Page();
    isSelectAll: boolean = false;
    selectData: any[] = [];
    fieldFilters = {
        keyword: '',
        firstDensity: null,
        secondDensity: null,
        redBook: null,
    };

    firstDensitys: IDropdown[] = [];
    secondDensitys: IDropdown[] = [];
    listRedBook: IDropdown[] = [];

    constructor(
        injector: Injector,
        messageService: MessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private changeDetectorRef: ChangeDetectorRef,
        private productService: ProductService,
        private distributionService: DistributionService,
        private openSellService: OpenSellService,
    ) {
        super(injector, messageService);
    }

    rows = [];
    dataSource: any[] = [];
    headerColumns: IHeaderColumn[] = [];
    selectedItems = [];
    ProductConst = ProductConst;

    openSellId: number;

    paramFilters = {
        projectId: 61,
        redBookType: null,
        buildingDensityId: null,
        keyword: null,
    }

    ngOnInit() {
        this.listRedBook = ProductConst.redBookTypes;
        this.paramFilters.projectId = this.config.data?.projectId;
        this.openSellId = this.config.data?.openSellId;
        this.firstDensitys = this.config.data?.firstDensitys;
        this.secondDensitys = this.config.data?.secondDensitys;
        //
        this.headerColumns = [
            { field: "codeDisplay", header: "Mã căn", width: "12rem", isPin: true, isResize: true },
            { field: "nameDisplay", header: "Tên căn", width: "12rem", isPin: true, isResize: true },
            { field: "projectStructureDisplay", header: "Mật độ xây dựng", width: "16rem" },
            { field: "priceAreaDisplay", header: "Diện tích", width: "10rem" },
            { field: "priceDisplay", header: "Giá bán", width: "12rem" },
            { field: "depositPriceDisplay", header: "Giá cọc", width: "12rem" },
            { field: "lockPriceDisplay", header: "Giá lock căn", width: "12rem" },
            { field: "redBookTypeDisplay", header: "Loại sổ đỏ", width: "8rem" },
            { field: "createDateDisplay", header: "Ngày phân phối", width: "10rem" },
        ].map((item: IHeaderColumn, index: number) => {
            item.position = index + 1;
            return item;
        });
    }

    setData(rows = []) {
        for (let row of rows) {
            row.codeDisplay = row?.productItem?.code;
            row.nameDisplay = row?.productItem?.name;
            row.projectStructureDisplay = row?.productItem?.projectStructure?.name;
            row.priceAreaDisplay = this.formatCurrency(row?.productItem?.priceArea) + ' m2';
            row.priceDisplay = this.formatCurrency(row?.productItem?.price);
            row.depositPriceDisplay = this.formatCurrency(row.depositPrice);
            row.lockPriceDisplay = this.formatCurrency(row.lockPrice);
            row.redBookTypeDisplay = this.ProductConst.getRedBookTypeName(row.productItem.redBookType);
            row.createDateDisplay = this.formatDateTime(row?.createdDate);
        }
    }

    ngAfterViewInit() {
        this.setPage({ page: this.offset });
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
    }

    setPage(pageInfo?: any) {
        this.isLoading = true;
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
        forkJoin([this.openSellService.getAllProductItemNoPaging(this.openSellId), this.distributionService.getAllDistributionByTradingProvider(this.paramFilters)])
        .subscribe(([resProductItem, resDistributionProductItem]) => {
            this.isLoading = false;
            // Danh sách tất cả căn hộ
            if (this.handleResponseInterceptor(resDistributionProductItem)) {
                this.dataSource = resDistributionProductItem?.data;
                this.setData(this.dataSource);
            }
            // Lọc bớt danh sách căn hộ đã được chọn
            if (this.handleResponseInterceptor(resProductItem) && resProductItem?.data?.items?.length) {
                let productItemSelectedIds = resProductItem?.data?.items.map(s => s.productItem.id);
                this.dataSource = this.dataSource.filter(r => !productItemSelectedIds.includes(r?.productItem?.id));
                this.setData(this.dataSource);
            }
            this.changeFilter();
        })
    }

    save() {
        this.submitted = true;
        let distributionProductItemIds = this.selectedItems.map(s => s.id);
        let body = {
            openSellId: this.openSellId,
            distributionProductItemIds: distributionProductItemIds,
        }
        this.openSellService.addProduct(body).subscribe((res) => {
            this.submitted = false;
            if(this.handleResponseInterceptor(res, 'Thêm thành công')) {
                this.ref.close(true);
            }
        });
        
    }
    
    changeFilter() {
        this.isLoading = true;
        this.rows = this.dataSource.filter((data: any) => {
            let result: {
                keyword: boolean;
                density: boolean;
                redBook: boolean;
            } = {
                keyword: false,
                density: false,
                redBook: false,
            };
            // filter keyword
            if (!this.fieldFilters.keyword || !this.fieldFilters.keyword.length) {
                result.keyword = true;
            } else {
                result.keyword = (data.codeDisplay.toLowerCase()).includes(this.fieldFilters.keyword.toLowerCase()) || (data.nameDisplay.toLowerCase()).includes(this.fieldFilters.keyword.toLowerCase());
            }
            // filter density
            if (!this.fieldFilters.firstDensity && !this.fieldFilters.secondDensity) {
                result.density = true;
            } else {
                result.density = data.productItem?.projectStructure?.code === this.fieldFilters.firstDensity || data.productItem?.projectStructure?.code === this.fieldFilters.secondDensity;
            }
            // filter redBook
            if (!this.fieldFilters.redBook) {
                result.redBook = true;
            } else {
                result.redBook = data.productItem.redBookType === this.fieldFilters.redBook;
            }
            return result.keyword && result.density && result.redBook;
        });
        this.isLoading = false;
    }
}
