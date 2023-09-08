import { Component, Injector } from "@angular/core";
import { AtributionConfirmConst, OpenSellFileConst, ProjectFileConst, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { OpenSellFileService } from "@shared/services/open-sell-file.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-open-sell-file-dialog",
	templateUrl: "./open-sell-file-dialog.component.html",
	styleUrls: ["./open-sell-file-dialog.component.scss"],
})
export class OpenSellFileDialogComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public configDialog: DynamicDialogConfig,
		private _openSellFileService: OpenSellFileService,
		private _contractTemplateService: DistributionService,
		public confirmationService: ConfirmationService,
		public ref: DynamicDialogRef
	) {
		super(injector, messageService);
	}

	ProjectFileConst = ProjectFileConst;
	ProjectPolicyConst = ProjectPolicyConst;
	OpenSellFileConst = OpenSellFileConst;

	openSellFile: any = {
		openSellFileType: null,
		validTime: null,
		rstOpenSellFiles: [
			{
				openSellId: 0,
				name: "",
				url: "",
			},
		],
	};

	openSellId: number;

	rstProjectJuridicalFile: any = {
		name: "",
		url: "",
	};

	ngOnInit(): void {
		this.openSellFile.rstOpenSellFiles[0].openSellId = this.configDialog?.data?.openSellId;
		this.openSellId = this.configDialog?.data?.openSellId;
	}

	save() {
		if (this.validForm()) {
			if (this.openSellFile.validTime){
				this.openSellFile.rstOpenSellFiles.map(file => {
					file.validTime = this.openSellFile.validTime;
					return file;
				})
			}

			this._openSellFileService.create(this.openSellFile).subscribe(
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
		} else {
			this.messageError("Vui lòng nhập đủ thông tin cho các trường có dấu (*)");
		}
	}

	addvalue() {
		this.openSellFile.rstOpenSellFiles.push({ openSellId: this.openSellId });
	}

	deleteFile(index) {		
		this.confirmationService.confirm({
			message: "Xóa file này?",
			...AtributionConfirmConst,
			accept: () => {
				this.openSellFile.rstOpenSellFiles.splice(index, 1);
			},
		});
	}

	myUploader(event, index) {
		if (event?.files[0]) {
			this._contractTemplateService.uploadFileGetUrl(event?.files[0], "open-sell-file").subscribe((response) => {
			if (this.handleResponseInterceptor(response, "Upload thành công")) {
				this.openSellFile.rstOpenSellFiles[index].url = response.data;
			}},
			(err) => {
				this.messageError("Có sự cố khi upload!");
			});
		}
	}

	validForm(): boolean {
		let checked = true;
		if (!this.openSellFile?.openSellFileType) {
			checked = false;
		}
		if (this.openSellFile?.rstOpenSellFiles.length == 0) {
			checked = false;
		} else {
			this.openSellFile?.rstOpenSellFiles.forEach((file) => {
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
