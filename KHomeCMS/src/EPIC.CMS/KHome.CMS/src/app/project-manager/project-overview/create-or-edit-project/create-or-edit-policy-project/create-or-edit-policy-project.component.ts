import { Component, Injector, Input } from "@angular/core";
import { ActiveDeactiveConst, AppConsts, FormNotificationConst, IDropdown, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CreateOrEditPolicyProjectElementComponent } from "./create-or-edit-policy-project-element/create-or-edit-policy-project-element.component";
import { ProjectPolicyService } from "@shared/services/project-policy.service";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "create-or-edit-policy-project",
	templateUrl: "./create-or-edit-policy-project.component.html",
	styleUrls: ["./create-or-edit-policy-project.component.scss"],
})
export class CreateOrEditPolicyProjectComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    private dialogService: DialogService,
	  private _projectPolicyService: ProjectPolicyService,
    private _dialogService: DialogService,

  ) {
    super(injector, messageService);
  }


  public filter: {
    keyword: string;
    policyType: number | undefined;
    status: number | undefined;
  } = {
    keyword: "",
    policyType: undefined,
    status: undefined,
  };
  public policyTypes: IDropdown[] = [];
  public statuss: IDropdown[] = [];
  public isLoading: boolean;
  public page: Page;
  public listAction: any[] = [];

  ProjectPolicyConst = ProjectPolicyConst;

  rows: any[] = [];
  cols: any[];
  _selectedColumns: any[];


  @Input() projectId;

  ngOnInit() {    
    this.setPage({ page: this.offset });

    // Xử lý ẩn hiện cột trong bảng
    this.cols = [
      { field: 'code', header: 'Mã chính sách', width: '12rem', isPin: true },
      { field: 'name', header: 'Tên chính sách từ CĐT', minWidth: '20rem', isPin: true },
      { field: 'policyTypeDisplay', header: 'Loại chính sách', width: '15rem' },
      { field: 'sourceDisplay', header: 'Loại hình đặt cọc ', width: '11rem'},
			// { field: 'columnResize', header: '', type:'hidden' },
    ];

    this.cols = this.cols.map((item, index) => {
      item.position = index + 1;
      return item;
    });

    this._selectedColumns = this.getLocalStorage("projectPolicyRst") ?? this.cols;
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
        this.setLocalStorage(this._selectedColumns, 'projectPolicyRst');
      }
    });
  }

	public onChangeFilter(event: any, key: string) {
		this.setPage({ Page: this.offset });
	}

	genListAction(data = []) {
		this.listAction = data.map( (policy, index) => {
				const actions = [];

		if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChinhSach_CapNhat])) {
			actions.push({
			data: policy,
			index: index,
			label: "Sửa",
			icon: "pi pi-pencil",
			command: ($event) => {
				this.edit($event.item.data);
			},
			});
		}

		
		if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChinhSach_DoiTrangThai])) {
			actions.push({
			data: policy,
			index: index,
			label: policy.status == ProjectPolicyConst.ACTIVE ? "Khóa" : 'Kích hoạt',
			icon: policy.status == ProjectPolicyConst.ACTIVE ? "pi pi-lock" : "pi pi-lock-open",
			command: ($event) => {
				this.changeStatus($event.item.data);
			},
			});
		}

		
		if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChinhSach_Xoa])) {
			actions.push({
			data: policy,
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

	changeStatus(policy){
		this._projectPolicyService.changeStatus(policy.id).subscribe(
		(res) => {
			let message = "Kích hoạt thành công";
			if (policy.status == ActiveDeactiveConst.ACTIVE) message = "Hủy kích hoạt thành công";
			if (this.handleResponseInterceptor(res, message)) {
			this.setPage();
			}
			console.log(res);
			
		},(err) => {
			console.log("err----", err);
			this.messageError(AppConsts.messageError);
		}
		)
	}

	delete(policy) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: `Bạn có chắc chắn muốn xóa chính sách ${policy.name}?`,
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this._projectPolicyService.delete(policy.id).subscribe(
					(response) => {
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
						console.log("err____", err);
						this.messageError(`Không xóa được chính sách ${policy.name}`);
					}
				);
			} else {
			}
		});
	}

	edit(policy) {
		const ref = this.dialogService.open(
			CreateOrEditPolicyProjectElementComponent,
			{
				header: "Chỉnh sửa chính sách CĐT",
				width: "600px",
				data: {
					projectId: this.projectId,
					policyProject: policy,
				},
			}
		);
		ref.onClose.subscribe((statusResponse) => {
			if (statusResponse) {
				this.setPage();
			}
		});
	}

	showData(rows) {
		for (let row of rows) {
			row.policyTypeDisplay = this.ProjectPolicyConst.getNamePolicyType(
				row.policyType
			);
			row.sourceDisplay = this.ProjectPolicyConst.getSource(row.source);
		}
		console.log("row", rows);
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.filter.keyword;
		this._projectPolicyService
			.findAll(this.page, this.projectId, this.filter)
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

	public create(event: any) {
		if (event) {
			const ref = this.dialogService.open(
				CreateOrEditPolicyProjectElementComponent,
				{
					header: "Thêm mới chính sách ưu đãi từ CĐT",
					width: "600px",
					data: {
						projectId: this.projectId,
					},
				}
			);
			ref.onClose.subscribe((statusResponse) => {
				if (statusResponse) {
					this.setPage();
				}
			});
		}
	}
}
