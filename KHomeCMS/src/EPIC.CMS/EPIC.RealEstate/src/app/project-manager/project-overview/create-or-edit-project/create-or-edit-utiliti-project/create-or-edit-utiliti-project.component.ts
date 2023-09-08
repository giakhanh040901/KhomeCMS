import { Component, Injector } from "@angular/core";
import { FormNotificationConst, IConstant, IDropdown, ProjectOverviewConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreEditImageUtilitiProjectComponent } from "./cre-edit-image-utiliti-project/cre-edit-image-utiliti-project.component";
import { CreateOtherUtilitiProjectDialogComponent } from "./create-other-utiliti-project-dialog/create-other-utiliti-project-dialog.component";
import { ManageUtilitiProjectDialogComponent } from "./manage-utiliti-project-dialog/manage-utiliti-project-dialog.component";

@Component({
	selector: "create-or-edit-utiliti-project",
	templateUrl: "./create-or-edit-utiliti-project.component.html",
	styleUrls: ["./create-or-edit-utiliti-project.component.scss"],
})
export class CreateOrEditUtilitiProjectComponent extends CrudComponentBase {
	public utilitiProjectGroupFilter: IDropdown[] = [];
	public isLoading: boolean;
	public dataSourceFromSystem: any[] = [];
	public pageFromSystem: Page = new Page();
	public dataSourceOther: any[] = [];
	public pageOther: Page = new Page();
	public listActionOther: any[] = [];
	public dataSourceImage: any[] = [];
	public pageImage: Page = new Page();
	public listActionImage: any[] = [];

	public filter: {
		type?: number;
		group?: number;
		name?: string;
		hightLight?: number;
	} = {
		type: undefined,
		group: undefined,
		name: undefined,
		hightLight: undefined,
	};

	constructor(
		injector: Injector,
		messageService: MessageService,
		private dialogService: DialogService,
		private projectOverviewService: ProjectOverviewService,
		private _dialogService: DialogService
	) {
		super(injector, messageService);
	}

	ProjectOverviewConst = ProjectOverviewConst;

	public get utilitiProjectType() {
		return ProjectOverviewConst.utilitiProjectType;
	}

	public get utilitiProjectTypeFilter() {
		return ProjectOverviewConst.utilitiProjectType.map((e: IConstant) =>
			({
				code: e.id,
				name: e.value,
			} as IDropdown)
		);
	}

	public get hightLightFilter() {
		return ProjectOverviewConst.hightLights;
	}

	ngOnInit() {
		this.setPage({ page: this.offset });
	}

