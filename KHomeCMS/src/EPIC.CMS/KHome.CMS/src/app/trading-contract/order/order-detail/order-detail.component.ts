import { Component, Injector, ViewChild } from "@angular/core";
import { OrderConst, ProductConst, FormNotificationConst, InvestorConst, AppConsts, ProjectStructureConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { forkJoin } from "rxjs";
import { DialogService } from "primeng/dynamicdialog";
import { TabView } from "primeng/tabview";
import { OBJECT_ORDER } from "@shared/base-object";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FilterSaleComponent } from "./filter-sale/filter-sale.component";
import { AddJointOwnerComponent } from "../create-order/order-filter-product/add-joint-owner/add-joint-owner.component";
import { OrderViewImagesComponent } from "./order-view-images/order-view-images.component";

@Component({
	selector: "app-order-detail",
	templateUrl: "./order-detail.component.html",
	styleUrls: ["./order-detail.component.scss"],
})
export class OrderDetailComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private dialogService: DialogService,
		private _orderService: OrderServiceProxy,
		private breadcrumbService: BreadcrumbService,
		private router: Router,
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Sổ lệnh", routerLink: ["/trading-contract/order"] },
			{ label: "Chi tiết sổ lệnh" },
		]);
		this.orderId = +this.cryptDecode(
			this.routeActive.snapshot.paramMap.get("id")
		);
		this.isJustView = this.routeActive.snapshot.paramMap.get("isJustView");
	}

	/* Check isJustView */
	isJustView: string = null;

	orderUpdate = { ...OBJECT_ORDER.UPDATE };
	//
	orderDetail: any = {};
	orderDetailTemp: any = {};
	orderId: number;
	//
	openSells = [];
	productAdd: any = {
		openSellId: 0,
	};
	listOfProducts: any;
	policies = [];
	policyDetails = [];
	listBank = [];

	searchCustomer: any;
	distributionInfo: any = {};
	policyInfo: any = {};
	policyDetailInfo: any = {};
	customers: any[] = [];
	profitPolicyDetail: number;
	totalInvestment = 0;
	showDetail: boolean = true;
	isEdit = false;
	isEditAll = false;
	//
	labelButtonEdit = "Chỉnh sửa";
	//
	fieldUpdates = {
		productInfo: {
			isEdit: false,
			apiPath: "/api/garner/order/update/total-value",
			name: "productInfo",
			idHTML: "productInfo",
		},
		typeOfcontract: {
			isEdit: false,
			apiPath: "/api/real-estate/order/update/co-owner",
			name: "typeOfcontract",
			idHTML: "typeOfcontract",
		},
		paymentType: {
			isEdit: false,
			apiPath: "/api/real-estate/order/update/payment-type",
			name: "paymentType",
			messageRequired: "Vui lòng chọn hình thức thanh toán!",
			idHTML: "paymentType",
		},
		saleReferralCode: {
			isEdit: false,
			apiPath: "/api/garner/order/update/referral-code",
			name: "saleReferralCode",
			messageRequired: "Vui lòng nhập mã giới thiệu!",
			idHTML: "saleReferralCode",
		},
	};

	tabViewActive = {
		thongTinChung: true,
		thongTinThanhToan: false,
		chinhSachUuDai: false,
		HSKHDangKy: false,
		lichSu: false,
	};

	@ViewChild(TabView) tabView: TabView;

	ProductConst = ProductConst;
	OrderConst = OrderConst;
	TabView = TabView;
	InvestorConst = InvestorConst;
	AppConsts = AppConsts;

	ngOnInit() {
		this.isLoading = true;

		forkJoin([
			this._orderService.get(this.orderId),
			this._orderService.getOpenSell(),
		]).subscribe(
			([resOrder, resOpenSell]) => {
				this.isLoading = false;

				if (
					this.handleResponseInterceptor(resOpenSell, "") &&
					resOpenSell?.data?.items?.length
				) {
					this.openSells = resOpenSell.data.items.map((openSell) => {
						openSell.labelName =
							openSell?.project?.code + " - " + openSell?.project?.name;
						return openSell;
					});
				}

				if (this.handleResponseInterceptor(resOrder) && resOrder?.data) {
					this.handleDataOrderDetail(resOrder?.data);
					if (this.orderDetail?.investor?.listInvestorIdentification) {
						this.orderDetail.investor.listInvestorIdentification =
							this.orderDetail.investor.listInvestorIdentification.map(
								(item) => {
									item.idNoInfo = item.idNo + `(${item.idType})`;
									return item;
								}
							);
					}
					this.orderDetailTemp.typeOfcontract = this.orderDetailTemp
						?.rstOrderCoOwner?.length
						? OrderConst.DONG_SO_HUU
						: OrderConst.SO_HUU;
				}
			},
			(err) => {
				this.isLoading = false;
				console.log("Error-------", err);
			}
		);
	}

	showPopupAction(showDetail, jointOwner) {
		const ref = this.dialogService.open(OrderViewImagesComponent, {
			header: "Xem đồng sở hữu",
			width: "800px",
			height: "90%",
			data: {
				jointOwner: jointOwner,
			},
		});
		//
		ref.onClose.subscribe((res) => {});
	}

	showDetailAction(showDetail, jointOwner) {
		if (showDetail) {
			this.orderDetailTemp.rstOrderCoOwner =
				this.orderDetailTemp?.rstOrderCoOwner.map((item) => {
					if (item?.idNo === jointOwner?.idNo) {
						item.isShow = true;
					}
					return item;
				});
		} else if (!showDetail) {
			this.orderDetailTemp.rstOrderCoOwner =
				this.orderDetailTemp?.rstOrderCoOwner.map((item) => {
					if (item?.idNo === jointOwner?.idNo) {
						item.isShow = false;
					}
					return item;
				});
		}
		console.log("item____", this.orderDetailTemp.rstOrderCoOwner);
	}

	changeTypeContract() {
		if (this.orderDetailTemp.typeOfcontract == OrderConst.SO_HUU) {
			this.orderDetailTemp.rstOrderCoOwner = [];
		}
	}

	removeElement(index, jointOwner) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa nguời đồng sở hữu này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log("dataCallBack", jointOwner);

			if (dataCallBack?.accept) {
				if (
					this.orderDetailTemp.status == OrderConst.KHOI_TAO ||
					this.orderDetailTemp.status == OrderConst.CHO_THANH_TOAN
				) {
					if (
						this.orderDetailTemp?.rstOrderCoOwner?.length > 1 ||
						this.orderDetailTemp.typeOfcontract != OrderConst.DONG_SO_HUU
					) {
						this._orderService
							.deleteCoOwner(jointOwner.id, this.orderId)
							.subscribe(
								(res) => {
									this.isLoading = false;
									if (
										this.handleResponseInterceptor(
											res,
											"Xóa đồng sở hữu thành công!"
										)
									) {
										this.getOrderDetail();
									}
								},
								(err) => {
									this.isLoading = false;
								}
							);
					} else {
						this.messageError(
							"Người đồng sở hữu phải có ít nhất 1 người! (FE)"
						);
					}
				} else {
					if (
						this.orderDetailTemp?.rstOrderCoOwner?.length > 1 ||
						this.orderDetailTemp.typeOfcontract != OrderConst.DONG_SO_HUU
					) {
						this.orderDetailTemp?.rstOrderCoOwner.splice(index, 1);
						this.messageSuccess("Sửa dữ liệu sản phẩm thành công!(FE)");
					} else {
						this.messageError(
							"Người đồng sở hữu phải có ít nhất 1 người! (FE)"
						);
					}
				}

				// this.orderDetailTemp?.rstOrderCoOwner?.length > 1 ?
				//     this.orderDetailTemp?.rstOrderCoOwner.splice(index, 1) && this.messageSuccess('Sửa dữ liệu sản phẩm thành công!(FE)') : this.messageError('Người đồng sở hữu phải có ít nhất 1 người! (FE)');
			}
		});
	}

	addjointOwner(identification) {
		const ref = this.dialogService.open(AddJointOwnerComponent, {
			header: "Thêm đồng sở hữu",
			width: "800px",
			height: "90%",
			data: {},
		});
		//
		ref.onClose.subscribe((res) => {
			if (res) {
				let body = { ...res, orderId: this.orderId };
				this._orderService.addCoOwner(body).subscribe(
					(res) => {
						this.isLoading = false;
						if (
							this.handleResponseInterceptor(
								res,
								"Thêm đồng sở hữu thành công!"
							)
						) {
							this.getOrderDetail();
						}
					},
					(err) => {
						this.isLoading = false;
					}
				);
				this.dataProcessing(res);
			}
		});
	}

	dataProcessing(data) {
		this.orderDetailTemp?.rstOrderCoOwner.push(data);
		for (let jointOwner of this.orderDetailTemp?.rstOrderCoOwner) {
			jointOwner.isShow = true;
		}
	}

	getInfoCustomer() {
		this._orderService.getInfoInvestorCustomer(this.searchCustomer).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "")) {
					this.customers = res?.data?.items?.map((item) => ({
						...item,
						defaultIdentification: item?.defaultIdentification?.id
							? {
									...item.defaultIdentification,
									investorIdenId: item.defaultIdentification.id,
									id: null,
									orderId: this.orderId,
							  }
							: { ...item.defaultIdentification, orderId: this.orderId },
					}));

					if (!this.customers.length) {
						this.messageError("Không tìm thấy dữ liệu");
					} else {
						if (
							this.orderDetailTemp.status == OrderConst.KHOI_TAO ||
							this.orderDetailTemp.status == OrderConst.CHO_THANH_TOAN
						) {
							this._orderService
								.addCoOwner(this.customers[0].defaultIdentification)
								.subscribe(
									(res) => {
										this.isLoading = false;
										if (
											this.handleResponseInterceptor(
												res,
												"Thêm đồng sở hữu thành công!"
											)
										) {
											this.getOrderDetail();
										}
									},
									(err) => {
										this.isLoading = false;
									}
								);
						}
						this.dataProcessing(this.customers[0].defaultIdentification);
						this.searchCustomer = "";
					}
				}
			},
			(err) => {
				console.log("Error-------", err);
				this.isLoading = false;
			}
		);
	}

	isChoose(row) {
		this.listOfProducts = [];
		row.isChoose = true;
		this.listOfProducts.push(row);
		row.sellingPolicyTemp = row?.sellingPolicy[0];
		this.orderDetail = { ...row };
	}

	clearData() {
		this.productAdd.keyword = "";
		this.listOfProducts = null;
		this.orderDetail = this.orderDetailTemp;
	}

	getProduct() {
		// this.isLoadingPage = true;
		this._orderService.getProduct(this.productAdd).subscribe(
			(res) => {
				//   this.isLoadingPage = false;
				if (
					this.handleResponseInterceptor(res, "") &&
					res?.data?.items?.length
				) {
					this.listOfProducts = res.data.items.map((item) => {
						item.buildingDensityName =
							ProjectStructureConst.getBuildingDensityTypeName(
								item?.productItem?.projectStructure?.buildingDensityType
							) +
							" " +
							item?.productItem?.projectStructure?.name;
						return item;
					});
				} else {
					this.messageError(
						"Không lấy được danh sách sản phẩm. Vui lòng thử lại sau!"
					);
				}
			},
			(err) => {
				console.log("Error-------", err);
				//   this.isLoadingPage = false;
			}
		);
	}

	changeTab(e) {
		let tabHeader = this.tabView.tabs[e.index].header;
		this.tabViewActive[tabHeader] = true;
		if (tabHeader != "lichSu") {
			this.tabViewActive.lichSu = false;
		}
	}

	getOrderDetail(isLoading = true) {
		this.isLoading = isLoading;
		this._orderService.get(this.orderId).subscribe(
			(resOrder) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(resOrder, "") && resOrder?.data) {
					this.handleDataOrderDetail(resOrder?.data);
				} else {
					this.isLoading = false;
				}
			},
			(err) => {
				this.isLoading = false;
			}
		);
	}

	handleDataOrderDetail(orderDetail) {
		this.orderDetail = orderDetail;
		this.orderDetail.buildingDensityName =
			ProjectStructureConst.getBuildingDensityTypeName(
				this.orderDetail?.productItem?.projectStructure?.buildingDensityType
			) +
			" " +
			this.orderDetail?.productItem?.projectStructure?.name;
		//
		this.orderDetailTemp = this.orderDetail;
		//

		this.orderDetailTemp.typeOfcontract = this.orderDetailTemp?.rstOrderCoOwner
			?.length
			? OrderConst.DONG_SO_HUU
			: OrderConst.SO_HUU;
		if (this.orderDetail?.investor?.listInvestorIdentification) {
			this.orderDetail.investor.listInvestorIdentification =
				this.orderDetail.investor.listInvestorIdentification.map((item) => {
					item.idNoInfo = item.idNo + `(${item.idType})`;
					return item;
				});
		}
	}

	deleteOrder() {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa sổ lệnh này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this._orderService.delete(this.orderId).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Xóa sổ lệnh thành công")
						) {
							this.router.navigate(["/trading-contract/order"]);
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không xóa được sổ lệnh`);
					}
				);
			} else {
			}
		});
	}

	searchSale() {
		if (this.isEdit || this.fieldUpdates.saleReferralCode.isEdit) {
			const ref = this.dialogService.open(FilterSaleComponent, {
				header: "Tìm kiếm sale",
				width: "1000px",
			});

			ref.onClose.subscribe((sale) => {
				if (sale) {
					this.orderDetailTemp.sale = { ...sale };
					this.orderDetailTemp.saleReferralCode = sale?.referralCode;
				}
			});
		}
	}
	//
	resetStatusFieldUpdates() {
		for (const [key, value] of Object.entries(this.fieldUpdates)) {
			this.fieldUpdates[key].isEdit = false;
		}
	}

	setStatusEdit() {
		this.isEdit = !this.isEdit;
		this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
		this.productAdd.openSellId = this.orderDetail.openSellId;
		this.productAdd.keyword = this.orderDetail?.productItem?.code
			? this.orderDetail?.productItem?.code
			: "";
		this.getProduct();
		// this.editorConfig.editable = this.isEdit;
		this.formatCurrency;
	}

	getBody() {
		let body = {
			...this.filterField(this.orderDetailTemp, this.orderUpdate),
			openSellDetailId:
				this.orderDetail.id && this.orderDetailTemp.openSellDetailId
					? this.orderDetailTemp.openSellDetailId
					: this.orderDetail.id,
			rstOrderCoOwners: this.orderDetailTemp?.rstOrderCoOwner,
			investorIdenId: this.orderDetailTemp?.investorIdenId,
			paymentType: this.orderDetailTemp.paymentType,
		};

		return body;
	}

	changeEdit() {
		this.isLoading = false;
		if (this.isEdit) {
			let body = this.getBody();
			this._orderService.update(body).subscribe((response) => {
				if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
					this.setStatusEdit();
					this.getOrderDetail();
				}
			});
		} else {
			this.setStatusEdit();
		}
	}

	resetStatusEditFieldUpdates() {
		for (const [key, value] of Object.entries(this.fieldUpdates)) {
			this.fieldUpdates[key].isEdit = false;
		}
	}

	public get routerBackLink() {
		return this._orderService.previousUrl
			? this._orderService.previousUrl
			: "/trading-contract/order";
	}

	updateInfoContactCustomer() {
		if (this.fieldUpdates.typeOfcontract.isEdit) {
			let body = {
				orderId: this.orderDetail.id,
				orderCoOwners: this.orderDetailTemp.rstOrderCoOwner,
			};
			this._orderService
				.updateInfoContactCustomer(body)
				.subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
						this.resetStatusFieldUpdates();
						this.tabViewActive.lichSu = false;
					}
				});
		} else {
			this.fieldUpdates.typeOfcontract.isEdit = true;
			const focus = document.getElementById("typeOfcontract");
			focus.scrollIntoView({ behavior: "smooth" });
		}
	}

	updateInfoProduct() {
		if (this.fieldUpdates.productInfo.isEdit) {
			let body = {
				orderId: this.orderDetail.id,
				investorBankAccId: this.orderDetail.investorBankAccId,
				contractAddressId: this.orderDetail.contractAddressId,
				investorIdenId: this.orderDetail.investorIdenId,
			};
			//
			this._orderService
				.updateInfoContactCustomer(body)
				.subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
						this.resetStatusFieldUpdates();
						this.tabViewActive.lichSu = false;
					}
				});
		} else {
			this.fieldUpdates.productInfo.isEdit = true;
			const focus = document.getElementById("productInfo");
			focus.scrollIntoView({ behavior: "smooth" });
			this.productAdd.openSellId = this.orderDetail.openSellId;
			this.productAdd.keyword = this.orderDetail?.productItem?.code
				? this.orderDetail?.productItem?.code
				: "";
			this.getProduct();
			// this.editorConfig.editable = this.isEdit;
			this.formatCurrency;
		}
	}

	updateField(field) {
		if (this.fieldUpdates[field].isEdit) {
			if (this.orderDetail[this.fieldUpdates[field].name]) {
				this._orderService
					.updateField(this.orderDetail, this.fieldUpdates[field])
					.subscribe((response) => {
						if (
							this.handleResponseInterceptor(response, "Cập nhật thành công")
						) {
							//   this.init(true);
							this.resetStatusFieldUpdates();
							this.tabViewActive.lichSu = false;
						}
					});
			} else {
				this.messageError(this.fieldUpdates[field].messageRequired);
			}
		} else {
			const focus = document.getElementById(this.fieldUpdates[field].idHTML);
			focus.scrollIntoView({ behavior: "smooth" });
			//
			this.resetStatusFieldUpdates();
			this.fieldUpdates[field].isEdit = true;
		}
	}
}
