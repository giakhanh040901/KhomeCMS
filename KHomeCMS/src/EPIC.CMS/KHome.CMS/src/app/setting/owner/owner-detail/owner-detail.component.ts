import { Component, Injector } from "@angular/core";
import { AppConsts, IssuerConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ActivatedRoute } from "@angular/router";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { OwnerServiceProxy } from "@shared/service-proxies/owner-service";
import { NationalityConst } from "@shared/nationality-list";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";
@Component({
	selector: "app-owner-detail",
	templateUrl: "./owner-detail.component.html",
	styleUrls: ["./owner-detail.component.scss"],
})
export class OwnerDetailComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private routeActive: ActivatedRoute,
		private dialogService: DialogService,
		private ownerService: OwnerServiceProxy,
		private breadcrumbService: BreadcrumbService
	) {
		super(injector, messageService);

		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Chủ đầu tư", routerLink: ["/setting/owner"] },
			{ label: "Chi tiết chủ đầu tư" },
		]);

		this.id = +this.cryptDecode(this.routeActive.snapshot.paramMap.get("id"));
	}

	id: number;
	ownerDetail: any = {};
	isEdit = false;
	labelButtonEdit = "Chỉnh sửa";

	IssuerConst = IssuerConst;

	NationalityConst = NationalityConst;

	caretPos: number = 0;
	baseUrl: string;

	htmlMarkdownOptions: any = [
		{
			value: "MARKDOWN",
			name: "MARKDOWN",
		},
		{
			value: "HTML",
			name: "HTML",
		},
	];

	content: string;
	contentType: string;

	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.isLoading = true;
		this.ownerService.getOwner(this.id).subscribe(
			(res) => {
				this.isLoading = false;
				if (this.handleResponseInterceptor(res, "")) {
					this.ownerDetail = res.data;
					this.content = this.ownerDetail?.descriptionContent ?? "";
					this.contentType =
						this.ownerDetail?.descriptionContentType ?? "MARKDOWN";
				}
			},
			(err) => {
				this.isLoading = false;
				console.log("Error-------", err);
			}
		);
	}

	insertImage() {
		if (this.isEdit) {
			const ref = this.dialogService.open(UploadImageComponent, {
				data: {
					inputData: [],
					showOrder: false,
				},
				header: "Chèn hình ảnh",
				width: "600px",
			});
			ref.onClose.subscribe((images) => {
				let imagesUrl = "";
				images.forEach((image) => {
					imagesUrl += `![](${this.baseUrl}/${image.data}) \n`;
				});

				let oldContentValue = this.content;
				let a =
					oldContentValue.slice(0, this.caretPos) +
					imagesUrl +
					oldContentValue.slice(this.caretPos);
				this.content = a;
			});
		}
	}

	getCaretPos(oField) {
		if (oField.selectionStart || oField.selectionStart == "0") {
			this.caretPos = oField.selectionStart;
			console.log("this.caretPos", this.caretPos);
		}
	}

	changeEdit() {
		console.log(this.ownerDetail);
		if (this.isEdit) {
			this.ownerDetail.descriptionContentType = this.contentType;
			this.ownerDetail.descriptionContent = this.content;
			let body = { ...this.ownerDetail };
			this.ownerService.update(body).subscribe((response) => {
				if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
					this.isEdit = !this.isEdit;
					this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
				}
			});
		} else {
			this.isEdit = !this.isEdit;
			this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
		}
	}
}
