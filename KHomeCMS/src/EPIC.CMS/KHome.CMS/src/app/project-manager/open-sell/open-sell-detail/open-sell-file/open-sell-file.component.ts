import { Component, Inject, Injector } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { 
	ActiveDeactiveConst,
	AppConsts,
	FormNotificationConst,
	MessageErrorConst,
	OpenSellFileConst,
	PermissionRealStateConst,
	ProjectFileConst,
	ProjectPolicyConst,
} from "@shared/AppConsts";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { DistributionService } from "@shared/services/distribution.service";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies-base";
import { AppUtilsService } from "@shared/services/utils.service";
import { ActivatedRoute } from "@angular/router";
import { OpenSellFileService } from "@shared/services/open-sell-file.service";
import { OpenSellFileDialogComponent } from "./open-sell-file-dialog/open-sell-file-dialog.component";

@Component({
	selector: "app-open-sell-file",
	templateUrl: "./open-sell-file.component.html",
	styleUrls: ["./open-sell-file.component.scss"],
})
export class OpenSellFileComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public confirmationService: ConfirmationService,
		private _openSellFileService: OpenSellFileService,
		private _contractTemplateService: DistributionService,
		private _utilsService: AppUtilsService,
		private dialogService: DialogService,
		private _routeActive: ActivatedRoute,
		@Inject(API_BASE_URL) baseUrl?: string
	) {
		super(injector, messageService);
		this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
		this.openSellId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("id")
		);
	}
	private baseUrl: string;
	openSellId: number;
	public rows: {
		id: number;
		name: string;
		openSellFileType: string;
		url: string;
		status: number;
	}[] = [];
	public isLoading: boolean;
	public page: Page;
	public listAction: any[] = [];
	modalDialog: boolean;
	modalDialogPDF: boolean;
	urlfilePDF: string;
	cols: any[];
	_selectedColumns: any[];
	fieldFilters = {
		keyword: "",
		type: null,
		status: null,
	};
	ProjectFileConst = ProjectFileConst;
	OpenSellFileConst = OpenSellFileConst;
	ProjectPolicyConst = ProjectPolicyConst;
	ActiveDeactiveConst = ActiveDeactiveConst;
	openSellFile: any = {
		id: 0,
		openSellId: 0,
		openSellFileType: null,
		name: "",
		url: "",
		status: null,
	};

	ngOnInit() {
		this.setPage({ page: this.offset });

		// Xử lý ẩn hiện cột trong bảng
		this.cols = [
			{ field: "name", header: "Tên file", width: "20rem", isPin: true },
			{ field: "openSellFileTypeDisplay", header: "Loại hình", width: "18rem" },
			{ field: "validTimeDisplay", header: "Ngày áp dụng", width: "18rem" },
			{ field: "url", header: "File mô tả ", width: "42rem" },
			{ field: "columnResize", header: "", type: "hidden" },
		];

		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});

		this._selectedColumns = this.getLocalStorage("openSellFile") ?? this.cols;
	}

	setColumn(col, _selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, "openSellFile");
			}
		});
	}

	public changeFilter(event: any) {
		if (event) {
			this.setPage({ page: this.offset });
		}
	}

	showData(rows) {
		for (let row of rows) {
			row.openSellFileTypeDisplay = OpenSellFileConst.getTypes(
				row.openSellFileType
			);
			row.validTimeDisplay = row?.validTime ? this.formatDate(row?.validTime) : "Luôn áp dụng";
		}
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this._openSellFileService
			.findAll(this.page, this.openSellId, this.fieldFilters)
			.subscribe((res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res)) {
					this.page.totalItems = res?.data?.totalItems;
					this.rows = res?.data?.items;
					if (this.rows?.length) {
						this.genListAction(this.rows);
						this.showData(this.rows);
					}
				}
			}),
			(err) => {
				this.isLoading = false;
				console.log("Error-------", err);
			};
	}

	public genListAction(data = []) {
		this.listAction = data.map((projectItem: any, index: number) => {
			const actions = [];

			if (
				this.isGranted([PermissionRealStateConst.RealStateMoBan_HoSo_ChinhSua])
			) {
				actions.push({
					data: projectItem,
					index: index,
					label: "Sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
			}

			if (
				this.isGranted([PermissionRealStateConst.RealStateMoBan_HoSo_XemFile])
			) {
				actions.push({
					data: projectItem,
					label: "Xem file",
					icon: "pi pi-eye",
					command: ($event) => {
						this.viewFile($event.item.data);
					},
				});
			}

			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_HoSo_Tai])) {
				actions.push({
					data: projectItem,
					label: "Tải xuống",
					icon: "pi pi-download",
					command: ($event) => {
						this.downloadFile($event.item.data);
					},
				});
			}

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateMoBan_HoSo_DoiTrangThai,
				])
			) {
				actions.push({
					data: projectItem,
					index: index,
					label:
						projectItem.status == ProjectPolicyConst.ACTIVE
							? "Hủy kích hoạt"
							: "Kích hoạt",
					icon:
						projectItem.status == ProjectPolicyConst.ACTIVE
							? "pi pi-lock"
							: "pi pi-lock-open",
					command: ($event) => {
						this.changeStatus($event.item.data);
					},
				});
			}

			if (
				this.isGranted([this.PermissionRealStateConst.RealStateMoBan_HoSo_Xoa])
			) {
				actions.push({
					data: projectItem,
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

	test(event: any) {}

	edit(openSellFile) {
		this.modalDialog = true;
		this.openSellFile = { ...openSellFile };
	}

	hideDialog() {
		this.modalDialog = false;
		this.modalDialogPDF = false;
		this.submitted = false;
	}

	resetProjectFile() {
		this.openSellFile = {
			id: 0,
			openSellId: 0,
			openSellFileType: null,
			name: "",
			fileUrl: "",
			status: null,
		};
	}

	changeStatus(file) {
		if (file.status == ProjectPolicyConst.ACTIVE) {
			this._openSellFileService
				.changeStatus(file.id, ProjectPolicyConst.DEACTIVE)
				.subscribe(
					(res) => {
						if (
							this.handleResponseInterceptor(res, "Hủy kích hoạt thành công")
						) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err----", err);
						this.messageError(AppConsts.messageError);
					}
				);
		} else if (file.status == ProjectPolicyConst.DEACTIVE) {
			this._openSellFileService
				.changeStatus(file.id, ProjectPolicyConst.ACTIVE)
				.subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Kích hoạt thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err----", err);
						this.messageError(AppConsts.messageError);
					}
				);
		}
	}

	delete(file) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: `Bạn có chắc chắn muốn xóa hồ sơ ${file.name}?`,
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this._openSellFileService.delete(file.id).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Xóa hồ sơ thành công")
						) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không xóa được hồ sơ ${file.name}`);
					}
				);
			} else {
			}
		});
	}

	create(event: any) {
		if (event) {
			const ref = this.dialogService.open(OpenSellFileDialogComponent, {
				header: "Thêm mới hồ sơ dự án",
				width: "800px",
				data: {
					openSellId: this.openSellId,
				},
			});
			ref.onClose.subscribe((statusResponse) => {
				if (statusResponse) {
					this.setPage();
				}
			});
		}
	}

	myUploader(event) {
		if (event?.files[0]) {
			this._contractTemplateService.uploadFileGetUrl(event?.files[0], "open-sell-file").subscribe((response) => {
			if (this.handleResponseInterceptor(response, "Upload thành công")) {
				this.openSellFile.url = response.data;
			}},
			(err) => {
				this.messageError("Có sự cố khi upload!");
			}
		);
		}
	}
	downloadFile(file) {
		const url = this.baseUrl + "/" + file?.url;
		this._utilsService.makeDownload("", url);
	}

	viewFile(file) {
		const url = this.AppConsts.redicrectHrefOpenDocs + this.baseUrl + "/" + file?.url;
		this.urlfilePDF = this.baseUrl + "/" + file?.url;
		if (!file?.url) {
			this.messageError("Không có file hồ sơ");
		} else {
			if (this.utils.isPdfFile(file?.url)) {
				this.modalDialogPDF = true;
			} else {
				this.messageError("Hệ thống hiện tại chỉ hỗ trợ xem file PDF");
			}
		}
	}

	save() {
		if (this.validForm()) {
			this.submitted = true;
			this.isLoading = true;
			this._openSellFileService.update(this.openSellFile).subscribe((res) => {
					if (this.handleResponseInterceptor(res, "Sửa thành công")) {
						this.setPage();
						this.hideDialog();
					}
				},
				(err) => {
					this.hideDialog();
					console.log("err---", err);
				}
			);
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	validForm(): boolean {
		return (
			this.openSellFile?.openSellFileType !== null &&
			this.openSellFile?.name?.trim() &&
			this.openSellFile?.url?.trim()
		);
	}
}
