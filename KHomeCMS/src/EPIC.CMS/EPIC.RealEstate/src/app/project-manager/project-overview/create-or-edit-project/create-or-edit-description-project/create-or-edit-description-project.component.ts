import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { AppConsts, ISelectButton } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";
export const MARKDOWN_OPTIONS = {
	MARKDOWN: "MARKDOWN",
	HTML: "HTML",
};

@Component({
	selector: "create-or-edit-description-project",
	templateUrl: "./create-or-edit-description-project.component.html",
	styleUrls: ["./create-or-edit-description-project.component.scss"],
})
export class CreateOrEditDescriptionProjectComponent extends CrudComponentBase {
	public htmlMarkdownOptions: ISelectButton[] = [
		{
			name: "MARKDOWN",
			value: MARKDOWN_OPTIONS.MARKDOWN,
		},
		{
			name: "HTML",
			value: MARKDOWN_OPTIONS.HTML,
		},
	];
	public isEdit: boolean = false;
	public descriptionProject: {
		contentType: string;
		content: string;
	} = {
		contentType: MARKDOWN_OPTIONS.MARKDOWN,
		content: "",
	};
	public baseUrl: string = "";
	public caretPos: number = 0;
	public messSuccess: string = "";

	constructor(
		injector: Injector,
		messageService: MessageService,
		public projectOverviewService: ProjectOverviewService,
		public dialogService: DialogService,
		public changeDetectorRef: ChangeDetectorRef
	) {
		super(injector, messageService);
	}

	ngOnInit() {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
	}

	ngAfterViewInit() {
		if (
			this.projectOverviewService.selectedProjectDTO &&
			this.projectOverviewService.selectedProjectDTO.contentType &&
			this.projectOverviewService.selectedProjectDTO.overviewContent
		) {
			this.descriptionProject.contentType =
				this.projectOverviewService.selectedProjectDTO.contentType;
			this.descriptionProject.content =
				this.projectOverviewService.selectedProjectDTO.overviewContent;
			this.isEdit = false;
			this.messSuccess = "Cập nhật thành công";
		} else {
			this.isEdit = false;
			this.messSuccess = "Thêm mới thành công";
		}
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
	}

	public get MARKDOWN_OPTIONS() {
		return MARKDOWN_OPTIONS;
	}

	public get displayContent() {
		if (this.descriptionProject.content) return this.descriptionProject.content;
		return "Nội dung hiển thị";
	}

	public save(event: any) {
		if (event) {
			if (this.validData) {
				const param = {
					id: this.projectOverviewService.selectedProjectId,
					contentType: this.descriptionProject.contentType,
					overviewContent: this.descriptionProject.content,
				};
				this.projectOverviewService.updateDescriptionProject(param).subscribe(
					(response) => {
						if (this.handleResponseInterceptor(response, this.messSuccess)) {
							this.isEdit = false;
							this.projectOverviewService.getProjectById();
						}
					},
					(err) => {
						this.submitted = false;
					}
				);
			} else {
				this.messageError(this.messSuccess);
			}
		}
	}

	public insertImage() {
		if (this.isEdit) {
			const ref = this.dialogService.open(UploadImageComponent, {
				header: "Chèn hình ảnh",
				width: "600px",
				data: {
					inputData: [],
					showOrder: false,
				},
			});
			ref.onClose.subscribe((images) => {
				let imagesUrl = "";
				images.forEach((image) => {
					imagesUrl += `![](${this.baseUrl}/${image.data}) \n`;
				});

				let oldContentValue = this.descriptionProject.content;
				let a =
					oldContentValue.slice(0, this.caretPos) +
					imagesUrl +
					oldContentValue.slice(this.caretPos);
				this.descriptionProject.content = a;
			});
		}
	}

	private validData() {
		return (
			this.descriptionProject.content && this.descriptionProject.content.length
		);
	}

	public getCaretPos(oField) {
		if (oField.selectionStart || oField.selectionStart == "0") {
			this.caretPos = oField.selectionStart;
		}
	}
}
