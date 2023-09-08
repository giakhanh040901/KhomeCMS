import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, IHeaderColumn, ProductConst, ProductDistributionConst, SearchConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { DistributionService } from "@shared/services/distribution.service";
import { ProductService } from "@shared/services/product.service";
import { ProjectStructureService } from "@shared/services/project-structure.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
    selector: "create-product-dialog",
    templateUrl: "./create-product-dialog.component.html",
    styleUrls: ["./create-product-dialog.component.scss"],
})
export class CreateProductDialogComponent extends CrudComponentBase {
    
    page: Page = new Page();
    isSelectAll: boolean = false;
    selectData: any[] = [];
    fieldFilters = {
        firstDensity: null,
        secondDensity: null,
        status: null,
        redBookType: null,
    };

    listDensity: IDropdown[] = [];
    listStatus: IDropdown[] = [];
    redBookType: IDropdown[] = [];

    constructor(
        injector: Injector,
        messageService: MessageService,
        public ref: DynamicDialogRef,
        private config: DynamicDialogConfig,
        private changeDetectorRef: ChangeDetectorRef,
        private productService: ProductService,
        private distributionService: DistributionService,
        private _projectStructureService: ProjectStructureService
    ) {
        super(injector, messageService);
    }

    projectId: number;
    defaultRows = [];
    rows = [];
    headerColumns: IHeaderColumn[] = [];
    selectedItems = [];
    ProductConst = ProductConst;

    distributionId: number;
    firstDensitys = [];
    secondDensitys = [];

    fillter = {
        keyword: "",
        redBookType: null,
        buildingDensityId: null
    }



    ngOnInit() {
        this.distributionId = this.config.data?.distributionId;
        this.projectId = this.config.data?.projectId;
        this.init();
        //
        this.headerColumns = [
            { field: "nameDisplay", header: "Mã căn", width: "12rem", isPin: true, isResize: true },
            { field: "noFloor", header: "Tầng", width: "5rem", class: 'justify-content-center' },
            { field: "roomTypeName", header: "Số phòng", width: "auto" },
            { field: "priceAreaDisplay", header: "Diện tích", width: "auto" },
            { field: "priceDisplay", header: "Giá bán", width: "auto" },
        ].map((item: IHeaderColumn, index: number) => {
            item.position = index + 1;
            return item;
        });
    }

    init(){
        forkJoin([
            this._projectStructureService.getNodeByLevel(1, this.projectId), 
            this._projectStructureService.getNodeByLevel(2, this.projectId)
          ]).subscribe(([res, resSecon]) => {
            this.isLoading = false;
            // Mật độ cấp 1
            if(this.handleResponseInterceptor(res) && res?.data?.length) {
              this.firstDensitys = res?.data;
            }
            // Mật độ cấp 2
            if(this.handleResponseInterceptor(resSecon) && resSecon?.data?.length) {
              this.secondDensitys = resSecon?.data;
            }
          });
    }

    setData(rows = []) {
        for (let row of rows) {
            row.nameDisplay = row.code;
            row.roomTypeName = ProductConst.getRoomTypeName(row.roomType);
            row.productLocationName = ProductConst.getLocationName(row.productLocation);
            row.priceAreaDisplay = this.formatCurrency(row.priceArea) + ' m2';
            row.unitPriceDisplay = this.formatCurrency(row.unitPrice);
            row.priceDisplay = this.formatCurrency(row.price);
            row.priceText = this.getPriceText(row.price);
        }
    }

    ngAfterViewInit() {
        this.setPage({ page: this.offset });
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
    }

    setPage(pageInfo?: any) {
        this.isLoading = true;
        this.fillter.buildingDensityId = this.fieldFilters.firstDensity ?? this.fieldFilters.secondDensity;
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
        this.distributionService.findCanDistribution(this.fillter).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res)) {
                this.rows = res?.data;
                this.setData(this.rows);
            }
            this.defaultRows = this.rows;
        })
    }

    save() {
        this.submitted = true;
        let productItemds = this.selectedItems.map(s => s.id);
        let body = {
            distributionId: this.distributionId,
            productItemIds: productItemds,
        }
        
        this.distributionService.createOrEditProductItem(body).subscribe((res) => {
            if(this.handleResponseInterceptor(res, 'Thêm thành công')) {
                this.ref.close(true);
            }
        });
        
    }
    
    changeLevel1(value) {
        this.fieldFilters.secondDensity = null;
        this.setPage();
    }

    changeLevel2(value) {
        this.fieldFilters.firstDensity = null;
        this.setPage();
    }

    changeFilter() {
        this.setPage();
    }
}
