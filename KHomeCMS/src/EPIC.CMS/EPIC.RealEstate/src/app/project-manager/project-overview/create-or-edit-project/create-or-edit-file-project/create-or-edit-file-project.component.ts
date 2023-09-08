import { Component, Inject, Injector, Input } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CreateProjectFileComponent } from "./create-project-file/create-project-file.component";
import { ProjectFileService } from "@shared/services/project-file.service";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { AppConsts, FormNotificationConst, ProjectFileConst, ProjectPolicyConst, } from "@shared/AppConsts";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { DistributionService } from "@shared/services/distribution.service";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies-base";
import { AppUtilsService } from "@shared/services/utils.service";

@Component({
	selector: "create-or-edit-file-project",
	templateUrl: "./create-or-edit-file-project.component.html",
	styleUrls: ["./create-or-edit-file-project.component.scss"],
})
export class CreateOrEditFileProjectComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    public confirmationService: ConfirmationService,
    private _projectFileService: ProjectFileService,
    private _contractTemplateService: DistributionService,
    private _utilsService: AppUtilsService,
    private dialogService: DialogService,
    @Inject(API_BASE_URL) baseUrl?: string,
  ) {
    super(injector, messageService);
    this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
  }

  private baseUrl: string;

  public rows: {
    id: number;
    name: string;
    projectFileType: string;
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

  ProjectFileConst = ProjectFileConst;
  ProjectPolicyConst = ProjectPolicyConst;

  projectFile: any = {
    id: 0,
    projectId: 0,
    projectFileType: null,
    name: "",
    url: "",
    status: null,
  };

  filter: {
    keyword: string;
    type: number;
    status: string;
  } = {
    keyword: '',
    type: undefined,
    status: undefined,
  }


  @Input() projectId;

  
  ngOnInit() {
    this.setPage(this.getPageCurrentInfo());

    // Xử lý ẩn hiện cột trong bảng
    this.cols = [
      { field: 'name', header: 'Tên file', width: '20rem', isPin: true },
      { field: 'projectFileTypeDisplay', header: 'Loại hình', width: '12rem' },
      { field: 'url', header: 'File mô tả ', width: '30rem'},
      { field: 'columnResize', header: '', type:'hidden' },
    ];

    this.cols = this.cols.map((item, index) => {
      item.position = index + 1;
      return item;
    });

    this._selectedColumns = this.getLocalStorage("projectFileRst") ?? this.cols;

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
        this.setLocalStorage(this._selectedColumns, 'projectFileRst');
      }
    });
  }
  
  showData(rows) {
    for (let row of rows) {
      row.projectFileTypeDisplay = this.ProjectFileConst.getNameTypeFile(row.projectFileType);
    }
    console.log("row", rows);
  }

  getPageCurrentInfo() {
		return {page: this.page.pageNumber, rows: this.page.pageSize};
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this._projectFileService.findAll(this.page, this.projectId, this.filter).subscribe((res) => {
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
				this.isGranted([
					this.PermissionRealStateConst.RealStateProjectOverview_HoSo_CapNhat,
				])
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
				this.isGranted([
					this.PermissionRealStateConst.RealStateProjectOverview_HoSo_XemFile,
				])
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

			if (
				this.isGranted([
					this.PermissionRealStateConst.RealStateProjectOverview_HoSo_TaiXuong,
				])
			) {
				actions.push({
					data: projectItem,
					label: "Tải xuống",
					icon: "pi pi-download",
					command: ($event) => {
						this.downloadFile($event.item.data);
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_HoSo_DoiTrangThai])) {
				actions.push({
					data: projectItem,
					index: index,
					label: projectItem.status == ProjectPolicyConst.ACTIVE ? "Hủy kích hoạt" : "Kích hoạt",
					icon: projectItem.status == ProjectPolicyConst.ACTIVE ? "pi pi-lock" : "pi pi-lock-open",
					command: ($event) => {
						this.changeStatus($event.item.data);
					},
				});
			}

			if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_HoSo_Xoa])) {
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

	create(event: any) {
		if (event) {
			const ref = this.dialogService.open(CreateProjectFileComponent, {
				header: "Thêm mới hồ sơ dự án",
				width: "800px",
				data: {
					projectId: this.projectId,
				},
			});
			ref.onClose.subscribe((statusResponse) => {
				if (statusResponse) {
					this.setPage();
				}
			});
		}
	}

	edit(projectFile) {
		const ref = this.dialogService.open(CreateProjectFileComponent, {
			header: "Sửa hồ sơ dự án",
			width: "800px",
			data: {
				projectId: this.projectId,
				projectFile: projectFile,
				isEdit: true
			},
		});
		ref.onClose.subscribe((statusResponse) => {
			if (statusResponse) {
				this.setPage();
			}
		});
	}

	hideDialog() {
		this.modalDialogPDF = false;
		this.submitted = false;
	}

	resetProjectFile() {
		this.projectFile = {
			id: 0,
			projectId: 0,
			projectFileType: null,
			name: "",
			fileUrl: "",
			status: null,
		};
	}

	changeStatus(file) {
		this._projectFileService.changeStatus(file.id, file.status == ProjectPolicyConst.ACTIVE ? ProjectPolicyConst.DEACTIVE : ProjectPolicyConst.ACTIVE).subscribe(
			(res) => {
				if (
					this.handleResponseInterceptor(res, file.status == ProjectPolicyConst.ACTIVE ? "Hủy kích hoạt thành công" : "Kích hoạt thành công")
				) {
					this.setPage();
				}
			},
			(err) => {
				console.log("err----", err);
				this.messageError(AppConsts.messageError);
			}
		);
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
				this._projectFileService.delete(file.id).subscribe(
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

	downloadFile(file) {
		const url = this.baseUrl + "/" + file?.url;
		this._utilsService.makeDownload("", url);
	}

	viewFile(file) {
		const url =
			this.AppConsts.redicrectHrefOpenDocs + this.baseUrl + "/" + file?.url;
		this.urlfilePDF = "/" + file?.url;
		if (!file?.url) {
			this.messageError("Không có file hồ sơ");
		} else {
			if (this.utils.isPdfFile(file?.url)) {
				this._projectFileService.viewFilePDF(this.urlfilePDF + '&download=true').subscribe()
			} else {
				this.messageError("Hệ thống hiện tại chỉ hỗ trợ xem file PDF");
			}
		}
	}

	validForm(): boolean {
		return (
			this.projectFile?.projectFileType !== null &&
			this.projectFile?.name?.trim() &&
			this.projectFile?.url?.trim()
		);
	}

	public onChangeFilter(event: any) {
		event && this.setPage({ Page: this.offset });
	}
}
