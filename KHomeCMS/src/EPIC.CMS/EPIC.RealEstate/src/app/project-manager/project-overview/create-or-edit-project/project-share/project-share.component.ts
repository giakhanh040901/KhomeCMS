import { Component, Injector, Input } from "@angular/core";
import { ActiveDeactiveConst, AppConsts, FormNotificationConst, ProjectShareConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProjectShareService } from "@shared/services/project-share.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { CreateOrEditProjectShareComponent } from "./create-or-edit-project-share/create-or-edit-project-share.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
  selector: "app-project-share",
  templateUrl: "./project-share.component.html",
  styleUrls: ["./project-share.component.scss"],
})
export class ProjectShareComponent extends CrudComponentBase {
	constructor(
		injector: Injector, 
		messageService: MessageService,
		private _dialogService: DialogService,
		private _projectShareService: ProjectShareService,
	) {
		super(injector, messageService);
	}

	ActiveDeactiveConst = ActiveDeactiveConst;
	ProjectShareConst = ProjectShareConst;
	public filter: {
		keyword: string;
		status: number | undefined;
	} = {
		keyword: "",
		status: undefined,
	};
	
	public isLoading: boolean;
	public page: Page;
	public listAction: any[] = [];

	rows: any[] = [];
	cols: any[];
	_selectedColumns: any[];

	@Input() projectId;

	ngOnInit(): void {
		this.setPage({ page: this.offset });
    	// Xử lý ẩn hiện cột trong bảng
		this.cols = [
			{ field: 'title', header: 'Tiêu đề', width: '18rem', isPin: true, cutText: 'b-cut-text-18' },
			{ field: 'createdDateDisplay', header: 'Ngày đăng', minWidth: '8rem', isPin: true },
			{ field: 'createdBy', header: 'Người đăng', width: '12rem', cutText: 'b-cut-text-12' },
			{ field: 'overviewContent', header: 'Nội dung', width: '26rem', cutText: 'b-cut-text-26'},
			{ field: 'columnResize', header: '', type:'hidden' },
		];

		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		  });
	  
		  this._selectedColumns = this.getLocalStorage("projectShareRst") ?? this.cols;
	}

	setColumn(col, _selectedColumns) {
		const ref = this._dialogService.open(
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

	genListAction(data = []) {
		this.listAction = data.map( (item, index) => {
			const actions = [];
			actions.push({
				data: item,
				label: "Chi tiết",
				icon: "pi pi-info-circle",
				command: ($event) => {
					this.detail($event.item.data);
				},
			});

			if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChiaSeDuAn_CapNhat])) {
				actions.push({
					data: item,
					index: index,
					label: "Sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
		  	}
		  
		  	if (item.status == ActiveDeactiveConst.ACTIVE || item.status == ActiveDeactiveConst.DEACTIVE && this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChiaSeDuAn_DoiTrangThai])) {
				actions.push({
					data: item,
					index: index,
					label: item.status == ActiveDeactiveConst.ACTIVE ? "Hủy kích hoạt" : 'Kích hoạt',
					icon: item.status == ActiveDeactiveConst.ACTIVE ? "pi pi-lock" : "pi pi-check-circle",
					command: ($event) => {
						this.changeStatus($event.item.data);
					},
				});
		  	}
	
		  	if (this.isGranted([this.PermissionRealStateConst.RealStateProjectOverview_ChiaSeDuAn_Xoa])) {
				actions.push({
					data: item,
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

	detail(item) {
		const ref = this._dialogService.open(CreateOrEditProjectShareComponent, {
			header: "Chi tiết chia sẻ dự án",
			width: '1000px',
			data: {
			  projectId: this.projectId,
			  item: item,
			  isEdit: false
			},
		});
			ref.onClose.subscribe((statusResponse) => {
				if(statusResponse) {
				this.setPage();
			}
		});
	}
	edit(item) {
		const ref = this._dialogService.open(CreateOrEditProjectShareComponent, {
			header: "Chỉnh sửa chia sẻ dự án",
			width: '1000px',
			data: {
			  projectId: this.projectId,
			  item: item,
			  isEdit: true
			},
		});
			ref.onClose.subscribe((statusResponse) => {
				if(statusResponse) {
				this.setPage();
			}
		});
	}

	changeStatus(item){
		this._projectShareService.changeStatus(item.id).subscribe((res) => {
			if (this.handleResponseInterceptor(res, item.status == ActiveDeactiveConst.ACTIVE ? "Hủy kích hoạt thành công" : "Kích hoạt thành công")) {
				this.setPage();
			}
		},(err) => {
			console.log("err----", err);
			this.messageError(AppConsts.messageError);
		  })
	}

	delete(item) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: `Bạn có chắc chắn muốn xóa chia sẻ dự án?`,
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
		console.log({ dataCallBack });
		if (dataCallBack?.accept) {
			this._projectShareService.delete(item.id).subscribe((res) => {
				if ( this.handleResponseInterceptor(res, "Xóa thành công")) {
					this.setPage();
				  }
				}, (err) => {
				  console.log('err____', err);
				  this.messageError(AppConsts.messageError);
			});
		} 
		});
	}

	create(event: any){
		if (event) {
			const ref = this._dialogService.open(CreateOrEditProjectShareComponent, {
				header: "Thêm mới chia sẻ dự án",
				width: '1000px',
				data: {
				  projectId: this.projectId
				},
			});
				ref.onClose.subscribe((statusResponse) => {
					if(statusResponse) {
					this.setPage();
					}
			});
		}
	}

	showData(rows) {
		for (let row of rows) {
		  row.createdDateDisplay = row.createdDate ? this.formatDate(row.createdDate) : "";
		}
		console.log("row", rows);
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.filter.keyword;
		this._projectShareService.findAll(this.page, this.projectId, this.filter).subscribe((res) => {
		  	this.isLoading = false;
			if(this.handleResponseInterceptor(res)) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items;
				if(this.rows?.length) { 
					this.showData(this.rows);
					this.genListAction(this.rows);
				}
			}
		}), (err) => {
		  this.isLoading = false;
		  console.log('Error-------', err);
		}
	};
	
	
}
