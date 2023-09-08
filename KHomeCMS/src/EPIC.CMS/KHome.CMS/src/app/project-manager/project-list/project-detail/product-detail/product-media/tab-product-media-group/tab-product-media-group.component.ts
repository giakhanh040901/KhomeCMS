import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, Inject, Injector, Input, OnInit } from "@angular/core";
import { AppConsts, FormNotificationConst, ProjectMedia } from "@shared/AppConsts";
import { DEFAULT_MEDIA_RST } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies-base";
import { ProductMediaService } from "@shared/services/product-media.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "app-tab-product-media-group",
	templateUrl: "./tab-product-media-group.component.html",
	styleUrls: ["./tab-product-media-group.component.scss"],
})
export class TabProductMediaGroupComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public dialogService: DialogService,
		private _productMediaService: ProductMediaService,
		@Inject(API_BASE_URL) baseUrl?: string
	) {
		super(injector, messageService);
		this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
	}

	private baseUrl: string;
	imgBackground = DEFAULT_MEDIA_RST.DEFAULT_IMAGE.IMAGE_ADD;
	imageStyle: any = {objectFit: 'cover', 'border-radius': '12px'};
	filters = {
		status: null,
	}
	@Input() productId;

	ProjectMedia = ProjectMedia;

	dataMediaDetail: any;

	groupNameDefault: string = '';

	ngOnInit(): void {
		this.setPage();
	}

	editName(id){
		this.dataMediaDetail.map( item => {
			if (item.id == id){
			  item.isEdit = true;
			  this.groupNameDefault = item.groupTitle;
			  return;
			}
		  })
	}

	editImage(item){
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: 'Chỉnh sửa hình ảnh',
			width: '500px',
			data: {
				isMultiple: false,
				mediaType: 'IMAGE',
			},
		});
		ref.onClose.subscribe(images => {
		  if (images && images.length > 0) {
			item.urlImage = images[0].data;
	
			let body = {
			  id: item.id,
			  urlImage: item.urlImage
			}
			this._productMediaService.updateDetail(body).subscribe( (res) => {
			  if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
				this.setPage();
			  }
			}, (err) => {
			  console.log("err---", err);
			  this.submitted = false;
			})
		  }
		});
	  }

	cancelName(id){
		this.dataMediaDetail.map( item => {
			if (item.id == id){
			  item.isEdit = false;
			  item.groupTitle = this.groupNameDefault;
			  return;
			}
		  })
	}

	saveName(item){
		let body = {
		  id: item.id,
		  projectId: item.projectId,
		  groupTitle: item.groupTitle
		}
	
		this._productMediaService.update(body).subscribe( (res) => {
		  if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
			item.isEdit = false;
			this.setPage();
		  }
		}, (err) => {
			item.isEdit = false;
		  console.log("err---", err);
		  this.submitted = false;
		})
	}

	insertImage(){
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: 'Tải hình ảnh',
			width: '600px',
		  	data: {
			  	isCreateMediaGroup: true,
        		isMultiple: true,
		  	},
		});
		ref.onClose.subscribe(result => {
		  
		  let body = {
			productItemId: this.productId,
			groupTitle: result.groupTitle,
			rstProductItemMediaDetails: []
		  }
		  if (result.uploadedFiles){
			result.uploadedFiles.forEach(item => {
			  body.rstProductItemMediaDetails.push({urlImage: item.data})
			});
	
			this._productMediaService.createGroup(body).subscribe( (res) => {
			  if (this.handleResponseInterceptor(res, "Thêm thành công")) {
				this.setPage();
			  }
			}, (err) => {
			  console.log("err---", err);
			  this.submitted = false;
			})
		  }
		})
	}

	addMoreImage(productMediaDetail){
		const ref = this.dialogService.open(UploadMediaComponent, { 
			header: 'Tải hình ảnh',
			width: '600px',
			data: {
				isMultiple: true
			},
			
		});
	
		ref.onClose.subscribe(result => {
		  let body = {
			projectMediaId: productMediaDetail.id,
			rstProductItemMediaDetails: []
		  }
		  if (result){
			result.forEach(item => {
			  body.rstProductItemMediaDetails.push({urlImage: item.data})
			});
			this._productMediaService.add(body).subscribe( (res) => {
			  if (this.handleResponseInterceptor(res, "Thêm thành công")) {
				this.setPage();
			  }
			}, (err) => {
			  console.log("err---", err);
			  this.submitted = false;
			})
		  }
		})
	  }

	  changeStatus(item){
		this.isLoadingPage = true;
		if (item.status == ProjectMedia.ACTIVE){
		  this._productMediaService.changeStatusDetail(item.id, ProjectMedia.DEACTIVE).subscribe( (res) => {
			if (this.handleResponseInterceptor(res, "Hủy kích hoạt thành công")) {
			  this.setPage();
			}
		  },(err) => {
			console.log("err----", err);
			this.messageError(AppConsts.messageError);
		  })
		}
		else if (item.status == ProjectMedia.DEACTIVE){
		  this._productMediaService.changeStatusDetail(item.id, ProjectMedia.ACTIVE).subscribe( (res) => {
			if (this.handleResponseInterceptor(res, "Kích hoạt thành công")) {
			  this.setPage();
			}
		  },(err) => {
			console.log("err----", err);
			this.isLoadingPage = false;
			this.messageError(AppConsts.messageError);
		  })
		}
	}

	processData (data) {
		this.dataMediaDetail = data;
		this.dataMediaDetail.map( item => {
			item.isEdit = false;
		})
	}

	deleleGroup(id){
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: `Bạn có chắc chắn muốn xóa nhóm hình ảnh?`,
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
		  console.log({ dataCallBack });
		  if (dataCallBack?.accept) {
			this.isLoadingPage = true;
			this._productMediaService.delete(id).subscribe((response) => {
				if ( this.handleResponseInterceptor(response, "Xóa hình ảnh thành công")) {
				  this.isLoadingPage = false;
				  this.setPage();
				}
			  }, (err) => {
				console.log('err____', err);
				this.isLoadingPage = false;
				this.messageError(`Không xóa được ảnh`);
			  });
		  } else {
	  
		  }
		});
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
			this.isLoadingPage = true;
			this._productMediaService.deleteDetail(id).subscribe((response) => {
				if ( this.handleResponseInterceptor(response, "Xóa hình ảnh thành công")) {
				  this.isLoadingPage = false;
				  this.setPage();
				}
			  }, (err) => {
				console.log('err____', err);
				this.isLoadingPage = false;
				this.messageError(`Không xóa được ảnh`);
			  });
		  } else {
	  
		  }
		});
	}

	drop(event: CdkDragDrop<any>, index, media) {
		this.dataMediaDetail[index] = {...media};
		// Đổi chỗ item
		moveItemInArray(this.dataMediaDetail[index].productItemMediaDetails, event.previousContainer.data.index, event.container.data.index);
		// 
		let body = {
		  "productItemId": this.productId,
		  "sort": this.dataMediaDetail[index].productItemMediaDetails.map((item, index) => { 
		    return { productItemMediaDetailId: item.id, sortOrder: index + 1};
		  })
		}
		// // 
		this._productMediaService.setPositionItemDetail(body).subscribe((res) => {
		  this.handleResponseInterceptor(res, 'Cập nhật thành công');
		});
	  }
	

	setPage(){
		this.isLoadingPage = true;
		this._productMediaService.findGroup(this.productId, this.filters).subscribe( (res) => {
		  this.isLoadingPage = false;
				if(this.handleResponseInterceptor(res)) {
			this.processData(res.data);
		  }
		}), (err) => {
		  this.isLoadingPage = false;
		  console.log('Error-------', err);
		}
	}
	
}
