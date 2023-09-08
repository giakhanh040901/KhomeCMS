import { Component, OnInit, Injector, ViewChild, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { TabView } from "primeng/tabview";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { ProductConst, ProjectStructureConst } from "@shared/AppConsts";
import { ProductService } from "@shared/services/product.service";
import { OpenSellService } from "@shared/services/open-sell.service";

@Component({
    selector: 'app-product-detail-view',
    templateUrl: './product-detail-view.component.html',
    styleUrls: ['./product-detail-view.component.scss']
})
export class ProductDetailViewComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private dialogService: DialogService,
        private breadcrumbService: BreadcrumbService,
        private router: Router,
        private _routeActive: ActivatedRoute,
        private openSellService: OpenSellService,
    ) {
        super(injector, messageService);
        this.openSellDetailId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get("openSellDetailId"));
    }
    //
    tabViewActive = {
        productInfo: true,
        lichSu: false,
    };

    @ViewChild(TabView)
    public tabView: TabView;

    // Id chi tiết mở bán
    openSellDetailId: number;
    productData: any = {};
    //
    productInfo: any = {};

    ngOnInit(): void {
        this.isLoading = true;
        // this.openSellService.get
        if(this.openSellDetailId) {
            this.isLoading = true;
            this.openSellService.getProductItemInfo(this.openSellDetailId).subscribe((res) => {
              this.isLoading = false;
              if(this.handleResponseInterceptor(res)) {
                this.productData = {...res?.data};
                this.productData.buildingDensityName = ProjectStructureConst.getBuildingDensityTypeName(this.productData?.projectStructure?.buildingDensityType) + ' ' + this.productData?.projectStructure?.name;
                this.productData.moreInfo = [{index: 1}];
                //
                this.breadcrumbService.setItems([
                    { label: "Mở bán", routerLink: "/project-manager/open-sell" },
                    { label: "Chi tiết mở bán", routerLink: `/project-manager/open-sell/detail/${this.cryptEncode(this.productData?.openSellId)}`},
                    { label: "Chi tiết sản phẩm" },
                ]);
              }
            });
          }

    }

    // dang loi chua fix
    public changeTab(event: any) {
        let tabHeader = this.tabView.tabs[event.index].header;
        this.tabViewActive[tabHeader] = true;
        if (tabHeader != 'lichSu'){
            this.tabViewActive.lichSu = false;
        }
    }

}
