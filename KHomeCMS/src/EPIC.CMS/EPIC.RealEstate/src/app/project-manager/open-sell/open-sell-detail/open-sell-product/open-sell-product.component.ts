import { OpenSellService } from "@shared/services/open-sell.service";
import { OpenSellAddProductComponent } from "./open-sell-add-product/open-sell-add-product.component";
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, Output } from "@angular/core";
import { ActiveDeactiveConst, FormNotificationConst, IActionTable, IHeaderColumn, OpenSellConst, ProductConst, YesNoConst, IDropdown, PermissionRealStateConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { LockApartmentDialogComponent } from "src/app/project-manager/product-distribution/product-distribution-detail/product-list/lock-apartment-dialog/lock-apartment-dialog.component";
import { Router } from "@angular/router";
import { ProjectStructureService } from "@shared/services/project-structure.service";
import { Subscription, forkJoin } from "rxjs";
import { FormDisablePriceComponent } from "./form-disable-price/form-disable-price.component";
import { SignalrService } from "@shared/services/signalr.service";

@Component({
	selector: "app-open-sell-product",
	templateUrl: "./open-sell-product.component.html",
	styleUrls: ["./open-sell-product.component.scss"],
})
export class OpenSellProductComponent extends CrudComponentBase {
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
		private _projectStructureService: ProjectStructureService,
		public openSellService: OpenSellService,
		private router: Router,
		private _signalrService: SignalrService
	) {
		super(injector, messageService);
	}

	@Input() openSellInfo: any;
	@Input() openSellId: number;

	ProductConst = ProductConst;
	OpenSellConst = OpenSellConst;
	ActiveDeactiveConst = ActiveDeactiveConst;
	YesNoConst = YesNoConst;

	@Input() rows = [];
	@Output() getOpenSellProduct = new EventEmitter<any>();
	//
	selectedColumns = [];
	headerColumns: IHeaderColumn[] = [];
	selectedItems = [];
	statuses = ProductConst.statuses.filter(status => status.code !== ProductConst.KHOI_TAO)

	fieldFilters = {
		keyword: "",
		firstDensity: null,
		secondDensity: null,
		redBookType: null,
		status: null,
	};

	firstDensitys: [] = [];
	secondDensitys: [] = [];

	sortData: any[] = [];
	openCellItemSubcription: Subscription;
	updateProductItemSubscription: Subscription;
	lastestItemSubcription: Subscription;
	public dataView = {
		grid: true,
		list: false,
	};
	public rowsNoPaging: any[] = [];
	public listSortField: IDropdown[] = [];
	public selectedSort: {
		field: string;
		order: number;
	} = {
		field: "",
		order: 1,
	};

	ngOnInit() {
		this.init();
		this.subject.isSetPage.subscribe(() => {
			this.setPage();
		});

		this._signalrService.startConnection().then(() => {
			// Đổi trạng thái căn hộ
			this._signalrService.listenProductItemStatuses();
			this.openCellItemSubcription =
				this._signalrService.AllProductItemObservable.subscribe((res) => {
					this.rows = this.rows.map((row) => {
						if (row.productItem.id == res.productItemId) {
							row.productItemStatus = res.status;
							const findCard = ProductConst.listCard.find(
								(card: any) => card.code === res.status
							);
							if (findCard) {
								row.backgroundTopColor = findCard.backgroundColor;
								row.titleColor = findCard.numberColor;
							}
						}
						return row;
					});
					this.dataView["grid"] && this.getListCard();
					this.genListAction(this.rows);
				});

			// Đếm số lượng căn hộ theo trạng thái
			this._signalrService.listenUpdateCountProductItem();
			this.updateProductItemSubscription =
				this._signalrService.UpdateProductItemObservable.subscribe(
					(resCount) => {
						for (const key in resCount) {
							this.openSellService.listCard =
								this.openSellService.listCard.map((card) => {
									if (card.countName == key && resCount[key] != null) {
										card.quantity = resCount[key];
										return card;
									} else {
										return card;
									}
								});
						}
					}
				);

			// Đổi thông tin sản phẩm mới
			this._signalrService.listenUpdateLastestOpenSell();
			this.lastestItemSubcription =
				this._signalrService.LastestOpenSellObservable.subscribe((res) => {
					this.openSellService.lastestProduct = {
						avatar: res.avatarImageUrl,
						fullName: res.fullName,
						productCode: res.productItemCode,
						tradingProviderName: res.tradingProviderName,
						time: res.expTimeDeposit,
						status: res.orderStatus,
					};
				});
			})
			.catch((err) => {	
				console.log("errSinglr", err);
		});
		this.headerColumns = [
			{ field: "code", header: "Mã căn", width: "8rem", isPin: true },
			{
				field: "name",
				header: "Tên căn",
				width: "8rem",
				isPin: true,
				isResize: true,
			},
			{
				field: "projectStructureDisplay",
				header: "Mật độ xây dựng",
				width: "16rem",
			},
			// { field: "roomTypeName", header: "Số phòng", width: "10rem" },
			// { field: "productLocationName", header: "Vị trí căn", width: "10rem" },
			{
				field: "priceAreaDisplay",
				fieldSort: "ProductItemPriceArea",
				header: "Diện tích",
				width: "9rem",
			},
			{
				field: "priceDisplay",
				fieldSort: "ProductItemPrice",
				header: "Giá bán",
				width: "10rem",
			},
			{ field: "depositPriceDisplay", header: "Giá cọc", width: "10rem" },
			{ field: "lockPriceDisplay", header: "Giá lock căn", width: "12rem" },
			{ field: "redBookTypeDisplay", header: "Loại sổ đỏ", width: "8rem" },
			{
				field: "isShowPrice",
				header: "Hiện giá",
				width: "9rem",
				class: "justify-content-center",
			},
			{
				field: "isShowApp",
				header: "Show App",
				width: "9rem",
				class: "justify-content-center",
			},
			{
				field: "_productItemLock",
				header: "Khóa căn - BH",
				width: "9rem",
				class: "justify-content-center",
			},
			{
				field: "_distributionLock",
				header: "Khóa căn - PP",
				width: "9rem",
				class: "justify-content-center",
			},
			{
				field: "_isLockOpenCell",
				fieldSort: "IsLock",
				header: "Khóa căn - MB",
				width: "11rem",
				class: "justify-content-center",
			},
		].map((item: IHeaderColumn, index: number) => {
			item.position = index + 1;
			return item;
		});
		this.listSortField = [
			{
				code: "Id",
				name: "ID",
			},
		];
		this.headerColumns.forEach((e: any) => {
			if (e.fieldSort) {
				this.listSortField.push({
					code: e.fieldSort,
					name: e.header,
				} as IDropdown);
			}
		});
		this.selectedSort.field = this.listSortField[0].code.toString();
		this.sortData = [
			{
				field: this.selectedSort.field,
				order: this.selectedSort.order,
			},
		];
		//
		this.selectedColumns =
			this.getLocalStorage("openSellProductList") ?? this.headerColumns;
		this.getLastestProduct();
	}

	ngOnDestroy(): void {
		if (this.openCellItemSubcription)
			(<Subscription>this.openCellItemSubcription).unsubscribe();
		if (this.updateProductItemSubscription)
			(<Subscription>this.updateProductItemSubscription).unsubscribe();
	}

	setData(rows = []) {
		for (let row of rows) {
			row.dataDisplay = {};
			row.code = row.productItem.code;
			row.name = row.productItem.name;
			row.noFloor = row.productItem.noFloor;
			row.projectStructureDisplay = row?.productItem?.projectStructure?.name;
			//
			row.roomTypeName = ProductConst.getRoomTypeName(row.productItem.roomType);
			row.productLocationName = ProductConst.getLocationName(row.productItem.productLocation);
			row.priceAreaDisplay = this.formatCurrency(row.productItem.priceArea) + " m2";
			row.priceDisplay = this.formatCurrency(row?.productItem?.price);
			row.depositPriceDisplay = this.formatCurrency(row.depositPrice);
			row.lockPriceDisplay = this.formatCurrency(row.lockPrice);
			row.priceText = this.getPriceText(row.productItem.price);
			row.redBookTypeDisplay = this.ProductConst.getRedBookTypeName(row.productItem.redBookType);
			row.dataDisplay.isShowPrice = row.isShowPrice === YesNoConst.YES;
			row.dataDisplay.isShowApp = row.isShowApp === YesNoConst.YES;
			row._productItemLock = row?.productItem?.isLock == YesNoConst.YES;
			row._distributionLock = row?.distributionProductItemStatus == ActiveDeactiveConst.DEACTIVE;
			row._isLockOpenCell = row?.isLock == YesNoConst.YES;
			row.status = row.productItemStatus;
			row.doorDirection = row?.productItem?.productLocation;
			row.hide = false;

			// check các trạng thái khóa của Bảng Hàng, Phân Phối, Mở Bán
			row._isLockDeactive = this.checkIsLockProductItem(row);
			if (row._isLockDeactive) row.status = ProductConst.KHOA_CAN;

			const findCard = ProductConst.listCard.find(
				(card: any) => card.code === row.status
			);
			if (findCard) {
				row.backgroundTopColor = findCard.backgroundColor;
				row.titleColor = findCard.numberColor;
			}
		}
		console.log("rows", this.rows);
	}

	checkIsLockProductItem(row): boolean {
		return (
			row?.productItem?.isLock == YesNoConst.YES ||
			row?.distributionProductItemStatus == ActiveDeactiveConst.DEACTIVE ||
			row?.isLock == YesNoConst.YES ||
			row?.status == ProductConst.KHOA_CAN
		);
	}

	ngAfterViewInit() {
		this.setPage({ page: this.offset });
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	init() {
		forkJoin([
			this._projectStructureService.getNodeByLevel(1,this.openSellInfo?.project?.id),
			this._projectStructureService.getNodeByLevel(2,this.openSellInfo?.project?.id),
		]).subscribe(([res, resSecon]) => {
			this.isLoading = false;
			// Mật độ cấp 1
			if (this.handleResponseInterceptor(res) && res?.data?.length) {
				this.firstDensitys = res?.data;
			}
			// Mật độ cấp 2
			if (this.handleResponseInterceptor(resSecon) && resSecon?.data?.length) {
				this.secondDensitys = resSecon?.data;
			}
		});
	}

	genListAction(data: ProductListModel[] = []) {
		this.listAction = data.map((data: any, index: number) => {
			const actions = [];
			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DSSP_ChiTiet])) {
				actions.push({
					data: data,
					index: index,
					label: "Xem chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data.id);
					},
				});
			}
			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DSSP_DoiShowApp])) {
				actions.push({
					data: data,
					label: data?.isShowApp == YesNoConst.YES ? "Tắt showapp" : "Bật showapp",
					icon: data?.isShowApp == YesNoConst.YES ? "pi pi-eye-slash" : "pi pi-eye",
					command: ($event) => {
						this.changeShowapp($event.item.data);
					},
				});
			}
			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DSSP_DoiShowPrice])) {
				actions.push({
					data: data,
					label:
						data?.isShowPrice == YesNoConst.YES
							? "Tắt hiển thị giá"
							: "Bật hiển thị giá",
					icon:
						data?.isShowPrice == YesNoConst.YES
							? "pi pi-eye-slash"
							: "pi pi-eye",
					command: ($event) => {
						this.hidePrice($event.item.data);
					},
				});
			}
			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DSSP_DoiTrangThai])) {
				actions.push({
					data: data,
					label: data?.isLock == YesNoConst.YES ? "Mở khóa căn" : "Khóa căn",
					icon:
						data?.isLock == YesNoConst.YES ? "pi pi-lock-open" : "pi pi-lock",
					command: ($event) => {
						this.lockOrOpenLock($event.item.data);
					},
				});
			}

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DSSP_Xoa])) {
				actions.push({
					data: data,
					label: "Xoá",
					icon: "pi pi-trash",
					command: ($event) => {
						this.deleteItem($event.item.data.id);
					},
				});
			}

			return actions;
		});
	}

	changeFilter() {
		this.setPage({ page: this.offset });
	}

	changeLevel1(value) {
		this.fieldFilters.secondDensity = null;
		this.setPage({ page: this.offset });
	}

	changeLevel2(value) {
		this.fieldFilters.firstDensity = null;
		this.setPage({ page: this.offset });
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.dataView["grid"] && this.getListCard();
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.openSellService.findAllProduct(this.page,this.openSellId,this.fieldFilters,this.sortData).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res)) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items;
				this.setData(this.rows);
				this.genListAction(this.rows);
				this.getOpenSellProduct.emit(this.rows);
			}
		});
	}

	create(event: any) {
		if (event) {
			const ref = this.dialogService.open(OpenSellAddProductComponent, {
				header: "Thêm sản phẩm mở bán",
				width: "1100px",
				data: {
					projectId: this.openSellInfo?.project?.id,
					openSellId: this.openSellId,
					firstDensitys: this.firstDensitys,
					secondDensitys: this.secondDensitys,
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

	detail(openSellDetailId) {
		this.router.navigate([
			"project-manager/open-sell/product-detail/" +
				this.cryptEncode(openSellDetailId),
		]);
	}

	lockOrOpenLock(data: any) {
		console.log("data___", data);

		if (
			data?.isLock == YesNoConst.YES ||
			data.distributionProductItemStatus == ActiveDeactiveConst.DEACTIVE ||
			data?.isLock == YesNoConst.YES
		) {
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
						id: data.id,
					};
					this.openSellService.lockOrUnlock(body).subscribe((response) => {
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
						typeCallApi: ProductConst.OPEN_SELL,
						id: data.id,
					},
				},
			});
			ref.onClose.subscribe((data: any) => {
				if (data?.accept) {
					this.setPage();
				}
			});
		}
	}

	changeShowapp(data) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: data.isShowApp == YesNoConst.YES ? "Xác nhận tắt showapp" : "Xác nhận showapp",
				icon: data.isShowApp == YesNoConst.YES ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.isLoading = true;
				this.openSellService.changeShowapp(data?.id).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, data.isShowApp == YesNoConst.YES ? "Tắt showapp thành công" : "Showapp thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err", err);
					}
				);
			} else {
				this.isLoading = false;
			}
		});
	}

	hidePrice(item) {
		if (item?.isShowPrice !== YesNoConst.YES) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: "Bạn có muốn bật hiện thị giá?",
					icon: FormNotificationConst.IMAGE_APPROVE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					let body = {
						id: item?.id,
					};
					this.openSellService.showPrice(body).subscribe((response) => {
						if (
							this.handleResponseInterceptor(response, "Bật hiện thị giá thành công")
						) {
							this.setPage();
						}
					});
				}
			});
		} else {
			const ref = this.dialogService.open(FormDisablePriceComponent, {
				header: "Xác nhận tắt hiển thị giá bán trên ứng dụng",
				width: "450px",
				data: {
					title: "Sau khi tắt hiển thị giá, khách hàng sẽ không xem được thông tin giá bán của căn hộ",
					icon: FormNotificationConst.IMAGE_CLOSE,
					hotline: this.openSellInfo.hotline ?? null,
					id: item?.id,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack.accept) {
					this.setPage();
				}
			});
		}
	}

	deleteItem(id) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Xoá căn hộ khỏi mở bán?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.isLoading = true;
				this.openSellService.deleteProduct([id]).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Xóa thành công!")) {
							this.selectedItems = [];
							this.setPage();
						}
					},
					(err) => {
						console.log("err", err);
					}
				);
			} else {
				this.isLoading = false;
			}
		});
	}

	delete() {
		if (this.selectedItems?.length) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: "Xoá căn hộ khỏi mở bán?",
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this.isLoading = true;
					let openSellProductIds = this.selectedItems.map((s) => s.id);
					//
					this.openSellService.deleteProduct(openSellProductIds).subscribe(
						(res) => {
							this.isLoading = false;
							if (this.handleResponseInterceptor(res, "Xóa thành công!")) {
								this.selectedItems = [];
								this.setPage();
							}
						},
						(err) => {
							this.isLoading = false;
							console.log("err", err);
						}
					);
				} else {
					this.isLoading = false;
				}
			});
		}
	}

	save(event: any) {
		if (event) {
			this.isEdit = false;
		}
	}

	public get showData() {
		return !!this.rows.length;
	}

	public get labelDataView() {
		return this.dataView["grid"] ? "Dạng lưới" : this.dataView["list"] ? "Dạng bảng" : "";
	}

	public changeView(viewType: string) {
		Object.keys(this.dataView).forEach((key: string) => {
			if (key === viewType) this.dataView[key] = true;
			else this.dataView[key] = false;
		});
	}

	private getListCard() {
		this.openSellService.getAllProductItemNoPaging(this.openSellId).subscribe((rowsNoPaging) => {
			if (this.handleResponseInterceptor(rowsNoPaging)) {
				this.rowsNoPaging = rowsNoPaging?.data?.items;
				let res = ProductConst.listCard.filter(
					(card: any) => card.code !== ProductConst.CHUA_MO_BAN
				) as any[];

				const listDataSortStatus = this.rowsNoPaging.reduce(
					(res: any, value: any) => {
						value.productItemStatus = this.checkIsLockProductItem(value) ? ProductConst.KHOA_CAN : value.productItemStatus;
						//
						const findIndexExist = res.findIndex((e) => e.status + "" === value.productItemStatus + "");
						//
						if (findIndexExist >= 0) {
							res[findIndexExist].values.push(value);
						} else {
							res.push({
								status: value.productItemStatus,
								values: [value],
							});
						}
						//
						return res;
					},
					[]
				);

				if (listDataSortStatus.length) {
					res.forEach((e: any) => {
						e.quantity =
							listDataSortStatus.find(
								(data: any) => data.status + "" === e.code + ""
							)?.values?.length || 0;
					});
				}
				this.openSellService.listCard = res;
			}
		});
	}

	public get classIconSort() {
		return this.selectedSort.order < 0
			? "pi pi-sort-amount-down"
			: "pi pi-sort-amount-up";
	}

	public handleSort(event: any, key: string) {
		if (event) {
			if (key === "order") {
				this.selectedSort.order = this.selectedSort.order * -1;
			}
			this.sortData = [
				{
					field: this.selectedSort.field,
					order: this.selectedSort.order,
				},
			];
			this.setPage();
		}
	}

	public handleClickCard(product: any) {
		if (product) {
			this.detail(product.id);
		}
	}

	public get listCard() {
		return this.openSellService.listCard;
	}

	public get apiSetPage() {
		return this.openSellService.getAllProductItemNoPaging.bind(
			this.openSellService,
			this.openSellId
		);
	}

	public functionMapDataSetPage(item: any) {
		if (item) {
			const { productItem } = item;
			const findCard = ProductConst.listCard.find((card: any) => card.code === item.productItemStatus);
			if (findCard) {
				item.backgroundTopColor = findCard.backgroundColorFull;
				item.titleColor = findCard.numberColorFull;
			}
			item.hide = false;
			item.code = productItem.code;
			item.roomTypeName = ProductConst.getRoomTypeName(productItem.roomType);
			item.productLocationName = ProductConst.getLocationName(productItem.productLocation);
			item.doorDirection = productItem.doorDirection;
			item.priceAreaDisplay = this.formatCurrency(productItem.priceArea) + " m2";
			item.priceDisplay = this.formatCurrency(productItem.price);
			item.priceText = this.getPriceText(productItem.price);
		}
	}

	private getLastestProduct() {
		this.openSellService.lastestOpenSell(this.openSellId).subscribe((res: any) => {
			if (this.handleResponseInterceptor(res, "")) {
				if (res.data) {
					const { data } = res;
					this.openSellService.lastestProduct = {
						avatar: data.avatarImageUrl,
						fullName: data.fullName,
						productCode: data.productItemCode,
						tradingProviderName: data.tradingProviderName,
						time: data.expTimeDeposit,
						status: data.orderStatus,
					};
				}
			}
		});
	}

  public get lastestProduct() {
    return {
      ...this.openSellService.lastestProduct,
      colorProductCode:
        ProductConst.listCard.find(
          (card: any) => card.code === this.openSellService.lastestProduct?.status
        )?.numberColor || "",
    };
  }
}
