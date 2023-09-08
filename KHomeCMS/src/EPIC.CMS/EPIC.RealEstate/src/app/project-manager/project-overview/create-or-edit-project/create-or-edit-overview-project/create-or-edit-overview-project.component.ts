import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { FormNotificationConst, IDropdown, ProjectOverviewConst } from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateOrEditOverviewProject } from "@shared/interface/project-manager/ProjectOverview.model";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { SelectIconComponent } from "src/app/components/select-icon/select-icon.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FormApproveComponent } from "src/app/form-general/form-request-approve-cancel/form-approve/form-approve.component";
import { FormRequestComponent } from "src/app/form-general/form-request-approve-cancel/form-request/form-request.component";

@Component({
	selector: "create-or-edit-overview-project",
	templateUrl: "./create-or-edit-overview-project.component.html",
	styleUrls: ["./create-or-edit-overview-project.component.scss"],
})
export class CreateOrEditOverviewProjectComponent extends CrudComponentBase {
	//
	public listOwner: IDropdown[] = [];
	public listBank: IDropdown[] = [];
	public listProvince: IDropdown[] = [];
	public overviewProject: CreateOrEditOverviewProject =
		new CreateOrEditOverviewProject();
	public isEdit: boolean = false;

	constructor(
		injector: Injector,
		messageService: MessageService,
		private router: Router,
		private projectOverviewService: ProjectOverviewService,
		public confirmationService: ConfirmationService,
		public dialogService: DialogService,
		public changeDetectorRef: ChangeDetectorRef
	) {
		super(injector, messageService);
	}

	ProjectOverviewConst = ProjectOverviewConst;

	public get listProjectType() {
		return ProjectOverviewConst.projectTypeFilters;
	}

	public get listProductType() {
		return ProjectOverviewConst.productTypes;
	}

	public get listDistributionType() {
		return ProjectOverviewConst.distributionTypes;
	}

	public get listProjectStatus() {
		return ProjectOverviewConst.projectStatuses;
	}

	defaultIcon = DEFAULT_MEDIA_RST.DEFAULT_ICON.ICON_DEFAULT;
	imageStyle: any = {
		objectFit: "cover",
		"background-color": "#D9D9D9",
		"margin-right": "1rem",
	};

	ngOnInit() {}

	ngAfterViewInit() {
		this.projectOverviewService._projectOverviewDetail$.subscribe(
			(res: any) => {
				if (res) {
					this.overviewProject.mapDTOToModel(res);
					this.overviewProject.id =
						this.projectOverviewService.selectedProjectId;
					if (
						this.overviewProject?.projectExtends.length > 0 &&
						this.overviewProject?.projectExtends[0].index != 1
					) {
						this.overviewProject?.projectExtends.map((item) => {
							item.path = `assets/layout/images/icon/${item.iconName}.svg`;
						});
					} else {
						this.overviewProject.projectExtends = [{ index: 1 }];
					}
				}
			}
		);
		this.projectOverviewService._listOwner$.subscribe((res: any) => {
			if (res) {
				this.listOwner = res;
			}
		});
		this.projectOverviewService._listBank$.subscribe((res: any) => {
			if (res) {
				this.listBank = res;
			}
		});
		this.projectOverviewService._listProvince$.subscribe((res: any) => {
			if (res) {
				this.listProvince = res;
			}
		});
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}
	public changeData(event: any, key: string) {}

	public clickAddMoreInfor(event: any) {
		// this.overviewProject.thongtinkhac.push({
		//   tieude: "",
		//   noidung: "",
		//   icon: "",
		// });
	}

	insertIcon() {
		if (this.isEdit) {
			this.overviewProject.projectExtends.push({index: this.overviewProject.projectExtends.length});

			// const ref = this.dialogService.open(SelectIconComponent, {
			// 	header: "Chọn Icon",
			// 	width: "950px",
			// 	height: '80vh',
			// 	style: { overflow: "auto", maxHeight: "80vh" },
			// });
			// ref.onClose.subscribe((listIcon) => {
			// 	if (listIcon) {
			// 		listIcon.forEach((icon) => {
			// 			this.overviewProject.projectExtends.push(icon);
			// 		});
			// 	}
			// });
		}
	}

