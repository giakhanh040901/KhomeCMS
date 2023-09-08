import { Component, Injector, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActiveDeactiveConst, ContractFormConst, DistributionContractTemplateConst, FormNotificationConst, IDropdown, KeyFilter, 
	PermissionRealStateConst, SampleContractConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OpenSellContractService } from "@shared/services/open-sell-contract.service";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { OpenSellContractDialogComponent } from "./open-sell-contract-dialog/open-sell-contract-dialog.component";

@Component({
	selector: "app-open-sell-contract",
	templateUrl: "./open-sell-contract.component.html",
	styleUrls: ["./open-sell-contract.component.scss"],
})
export class OpenSellContractComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _routeActive: ActivatedRoute,
		private _openSellContractService: OpenSellContractService,
		private dialogService: DialogService,
	) {
		super(injector, messageService);
		this.openSellId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("id")
		);
	}
	@Input() openSellId: number;
	ref: DynamicDialogRef;

	confirmRequestDialog: boolean = false;
	rows: any[] = [];
	policyList: any;
	list: any = {};

	YesNoConst = YesNoConst;
	KeyFilter = KeyFilter;
	ContractFormConst = ContractFormConst;
	DistributionContractTemplateConst = DistributionContractTemplateConst;
	SampleContractConst = SampleContractConst;
	ActiveDeactiveConst = ActiveDeactiveConst;

	investorBank: any = {};
	banks: any = {};
	submitted: boolean;

	isDetail = false;
	actions: any[] = [];
	bankFullName: any = {};

	page = new Page();
	offset = 0;

	fieldFilters = {
		keyword: "",
		contractType: undefined,
		status: undefined,
	};

	public listContractType: IDropdown[] = [];
	public get listStatus() {
		return SampleContractConst.statusFilters;
	}

	ngOnInit(): void {
		this.listContractType = SampleContractConst.contractType as IDropdown[];
		this.setPage();
	}

	genListAction(data = []) {
		this.actions = data.map((item) => {
			const action = [];

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_MauBieu_ChinhSua])) {
				action.push({
					data: item,
					label: "Chỉnh sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
			}

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_MauBieu_DoiTrangThai])) {
				action.push({
					data: item,
					label:
						item.status == ActiveDeactiveConst.ACTIVE ? "Khóa" : "Kích hoạt",
					icon:
						item.status == ActiveDeactiveConst.ACTIVE
							? "pi pi-times-circle"
							: "pi pi-check-circle",
					command: ($event) => {
						this.changeStatus($event.item.data);
					},
				});
			}

			// if (true) {
			//   action.push({
			//     data: item,
			//     label: "Xóa",
			//     icon: "pi pi-trash",
			//     command: ($event) => {
			//       this.delete($event.item.data);
			//     },
			//   });
			// }
			return action;
		});
	}

	delete(item) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa mẫu hợp đồng này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {});
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.fieldFilters.keyword;
		this.isLoading = true;
		this._openSellContractService
			.findAll(this.page, this.openSellId, this.fieldFilters)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.page.totalItems = res.data.totalItems;
						this.rows = res?.data?.items;
						this.genListAction(this.rows);
					}
				},
				() => {
					this.isLoading = false;
				}
			);
	}

	genContractCodeStructure(configContractCodeDetails = []) {
		let contractCodeStructure = "";
		if (configContractCodeDetails?.length) {
			configContractCodeDetails.forEach((element) => {
				contractCodeStructure +=
					"<" + (element?.value ? element.value : element?.key) + ">";
			});
		}
		//
		return contractCodeStructure;
	}

	create() {
		const ref = this.dialogService.open(OpenSellContractDialogComponent, {
			header: "Thêm mới mẫu biểu đặt cọc",
			width: "800px",
			data: {
				openSellId: this.openSellId,
			},
		});
		//
		ref.onClose.subscribe((res) => {
			this.setPage();
		});
	}

	edit(row) {
		const ref = this.dialogService.open(OpenSellContractDialogComponent, {
			header: "Cập nhật mẫu biểu đặt cọc",
			width: "800px",
			data: {
				openSellId: this.openSellId,
				depositForm: row,
			},
		});
		//
		ref.onClose.subscribe((res) => {
			this.setPage();
		});
	}

	changeStatus(row) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "400px",
			data: {
				title:
					row.status == ActiveDeactiveConst.ACTIVE
						? "Bạn có chắc muốn khóa mẫu biểu này ?"
						: "Bạn có chắc muốn kích hoạt mẫu biểu này ?",
				icon:
					row.status == ActiveDeactiveConst.ACTIVE
						? FormNotificationConst.IMAGE_CLOSE
						: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this._openSellContractService.updateStatus(row).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Cập nhật thành công")
						) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
					}
				);
			}
		});
	}
}
