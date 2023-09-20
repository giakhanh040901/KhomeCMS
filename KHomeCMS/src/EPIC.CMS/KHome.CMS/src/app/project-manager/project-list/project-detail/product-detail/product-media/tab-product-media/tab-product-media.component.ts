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
	selector: "app-tab-product-media",
	templateUrl: "./tab-product-media.component.html",
	styleUrls: ["./tab-product-media.component.scss"],
})
export class TabProductMediaComponent extends CrudComponentBase implements OnInit {
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
	dataMediaTypes: any;
	ProjectMedia = ProjectMedia;
	imgBackground = DEFAULT_MEDIA_RST.DEFAULT_IMAGE.IMAGE_ADD;
	imageStyle: any = {objectFit: 'cover', 'border-radius': '12px'};
	isLoadingPage: boolean;
	filters = {
		position: null,
		status: null,
	}
	@Input() productId;


	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		console.log('baseUrl!!!', this.baseUrl)
		this.dataMediaTypes = ProjectMedia.productTypes.map(type => {
		const item = {
			name: type.name,
			code: type.code,
			typeFile: type.typeFile,
			isMultiple: type.isMultiple,
			rstProjectMedias: [
			],
			description: type.description,
			maxSize: type.maxSize
		}
			return item;
		})
		this.setPage();
	}

	resetMediaType(){
		this.dataMediaTypes = ProjectMedia.productTypes.map(type => {
		  const item = {
			name: type.name,
			code: type.code,
			typeFile: type.typeFile,
			isMultiple: type.isMultiple,
			rstProjectMedias: [
			],
			description: type.description,
			maxSize: type.maxSize
		  }
		  return item;
		})
	}
	  
	insertImage(media){
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: 'Tải hình ảnh',
			width: '600px',
			data: {
				media: media,
			},
			
		});
		ref.onClose.subscribe(images => {
			let body = {
			location: media.code,
			rstProductItemMedias: []
			}
			if (images){
			images.forEach(image => {
				body.rstProductItemMedias.push({
					productItemId: this.productId,
					urlImage: image.data,
					urlPath: image.urlPath
				})
			})
			this.isLoadingPage = true;			
			this._productMediaService.create(body).subscribe( (res) => {
				if (this.handleResponseInterceptor(res, "Thêm thành công")) {
					this.isLoadingPage = false;			
					this.setPage();
				}
			}, (err) => {
				console.log("err---", err);
				this.isLoadingPage = false;			
				this.submitted = false;
			})
			}
		})
	}
	
	editImage(item){
		console.log('item: ', item);
		
		const ref = this.dialogService.open(UploadMediaComponent, {
			header: 'Chỉnh sửa hình ảnh',
			width: '500px',
			data: {
				mediaItem: item,
				isMultiple: false,
				mediaType: item.mediaType,
			},
		});
		ref.onClose.subscribe(images => {
			if (images?.urlPath){
				item.urlPath = images.urlPath;
				this._productMediaService.update(item).subscribe( (res) => {
					if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
						this.setPage();
					}
				}, (err) => {
				  console.log("err---", err);
				  this.submitted = false;
				})
			  } else if (images && images.length > 0) {
				item.urlImage = images[0].data;
				item.urlPath = images[0].urlPath;
		
				this._productMediaService.update(item).subscribe( (res) => {
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
	
	changeStatus(item){
		this.isLoadingPage = true;
		if (item.status == ProjectMedia.ACTIVE){
		  this._productMediaService.changeStatus(item.id, ProjectMedia.DEACTIVE).subscribe( (res) => {
			if (this.handleResponseInterceptor(res, "Hủy kích hoạt thành công")) {
			  this.setPage({ page: this.page.pageNumber });
			}
		  },(err) => {
			console.log("err----", err);
			this.messageError(AppConsts.messageError);
		  })
		}
		else if (item.status == ProjectMedia.DEACTIVE){
		  this._productMediaService.changeStatus(item.id, ProjectMedia.ACTIVE).subscribe( (res) => {
			if (this.handleResponseInterceptor(res, "Kích hoạt thành công")) {
			  this.setPage({ page: this.page.pageNumber });
			}
		  },(err) => {
			console.log("err----", err);
			this.isLoadingPage = false;
			this.messageError(AppConsts.messageError);
		  })
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
			this._productMediaService.delete(id).subscribe((response) => {
				if ( this.handleResponseInterceptor(response, "Xóa hình ảnh thành công")) {
				  this.setPage();
				}
			  }, (err) => {
				console.log('err____', err);
				this.messageError(`Không xóa được ảnh`);
			  });
		  } else {
	  
		  }
		});
	}
	
	processData(data){
		  data.forEach( item => {
			this.dataMediaTypes.forEach(type => {
			  if (type.code == item.location){
				type.rstProjectMedias.push(item);     
			  }
			})
		  })
		  console.log('chay xong: ', this.dataMediaTypes);
	}

	drop(event: CdkDragDrop<any>, index, media) {
		this.dataMediaTypes[index] = {...media};
		// Đổi chỗ item
		moveItemInArray(this.dataMediaTypes[index].rstProjectMedias, event.previousContainer.data.index, event.container.data.index);
		// 
		let body = {
		  "productItemId": this.productId,
		  "location": media.code,
		  "sort": this.dataMediaTypes[index].rstProjectMedias.map((item, index) => { 
			return { productItemMediaId: item.id, sortOrder: index + 1};
		  })
		}
		
		this._productMediaService.setPositionItem(body).subscribe((res) => {
		  this.handleResponseInterceptor(res, 'Cập nhật thành công');
		});
	  }

	setPage(pageInfo?: any){
		this.isLoadingPage = true;
		this._productMediaService.find(this.productId, this.filters).subscribe( (res) => {
		  this.isLoadingPage = false;
			if (this.handleResponseInterceptor(res)) {
				this.resetMediaType();
				this.processData(res.data);
		  	}
		}), (err) => {
		  this.isLoadingPage = false;
		  console.log('Error-------', err);
		}
	  }
}
