import { Component, Injector } from "@angular/core";
import { AtributionConfirmConst, MessageErrorConst, ProjectFileConst, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { ProjectFileService } from "@shared/services/project-file.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-create-project-file",
	templateUrl: "./create-project-file.component.html",
	styleUrls: ["./create-project-file.component.scss"],
})
export class CreateProjectFileComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public configDialog: DynamicDialogConfig,
		private _projectFileService: ProjectFileService,
		private _contractTemplateService: DistributionService,
		public confirmationService: ConfirmationService,
		public ref: DynamicDialogRef
	) {
		super(injector, messageService);
	}

	ProjectFileConst = ProjectFileConst;
	ProjectPolicyConst = ProjectPolicyConst;

	projectFile: any = {
		juridicalFileType: null,
		rstProjectJuridicalFiles: [
			{
				projectId: 0,
				name: "",
				url: "",
			},
		],
	};

	projectId: number;

	isEdit: boolean = false;
	ngOnInit(): void {
		this.projectFile.rstProjectJuridicalFiles[0].projectId = this.configDialog?.data?.projectId;
		this.isEdit = this.configDialog?.data?.isEdit ?? false;
		if (this.configDialog?.data?.projectFile){
			console.log('!!! ', this.configDialog?.data?.projectFile);
			this.projectFile.juridicalFileType = this.configDialog?.data?.projectFile.projectFileType
			this.projectFile.rstProjectJuridicalFiles[0] = this.configDialog?.data?.projectFile; 
			
		}
		this.projectId = this.configDialog?.data?.projectId;
	}

	save() {
		if (this.validForm()) {
			if (this.projectFile.rstProjectJuridicalFiles[0].id){
				this._projectFileService.update(this.projectFile.rstProjectJuridicalFiles[0]).subscribe((res) => {
					if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
						this.ref.close(true);
					}	
				})
			} else {
				this._projectFileService.create(this.projectFile).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Thêm thành công")) {
							this.ref.close(true);
						}
					},
					(err) => {
						console.log("err---", err);
						this.submitted = false;
					}
				);
			}
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	addvalue() {
		this.projectFile.rstProjectJuridicalFiles.push({
			projectId: this.projectId,
		});
	}

	deleteFile(index) {
		this.confirmationService.confirm({
			message: "Xóa file này?",
			...AtributionConfirmConst,
			accept: () => {
				this.projectFile.rstProjectJuridicalFiles.splice(index, 1);
			},
		});
	}

	myUploader(event, index) {
		if (event?.files[0]) {
			this._contractTemplateService.uploadFileGetUrl(event?.files[0], "project").subscribe((response) => {
			if (this.handleResponseInterceptor(response, "Upload thành công")) {
				this.projectFile.rstProjectJuridicalFiles[index].url = response.data;
			}},
				(err) => {
					this.messageError("Có sự cố khi upload!");
				}
			);
		}
	}

	validForm(): boolean {
		let checked = true;
		if (!this.projectFile?.juridicalFileType) {
			checked = false;
		}
		if (this.projectFile?.rstProjectJuridicalFiles.length == 0) {
			checked = false;
		} else {
			this.projectFile?.rstProjectJuridicalFiles.forEach((file) => {
				if (!file?.name || !file?.url) {
					checked = false;
				}
			});
		}
		return checked;
	}

	close(event: any) {
		this.ref.close();
	}
}
