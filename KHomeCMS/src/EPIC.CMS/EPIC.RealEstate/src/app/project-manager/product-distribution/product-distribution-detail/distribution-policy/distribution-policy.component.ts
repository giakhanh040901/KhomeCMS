import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormNotificationConst, IActionTable, IDropdown, ProductDistributionConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionPolicyModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { ProductDistributionService } from "@shared/services/product-distribution.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreateDistributionPolicyDialogComponent } from "./create-distribution-policy-dialog/create-distribution-policy-dialog.component";

@Component({
	selector: "distribution-policy",
	templateUrl: "./distribution-policy.component.html",
	styleUrls: ["./distribution-policy.component.scss"],
})
export class DistributionPolicyComponent extends CrudComponentBase {
	public dataSource: DistributionPolicyModel[] = [];
	public page: Page = new Page();
	public listAction: IActionTable[][] = [];
	public listPolicy: IDropdown[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private dialogService: DialogService,
		private changeDetectorRef: ChangeDetectorRef,
		private productDistributionService: ProductDistributionService
	) {
		super(injector, messageService);
		this.distributionId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get("id"));
	}

	distributionId: number;

	public getStatusSeverity(code: string) {
		return ProductDistributionConst.getStatusActive(code, "severity");
	}

	public getStatusName(code: string) {
		return ProductDistributionConst.getStatusActive(code, "name");
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.productDistributionService.init();
		this.productDistributionService._listPolicy$.subscribe((res) => {
			if (res) this.listPolicy = res;
		});
		this.setPage({ page: this.offset });
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	public genListAction(data: DistributionPolicyModel[] = []) {
		this.listAction = data.map(
			(data: DistributionPolicyModel, index: number) => {
				const actions = [];

				if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_ChinhSach_ChiTiet])) {
					actions.push({
						data: data,
						index: index,
						label: "Xem chi tiết",
						icon: "pi pi-info-circle",
						command: ($event) => {
							this.view($event.item.data);
						},
					});
				}

				if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_ChinhSach_DoiTrangThai])) {
					if (data.status === ProductDistributionConst.DEACTIVE) {
						actions.push({
							data: data,
							label: "Kích hoạt",
							icon: "pi pi-arrow-circle-up",
							command: ($event) => {
								this.changeStatus($event.item.data);
							},
						});
					}
				}

				if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_ChinhSach_Xoa])) {
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
			}
		);
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = "";
		this.productDistributionService.getAllDistributionPolicy(this.page).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "")) {
					this.page.totalItems = res.data.totalItems;
					if (res?.data?.items && res?.data?.items?.length) {
						this.dataSource = res.data.items.map(
							(item: any) =>
								({
									id: item.id,
									code: item.code,
									name: item.name,
									typePay: ProductDistributionConst.listPayType.find((e: IDropdown) => e.code === item.paymentType).name || "",
									deposit: item?.depositValue <= 100 ? item.depositValue + "%" : item?.depositValue > 100 ? this.formatCurrency(item?.depositValue) : "",
									lock: item?.lockValue <= 100 ? item.lockValue + "%" : item?.lockValue > 100 ? this.formatCurrency(item?.lockValue) : "",
									status: item.status,
								} as DistributionPolicyModel)
						);
						this.genListAction(this.dataSource);
					} else {
						this.dataSource = [];
					}
				}
			},
			(err) => {
				this.isLoading = false;
			}
		);
	}

	public create(event: any) {
		if (event) {
			const ref = this.dialogService.open(
				CreateDistributionPolicyDialogComponent,
				{
					header: "Thêm chính sách",
					width: "800px",
					data: {
						listPolicy: this.listPolicy,
					},
				}
			);
			ref.onClose.subscribe((data: any) => {
				if (data) {
					this.messageSuccess("Thêm mới thành công");
					this.setPage({ page: this.offset });
				}
			});
		}
	}

	private view(data: any) {
		if (data) {
			this.productDistributionService.getDistributionPolicyDetail(data.id).subscribe((res) => {
				if (res.data) {
					const ref = this.dialogService.open(
						CreateDistributionPolicyDialogComponent,
						{
							header: "Thêm chính sách",
							width: "800px",
							data: {
								isView: true,
								dataSource: res.data,
							},
						}
					);
					ref.onClose.subscribe((data: any) => {
						if (data) {
							this.messageSuccess("Thêm mới thành công");
							this.setPage({ page: this.offset });
						}
					});
				}
			});
		}
	}

	private changeStatus(data: any) {
		if (data) {
			const textStatus = "Kích hoạt";
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: `Xác nhận ${textStatus} chính sách phân phối?`,
					icon: FormNotificationConst.IMAGE_APPROVE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this.productDistributionService.activePolicy(data.id, this.distributionId).subscribe((response) => {
						if (this.handleResponseInterceptor(response, `${textStatus} chính sách thành công`)) {
							this.setPage();
						}
					},
					(err) => {
						this.messageError(`Không xóa được chính sách`);
					}
				);
				}
			});
		}
	}

	private delete(data: any) {
		if (data) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: "Xác nhận xóa chính sách phân phối?",
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this.productDistributionService.deleteDistributionPolicy(data.id).subscribe((response) => {
						if (
							this.handleResponseInterceptor(
								response,
								"Xóa chính sách thành công"
							)
						) {
							this.setPage();
						}
					},
					(err) => {
						this.messageError(`Không xóa được chính sách`);
					}
				);
				}
			});
		}
	}

	public save(event: any) {
		if (event) {
		}
	}

	public get isCreate() {
		// check nếu như chưa có sản phẩm phân phối nào
		return !this.dataSource.length && this.page.getPageNumber() === 1;
	}
}
