import { Component, Injector, OnInit } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { MessageService } from "primeng/api";
import { AppConsts, MediaNewsConst, MediaConst, FormNotificationConst } from "@shared/AppConsts";
import { DialogService } from "primeng/dynamicdialog";
import { decode } from "html-entities";
import { FacebookPostService } from "@shared/services/project-post.service";
import { FacebookComponent } from "./facebook/facebook.component";
import { AddPostManuallyComponent } from "./add-post-manually/add-post-manually.component";
import { ActivatedRoute } from "@angular/router";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "app-project-post-manage",
	templateUrl: "./project-post-manage.component.html",
	styleUrls: ["./project-post-manage.component.scss"],
})
export class ProjectPostManageComponent extends CrudComponentBase implements OnInit {
	page = new Page();
	rows: any[] = [];
	MediaConst = MediaConst;
	MediaNewsConst = MediaNewsConst;
	AppConsts = AppConsts;
	showAddNewModel: Boolean;
	addNewModelSubmitted: Boolean;
	newsMedia: any;
	uploadedFiles: any[] = [];
	baseImgUrl: String;
	baseUrl: string;
	listAction: any[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		private _dialogService: DialogService,
		private facebookService: FacebookPostService,
		private routeActive: ActivatedRoute
	) {
		super(injector, messageService);
		this.showAddNewModel = false;
		this.addNewModelSubmitted = false;
		this.projectId = +this.cryptDecode(
			this.routeActive.snapshot.paramMap.get("id")
		);
	}
	projectId: any;

	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.setPage({ page: this.offset });
	}

	changeStatus() {
		this.setPage({ page: this.offset });
	}

	setLengthStringInScreen(ratio) {
		return (this.screenWidth / ratio).toFixed();
	}

	addManually() {
		let modal = this._dialogService.open(AddPostManuallyComponent, {
			header: "Thêm mới bài đăng facebook",
			width: "100vw",
			height: "100vh",
			contentStyle: {maxHeight: "100vh"},
			data: {
				inputData: null,
				projectId: this.projectId,
			},
		});
		modal.onClose.subscribe((result) => {
			if (result) {
				this.messageSuccess("Thêm thành công", "");
				this.offset = 0;
				this.setPage({ page: this.offset });
			}
		});
	}

	create() {
		let modal = this._dialogService.open(FacebookComponent, {
			data: {
				inputData: null,
			},
			header: "Thêm mới bài đăng facebook",
			width: "100%",
			style: { "max-height": "100%", "border-radius": "0px" },
		});
		modal.onClose.subscribe((result) => {
			if (result) {
				this.messageSuccess("Thêm thành công", "");
				this.offset = 0;
				this.setPage({ page: this.offset });
			}
		});
	}

	edit(row) {
		console.log("row", row);

		let modal = this._dialogService.open(AddPostManuallyComponent, {
			data: {
				inputData: row,
			},
			header: "Sửa bài đăng facebook",
			width: "100%",
			style: { "max-height": "100%", "border-radius": "0px" },
		});
		modal.onClose.subscribe((result) => {
			if (result) {
				this.messageSuccess("Cập nhật thành công", "");
				this.offset = 0;
				this.setPage({ page: this.offset });
			}
		});
	}

	genListAction(data = []) {
		this.listAction = data.map((item) => {
			const status = item?.approve?.status;

			const actions = [];

			if (
				this.isGranted([
					this.PermissionRealStateConst
						.RealStateProjectOverview_Facebook_Post_CapNhat,
				])
			) {
				actions.push({
					data: item,
					label: "Chỉnh sửa",
					icon: "pi pi-user-edit",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});
			}

			if (
				this.isGranted([
					this.PermissionRealStateConst
						.RealStateProjectOverview_Facebook_Post_DoiTrangThai,
				])
			) {
				if (
					item?.status == MediaConst.NHAP ||
					item?.status == MediaConst.TRINH_DUYET
				) {
					actions.push({
						data: item,
						label: "Duyệt đăng",
						icon: "pi pi-check-circle",
						command: ($event) => {
							this.approve($event.item.data);
						},
					});
				}

				if (item?.status == MediaConst.ACTIVE) {
					actions.push({
						data: item,
						label: "Bỏ duyệt đăng",
						icon: "pi pi-check-circle",
						command: ($event) => {
							this.approve($event.item.data);
						},
					});
				}
			}

			if (
				item?.status == MediaConst.NHAP &&
				this.isGranted([
					this.PermissionRealStateConst
						.RealStateProjectOverview_Facebook_Post_Xoa,
				])
			) {
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

	detectVideo(row) {
		row.content = decode(row.content);
		if (row.mainImg) {
			var isVideo = false;
			const images = ["jpg", "gif", "png"];
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

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;

		this.page.keyword = this.keyword;
		this.isLoading = true;
		this.page.pageSize = 20;
		this.facebookService
			.getAll(this.page, this.status, this.projectId)
			.subscribe(
				(res) => {
					this.isLoading = false;
					this.page.totalItems = res.totalResults;
					this.rows = res.results.map(this.detectVideo);
					this.genListAction(this.rows);
				},
				(err) => {
					this.isLoading = false;
					console.log("Error-------", err);
				}
			);
	}

	hideDialog() {
		this.showAddNewModel = false;
		this.addNewModelSubmitted = false;
	}

	getTypes() {
		let keys: any = [];
		for (let key in MediaConst.newsTypes) {
			keys.push({ key: key, value: MediaConst.newsTypes[key] });
		}
		return keys;
	}

	getStatus() {
		let keys: any = [];
		for (let key in MediaConst.mediaStatus) {
			keys.push({ key: key, value: MediaConst.mediaStatus[key] });
		}
		return keys;
	}

	header() {
		return "Thêm mới bài đăng facebook";
	}

	save() {
		console.log(this.newsMedia);
	}

	remove(row) {
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: "Bạn có muốn xoá bài đăng facebook?",
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				let body = {
					id: row?.id,
					status: "DELETED",
				};

				this.facebookService.updateStatus(body).subscribe(
					(res) => {
						this.messageSuccess("Xoá bài đăng facebook thành công");
						this.setPage({ page: 0 });
					},
					(err) => {
						this.messageError("Xoá bài đăng facebook thất bại");
					}
				);
			}
		});
	}

	approve(row) {
		var message = "Bạn có muốn duyệt đăng bài đăng facebook?";
		if (row.status == "ACTIVE") {
			message = "Bạn có muốn bỏ duyệt đăng bài đăng facebook?";
		}
		const ref = this._dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: message,
				icon: FormNotificationConst.IMAGE_APPROVE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				let body = {
					id: row?.id,
					status: row.status == "ACTIVE" ? "PENDING" : "ACTIVE",
				};
				row.status = row.status == "ACTIVE" ? "PENDING" : "ACTIVE";
				this.facebookService.updateStatus(body).subscribe(
					(res) => {
						this.messageSuccess("Cập nhật thành công");
						this.setPage({ page: 0 });
					},
					(err) => {
						this.messageError("Đăng bài đăng facebook thất bại");
					}
				);
			}
		});
	}
}
