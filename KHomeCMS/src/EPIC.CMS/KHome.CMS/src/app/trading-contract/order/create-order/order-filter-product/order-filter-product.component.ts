import { Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { AppConsts, FormNotificationConst, InvestorConst, OpenSellConst, OrderConst, ProjectStructureConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { OrderStepService } from "@shared/services/order-step-service";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { AddJointOwnerComponent } from "./add-joint-owner/add-joint-owner.component";
import { TradingProviderSelectedService } from "@shared/services/trading-provider.service";

@Component({
	selector: "app-order-filter-product",
	templateUrl: "./order-filter-product.component.html",
	styleUrls: ["./order-filter-product.component.scss"],
})
export class OrderFilterProductComponent extends CrudComponentBase {
	page = new Page();

	orderInfo: any = {
		projectId: null,
		openSellDetailId: null,
		keyword: null,
		listOfProducts: null,
		openSells: null,
	};
	jointOwnerInfo: any = {
		paymentOptionType: null,
		typeOfcontract: null,
	};
	openSells = [];
	policies = [];
	policyDetails = [];
	searchCustomer: any;
	jointOwners: any = [];
	distributionInfo: any = {};
	listOfProducts: any;
	OrderConst = OrderConst;
	InvestorConst = InvestorConst;
	AppConsts = AppConsts;
	product: any;
	customers: any[] = [];

	buildingDensitys = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		public OrderStepService: OrderStepService,
		private _orderService: OrderServiceProxy,
		private _projectServices: ProjectOverviewService,
		private router: Router,
		private _dialogService: DialogService,
		public confirmationService: ConfirmationService,
		private _tradingProviderSelectedService: TradingProviderSelectedService,
	) {
		super(injector, messageService);
	}

	ngOnInit() {
		this._tradingProviderSelectedService.TradingProviderObservable.subscribe(
			(change) => {
				this.changeTrading();
			}
		);
		if (!this.OrderStepService?.orderInfo?.cifCode) {
			this.router.navigate(["trading-contract/order/create/filter-customer"]);
		}
		//
		this.isLoadingPage = true;
		this._projectServices.getProjectByTrading().subscribe(
			(res) => {
				this.isLoadingPage = false;
				if (this.handleResponseInterceptor(res, "") && res?.data?.length) {
					this.orderInfo.openSells = res.data.reduce((res: any[], val: any) => {
						if (val.status !== OpenSellConst.TAM_DUNG) {
							res.push({
								...val,
								labelName: val?.code + " - " + val?.name,
							});
						}
						return res;
					}, []);
					this.setData();

					// } else {
					//   this.messageError('Không lấy được danh sách sản phẩm. Vui lòng thử lại sau!');
				}
			},
			(err) => {
				console.log("Error-------", err);
				this.isLoadingPage = false;
			}
		);
	}

	changeTrading() {
		this.isLoadingPage = true;
		this._projectServices.getProjectByTrading().subscribe(
			(res) => {
				this.isLoadingPage = false;
				if (this.handleResponseInterceptor(res, "") && res?.data?.length) {
					this.orderInfo.openSells = res.data.reduce((res: any[], val: any) => {
						if (val.status !== OpenSellConst.TAM_DUNG) {
							res.push({
								...val,
								labelName: val?.code + " - " + val?.name,
							});
						}
						return res;
					}, []);
					this.setData();

					// } else {
					//   this.messageError('Không lấy được danh sách sản phẩm. Vui lòng thử lại sau!');
				}
			},
			(err) => {
				console.log("Error-------", err);
				this.isLoadingPage = false;
			}
		);
	}

	dataProcessing(data) {
		const checkExist = this.jointOwners.some(
			(e) => data.idNo + "" === e.idNo + ""
		);
		if (!checkExist) {
			this.jointOwners.push(data);
		} else {
			this.messageError("Người sở hữu đã tồn tại.");
		}
	}

	addjointOwner(identification) {
		const ref = this._dialogService.open(AddJointOwnerComponent, {
			header: "Thêm đồng sở hữu",
			width: "800px",
			height: "90%",
		});
		//
		ref.onClose.subscribe((res) => {
			console.log("res_____", res);

			if (res) {
				this.dataProcessing(res);
			}
		});
	}

	removeElement(index) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa nguời đồng sở hữu này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			this.jointOwners.splice(index, 1);
		});
	}

	getInfoCustomer() {
		this._orderService.getInfoInvestorCustomer(this.searchCustomer).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "")) {
					this.customers = res?.data?.items;
					if (!this.customers.length) {
						this.messageError("Không tìm thấy dữ liệu");
					} else {
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

	clearData() {
		this.orderInfo.keyword = "";
		this.orderInfo.listOfProducts = null;
		this.product.isChoose = false;
		this.product = false;
	}

	isChoose(row) {
		row.isChoose = true;
		this.orderInfo.listOfProducts = [];
		this.orderInfo.listOfProducts.push(row);
		this.product = true;
		this.messageSuccess("Thêm dữ liệu sản phẩm thành công!");
	}

	getProduct() {
		if (this.orderInfo?.keyword?.trim() && this.orderInfo?.projectId) {
			let openSell = this.orderInfo.openSells.find(
				(o) => o.id == this.orderInfo.openSellId
			);
			this.isLoadingPage = true;
			this._orderService.findProduct(this.orderInfo).subscribe(
				(resProduct) => {
					this.isLoadingPage = false;
					if (
						this.handleResponseInterceptor(resProduct, "") &&
						resProduct?.data?.length
					) {
						this.orderInfo.listOfProducts = resProduct?.data?.map((item) => {
							item.buildingDensityName =
								ProjectStructureConst.getBuildingDensityTypeName(
									item?.productItem?.projectStructure?.buildingDensityType
								) +
								" " +
								item?.productItem?.projectStructure?.name;
							return item;
						});
						this.setData();
					} else {
						this.orderInfo.listOfProducts = [];
						this.messageError(
							"Không lấy được danh sách sản phẩm. Vui lòng thử lại sau!"
						);
					}
				},
				(err) => {
					console.log("Error-------", err);
					this.isLoadingPage = false;
				}
			);
		} else {
			this.messageError(
				this.orderInfo?.projectId
					? "Vui lòng nhập thông tin căn hộ!"
					: "Vui lòng chọn dự án!"
			);
		}
	}

	setData() {
		if (this.OrderStepService.orderInfo.productInfo) {
			this.jointOwnerInfo = this.OrderStepService?.orderInfo?.jointOwnerInfo;
			this.orderInfo = this.OrderStepService?.orderInfo?.productInfo;
			this.jointOwners =
				this.OrderStepService?.orderInfo?.jointOwnerInfo?.jointOwners;
		}
	}

	nextPage() {
		if (this.isValid()) {
			this.OrderStepService.orderInfo.productInfo = this.orderInfo;
			if (this.jointOwnerInfo) {
				this.jointOwnerInfo.jointOwners = this.jointOwners;
				this.OrderStepService.orderInfo.jointOwnerInfo = this.jointOwnerInfo;
			} else {
				this.messageError("Vui lòng nhập đủ thông tin!");
			}
			this.router.navigate(["/trading-contract/order/create/view"]);
		}
	}

	public isValid() {
		let res: boolean = true;
		if (
			this.orderInfo.listOfProducts &&
			this.jointOwnerInfo?.paymentOptionType &&
			this.jointOwnerInfo?.typeOfcontract
		) {
			res = true;
			if (
				this.jointOwnerInfo.typeOfcontract === OrderConst.DONG_SO_HUU &&
				(!this.jointOwners || !this.jointOwners.length)
			) {
				res = false;
				this.messageError("Vui lòng chọn thông tin người đồng sở hữu!");
			}
		} else {
			res = false;
			this.messageError("Vui lòng nhập đủ thông tin!");
		}
		return res;
	}

	prevPage() {
		this.router.navigate(["/trading-contract/order/create/filter-customer"]);
	}
}
