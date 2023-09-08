import { Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { FormNotificationConst, IActionTable, IDropdown, ProductDistributionConst} from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductDistributionModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { TradingProviderServiceProxy } from "@shared/service-proxies/setting-service";
import { DistributionService } from "@shared/services/distribution.service";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { CreateProductDistributionDialogComponent } from "./create-product-distribution-dialog/create-product-distribution-dialog.component";

@Component({
	selector: "product-distribution",
	templateUrl: "./product-distribution.component.html",
	styleUrls: ["./product-distribution.component.scss"],
})
export class ProductDistributionComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private tradingProviderService: TradingProviderServiceProxy,
		private projectOverviewService: ProjectOverviewService,
		private router: Router,
		private distributionService: DistributionService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
		{ label: "Trang chủ", routerLink: ["/home"] },
		{ label: "Quản lý dự án", routerLink: ["/home"] },
		{ label: "Phân phối sản phẩm" },
		]);
	}

	isLoading: boolean;
	page: Page;

	listAction = [];
	headerColumns = [];
	selectedColumns = [];
	tradingProviders = [];
	projects = [];

	ProductDistributionConst = ProductDistributionConst;
	//
	fieldFilters = {
		tradingProviderId: null,
		projectId: null,
		status: null,
	};

  	rows = [];
	sortData: any[] = [];

  public statusFilters: IDropdown[] = [];
  minWidthTable: string;

	ngOnInit(): void {
  this.minWidthTable = '1800xp'

		this.subject.isSetPage.subscribe(() => {
		this.setPage();
		})
		this.statusFilters = ProductDistributionConst.statuses.filter((status: IDropdown) => status.code !== ProductDistributionConst.CHO_DUYET);
		this.headerColumns = [
		{ field: "codeDisplay", header: "Mã dự án", width: "10rem" },
		{ field: "nameDisplay", header: "Tên dự án", isPin: true},
		{ field: "agencyDisplay", header: "Đại lý bán" },
		{ field: "quantityDisplay", fieldSort: 'Quantity', header: "Số lượng", width: "8rem" },
		{ field: "soldDisplay", fieldSort: 'QuantitySold', header: "Đã bán", width: "8rem" },
		{ field: "depositDisplay", fieldSort: 'QuantityDeposit', header: "Đã cọc", width: "8rem" },
		{ field: "startDateDisplay", fieldSort: 'StartDate', header: "Ngày phân phối", width: "12rem" },
		{ field: "approveBy", header: "Người duyệt PP", width: "10rem" },
		// { field: "stopDate", header: "Người dừng PP", width: "10rem" },
		];
		//
		this.headerColumns.map((item, index: number) => {
		item.position = index + 1;
		return item;
		});
		//
		this.selectedColumns = this.getLocalStorage(ProductDistributionConst.keyStorage) ?? this.headerColumns.filter(item => item.field !== "codeDisplay");
		this.setPage({ page: this.offset });
	}

 

  setData(rows = []) {
    for (let row of rows) {
      row.codeDisplay = row?.project?.code;
      row.nameDisplay = row?.project?.name;
      row.agencyDisplay = row?.tradingProvider?.name;
      row.startDateDisplay = this.formatDate(row?.startDate);
      row.depositDisplay = this.formatCurrency(row?.quantityDeposit);
      row.soldDisplay = this.formatCurrency(row?.quantitySold);
      row.quantityDisplay = this.formatCurrency(row?.quantity);
    }
  }

  setColumn(col, selectedColumns) {
    const ref = this.dialogService.open(
      FormSetDisplayColumnComponent,
      this.getConfigDialogServiceDisplayTableColumn(col, selectedColumns)
    );
    //
    ref.onClose.subscribe((dataCallBack) => {
      if (dataCallBack?.accept) {
        this.selectedColumns = dataCallBack.data.sort(function (a, b) {
          return a.position - b.position;
        });
        this.setLocalStorage(
          this.selectedColumns,
          ProductDistributionConst.keyStorage
        );
      }
    });
  }

  genListAction(data: ProductDistributionModel[] = []) {
    this.listAction = data.map((data: any, index: number) => {
      const actions: IActionTable[] = [];
      if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_ChiTiet])) {
        actions.push({
          data: data,
          label: "Thông tin chi tiết",
          icon: "pi pi-info-circle",
          command: ($event) => {
            this.detail($event.item.data);
          },
        } as IActionTable);
      }

      if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_DoiTrangThai]) && (data.status == this.ProductDistributionConst.TAM_DUNG || data.status == this.ProductDistributionConst.DANG_PHAN_PHOI) ) {
        actions.push({
          data: data,
          label: data.status == this.ProductDistributionConst.TAM_DUNG ? "Phân phối" : "Tạm dừng",
          icon:  data.status == this.ProductDistributionConst.TAM_DUNG ? "pi pi-volume-up" : "pi pi-lock",
          command: ($event) => {
            this.pause($event.item.data);
          },
        });
      }

      if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_Xoa]) && data.status == this.ProductDistributionConst.KHOI_TAO ) {
        actions.push({
          data: data,
          label: "Xóa",
          icon: "pi pi-trash",
          command: ($event) => {
            this.delete($event.item.data);
          },
        });
      }

      return actions;
    });
  }

	create() {
		const ref = this.dialogService.open(
		CreateProductDistributionDialogComponent,
		{
			header: "Tạo mới thông tin phân phối",
			width: "450px",
		}
		);
		//
		ref.onClose.subscribe((statusSuccess) => {
		if (statusSuccess) {
			this.setPage();
		}
		});
	}

  detail(item) {
    this.router.navigate(["project-manager/product-distribution/detail/" + this.cryptEncode(item.id)]);
  }

  pause(distribution){
    const ref = this.dialogService.open(FormNotificationComponent, {
      header: distribution.status == this.ProductDistributionConst.TAM_DUNG ? "Phân phối sản phẩm" : "Tạm dừng phân phối",
      width: "600px",
      data: {
        title: distribution.status == this.ProductDistributionConst.TAM_DUNG ? `Xác nhận mở phân phối sản phẩm` : `Xác nhận dừng phân phối sản phẩm`,
        icon: distribution.status == this.ProductDistributionConst.TAM_DUNG ? FormNotificationConst.IMAGE_APPROVE  : FormNotificationConst.IMAGE_CLOSE,
      },
    });
    ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
      if (dataCallBack?.accept) {
        this.distributionService.pauseOrActive(distribution.id).subscribe((response) => {
            if ( this.handleResponseInterceptor(response, distribution.status == this.ProductDistributionConst.TAM_DUNG ? "Phân phối thành công" : "Dừng phân phối thành công")) {
              this.setPage();
            }
          }, (err) => {
            console.log('err____', err);
            this.messageError(distribution.status == this.ProductDistributionConst.TAM_DUNG ? `Phân phối thất bại` : `Dừng phân phối thất bại`);
          });
      } else {
      }
    });
  }

  delete(distribution) {
    const ref = this.dialogService.open(FormNotificationComponent, {
      header: "Thông báo",
      width: "600px",
      data: {
        title: `Bạn có chắc chắn muốn xóa phân phối ${distribution?.project?.name}?`,
        icon: FormNotificationConst.IMAGE_CLOSE,
      },
    });
    ref.onClose.subscribe((dataCallBack) => {
      console.log({ dataCallBack });
      if (dataCallBack?.accept) {
        this.distributionService.delete(distribution.id).subscribe((response) => {
            if ( this.handleResponseInterceptor(response, "Xóa phân phối thành công")) {
              this.setPage();
            }
          }, (err) => {
            console.log('err____', err);
            this.messageError(`Không xóa được phân phối đầu tư`);
          });
      } else {
      }
    });
  }

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		forkJoin([
			this.distributionService.findAll(this.page, this.fieldFilters, this.sortData ),
			this.tradingProviderService.getAllNoPaging(),
			this.projectOverviewService.getAllProjectNoPaging(),
		]).subscribe(([res, resTrading, resProject]) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res)) {
				this.page.totalItems = res.data.totalItems;
				this.rows = res?.data?.items;
				if (this.rows.length > 0) {
					this.genListAction(this.rows);
					this.setData(this.rows);
				}
			}
			if (this.handleResponseInterceptor(resTrading)) {
				this.tradingProviders = resTrading?.data?.items;
			}
			if (this.handleResponseInterceptor(resProject)) {
				this.projects = resProject?.data?.items;
			}
		});
	}
}
