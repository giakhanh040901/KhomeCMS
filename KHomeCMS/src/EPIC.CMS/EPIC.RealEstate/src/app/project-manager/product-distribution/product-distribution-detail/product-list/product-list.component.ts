import { ChangeDetectorRef, Component, Injector, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ActiveDeactiveConst, FormNotificationConst, IActionTable, IHeaderColumn, ProductConst, ProductDistributionConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { DistributionService } from "@shared/services/distribution.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreateProductDialogComponent } from "./create-product-dialog/create-product-dialog.component";
import { LockApartmentDialogComponent } from "./lock-apartment-dialog/lock-apartment-dialog.component";

@Component({
	selector: "product-list",
	templateUrl: "./product-list.component.html",
	styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent extends CrudComponentBase {
	public dataSource: ProductListModel[] = [];
	public page: Page = new Page();
	public listAction: IActionTable[][] = [];
	public isSelectAll: boolean = false;
	public isEdit: boolean = false;

	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private changeDetectorRef: ChangeDetectorRef,
		private distributionService: DistributionService,
		private router: Router
	) {
		super(injector, messageService);
	}

	@Input() distributionId: number;
	@Input() distributionInfo: any = {};

	ProductConst = ProductConst;
	ProductDistributionConst = ProductDistributionConst;
	ActiveDeactiveConst = ActiveDeactiveConst;
	YesNoConst = YesNoConst;

	@Input() rows = [];

	selectedColumns = [];
	headerColumns: IHeaderColumn[] = [];
	selectedItems = [];
	sortData: any[] = [];

	ngOnInit() {
		this.subject.isSetPage.subscribe(() => {
			this.setPage();
		});
		this.headerColumns = [
			{ field: "code", header: "Mã căn", width: "8rem", isPin: true },
			{ field: "name", header: "Tên căn", width: "10rem", isPin: true, isResize: true },
			{ field: "noFloor", fieldSort: "ProductItemNoFloor", header: "Tầng số", width: "10rem", class: "justify-content-center" },
			{ field: "roomTypeName", fieldSort: "ProductItemRoomType", header: "Số phòng", width: "11rem", class: "justify-content-center" },
			{ field: "productLocationName", header: "Vị trí căn", width: "8rem", class: "justify-content-center" },
			{ field: "priceAreaDisplay", fieldSort: "ProductItemPriceArea", header: "Diện tích", width: "10rem" },
			{ field: "unitPriceDisplay", fieldSort: "ProductItemUnitPrice", header: "Đơn giá", width: "10rem" },
			{ field: "priceDisplay", fieldSort: "ProductItemPrice", header: "Giá bán", width: "10rem" },
			{ field: "_productItemLock", header: "Khóa căn - BH", width: "9rem", class: "justify-content-center" },
			{ field: "_distributionLock", header: "Khóa căn - PP", width: "9rem", class: "justify-content-center" },
		].map((item: IHeaderColumn, index: number) => {
			item.position = index + 1;
			return item;
		});
		//
		this.selectedColumns =
			this.getLocalStorage("projectList") ?? this.headerColumns;
		//
	}

	setData(rows = []) {
		for (let row of rows) {
			row.dataDisplay = {};
			row.dataDisplay.code = row.productItem.code;
			row.dataDisplay.name = row.productItem.name;
			row.dataDisplay.noFloor = row.productItem.noFloor ?? row.productItem.numberFloor;
			//
			row.dataDisplay.roomTypeName = ProductConst.getRoomTypeName(row.productItem.roomType);
			row.dataDisplay.productLocationName = ProductConst.getLocationName(row.productItem.productLocation);
			row.dataDisplay.priceAreaDisplay = this.formatCurrency(row.productItem.priceArea) + " m2";
			row.dataDisplay.unitPriceDisplay = this.formatCurrency(row.productItem.unitPrice);
			row.dataDisplay.priceDisplay = this.formatCurrency(row.productItem.price);
			row.dataDisplay.priceText = this.getPriceText(row.productItem.price);
			row._productItemLock = row?.productItem?.isLock == YesNoConst.YES;
			row._distributionLock = row?.status == ActiveDeactiveConst.DEACTIVE;
			// check các trạng thái khóa của Bảng Hàng, Phân Phối
			if (
				row?.productItem?.isLock == YesNoConst.YES ||
				row?.status == ActiveDeactiveConst.DEACTIVE
			) {
				row._isLockDeactive = true;
			} else {
				row._isLockDeactive = false;
			}
		}
	}

	ngAfterViewInit() {
		this.setPage({ page: this.offset });
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	genListAction(data = []) {
		this.listAction = data.map((data, index: number) => {
			const actions = [];
			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_DSSP_ChiTiet])) {
				actions.push({
					data: data,
					index: index,
					label: "Xem chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data);
					},
				});
			}
			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_DSSP_Mo_KhoaCan])) {
				actions.push({
					data: data,
					label: data?.status == ActiveDeactiveConst.DEACTIVE ? "Mở khóa căn" : "Khóa căn",
					icon: data?.status == ActiveDeactiveConst.DEACTIVE ? "pi pi-lock-open" : "pi pi-lock",
					command: ($event) => {
						this.lockOrOpenLock($event.item.data);
					},
				});
			}
			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_DSSP_Xoa])) {
				actions.push({
					data: data,
					label: "Xoá",
					icon: "pi pi-trash",
					command: ($event) => {
						this.delete($event.item.data);
					},
				});
			}

			return actions;
		});
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.distributionService.findAllItem(this.page, this.status, this.sortData).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res)) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items;
				this.distributionService.getIsHaveProductList(
					this.rows,
					this.page.getPageNumber()
				);
				this.setData(this.rows);
				this.genListAction(this.rows);
			}
		});
	}

	create(event: any) {
		if (event) {
			const ref = this.dialogService.open(CreateProductDialogComponent, {
				header: "Thêm phân phối",
				width: "1100px",
				data: {
					distributionId: this.distributionId,
					projectId: this.distributionInfo?.project.id,
				},
			});
			ref.onClose.subscribe((statusSuccess) => {
				if (statusSuccess) {
					this.setPage({ page: this.offset });
				}
			});
		}
	}

	edit(event: any) {}

	detail(item) {
		this.router.navigate([
			`project-manager/project-list/detail/product-detail/${this.cryptEncode(
				item?.productItem?.id
			)}`,
		]);
	}

	changeFilter(value) {
		this.setPage({ page: this.offset });
	}

	lockOrOpenLock(product: any) {
		if (product?.status == ActiveDeactiveConst.DEACTIVE) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: "Bạn có muốn mở khóa căn hộ này?",
					icon: FormNotificationConst.IMAGE_APPROVE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					let body = {
						id: product.id,
					};
					this.distributionService.lockOrUnlock(body).subscribe((response) => {
						if (
							this.handleResponseInterceptor(response, "Mở khóa thành công")
						) {
							this.setPage();
						}
					});
				}
			});
		} else {
			const ref = this.dialogService.open(LockApartmentDialogComponent, {
				header: "Khóa căn hộ",
				width: "500px",
				data: {
					lockApartment: {
						typeCallApi: ProductConst.PRODUCT_LIST,
						id: product.id,
					},
				},
			});
			ref.onClose.subscribe((data: any) => {
				if (data?.accept) {
					this.setPage();
					//
				}
			});
		}
	}

	delete(data?: any) {
		let body: any = {};
		if (!data) {
			if (this.selectedItems.length) {
				const distributionItemIds = this.selectedItems.map((s) => s.id);
				body = {
					id: this.distributionId,
					distributionItemIds: distributionItemIds,
				};
			}
		} else {
			if (data.id) {
				body = {
					id: this.distributionId,
					distributionItemIds: [data.id],
				};
			}
		}
		if (Object.keys(body).length) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: `Bạn có chắc chắn muốn xóa sản phẩm đã chọn`,
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this.distributionService.deleteDistributionProductItem(body).subscribe((res) => {
						if (this.handleResponseInterceptor(res,"Xóa sản phẩm thành công!")) {
							if (!data) {
								this.selectedItems = [];
							} else {
								this.selectedItems = this.selectedItems.filter(
									(e: any) => e.id !== data.id
								);
							}
							this.setPage();
						}
					},
					(err) => {
						console.log("err", err);
					}
				);
				}
			});
		}
	}

	save(event: any) {
		if (event) {
			this.isEdit = false;
		}
	}
}