	ngAfterViewInit() {
		this.projectOverviewService.getAllGroupUtiliti().subscribe((res: any) => {
			if (res.data) {
				this.utilitiProjectGroupFilter = res.data.map(
					(e: any) =>
						({
							code: e.id,
							name: e.name,
						} as IDropdown)
				);
			}
			this.setPageOther({ page: this.offset });
			this.setPageImage({ page: this.offset });
		});
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.pageFromSystem.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.pageFromSystem.pageSize = pageInfo?.rows;
		this.pageFromSystem.keyword = "";
		this.projectOverviewService
			.getAllUtilitiProject(
				this.pageFromSystem,
				this.filter.type,
				this.filter.group,
				this.filter.name,
				!!this.filter.hightLight ? YesNoConst.YES : undefined,
				YesNoConst.YES
			)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.pageFromSystem.totalItems = res.data.totalItems;
						if (res.data?.items) {
							this.dataSourceFromSystem = res.data.items.map((item: any) => ({
								id: item.id,
								name: item.name,
								groupName: item.groupName,
								typeName:
									this.utilitiProjectType.find(
										(value: IConstant) => value.id === item.type
									)?.value || "",
								isSelected: item.isSelected === YesNoConst.YES,
								isHighlight: item.isHighlight === YesNoConst.YES,
							}));
						}
					}
				},
				(err) => {
					this.isLoading = false;
				}
			);
	}

	changeFilterType() {
		this.setPage({ page: this.offset });
	}

	changeFilter() {
		this.setPage({ page: this.offset });
	}

	public genListAction(data = [], key: string) {
		if (key === "other") {
			this.listActionOther = data.map((dataOther, index) => {
				const actions = [];

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchKhac_CapNhat,
					])
				) {
					actions.push({
						data: dataOther,
						index: index,
						label: "Sửa",
						icon: "pi pi-pencil",
						command: ($event) => {
							this.editOther($event.item.data);
						},
					});
				}

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchKhac_DoiTrangThai,
					])
				) {
					actions.push({
						data: dataOther,
						label: "Đổi trạng thái",
						icon: "pi pi-pencil",
						command: ($event) => {
							this.changeStatusOther($event.item.data);
						},
					});
				}

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchKhac_DoiTrangThaiNoiBat,
					])
				) {
					actions.push({
						data: dataOther,
						label: dataOther.isHighlight ? "Bỏ nổi bật" : "Nổi bật",
						icon: "pi pi-pencil",
						command: ($event) => {
							this.changeIsHighlight($event.item.data);
						},
					});
				}

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchKhac_Xoa,
					])
				) {
					actions.push({
						data: dataOther,
						label: "Xoá",
						icon: "pi pi-trash",
						command: ($event) => {
							this.deleteOther($event.item.data);
						},
					});
				}

				return actions;
			});
		} else if (key === "image") {
			this.listActionImage = data.map((dataImage, index) => {
				const actions = [];


				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchMinhHoa_CapNhat,
					])
				) {
					actions.push({
						data: dataImage,
						index: index,
						label: "Sửa",
						icon: "pi pi-pencil",
						command: ($event) => {
							this.editImage($event.item.data);
						},
					});
				}

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchMinhHoa_DoiTrangThai,
					])
				) {
					actions.push({
						data: dataImage,
						label: "Thay đổi trạng thái",
						icon: "pi pi-pencil",
						command: ($event) => {
							this.changeStatusImage($event.item.data);
						},
					});
				}

				if (
					this.isGranted([
						this.PermissionRealStateConst
							.RealStateProjectOverview_TienIchMinhHoa_Xoa,
					])
				) {
					actions.push({
						data: dataImage,
						label: "Xoá",
						icon: "pi pi-trash",
						command: ($event) => {
							this.deleteImage($event.item.data);
						},
					});
				}

				return actions;
			});
		}
	}

	public clickInfo(event: any) {
		if (event) {
			const ref = this.dialogService.open(ManageUtilitiProjectDialogComponent, {
				header: "Danh sách tiện ích",
				width: "900px",
				data: {
					filter: {
						...this.filter,
					},
					utilitiProjectGroupFilter: [...this.utilitiProjectGroupFilter],
				},
			});
			//
			ref.onClose.subscribe((response: any) => {
				if (response) {
					this.messageSuccess("Đã lưu thành công tiện ích");
					this.setPage({ page: this.offset });
				}
			});
		}
	}

	public setPageOther(pageInfo?: any) {
		this.isLoading = true;
		this.pageOther.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.pageOther.pageSize = pageInfo?.rows;
		this.pageOther.keyword = "";
		this.projectOverviewService
			.getAllOtherUtilitiProject(this.pageOther)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.pageOther.totalItems = res.data.length;
						if (res.data && res.data?.length) {
							this.dataSourceOther = res.data.map((item: any) => ({
								...item,
								id: item.id,
								name: item.title,
								isHighlight: item?.isHighlight == YesNoConst.YES ? true : false,
								groupName:
									this.utilitiProjectGroupFilter.find(
										(e: IDropdown) => e.code === item.groupUtilityId
									)?.name || "",
								typeName:
									this.utilitiProjectType.find(
										(value: IConstant) => value.id === item.type
									)?.value || "",
								isSelected: item.isSelected === YesNoConst.YES,
								status: item.status,
							}));
							if (this.dataSourceOther?.length) {
								this.genListAction(this.dataSourceOther, "other");
							}
						} else {
							this.dataSourceOther = [];
						}
					}
				},
				(err) => {
					this.isLoading = false;
				}
			);
	}

	public createOther(event: any) {
		if (event) {
			const ref = this.dialogService.open(
				CreateOtherUtilitiProjectDialogComponent,
				{
					header: "Thêm tiện ích",
					width: "1200px",
					data: {
						utilitiTypes: this.utilitiProjectTypeFilter,
						utilitiGroups: this.utilitiProjectGroupFilter,
					},
				}
			);
			//
			ref.onClose.subscribe((data: any) => {
				if (data) {
					this.messageSuccess("Thêm mới thành công");
					this.setPageOther({ page: this.offset });
				}
			});
		}
	}

	public editOther(dataOther: any) {
		if (dataOther.id) {
			this.isLoading = true;
			this.projectOverviewService
				.getOtherUtilitiProjectById(dataOther.id)
				.subscribe((response: any) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(response)) {
						const ref = this.dialogService.open(
							CreateOtherUtilitiProjectDialogComponent,
							{
								header: "Chỉnh sửa tiện ích",
								width: "1200px",
								data: {
									utilitiTypes: this.utilitiProjectTypeFilter,
									utilitiGroups: this.utilitiProjectGroupFilter,
									isEdit: true,
									selectedId: dataOther?.id,
									dataSource: response.data,
									path: `assets/layout/images/icon/${dataOther.iconName}.svg`,
								},
							}
						);
						ref.onClose.subscribe((data: any) => {
							if (data) {
								this.messageSuccess("Chỉnh sửa thành công");
								this.setPageOther({ page: this.offset });
							}
						});
					}
				});
		}
	}

	changeIsHighlight(data) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn thay đổi nổi bật tiện ích này?",
				icon: data.isHighlight
					? FormNotificationConst.IMAGE_CLOSE
					: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				// Đổi trạng thái isHighlight
				let body = {
					projectId: this.projectOverviewService.selectedProjectId,
					title: data.name,
					groupUtilityId: data.groupUtilityId,
					iconName: data.iconName,
					type: data.type,
					id: data.id,
					isHighlight: data.isHighlight ? YesNoConst.NO : YesNoConst.YES,
					isSelected: data.isSelected ? YesNoConst.YES : YesNoConst.NO,
				};
				this.projectOverviewService.updateOtherUtilitiProject(body).subscribe(
					(response: any) => {
						this.isLoadingPage = false;
						if (this.handleResponseInterceptor(response)) {
							this.setPageOther();
						} else {
						}
					},
					(err) => {
						this.isLoadingPage = false;
					}
				);
			}
		});
	}

	public changeStatusOther(dataOther) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn thay đổi trạng thái tiện ích này?",
				icon: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.updateStatusOtherUtilitiProject({ id: dataOther.id })
					.subscribe(
						(response) => {
							if (
								this.handleResponseInterceptor(
									response,
									"Thay đổi trạng thái thành công"
								)
							) {
								this.setPageOther({ page: this.offset });
							}
						},
						(err) => {
							this.messageError(`Không thay đổi được trạng thái tiện ích`);
						}
					);
			}
		});
	}

	public deleteOther(dataOther) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa tiện ích này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.deleteOtherUtilitiProject(dataOther.id)
					.subscribe(
						(response) => {
							if (this.handleResponseInterceptor(response, "Xóa thành công")) {
								this.setPageOther({ page: this.offset });
							}
						},
						(err) => {
							this.messageError(`Không xóa được tiện ích`);
						}
					);
			}
		});
	}

	public setPageImage(pageInfo?: any) {
		this.isLoading = true;
		this.pageImage.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.pageImage.pageSize = pageInfo?.rows;
		this.pageImage.keyword = "";
		this.projectOverviewService
			.getAllImageUtilitiProject(this.pageImage)
			.subscribe(
				(res) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(res, "")) {
						this.pageImage.totalItems = res.data.length;
						if (res.data && res.data?.length) {
							this.dataSourceImage = res.data.map((item: any) => ({
								id: item.id,
								name: item.title,
								typeName:
									this.utilitiProjectType.find(
										(value: IConstant) => value.id === item.type
									)?.value || "",
								url: item.url,
								status: item.status,
							}));
							if (this.dataSourceImage?.length) {
								this.genListAction(this.dataSourceImage, "image");
							}
						} else {
							this.dataSourceImage = [];
						}
					}
				},
				(err) => {
					this.isLoading = false;
				}
			);
	}

	public createImage(event: any) {
		if (event) {
			const ref = this.dialogService.open(CreEditImageUtilitiProjectComponent, {
				header: "Thêm ảnh minh họa",
				width: "1200px",
				data: {
					utilitiTypes: this.utilitiProjectTypeFilter,
				},
			});
			//
			ref.onClose.subscribe((data: any) => {
				if (data) {
					this.messageSuccess("Thêm mới thành công");
					this.setPageImage({ page: this.offset });
				}
			});
		}
	}

	public editImage(dataImage: any) {
		if (dataImage.id) {
			this.isLoading = true;
			this.projectOverviewService
				.getImageUtilitiProjectById(dataImage.id)
				.subscribe((response: any) => {
					this.isLoading = false;
					if (this.handleResponseInterceptor(response)) {
						const ref = this.dialogService.open(
							CreEditImageUtilitiProjectComponent,
							{
								header: "Chỉnh sửa ảnh minh họa",
								width: "1200px",
								data: {
									utilitiTypes: this.utilitiProjectTypeFilter,
									isEdit: true,
									selectedId: dataImage?.id,
									dataSource: response.data,
								},
							}
						);
						ref.onClose.subscribe((data: any) => {
							if (data) {
								this.messageSuccess("Chỉnh sửa thành công");
								this.setPageImage({ page: this.offset });
							}
						});
					}
				});
		}
	}

	public changeStatusImage(dataOther) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn thay đổi trạng thái ảnh minh họa này?",
				icon: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.updateStatusImageUtilitiProject(dataOther.id)
					.subscribe(
						(response) => {
							if (
								this.handleResponseInterceptor(
									response,
									"Thay đổi trạng thái thành công"
								)
							) {
								this.setPageImage({ page: this.offset });
							}
						},
						(err) => {
							this.messageError(`Không thay đổi được trạng thái ảnh minh họa`);
						}
					);
			}
		});
	}

	public deleteImage(dataImage) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn muốn xóa ảnh minh họa này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.deleteImageUtilitiProject(dataImage.id)
					.subscribe(
						(response) => {
							if (this.handleResponseInterceptor(response, "Xóa thành công")) {
								this.setPageImage({ page: this.offset });
							}
						},
						(err) => {
							this.messageError(`Không xóa được ảnh minh họa`);
						}
					);
			}
		});
	}

	deleteUtiliti(id) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "540px",
			data: {
				title: "Bạn có chắc chắn xóa tiện ích này?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.deleteUtilitiProject(id)
					.subscribe((response) => {
						if (this.handleResponseInterceptor(response, "Xóa thành công")) {
							this.setPage();
						}
					});
			}
		});
	}

	public getStatusSeverity(code: number) {
		return ProjectOverviewConst.getStatusActiveSeverity(code);
	}

	public getStatusName(code: number) {
		return ProjectOverviewConst.getStatusActiveName(code);
	}
}
