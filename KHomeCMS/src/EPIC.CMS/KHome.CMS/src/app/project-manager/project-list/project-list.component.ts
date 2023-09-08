import { Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { FormNotificationConst, IConstant, IDropdown, IHeaderColumn, ProjectOverviewConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewModel } from "@shared/interface/project-manager/ProjectOverview.model";
import { Page } from "@shared/model/page";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "app-project-list",
	templateUrl: "./project-list.component.html",
	styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private router: Router,
		private projectOverviewService: ProjectOverviewService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Quản lý dự án", routerLink: ["/project-manager/project-list"]},
			{ label: "Bảng hàng dự án" },
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
		owner: number | undefined;
		projectType: number | undefined;
		status: number | undefined;
	} = {
		keyword: "",
		owner: undefined,
		projectType: undefined,
		status: undefined,
	};
	ownerFilters: IDropdown[] = [];

	public get projectTypeFilters() {
		return ProjectOverviewConst.projectTypeFilters;
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

	public get productTypes() {
		return ProjectOverviewConst.productTypes;
	}

	minWidthTable: string;

	ngOnInit(): void {
		this.minWidthTable = '1200px';
		this.subject.isSetPage.subscribe(() => {
		  this.setPage();
		});
		this.headerColumns = [
		  { field: "code", fieldSort: 'Code', header: "Mã dự án"},
		  { field: "name", fieldSort: 'Name', header: "Tên dự án", isPin: true },
		  { field: "totalQuantity", fieldSort: 'TotalQuantity', header: "SL sản phẩm", width: "11rem" },
		  { field: "distributionQuantity", fieldSort: 'DistributionQuantity', header: "Đã phân phối", width: "11rem" },
		  { field: "soldQuantity", fieldSort: 'SoldQuantity', header: "Đã bán", width: "8rem" },
		  { field: "remainingQuantity", fieldSort: 'RemainingQuantity', header: "Còn lại", width: "8rem" },
		].map((item: IHeaderColumn, index: number) => {
		  item.position = index + 1;
		  return item;
		});
		this.selectedColumns = this.getLocalStorage("projectList") ?? this.headerColumns.filter(item => item.field !== "code");
		this.setPage({ page: this.offset });
	
	}

	ngAfterViewInit() {
		this.projectOverviewService._listOwner$.subscribe((res: any) => {
			if (res) {
				this.ownerFilters = res;
			}
		});
	}

	setColumn(col, selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, selectedColumns)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this.selectedColumns, "projectList");
			}
		});
	}

	genListAction(data = []) {
		this.listAction = data.map((projectItem: any, index: number) => {
			const actions = [];
			//
			actions.push({
				data: projectItem,
				label: "Thông tin chi tiết",
				icon: "pi pi-info-circle",
				command: ($event) => {
					this.detail($event.item.data.id);
				},
			});
			actions.push({
				data: projectItem,
				label: "Xóa",
				icon: "pi pi-trash",
				command: ($event) => {
					this.delete($event.item.data);
				},
			});
			//
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

	view(projectId) {
		this.router.navigate([
			"project-manager/project-overview/detail/" + this.cryptEncode(projectId),
		]);
	}

	detail(projectId) {
		this.router.navigate([
			"project-manager/project-list/detail/" + this.cryptEncode(projectId),
		]);
	}

	edit(data) {}

	changeFilter() {
		this.setPage({ page: this.offset });
	}

	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.filter.keyword;
		this.projectOverviewService
			.getAllProject(this.page, this.filter, this.sortData)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.page.totalItems = res.data.totalItems;
						if (res.data?.items) {
							this.rows = res.data.items.map(
								(item: any) =>
									({
										id: item.id,
										code: item.code,
										name: item.name,
										totalQuantity: item.totalQuantity,
										distributionQuantity: item.distributionQuantity,
										soldQuantity: item.soldQuantity,
										remainingQuantity: item.remainingQuantity,
										productType:
											this.productTypes.find(
												(productType: IConstant) =>
													productType.id === item?.productTypes[0]
											)?.value || "",
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
