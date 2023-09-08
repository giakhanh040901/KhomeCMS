import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, YesNoConst } from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import {
	DialogService,
	DynamicDialogConfig,
	DynamicDialogRef,
} from "primeng/dynamicdialog";
import { SelectIconComponent } from "src/app/components/select-icon/select-icon.component";

@Component({
	selector: "create-other-utiliti-project-dialog",
	templateUrl: "./create-other-utiliti-project-dialog.component.html",
	styleUrls: ["./create-other-utiliti-project-dialog.component.scss"],
})
export class CreateOtherUtilitiProjectDialogComponent extends CrudComponentBase {
	public dataSource: any[] = [];
	public utilitiTypes: IDropdown[] = [];
	public utilitiGroups: IDropdown[] = [];
	public isEdit: boolean = false;
	public selectedId: number | undefined = undefined;
	public message: string = "";
	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		private projectOverviewService: ProjectOverviewService,
		public dialogService: DialogService,
		private config: DynamicDialogConfig,
		private changeDetectorRef: ChangeDetectorRef
	) {
		super(injector, messageService);
	}

	defaultIcon = DEFAULT_MEDIA_RST.DEFAULT_ICON.ICON_DEFAULT;

	ngOnInit() {
		if (this.config.data) {
			this.utilitiTypes = [...this.config.data.utilitiTypes];
			this.utilitiGroups = [...this.config.data.utilitiGroups];
			this.isEdit = !!this.config.data.isEdit;
			this.selectedId = this.config.data.selectedId;
		}
		if (!this.isEdit) {
			this.dataSource.push({
				name: "",
				type: undefined,
				group: undefined,
				iconName: "",
				path: this.defaultIcon,
				isHighlight: false,
			});
		}
	}

	ngAfterViewInit() {
		if (this.selectedId !== undefined && this.config.data.dataSource) {
			this.dataSource = [
				{
					name: this.config.data.dataSource.title,
					type: this.config.data.dataSource.type,
					group: this.config.data.dataSource.groupUtilityId,
					iconName: this.config.data.dataSource.iconName,
					path: `assets/layout/images/icon/${this.config.data.dataSource.iconName}.svg`,
					isHighlight:
						this.config.data.dataSource.isHighlight == YesNoConst.YES
							? true
							: false,
				},
			];
		}
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

  public onChangeCheckbox(event: any, selectedRow: any, key: string) {
    if (event) {
      // this.getDataSelectedData(selectedRow);
      // this.getDataCheckboxAll(key);
      // //
      // this.constraintChecked(key);
      console.log('noi bat ', selectedRow);
      
    }
  }

	public addMore(event: any) {
		if (event) {
			this.dataSource.push({
				name: "",
				type: undefined,
				group: undefined,
				iconName: "",
				path: this.defaultIcon,
				isHighlight: false,
			});
			// const ref = this.dialogService.open(SelectIconComponent, {
			// 	header: "Chọn Icon",
			// 	width: "1000px",
			// });
			// ref.onClose.subscribe((listIcon) => {
			// 	if (listIcon) {
			// 		listIcon.forEach((icon) => {
			// 			this.dataSource.push({
			// 				name: "",
			// 				type: undefined,
			// 				group: undefined,
			// 				iconName: icon.iconName,
			// 				path: icon.path,
			// 			});
			// 		});
			// 	}
			// });
		}
	}

	updateIcon(iconInfo) {
		this.dataSource[iconInfo.index].iconName = iconInfo.iconName;
	}

	public removeItem(event) {
		this.dataSource.splice(event, 1);
	}

	public save(event: any) {
		if (event) {
			if (this.validData(this.isEdit)) {
				this.isLoadingPage = true;
				if (!this.isEdit) {
					// CREATE
					const body: any = {
						projectId: this.projectOverviewService.selectedProjectId,
						utilityExtends: this.dataSource.map((e: any) => ({
							title: e.name,
							groupUtilityId: e.group,
							iconName: e.iconName,
							type: e.type,
							isHighlight: e.isHighlight ? YesNoConst.YES : YesNoConst.NO,
						})),
					};
					this.projectOverviewService.createOtherUtilitiProject(body).subscribe(
						(response: any) => {
							this.isLoadingPage = false;
							if (this.handleResponseInterceptor(response)) {
								this.ref.close({ data: response, accept: true });
							} else {
							}
						},
						(err) => {
							this.isLoadingPage = false;
						}
					);
				} else {
					// EDIT
					const body: any = {
						projectId: this.projectOverviewService.selectedProjectId,
						title: this.dataSource[0].name,
						groupUtilityId: this.dataSource[0].group,
						iconName: this.dataSource[0].iconName,
						type: this.dataSource[0].type,
						isHighlight: this.dataSource[0].isHighlight
							? YesNoConst.YES
							: YesNoConst.NO,
						id: this.selectedId,
					};
					this.projectOverviewService.updateOtherUtilitiProject(body).subscribe(
						(response: any) => {
							this.isLoadingPage = false;
							if (this.handleResponseInterceptor(response)) {
								this.ref.close({ data: response, accept: true });
							} else {
							}
						},
						(err) => {
							this.isLoadingPage = false;
						}
					);
				}
			} else {
				this.messageError(this.message);
			}
		}
	}

	close(event: any) {
		event && this.ref.close();
	}

	private validData(isEdit: boolean = true) {
		this.message = "";
		let result: boolean = true;
		if (!this.dataSource.length) {
			this.message = "Vui lòng chọn Tiện ích";
			result = false;
		} else {
			if (!isEdit) {
				this.dataSource.every((data: any, index: number) => {
					if (!data.name || !data.name.length) {
						this.message = `Vui lòng nhập Tên tiện ích của tiện ích thứ ${
							index + 1
						}`;
						result = false;
						return false;
					} else if (!data.type) {
						this.message = `Vui lòng chọn Loại tiện ích của tiện ích thứ ${
							index + 1
						}`;
						result = false;
						return false;
					} else if (!data.group) {
						this.message = `Vui lòng chọn Nhóm tiện ích của tiện ích thứ ${
							index + 1
						}`;
						result = false;
						return false;
					} else if (!data.iconName) {
						this.message = `Vui lòng chọn Icon tiện ích của tiện ích thứ ${
							index + 1
						}`;
						result = false;
						return false;
					}
					return true;
				});
			} else {
				const data = this.dataSource[0];
				if (!data.name || !data.name.length) {
					this.message = `Vui lòng nhập Tên tiện ích`;
					result = false;
				} else if (!data.type) {
					this.message = `Vui lòng chọn Loại tiện ích`;
					result = false;
				} else if (!data.group) {
					this.message = `Vui lòng chọn Nhóm tiện ích`;
					result = false;
				} else if (!data.iconName) {
					this.message = `Vui lòng chọn Icon tiện ích`;
					result = false;
				}
			}
		}
		return result;
	}
}
