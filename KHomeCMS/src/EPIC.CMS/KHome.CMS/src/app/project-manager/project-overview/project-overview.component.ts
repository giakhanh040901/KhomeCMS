import { Component, Injector, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { FormNotificationConst, IDropdown, IHeaderColumn, ProjectOverviewConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewModel } from "@shared/interface/project-manager/ProjectOverview.model";
import { Page } from "@shared/model/page";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { CreateOrEditOverviewProjectDialogComponent } from "./create-or-edit-project/create-or-edit-overview-project-dialog/create-or-edit-overview-project-dialog.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
@Component({
	selector: "project-overview",
	templateUrl: "./project-overview.component.html",
	styleUrls: ["./project-overview.component.scss"],
})
export class ProjectOverviewComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private router: Router,
		private changeDetectorRef: ChangeDetectorRef,
		private projectOverviewService: ProjectOverviewService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Quản lý dự án" },
			{ label: "Tổng quan dự án" },
		]);
	}

	rows: ProjectOverviewModel[] = [];
	isLoading: boolean;
	page: Page;
	listAction: any[] = [];
	selectedColumns: IHeaderColumn[] = [];
	headerColumns: IHeaderColumn[] = [];
	filter: {
		keyword: string;
		ownerId: number | undefined;
		projectType: number | undefined;
		productTypes: number[] | undefined;
		status: number | undefined;
	} = {
		keyword: "",
		ownerId: undefined,
		projectType: undefined,
		productTypes: undefined,
		status: undefined,
	};

	ownerFilters: IDropdown[] = [];
	sortData: any[] = [];
	public get projectTypeFilters() {
		return ProjectOverviewConst.projectTypeFilters;
	}

	public get listProductType() {
		return ProjectOverviewConst.productTypes;
	}

	public get statusFilters() {
		return ProjectOverviewConst.statusFilters;
	}

	public getStatusSeverity(code: number) {
		return ProjectOverviewConst.getStatusSeverity(code);
	}

	public getStatusName(code: number) {
		return ProjectOverviewConst.getStatusName(code);
	}
	minWidthTable: string;

	ngOnInit(): void {
        this.minWidthTable = '1800xp'

		this.subject.isSetPage.subscribe(() => {
		this.setPage();
		});
		this.headerColumns = [
			{ field: "code", fieldSort: 'Code', header: "Mã dự án", width: "12rem" },
			{ field: "name", fieldSort: 'Name', header: "Tên dự án", isPin: true },
			{ field: "productType", header: "Loại hình", isPin: true },
			{ field: "ownerName", fieldSort: 'OwnerId', header: "Chủ đầu tư" },
			{ field: "createdDate", fieldSort: 'CreatedDate', header: "Ngày cài đặt", width: "10rem" },
			{ field: "createdBy", fieldSort: 'CreatedBy', header: "Người cài đặt", width: "10rem" },
		].map((item: IHeaderColumn, index: number) => {
		item.position = index + 1;
		return item;
		});
		this.selectedColumns = this.getLocalStorage("projectOverview") ?? this.headerColumns.filter(item => item.field !== "code");
		this.setPage({ page: this.offset });
	}
	
	public get productTypes() {
		return ProjectOverviewConst.productTypes;
	}

	ngAfterViewInit() {
		this.projectOverviewService._listOwner$.subscribe((res: any) => {
			if (res) {
				this.ownerFilters = res;
			}
		});

		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	setColumn(col, selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, selectedColumns)
		);
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this.selectedColumns, "projectOverview");
			}
		});
	}

	genListAction(data = []) {
		this.listAction = data.map((projectItem: any, index: number) => {
			const actions = [];

			if (
				this.isGranted([
					this.PermissionRealStateConst
						.RealStateProjectOverview_ThongTinProjectOverview,
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
					this.PermissionRealStateConst.RealStateProjectOverview_Xoa,
				]) &&
				projectItem.status === ProjectOverviewConst.KHOI_TAO
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

	delete(item) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa dự án này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this.projectOverviewService.delete(item).subscribe(
					(response) => {
						if (this.handleResponseInterceptor(response, "Xóa thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không xóa được ${item.name}`);
					}
				);
			} else {
			}
		});
	}

	create() {
		const ref = this.dialogService.open(
			CreateOrEditOverviewProjectDialogComponent,
			{
				header: "Thêm mới hồ sơ dự án",
				width: "1200px",
			}
		);
		//
		ref.onClose.subscribe((project) => {
			if (project?.id) {
				this.view(project?.id);
			}
		});
	}

	view(projectId) {
		this.router.navigate([
			"project-manager/project-overview/detail/" + this.cryptEncode(projectId),
		]);
	}

	detail(project) {
		this.router.navigate(["project-manager/project-overview/detail/" + this.cryptEncode(project?.id)]);
	}

	edit(project) {
		this.router.navigate(["project-manager/project-overview/detail/" + this.cryptEncode(project?.id)]);
	}

	changeFilter(value) {
		this.setPage({ page: this.offset });
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.filter.keyword;
		this.projectOverviewService.getAllProject(this.page, this.filter, this.sortData).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, "")) {
				this.page.totalItems = res.data.totalItems;
				if (res.data?.items) {
					this.rows = res.data.items
					this.rows = res.data.items.map(
						(item: any) =>
							({
								id: item.id,
								code: item.code,
								name: item.name,
								productType: item?.productTypes
									? ProjectOverviewConst.getNameProductTypes(item?.productTypes)
									: "",
								ownerName: item.ownerName,
								createdDate:
									item.createdDate && item.createdDate.length
										? this.formatDate(item.createdDate)
										: "",
								createdBy: item.createdBy,
								status: item.status,
							} as ProjectOverviewModel)
					);
				}
				if (this.rows?.length) {
					this.genListAction(this.rows);
				}
			}
		},
		(err) => {
			this.isLoading = false;
		}
	);
	}
}
