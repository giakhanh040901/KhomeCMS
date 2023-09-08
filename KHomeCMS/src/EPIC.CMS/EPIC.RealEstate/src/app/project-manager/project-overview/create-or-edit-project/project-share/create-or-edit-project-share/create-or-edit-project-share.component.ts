import { Component, Injector } from "@angular/core";
import { FormNotificationConst, ISelectButton, MessageErrorConst } from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { ProjectShareService } from "@shared/services/project-share.service";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";
import { UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

export const MARKDOWN_OPTIONS = {
	MARKDOWN: "MARKDOWN",
	HTML: "HTML",
};

@Component({
	selector: "app-create-or-edit-project-share",
	templateUrl: "./create-or-edit-project-share.component.html",
	styleUrls: ["./create-or-edit-project-share.component.scss"],
})
export class CreateOrEditProjectShareComponent extends CrudComponentBase {
	constructor(
		injector: Injector, 
		messageService: MessageService,
		private _dialogService: DialogService,
		private _projectShareService: ProjectShareService,
		private _configDialog: DynamicDialogConfig,
		private _contractTemplateService: DistributionService,
		public ref: DynamicDialogRef
	) {
		super(injector, messageService);
	}

	shareItem: any = {
		id: null,
		projectId: null,
		title: "",
		contentType: MARKDOWN_OPTIONS.MARKDOWN,
		overviewContent: "",
		documentFiles: [],
		imageFiles: []
	}

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

	public baseUrl: string = "";
	public caretPos: number = 0;

	imgBackground = DEFAULT_MEDIA_RST.DEFAULT_IMAGE.IMAGE_ADD;
	imageStyle: any = {objectFit: 'cover', 'border-radius': '12px'};
	
	isEdit: boolean = true;
	maxContentLength: number = 3000;
	ngOnInit(): void {
		this.baseUrl = this.AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.shareItem.projectId = this._configDialog?.data?.projectId;
		this.shareItem.id = this._configDialog?.data?.item?.id;
		this.isEdit = this._configDialog?.data?.isEdit ?? true;
		
		if (this.shareItem.id) {
			this._projectShareService.findById(this.shareItem.id).subscribe(res => {
				this.shareItem = res.data;
			})
		} 
	}

	public get MARKDOWN_OPTIONS() {
		return MARKDOWN_OPTIONS;
	}
	
	public get displayContent() {
	if (this.shareItem.overviewContent) return this.shareItem.overviewContent;
		return "Nội dung hiển thị";
	}

	  
	public insertImage() {
		const ref = this._dialogService.open(UploadImageComponent, {
			header: "Chèn hình ảnh",
			width: "600px",
			data: {
				inputData: [],
			},
		});
		ref.onClose.subscribe((images) => {
		  let imagesUrl = "";
		  images.forEach((image) => {
			imagesUrl += `![](${this.baseUrl}/${image.data}) \n`;
		  });
	
		  let oldContentValue = this.shareItem.overviewContent;
		  let a =
			oldContentValue?.slice(0, this.caretPos) +
			imagesUrl +
			oldContentValue?.slice(this.caretPos);
		  this.shareItem.overviewContent = a;
		});
	}
	
	checkContentLength() {
		if (this.shareItem.overviewContent.length > this.maxContentLength) {
		  this.shareItem.overviewContent = this.shareItem.overviewContent.substring(0, this.maxContentLength);
		}
	  }

	getCaretPos(oField) {
		if (oField.selectionStart || oField.selectionStart == '0') {
			this.caretPos = oField.selectionStart;
			console.log("this.caretPos", this.caretPos);
		}
	}

	myUploader(event, index) {
		if (event?.files[0]) {
			this._contractTemplateService.uploadFileGetUrl(event?.files[0], "realState").subscribe( (response) => {
				if (this.handleResponseInterceptor(response, "Upload thành công")) {
					this.shareItem.documentFiles[index].fileUrl = response.data;

				}},
				(err) => {
					this.messageError("Có sự cố khi upload!");
				}
			);
		}
	}

	myMultiUploader(event){
		if (event?.files) {
			console.log('event: ', event);
			event?.files.forEach(file => {
				this._contractTemplateService.uploadFileGetUrl(file, "realState").subscribe( (response) => {
					console.log({response,});
					if (response?.code === 0) {
						switch (response?.status) {
							case 200:
								break;
							case 0:
								this.messageError(response?.message || "");
								break;
							default:
								this.messageError("Có sự cố khi upload!");
								break;
						}
					} else if (response?.code === 200) {
						this.shareItem.documentFiles.push({name: "", fileUrl: response.data})
					}
				},
				(err) => {
					this.messageError("Có sự cố khi upload!");
				}
			);
			});
		};
	}

	insertImageFile(){
		const ref = this._dialogService.open(UploadMediaComponent, {
			header: 'Tải hình ảnh',
			width: '600px',
			data: {
				isMultiple: true,
			},
		});
		ref.onClose.subscribe(images => {
			if (images) {
				images.forEach(image => {
					this.shareItem.imageFiles.push({
						name: '',
						fileUrl: image.data,
					})
			  })
			}
		})
	}
	editImage(item){
		if (this.isEdit){
			const ref = this._dialogService.open(UploadMediaComponent, {
				header: 'Chỉnh sửa hình ảnh',
				width: '500px',
				data: {
					isMultiple: false,
					mediaType: 'IMAGE'
				},
			  });
			  ref.onClose.subscribe(images => {
				  if (images) {
					  item.fileUrl = images[0].data;
				  }
			  });
		}
	}

	deleteImage(index) {
		if (this.isEdit) {
			const ref = this._dialogService.open(FormNotificationComponent, {
				header: "Thông báo",
				width: "600px",
				data: {
					title: `Bạn có chắc chắn muốn xóa hình ảnh?`,
					icon: FormNotificationConst.IMAGE_CLOSE,
				},
			});
			ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this.shareItem.imageFiles.slice(index, 1);
			} 
			});
		}
	}

	validForm(): boolean {
		let checkFile = true;
		if (this.shareItem.documentFiles.length > 0){
			this.shareItem.documentFiles.forEach(item => {
				if (!item.name) {
					checkFile = false;
				}
			})
		}
		const validRequired = this.shareItem.projectId
                        && this.shareItem.title
                        && checkFile
		return validRequired;
	}

	save(){
		if (this.validForm()){
			if (this.shareItem.id){
				this._projectShareService.update(this.shareItem).subscribe((res) => {
					if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
						this.ref.close(true);
					}
					},(err) => {
					console.log("err---", err);
					this.submitted = false;
				})
			} else {
				this._projectShareService.create(this.shareItem).subscribe((res) => {
					if (this.handleResponseInterceptor(res, "Thêm thành công")) {
						this.ref.close(true);
					}
					},(err) => {
					console.log("err---", err);
					this.submitted = false;
				})
			} 
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	close($event){
		this.ref.close();
	}
}
