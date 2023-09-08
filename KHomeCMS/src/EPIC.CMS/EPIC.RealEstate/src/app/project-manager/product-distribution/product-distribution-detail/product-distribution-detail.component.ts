import { Component, Injector, Input, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductDistributionConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { ProductDistributionService } from "@shared/services/product-distribution.service";
import { ProductService } from "@shared/services/product.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { TabView } from "primeng/tabview";
import { FormApproveComponent } from "src/app/form-general/form-request-approve-cancel/form-approve/form-approve.component";
import { FormRequestComponent } from "src/app/form-general/form-request-approve-cancel/form-request/form-request.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";

@Component({
    selector: "product-distribution-detail",
    templateUrl: "./product-distribution-detail.component.html",
    styleUrls: ["./product-distribution-detail.component.scss"],
})
export class ProductDistributionDetailComponent extends CrudComponentBase {

    @ViewChild(TabView)
    public tabView: TabView;
    
    // CONST
    ProductDistributionConst = ProductDistributionConst;
    //
    public tabViewActive = {
        distributionInfo: true,
        productList: false,
        distributionPolicy: false,
        contractForm: false,
    }

    distributionId: number;
    distributionInfo: any = {};

    constructor(
        injector: Injector,
        messageService: MessageService,
        private breadcrumbService: BreadcrumbService,
        private router: Router,
        private _routeActive: ActivatedRoute,
        private _distributionService: DistributionService,
        private productDistributionService: ProductDistributionService,
        private dialogService: DialogService,
    ) {
        super(injector, messageService);
        this.breadcrumbService.setItems([
            { label: "Quản lý dự án", routerLink: "/home" },
            { label: "Phân phối sản phẩm", routerLink: "/project-manager/product-distribution" },
            { label: "Phân phối sản phẩm chi tiết" },
        ]);
        //
        this.distributionId = this._distributionService.distributionId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get("id"));
        this.productDistributionService.distributionId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get("id"));
    }

    ngOnInit() {
        this.getDetail();
        this._distributionService.getIsHaveProductList();
    }

    getDetail() {
        this.isLoading = true;
        this._distributionService.findById(this.distributionId).subscribe((res) => {
            this.isLoading = false;
            this.distributionInfo = {};
            if(this.handleResponseInterceptor(res)) {
                this.distributionInfo = {
                    ...res?.data,
                    startDate: this.formatDate(res?.data?.startDate),
                    endDate: this.formatDate(res?.data?.endDate),
                    tradingProviderName: res?.data?.tradingProvider?.name,
                    projectName: res?.data?.project?.name,
                };
            }
        });
    }

    public changeTab(event: any) {
        let tabHeader = this.tabView.tabs[event.index].header;
        this.tabViewActive[tabHeader] = true;
    }

    // TRÌNH DUYỆT PHÂN PHỐI SẢN PHẨM
    requestApprove() {
        const params = {
			id: this.distributionId,
			summary: 'Phân phối sản phẩm',
            data: this.distributionInfo,
            type: 'distributionProductInfo'
		}
        //
		const ref = this.dialogService.open(
			FormRequestComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this._distributionService.requestApprove(dataCallBack.data).subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Trình duyệt thành công!")) {
                        this.getDetail();
					}
				});
			}
		});
    }

    // PHÊ DUYỆT PHÂN PHỐI
    approve() {
        const params = {
			id: this.distributionId,
			summary: 'Phân phối sản phẩm',
            data: this.distributionInfo,
            type: 'distributionProductInfo'
		}
        //
		const ref = this.dialogService.open(
			FormApproveComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
                this._distributionService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove ).subscribe((response) => {
                    if (this.handleResponseInterceptor(response, "Thao tác thành công!")) {
                        this.getDetail();
                    }
                });
			}
		});
    }

    public get isHaveProductList() {
        return this._distributionService.isHaveProductList;
    }
}