import { Component, Injector, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormNotificationConst, IDropdown, IHeaderColumn, ProductConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProductService } from "@shared/services/product.service";
import { ProjectStructureService } from "@shared/services/project-structure.service";
import { SignalrService } from "@shared/services/signalr.service";
import { MessageService, SortMeta } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { Subscription, forkJoin } from "rxjs";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { CloneDepartmentDialogComponent } from "../../product-distribution/product-distribution-detail/product-list/clone-apartment-dialog/clone-department-dialog/clone-department-dialog.component";
import { LockApartmentDialogComponent } from "../../product-distribution/product-distribution-detail/product-list/lock-apartment-dialog/lock-apartment-dialog.component";
import { AddProductComponent } from "./add-product/add-product.component";

@Component({
	selector: "app-project-detail",
	templateUrl: "./project-detail.component.html",
	styleUrls: ["./project-detail.component.scss"],
})
export class ProjectDetailComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private router: Router,
		private _routeActive: ActivatedRoute,
		public productService: ProductService,
		private projectStructureService: ProjectStructureService,
		private _signalrService: SignalrService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Bảng hàng dự án", routerLink: "/project-manager/project-list" },
			{ label: "Chi tiết dự án" },
		]);
		//
		this.projectId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("projectId")
		);
	}

	projectId: number;

	ProductConst = ProductConst;
	YesNoConst = YesNoConst;
	rows = [];
	rowsNoPaging = [];
	isLoading: boolean;
	page: Page;
	listAction: any[] = [];
	selectedColumns: IHeaderColumn[] = [];
	headerColumns: IHeaderColumn[] = [];
	//
	sortModes: SortMeta[] = [];
	dataView = {
		grid: true,
		list: false,
	};
	//
	fieldFilters = {
		keyword: null,
		projectId: null,
		buildingDensityId: null,
		classifyType: null,
		status: null,
	};

	buildingDensitys = [];
	projects = [];
	fileExcel: any;

	productItemSubcription: Subscription;
	updateProductItemSubscription: Subscription;
	lastestItemSubcription: Subscription;
	public selectedSort: {
		field: string;
		order: number;
	} = {
		field: "",
		order: 1,
	};
	public listSortField: IDropdown[] = [];

	sortFields: string[];
	sortOrders: number[];
	sortData: any[] = [];

	ngOnInit(): void {
		this.subject.isSetPage.subscribe(() => {
			this.setPage();
		});
		this.headerColumns = [
			{
				field: "code",
				fieldSort: "Code",
				header: "Mã căn",
				width: "11rem",
				isPin: true,
			},
			{
				field: "name",
				fieldSort: "Name",
				header: "Tên căn",
				width: "11rem",
				isPin: true,
				isResize: true,
			},
			{
				field: "noFloor",
				fieldSort: "NoFloor",
				header: "Tầng số",
				width: "10rem",
			},
			{
				field: "roomTypeName",
				fieldSort: "RoomType",
				header: "Số phòng",
				width: "10rem",
			},
			{
				field: "productLocationName",
				fieldSort: "ProductLocation",
				header: "Vị trí căn",
				width: "10rem",
			},
			{
				field: "priceAreaDisplay",
				fieldSort: "PriceArea",
				header: "Diện tích",
				width: "10rem",
			},
			{
				field: "unitPriceDisplay",
				fieldSort: "UnitPrice",
				header: "Đơn giá",
				width: "10rem",
			},
			{
				field: "priceDisplay",
				fieldSort: "Price",
				header: "Giá bán",
				width: "10rem",
			},
			{
				field: "isLock",
				fieldSort: "IsLock",
				header: "Khóa căn - BH",
				width: "13rem",
				class: "justify-content-center",
			},
		].map((item: IHeaderColumn, index: number) => {
			item.position = index + 1;
			return item;
		});
		//
		this.selectedColumns =
			this.getLocalStorage("projectList") ?? this.headerColumns;
		//
		this.listSortField = this.headerColumns.reduce(
			(res: IDropdown[], value: IHeaderColumn) => {
				if (value.fieldSort && value.fieldSort.length) {
					res.push({
						code: value.fieldSort,
						name: value.header,
					} as IDropdown);
				}
				return res;
			},
			[]
		);
		this.listSortField.push({
			code: "Id",
			name: "ID",
		} as IDropdown);
		if (this.dataView["grid"] && this.listSortField.length) {
			this.selectedSort.field = this.listSortField[0].code.toString();
			this.sortData = [
				{
					field: this.selectedSort.field,
					order: this.selectedSort.order,
				},
			];
		}
		this.initData(this.projectId);
		this.setPage({ page: this.offset });
		this.getLastestProduct();
		//
		this._signalrService
			.startConnection()
			.then(() => {
				// Đổi trạng thái căn hộ
				this._signalrService.listenProductItemStatuses();
				this.productItemSubcription =
					this._signalrService.AllProductItemObservable.subscribe((res) => {
						this.rows = this.rows.map((row) => {
							if (row.id == res.productItemId) {
								row.status = res.status;
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
					});

				// Đổi điểm số lượng căn hộ theo trạng thái
				this._signalrService.listenUpdateCountProductItem();
				this.updateProductItemSubscription =
					this._signalrService.UpdateProductItemObservable.subscribe(
						(resCount) => {
							for (const key in resCount) {
								this.productService.listCard = this.productService.listCard.map(
									(card) => {
										if (card.countName == key && resCount[key] != null) {
											card.quantity = resCount[key];
											return card;
										} else {
											return card;
										}
									}
								);
							}
						}
					);

				// Đổi thông tin sản phẩm mới
				this._signalrService.listenUpdateLastestProductItem();
				this.lastestItemSubcription =
					this._signalrService.LastestProductItemObservable.subscribe((res) => {
						this.productService.lastestProduct = {
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
	}

	ngOnDestroy(): void {
		if (this.productItemSubcription)
			(<Subscription>this.productItemSubcription).unsubscribe();
		if (this.updateProductItemSubscription)
			(<Subscription>this.updateProductItemSubscription).unsubscribe();
	}

	@ViewChild("fubauto") fubauto: any;
	myUploader(event) {
		this.fileExcel = event?.files[0];
		if (this.fileExcel) {
			this.isLoading = true;
			this.productService
				.importFromExcel({ file: this.fileExcel, ProjectId: this.projectId })
				.subscribe(
					(response) => {
						this.fubauto.clear();
						if (
							this.handleResponseInterceptor(response, "Upload thành công!")
						) {
							this.setPage();
						}
					},
					(err) => {
						this.messageError("Có sự cố khi upload!");
					}
				)
				.add(() => {
					this.isLoading = false;
				});
		}
	}

	initData(projectId) {
		this.projectStructureService.getNodeLasts(projectId).subscribe((res) => {
			this.isLoading = false;
			if (res.status) this.buildingDensitys = res?.data;
		});
	}

	setItemQuantityClass() {
		if (this.screenWidth > 1000 && this.screenWidth <= 1200) return "items-s";
		if (this.screenWidth > 1200 && this.screenWidth <= 1500) return "items-m";
		if (this.screenWidth > 1500 && this.screenWidth <= 1920) return "items-l";
		if (this.screenWidth > 1920) return "items-xl";
		return "";
	}

	setData(rows = []) {
		for (let row of rows) {
			row.roomTypeName = ProductConst.getRoomTypeName(row.roomType);
			row.productLocationName = ProductConst.getLocationName(
				row.productLocation
			);
			row.priceAreaDisplay = this.formatCurrency(row.priceArea) + " m2";
			row.unitPriceDisplay = this.formatCurrency(row.unitPrice);
			row.priceDisplay = this.formatCurrency(row.price);
			row.priceText = this.getPriceText(row.price);
			row.isLock = row.isLock;
			row._isLock = row.isLock == YesNoConst.YES;
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
				this.setLocalStorage(this.selectedColumns, "projectList");
			}
		});
	}

	genListAction(data = []) {
		this.listAction = data.map((projectItem: any, index: number) => {
			const actions = [];
			//
			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateMenuProjectListDetail_ChiTiet,
				])
			) {
				actions.push({
					data: projectItem,
					label: "Thông tin chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data);
					},
				});
			}

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateMenuProjectListDetail_KhoaCan,
				])
			) {
				actions.push({
					data: projectItem,
					label:
						projectItem?.isLock == YesNoConst.YES ? "Mở khóa căn" : "Khóa căn",
					icon:
						projectItem?.isLock == YesNoConst.YES
							? "pi pi-lock-open"
							: "pi pi-lock",
					command: ($event) => {
						this.lockOrOpenLock($event.item.data);
					},
				});
			}

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateMenuProjectListDetail_NhanBan,
				])
			) {
				actions.push({
					data: projectItem,
					label: "Nhân bản",
					icon: "pi pi-clone",
					command: ($event) => {
						this.clone($event.item.data);
					},
				});
			}
			return actions;
		});
	}

	lockOrOpenLock(project) {
		if (project?.isLock == YesNoConst.NO) {
			const ref = this.dialogService.open(LockApartmentDialogComponent, {
				header: "Khoá căn hộ",
				width: "500px",
				data: {
					lockApartment: {
						typeCallApi: ProductConst.PROJECT_LIST,
						id: project.id,
					},
				},
			});
			ref.onClose.subscribe((statusResponse) => {
				if (statusResponse?.accept) {
					this.setPage();
				}
			});
		} else {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Mở khoá căn hộ",
				width: "600px",
				data: {
					title: `Xác nhận mở khoá căn hộ`,
					icon: FormNotificationConst.IMAGE_APPROVE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				console.log({ dataCallBack });
				if (dataCallBack?.accept) {
					let body = {
						id: project?.id,
						summary: "123",
					};
					this.productService.lock(body).subscribe(
						(response) => {
							if (
								this.handleResponseInterceptor(response, "Mở khoá thành công")
							) {
								this.setPage();
							}
						},
						(err) => {
							console.log("err____", err);
							this.messageError(`Không mở khoá thành công`);
						}
					);
				} else {
				}
			});
		}
	}

	clone(productItem) {
		const ref = this.dialogService.open(CloneDepartmentDialogComponent, {
			header: "Nhân bản thông tin sản phẩm",
			width: "800px",
			data: {
				productItem: productItem,
			},
		});
		ref.onClose.subscribe((res) => {
			if (res?.items?.length > 0) {
				let body = res;
				body.productItemId = productItem.id;
				this.productService.clone(body).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Nhân bản thành công")
						) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không nhân bản thành công`);
					}
				);
			}
		});
	}

	view(projectId) {
		this.router.navigate([
			"project-manager/project-overview/detail/" + this.cryptEncode(projectId),
		]);
	}

	detail(product) {
		this.router.navigate([
			`project-manager/project-list/detail/product-detail/${this.cryptEncode(
				product.id
			)}`,
		]);
	}

	edit(data) {}

	changeFilter(e) {
		this.setPage({ page: this.offset });
	}

	importTemplate() {
		this.isLoading = true;
		this.productService.importTemplate(this.projectId).subscribe(
			(res) => {
				this.isLoading = false;
				this.handleResponseInterceptor(res, "Tải file mẫu thành công");
			},
			(err) => {
				this.isLoading = false;
			}
		);
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.fieldFilters.keyword;
		forkJoin([
			this.productService.findAll(
				this.page,
				this.projectId,
				this.fieldFilters,
				this.sortData
			),
			this.productService.findAllPageSize(this.page, this.projectId),
		]).subscribe(
			([res, resNoPaging]) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(resNoPaging, "")) {
					this.rowsNoPaging = resNoPaging.data?.items.map((e: any) => {
						if (e?.isLock == YesNoConst.YES) {
							e._isLock = true;
						}
						const findCard = ProductConst.listCard.find(
							(card: any) => card.code === e.status
						);
						if (findCard) {
							e.backgroundTopColor = findCard.backgroundColorFull;
							e.titleColor = findCard.numberColorFull;
						}
						return e;
					});
				}

				if (this.handleResponseInterceptor(res, "")) {
					this.page.totalItems = res.data.totalItems;
					if (res.data?.items) {
						this.rows = res.data?.items.map((e: any) => {
							if (e?.isLock == YesNoConst.YES) {
								e._isLock = true;
								e.status = ProductConst.KHOA_CAN;
							}
							const findCard = ProductConst.listCard.find(
								(card: any) => card.code === e.status
							);
							if (findCard) {
								e.backgroundTopColor = findCard.backgroundColor;
								e.titleColor = findCard.numberColor;
							}
							e.hide = false;
							return e;
						});
						this.dataView["grid"] && this.getListCard();
					}
					if (this.rows?.length) {
						this.genListAction(this.rows);
						this.setData(this.rows);
					}
				}
			},
			(err) => {
				this.isLoading = false;
			}
		);
	}

	createProduct() {
		const ref = this.dialogService.open(AddProductComponent, {
			header: "Thêm sản phẩm",
			width: "1000px",
			style: { overflow: "hidden" },
			data: {
				projectId: this.projectId,
			},
		});
		//
		ref.onClose.subscribe((res) => {
			if (res?.id) {
				this.router.navigate([
					`project-manager/project-list/detail/product-detail/${this.cryptEncode(
						res.id
					)}`,
				]);
			}
		});
	}

	changeView(viewType: string) {
		// if (!this.dataView[viewType]) this.dataView[viewType] = true;
		for (const [key, value] of Object.entries(this.dataView)) {
			if (key != viewType) this.dataView[key] = false;
		}
	}

	private getListCard() {
		let res = ProductConst.listCard as any[];

		const listDataSortStatus = this.rowsNoPaging.reduce(
			(res: any, value: any) => {
				value.status =
					value?.isLock === YesNoConst.YES
						? ProductConst.KHOA_CAN
						: value.status;
				const findIndexExist = res.findIndex(
					(e) => e.status + "" === value.status + ""
				);
				if (findIndexExist >= 0) {
					res[findIndexExist].values.push(value);
				} else {
					res.push({
						status: value.status,
						values: [value],
					});
				}

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
		this.productService.listCard = res;
	}

	public onClickProduct(event: any, data: any) {
		if (event && data) {
			// this.detail(data);
		}
	}

	public get labelDataView() {
		return this.dataView["grid"]
			? "Dạng lưới"
			: this.dataView["list"]
			? "Dạng bảng"
			: "";
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

	public get classIconSort() {
		return this.selectedSort.order < 0
			? "pi pi-sort-amount-down"
			: "pi pi-sort-amount-up";
	}

	public handleClickCard(product: any) {
		if (product) {
			this.detail(product);
		}
	}

	public get listCard() {
		return this.productService.listCard;
	}

	public get apiSetPage() {
		return this.productService.findAllPageSize.bind(
			this.productService,
			undefined,
			this.projectId
		);
	}

  public get lastestProduct() {
    return {
      ...this.productService.lastestProduct,
      colorProductCode:
        ProductConst.listCard.find(
          (card: any) => card.code === this.productService.lastestProduct?.status
        )?.numberColor || "",
    };
  }

  public functionMapDataSetPage(item: any) {
	if (item) {
		if (item?.isLock == YesNoConst.YES) {
			item._isLock = true;
		}
		const findCard = ProductConst.listCard.find(
			(card: any) => card.code === item.status
		);
		if (findCard) {
			item.backgroundTopColor = findCard.backgroundColorFull;
			item.titleColor = findCard.numberColorFull;
		}
		item.hide = false;
		item.roomTypeName = ProductConst.getRoomTypeName(item.roomType);
		item.productLocationName = ProductConst.getLocationName(
			item.productLocation
		);
		item.priceAreaDisplay = this.formatCurrency(item.priceArea) + " m2";
		item.unitPriceDisplay = this.formatCurrency(item.unitPrice);
		item.priceDisplay = this.formatCurrency(item.price);
		item.priceText = this.getPriceText(item.price);
	}
}

	private getLastestProduct() {
		this.productService
			.lastestProductItem(this.projectId)
			.subscribe((res: any) => {
				if (this.handleResponseInterceptor(res, "")) {
					if (res.data) {
						const { data } = res;
						this.productService.lastestProduct = {
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

}
