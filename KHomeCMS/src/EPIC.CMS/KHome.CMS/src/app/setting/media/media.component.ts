import { Component, Injector, OnInit } from "@angular/core";
import { AppConsts, FormNotificationConst, MediaConst, MediaNewsConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { MediaService } from "@shared/service-proxies/setting-service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { AddMediaComponent } from "./add-media/add-media.component";
import { decode } from "html-entities";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
@Component({
	selector: "app-media",
	templateUrl: "./media.component.html",
	styleUrls: ["./media.component.scss"],
})
export class MediaComponent extends CrudComponentBase implements OnInit {
	page = new Page();
	rows: any[] = [];
	MediaConst = MediaConst;
	MediaNewsConst = MediaNewsConst;
	showAddNewModel: Boolean;
	addNewModelSubmitted: Boolean;
	newsMedia: any;
	uploadedFiles: any[] = [];
	listAction: any[] = [];
	baseImgUrl: String;
	baseUrl: string;
	position: any;
	type: any;

	constructor(
		injector: Injector,
		messageService: MessageService,
		// private _contractTemplateService: ContractTemplateServiceProxy,
		private broadcastService: MediaService,
		public dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private confirmationService: ConfirmationService,
		private _dialogService: DialogService
	) {
		super(injector, messageService);
		this.showAddNewModel = false;
		this.addNewModelSubmitted = false;
	}

	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.setPage({ page: this.offset });
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Danh sách hình ảnh hiển thị" },
		]);
	}

	genListAction(data = []) {
		this.listAction = data.map((item) => {
			const actions = [];

			if (item.status != this.MediaConst.status.DELETED) {
				actions.push({
					data: item,
					label: "Sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
			}

			if (item.status == this.MediaConst.status.DELETED) {
				actions.push({
					data: item,
					label: "Xem chi tiết",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.detailDelete($event.item.data);
					},
				});
			}

			if (
				item.status == this.MediaConst.status.PENDING ||
				item.status == this.MediaConst.status.DRAFT
			) {
				actions.push({
					data: item,
					label: "Duyệt đăng",
					icon: "pi pi-check",
					command: ($event) => {
						this.approve($event.item.data);
					},
				});
			}

			if (item.status == this.MediaConst.status.ACTIVE) {
				actions.push({
					data: item,
					label: "Bỏ duyệt đăng",
					icon: "pi pi-times",
					command: ($event) => {
						this.approve($event.item.data);
					},
				});
			}

			if (item.status != this.MediaConst.status.DELETED) {
				actions.push({
					data: item,
					label: "Xoá",
					icon: "pi pi-trash",
					command: ($event) => {
						this.remove($event.item.data);
					},
				});
			}

			return actions;
		});
	}

	detailDelete(row) {
		const ref = this.dialogService
			.open(AddMediaComponent, {
				data: {
					inputData: row,
				},
				header: "Xem hình ảnh",
				width: "800px",
			})
			.onClose.subscribe(() => {
				this.offset = 0;
				this.setPage({ page: this.offset });
			});
	}

	changeStatus() {
		this.setPage({ page: this.offset });
	}

	changeType() {
		this.setPage({ page: this.offset });
	}

	changePosition() {
		this.setPage({ page: this.offset });
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		// this.page.pageSize = 20;
		this.broadcastService
			.getAllMedia(this.page, this.status, "estate_invest", this.position)
			.subscribe(
				(res) => {
					this.isLoading = false;
					this.page.totalItems = res.totalResults;
					this.rows = res.results.map(this.detectVideo);
					this.genListAction(this.rows);
				},
				(err) => {
					this.isLoading = false;
					console.log("Error", err);
				}
			);
	}

	setLengthStringForScreen(ratio) {
		return (this.screenWidth / ratio).toFixed();
	}

	detectVideo(row) {
		row.content = decode(row.content);
		if (row.mainImg) {
			var isVideo = false;
			let videos = ["mp4", "3gp", "ogg", "mkv"];
			for (var i = 0; i < videos.length; i++) {
				if (row.mainImg.search(videos[i]) > -1) {
					isVideo = true;
					break;
				}
			}
		}
		return { ...row, isVideo };
	}
	create() {
		const ref = this.dialogService
			.open(AddMediaComponent, {
				data: {
					inputData: null,
				},
				header: "Thêm mới hình ảnh",
				width: "800px",
			})
			.onClose.subscribe((result) => {
				this.offset = 0;
				this.setPage({ page: this.offset });
			});
	}
	edit(row) {
		const ref = this.dialogService
			.open(AddMediaComponent, {
				data: {
					inputData: row,
				},
				header: "Chỉnh sửa hình ảnh",
				width: "800px",
			})
			.onClose.subscribe(() => {
				this.offset = 0;
				this.setPage({ page: this.offset });
			});
	}

	remove(row) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có chắc chắn xóa hình ảnh?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				row.status = "DELETED";
				this.broadcastService.saveMedia(row).subscribe(
					(response) => {
						if (row.status == "DELETED") {
							this.messageSuccess('Xoá hình ảnh thành công!');
							this.setPage();
						}
					},
					() => {
						this.messageError('Xoá hình ảnh thất bại!')
					}
				);
			}
		});
	}

	approve(row) {
		var messageMedia = "Bạn có muốn duyệt đăng hình ảnh?";
		var headerMedia = "Đăng hình ảnh";
		if (row.status == "ACTIVE") {
			messageMedia = "Bạn có muốn bỏ duyệt đăng hình ảnh?";
			headerMedia = "Bỏ đăng hình ảnh";
		}
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: messageMedia,
				icon: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				row.status = row.status == "ACTIVE" ? "PENDING" : "ACTIVE";
				this.broadcastService.saveMedia(row).subscribe(
					(res) => {
						if (row.status != "DELETED") {
							this.messageSuccess('Cập nhật thành công');
							this.setPage();
						}
					},
					() => {
						this.messageError("Đăng hình ảnh thất bại");
					}
				);
			}
		});
	}
}
