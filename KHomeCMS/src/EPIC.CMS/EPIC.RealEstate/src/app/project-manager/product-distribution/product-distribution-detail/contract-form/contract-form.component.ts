import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { FormNotificationConst, IActionTable, IDropdown, ProductDistributionConst, SampleContractConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ContractFormModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { ProductDistributionService } from "@shared/services/product-distribution.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreateOrEditContractFormDialogComponent } from "./create-or-edit-contract-form-dialog/create-or-edit-contract-form-dialog.component";

@Component({
	selector: "contract-form",
	templateUrl: "./contract-form.component.html",
	styleUrls: ["./contract-form.component.scss"],
})
export class ContractFormComponent extends CrudComponentBase {
	public dataSource: ContractFormModel[] = [];
	public page: Page = new Page();
	public listAction: IActionTable[][] = [];
	private listContractForm: IDropdown[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private changeDetectorRef: ChangeDetectorRef,
		private productDistributionService: ProductDistributionService
	) {
		super(injector, messageService);
	}

	public getStatusSeverity(code: string) {
		return ProductDistributionConst.getStatusActive(code, "severity");
	}

	public getStatusName(code: string) {
		return ProductDistributionConst.getStatusActive(code, "name");
	}

	public get listContractType() {
		return SampleContractConst.contractType;
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.productDistributionService.init();
		this.productDistributionService._listContractFormCode$.subscribe((res) => {
			if (res) {
				this.listContractForm = res;
			}
			this.setPage({ page: this.offset });
		});
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	public genListAction(data: ContractFormModel[] = []) {
		this.listAction = data.map((data: ContractFormModel, index: number) => {
			const actions = [];

			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_MauBieu_XuatWord])) {
				actions.push({
					data: data,
					index: index,
					label: "Xuất mẫu Word",
					icon: "pi pi-info",
					command: ($event) => {
						this.downloadFile($event.item.data, "word");
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_MauBieu_XuatPdf])) {
				actions.push({
					data: data,
					index: index,
					label: "Xuất mẫu PDF",
					icon: "pi pi-info",
					command: ($event) => {
						this.downloadFile($event.item.data, "pdf");
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_MauBieu_ChinhSua])) {
				actions.push({
					data: data,
					label: "Chỉnh sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStatePhanPhoi_MauBieu_DoiTrangThai])) {
				actions.push({
					data: data,
					label: "Tạm dừng",
					icon: "pi pi-stop-circle",
					command: ($event) => {
						this.stop($event.item.data);
					},
				});
			}
			return actions;
		});
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.productDistributionService.getAllContractForm(this.page).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, "")) {
				this.page.totalItems = res.data.totalItems;
				if (res.data?.items && res.data?.items?.length) {
					this.dataSource = res.data.items.map(
						(item: any) =>
							({
								id: item.id,
								name: item.contractTemplateTempName,
								structure:
									this.listContractForm.find(
										(e: IDropdown) => e.code === item.configContractCodeId
									)?.name || "",
								type:
									this.listContractType.find(
										(e: IDropdown) => e.code === item.contractType
									)?.name || "",
								policy: item.distributionPolicyName,
								status: item.status,
							} as ContractFormModel)
					);
					this.genListAction(this.dataSource);
				} else {
					this.dataSource = [];
				}
			}
		},
		(err) => {
			this.isLoading = false;
		});
	}

	public create(event: any) {
		if (event) {
			const ref = this.dialogService.open(
				CreateOrEditContractFormDialogComponent,
				{
					header: "Thêm mới mẫu hợp đồng",
					width: "800px",
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

  private downloadFile(data: any, key: string) {
    if (data) {
      this.isLoading = false;
      this.productDistributionService.downloadFile(data.id, key).subscribe(
        (res) => {
          this.isLoading = false;
          this.handleResponseInterceptor(res);
        },
        () => {
          this.isLoading = false;
        }
      );
    }
  }

	private edit(data: any) {
		if (data) {
			this.productDistributionService.getContractFormDetail(data.id).subscribe((res: any) => {
				if (res?.data) {
					const ref = this.dialogService.open(
						CreateOrEditContractFormDialogComponent,
						{
							header: "Chỉnh sửa mẫu hợp đồng",
							width: "800px",
							data: {
								dataSource: res.data,
							},
						}
					);
					ref.onClose.subscribe((data: any) => {
						if (data) {
							this.messageSuccess("Chỉnh sửa thành công")

							this.setPage();
						}
					});
				}
			});
		}
	}

	private stop(data: any) {
		if (data) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: "Bạn có chắc chắn muốn hủy kích hoạt hợp đồng này?",
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this.productDistributionService.cancelActiveContractForm(data.id).subscribe(
							(response) => {
								if (this.handleResponseInterceptor(response, "Hủy kích hoạt thành công")) {
									this.setPage();
								}
							},
							(err) => {
								this.messageError(`Không thể hủy kích hoạt`);
							}
						);
				}
			});
		}
	}
}
