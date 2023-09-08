import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import {
	FormNotificationConst,
	IDropdown,
	ProjectOverviewConst,
} from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateOrEditOverviewProject } from "@shared/interface/project-manager/ProjectOverview.model";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { SelectIconComponent } from "src/app/components/select-icon/select-icon.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "create-or-edit-overview-project-dialog",
	templateUrl: "./create-or-edit-overview-project-dialog.component.html",
	styleUrls: ["./create-or-edit-overview-project-dialog.component.scss"],
	providers: [ConfirmationService],
})
export class CreateOrEditOverviewProjectDialogComponent extends CrudComponentBase {
	public listOwner: IDropdown[] = [];
	public listBank: IDropdown[] = [];
	public listProvince: IDropdown[] = [];
	public overviewProject: CreateOrEditOverviewProject =
		new CreateOrEditOverviewProject();

	constructor(
		injector: Injector,
		messageService: MessageService,
		private router: Router,
		private projectOverviewService: ProjectOverviewService,
		public dialogService: DialogService,
		public confirmationService: ConfirmationService,
		private ref: DynamicDialogRef,
		private changeDetectorRef: ChangeDetectorRef
	) {
		super(injector, messageService);
	}

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

	imageStyle: any = {objectFit: 'cover', 'background-color': '#D9D9D9', 'margin-right': '1rem'};
  defaultIcon =  DEFAULT_MEDIA_RST.DEFAULT_ICON.ICON_DEFAULT;

  ngOnInit() {}

  ngAfterViewInit() {
    this.projectOverviewService._listOwner$.subscribe((res: any) => {
      if (res) {
        // a va b la cac item de so sanh
        this.listOwner = res.sort((a, b) => b.code - a.code);
        if (this.listOwner.length === 1){
          this.overviewProject.ownerId = Number(this.listOwner[0].code);
        }
        
      }
    });
    this.projectOverviewService._listBank$.subscribe((res: any) => {
      if (res) {
        this.listBank = res;
        console.log("res",res);
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
	public changeData(event: any, key: string) {
		if (key === "chudautu") {
		}
	}

  
  insertIcon(){
	this.overviewProject.projectExtends.push({index: this.overviewProject.projectExtends.length});
    // const ref = this.dialogService.open(SelectIconComponent, {
    //   header: 'Chọn Icon',
    //   width: '950px',
    //   height: '80vh',
    //   style: { overflow: "auto", maxHeight: "80vh" },
    // });
    // ref.onClose.subscribe(listIcon => {
    //   if (listIcon){
    //     listIcon.forEach( (icon) => {
    //       this.overviewProject.projectExtends.push(icon)
    //     })
    //   }
    // })
  }

  changeIcon(icon){
    const ref = this.dialogService.open(SelectIconComponent, {
      header: 'Chọn Icon',
      data: {
        isUpdate: true
      },
      width: '950px',
      height: '80vh',
      style: { overflow: "auto", maxHeight: "80vh" },
    });
    ref.onClose.subscribe(result => {
      icon.iconName = result[0].iconName;
      icon.path = result[0].path;
      console.log('check: ', icon);
    })
  }

	deleteIcon(index) {
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
				this.overviewProject.startDate &&
					(this.overviewProject.startDate = this.formatCalendarItem(
						this.overviewProject.startDate
					));
				this.projectOverviewService
					.createProject(this.overviewProject.toObjectSendToAPI())
					.subscribe(
						(response) => {
							if (this.handleResponseInterceptor(response, "Thêm thành công")) {
								this.submitted = false;
								this.ref.close(response?.data);
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

	close(event: any) {
		this.ref.close();
	}
}