	changeIcon(icon) {
		if (this.isEdit) {
			const ref = this.dialogService.open(SelectIconComponent, {
				header: "Chọn Icon",
				width: "950px",
				height: '80vh',
				style: { overflow: "auto", maxHeight: "80vh" },
				data: {
					isUpdate: true,
				},
			});
			ref.onClose.subscribe((result) => {
				icon.id = result[0]?.id;
				icon.iconName = result[0]?.iconName;
				icon.path = result[0]?.path;
			});
		}
	}

	deleteIcon(index) {
		if (this.isEdit) {
			const ref = this.dialogService.open(FormNotificationComponent, {
				header: "Xoá thông tin",
				width: "600px",
				data: {
					title: `Bạn có chắc chắn muốn xóa thông tin này?`,
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
				console.log({ dataCallBack });
				if (dataCallBack?.accept) {
					this.overviewProject.projectExtends.splice(index, 1);
				} else {
				}
			});
		}
	}

	checkIcon(listIcon) {
		let isCheck: boolean = true;
		listIcon.forEach((icon) => {
			if (!icon.title || !icon.description || !icon.iconName) {
				isCheck = false;
			}
		});
		return isCheck;
	}

	public save(event?: any) {
		if (event) {
			if (
				!this.overviewProject?.projectExtends[0]?.title &&
				!this.overviewProject?.projectExtends[0]?.description &&
				!this.overviewProject?.projectExtends[0]?.iconName
			) {
				this.overviewProject.projectExtends = [];
			} else {
				if (!this.checkIcon(this.overviewProject.projectExtends)) {
					return this.messageError(
						"Không được bỏ trống các trường trong Thông tin khác!"
					);
				}
			}
			if (this.overviewProject.isValidData()) {
				this.submitted = true;
				this.projectOverviewService
					.updateProject(this.overviewProject.toObjectSendToAPI())
					.subscribe(
						(response) => {
							if (
								this.handleResponseInterceptor(response, "Chỉnh sửa thành công")
							) {
								this.submitted = false;
								this.isEdit = false;
								this.projectOverviewService.getProjectById();
							} else {
								this.submitted = false;
							}
						},
						(err) => {
							this.submitted = false;
						}
					);
			} else {
				const messageError = this.overviewProject.dataValidator.length
					? this.overviewProject.dataValidator[0].message
					: undefined;
				messageError && this.messageError(messageError);
			}
		}
	}

	// TRÌNH DUYỆT PHÂN PHỐI SẢN PHẨM
	requestApprove() {
		const params = {
			id: this.overviewProject.id,
			summary: "Trình duyệt sản phẩm",
			data: this.overviewProject,
			type: "projectInfo",
		};
		//
		const ref = this.dialogService.open(
			FormRequestComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.requestApprove(dataCallBack.data)
					.subscribe((response) => {
						if (
							this.handleResponseInterceptor(
								response,
								"Trình duyệt thành công!"
							)
						) {
							this.getDetail();
						}
					});
			}
		});
	}

	approve() {
		const params = {
			id: this.overviewProject.id,
			summary: "Phê duyệt sản phẩm",
			data: this.overviewProject,
			type: "projectInfo",
		};
		//
		const ref = this.dialogService.open(
			FormApproveComponent,
			this.getConfigDialogServiceRAC("Trình duyệt", params)
		);
		//
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this.projectOverviewService
					.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove)
					.subscribe((response) => {
						if (
							this.handleResponseInterceptor(response, "Thao tác thành công!")
						) {
							this.getDetail();
						}
					});
			}
		});
	}

	getDetail() {
		this.projectOverviewService.getProjectById();
	}
}
