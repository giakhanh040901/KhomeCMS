import { Component, Inject, Injector, Input, OnInit } from "@angular/core";
import {
	AppConsts,
	FormNotificationConst,
	ProjectMedia,
} from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies-base";
import { ProjectMediaService } from "@shared/services/project-media.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
	selector: "app-tab-media",
	templateUrl: "./tab-media.component.html",
	styleUrls: ["./tab-media.component.scss"],
})
// const { DEFAULT_IMAGE, MODAL_EKYC_TYPE } = OBJECT_INVESTOR_EKYC;
export class TabMediaComponent extends CrudComponentBase implements OnInit {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public dialogService: DialogService,
		private _projectMediaService: ProjectMediaService,
		@Inject(API_BASE_URL) baseUrl?: string
	) {
		super(injector, messageService);
		this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
	}

	private baseUrl: string;
	dataMediaTypes: any = [];
	ProjectMedia = ProjectMedia;
	imgBackground = DEFAULT_MEDIA_RST.DEFAULT_IMAGE.IMAGE_ADD;
	imageStyle: any = { objectFit: "cover", "border-radius": "12px" };
	isLoadingPage: boolean;
	filters = {
		position: null,
		status: null,
	};
	@Input() projectId;

	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.dataMediaTypes = ProjectMedia.types.map((type) => {
			const item = {
				name: type.name,
				code: type.code,
				typeFile: type.typeFile,
				isMultiple: type.isMultiple,
				rstProjectMedias: [],
				description: type.description,
				maxSize: type.maxSize,
			};
			return item;
		});
		this.setPage();
	}

	resetMediaType() {
		this.dataMediaTypes = ProjectMedia.types.map((type) => {
			const item = {
				name: type.name,
				code: type.code,
				typeFile: type.typeFile,
				isMultiple: type.isMultiple,
				rstProjectMedias: [],
				description: type.description,
				maxSize: type.maxSize,
			};
			return item;
		});
	}

	insertImage(media) {
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: "Tải hình ảnh",
			width: "600px",
			data: {
				media: media,
			},
		});
		ref.onClose.subscribe((images) => {
			let body = {
				location: media.code,
				rstProjectMedias: [],
			};
			if (images) {
				if (images.urlPath) {
					body.rstProjectMedias.push({
						projectId: this.projectId,
						groupTitle: "",
						urlImage: null,
						urlPath: images.urlPath,
					});
				} else {
					images.forEach((image) => {
						body.rstProjectMedias.push({
							projectId: this.projectId,
							groupTitle: "",
							urlImage: image.data,
							urlPath: image.urlPath,
						});
					});
				}

				this.isLoadingPage = true;
				this._projectMediaService.create(body).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Thêm thành công")) {
							this.isLoadingPage = false;
							this.setPage();
						}
					},
					(err) => {
						console.log("err---", err);
						this.isLoadingPage = false;
						this.submitted = false;
					}
				);
			}
		});
	}

	editImage(item) {
		if (item.location === "Anh360" && !item.urlImage) {
			item.mediaType = "image";
		}
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: "Chỉnh sửa hình ảnh",
			width: "500px",
			data: {
				mediaItem: item,
				isMultiple: false,
				mediaType: item.mediaType,
			},
		});
		ref.onClose.subscribe((images) => {
			if (images?.urlPath) {
				item.urlPath = images.urlPath;
				this._projectMediaService.update(item).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err---", err);
						this.submitted = false;
					}
				);
			} else if (images && images.length > 0) {
				item.urlImage = images[0].data;
				item.urlPath = images[0].urlPath;

				this._projectMediaService.update(item).subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err---", err);
						this.submitted = false;
					}
				);
			}
		});
	}

	changeStatus(item) {
		this.isLoadingPage = true;
		if (item.status == ProjectMedia.ACTIVE) {
			this._projectMediaService
				.changeStatus(item.id, ProjectMedia.DEACTIVE)
				.subscribe(
					(res) => {
						if (
							this.handleResponseInterceptor(res, "Hủy kích hoạt thành công")
						) {
							this.setPage({ page: this.page.pageNumber });
						}
					},
					(err) => {
						console.log("err----", err);
						this.messageError(AppConsts.messageError);
					}
				);
		} else if (item.status == ProjectMedia.DEACTIVE) {
			this._projectMediaService
				.changeStatus(item.id, ProjectMedia.ACTIVE)
				.subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Kích hoạt thành công")) {
							this.setPage({ page: this.page.pageNumber });
						}
					},
					(err) => {
						console.log("err----", err);
						this.isLoadingPage = false;
						this.messageError(AppConsts.messageError);
					}
				);
		}
	}

	deleteImage(id) {
		const ref = this.dialogService.open(FormNotificationComponent, {
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
				this._projectMediaService.delete(id).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(
								response,
								"Xóa hình ảnh thành công"
							)
						) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không xóa được ảnh`);
					}
				);
			} else {
			}
		});
	}

	processData(data) {
		data.forEach((item) => {
			this.dataMediaTypes.forEach((type) => {
				if (type.code == item.location) {
					type.rstProjectMedias.push(item);
				}
			});
		});
	}

	setPage(pageInfo?: any) {
		this.isLoadingPage = true;
		this._projectMediaService
			.find(this.projectId, this.filters)
			.subscribe((res) => {
				this.isLoadingPage = false;
				if (this.handleResponseInterceptor(res)) {
					this.resetMediaType();
					this.processData(res.data);
				}
			}),
			(err) => {
				this.isLoadingPage = false;
				console.log("Error-------", err);
			};
	}

	drop(event: CdkDragDrop<any>, index, media) {
		this.dataMediaTypes[index] = { ...media };
		// Đổi chỗ item
		moveItemInArray(
			this.dataMediaTypes[index].rstProjectMedias,
			event.previousContainer.data.index,
			event.container.data.index
		);
		//
		let body = {
			projectId: this.projectId,
			location: media.code,
			sort: this.dataMediaTypes[index].rstProjectMedias.map((item, index) => {
				return { projectMediaId: item.id, sortOrder: index + 1 };
			}),
		};
		//
		this._projectMediaService.setPositionItem(body).subscribe((res) => {
			this.handleResponseInterceptor(res, "Cập nhật thành công");
		});
	}
}
