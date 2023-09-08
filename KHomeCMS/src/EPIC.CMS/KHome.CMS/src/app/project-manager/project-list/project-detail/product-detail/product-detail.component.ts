import { Component, OnInit, Injector, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectListService } from "@shared/services/project-list.service";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { TabView } from "primeng/tabview";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { ProductConst } from "@shared/AppConsts";
import { ProductService } from "@shared/services/product.service";
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private _routeActive: ActivatedRoute,
    private productService: ProductService,
  ) {
    super(injector, messageService);
    this.productId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get("productId"));
  }

  public tabViewActive: {
    productInfo: boolean,
    policySales: boolean,
    policy: boolean,
    utiliti: boolean,
    material: boolean,
    designDiagram: boolean,
    images: boolean;
    lichSu: boolean
  } = {
    productInfo: true,
    policySales: false,
    policy: false,
    utiliti: false,
    material: false,
    designDiagram: false,
    images: false,
    lichSu: false,
  };

  @ViewChild(TabView)
  public tabView: TabView;

  productId: number;
  productInfo: any = {};


  ngOnInit(): void {
    this.isLoading = true;
    this.productService.findById(this.productId).subscribe((res) => {
      if (this.handleResponseInterceptor(res)) {
        this.productInfo = res?.data;
        this.breadcrumbService.setItems([
          { label: "Bảng hàng dự án", routerLink: "/project-manager/project-list" },
          { label: "Chi tiết dự án", routerLink: `/project-manager/project-list/detail/${this.cryptEncode(res?.data.projectId)}` },
          { label: "Chi tiết sản phẩm" },
        ]);
      }
    });
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
