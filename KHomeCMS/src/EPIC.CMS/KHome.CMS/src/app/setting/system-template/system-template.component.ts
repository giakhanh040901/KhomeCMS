import { Component, Injector, OnInit } from "@angular/core";
import { AppConsts, AtributionConfirmConst } from "@shared/AppConsts";
import { NotificationService } from "@shared/service-proxies/notification-service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { decode } from "html-entities";
import { CrudComponentBase } from "@shared/crud-component-base";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";

@Component({
	selector: "app-system-template",
	templateUrl: "./system-template.component.html",
	styleUrls: ["./system-template.component.scss"],
	providers: [DialogService, ConfirmationService, MessageService],
})
export class SystemTemplateComponent
	extends CrudComponentBase
	implements OnInit
{
	baseUrl: string;
	systemNotificationTemplate: any;
	items: any[];
	itemsAdmin: any[];
	itemSelected: any;
	itemSelectedAdmin: any;
	caretPos: number = 0;
	actionsList: any = [
		{ value: "PUSH_NOTIFICATION", name: "Đẩy thông báo trên app" },
		{ value: "SEND_SMS", name: "Gửi SMS" },
		{ value: "SEND_EMAIL", name: "Gửi email" },
	];
	currentKey: any;
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
	configKeys: any = {};

	constructor(
		private notificationService: NotificationService,
		private dialogService: DialogService,
		injector: Injector,
		protected messageService: MessageService,
		private breadcrumbService: BreadcrumbService,
		public confirmationService: ConfirmationService
	) {
		super(injector, messageService);

		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Cài đặt" },
			{ label: "Cấu hình thông báo từ hệ thống" },
		]);
	}

	ngOnInit(): void {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.systemNotificationTemplate = {
			key: "",
			notificationTemplateName: "",
			description: "",
			actions: [],
			emailContentType: "MARKDOWN",
			pushAppContentType: "MARKDOWN",
			smsContentType: "MARKDOWN",
			emailContent: "",
			pushAppContent: "",
			smsContent: "",
			titleAppContent: "",
		};

		this.notificationService.getSystemNotification("real_estate").subscribe(
			(data) => {
				if (data && data.configKeys) {
					var normalizedSettings = new Object();
					if (data.value.settings) {
						data.value.settings.forEach((setting) => {
							normalizedSettings[setting.key] = { ...setting };
						});
						//Nếu FE chưa có thì bôt sung thêm config vào.
						data.configKeys.forEach((config) => {
							if (
								normalizedSettings[config.key]?.hasOwnProperty("isAdmin") &&
								config?.isAdmin
							) {
								normalizedSettings[config.key].isAdmin = true;
								normalizedSettings[config.key].adminEmailDisplay =
									normalizedSettings[config.key].adminEmail.map((email) => ({
										email,
									}));
							}
							if (!normalizedSettings[config.key]) {
								normalizedSettings[config.key] = config?.isAdmin
									? { ...config, adminEmailDisplay: [] }
									: { ...config };
							}
						});
					} else {
						data.configKeys.forEach((config) => {
							normalizedSettings[config.key] = config?.isAdmin
								? { ...config, adminEmailDisplay: [] }
								: { ...config };
						});
					}
					this.configKeys = normalizedSettings;
					this.itemsAdmin = data?.configKeys
						.filter((item) => item.isAdmin)
						.map((item) => ({
							...item,
							notificationTemplateName:
								item.notificationTemplateName + " [Admin]",
						}));
					this.items = data?.configKeys?.filter((item) => !item.isAdmin);
				}
			},
			(error) => {
				return this.messageError('Lỗi khi tải cấu hình thông báo');
			}
		);
	}

	addvalue(item) {
		this.configKeys[this.currentKey].adminEmailDisplay.push({ email: null });
	}

	removeElement(index) {
		this.confirmationService.confirm({
			message: "Xóa email này?",
			...AtributionConfirmConst,
			accept: () => {
				this.configKeys[this.currentKey].adminEmailDisplay.splice(index, 1);
			},
		});
	}

	notificationChange(item, isAdmin) {
		console.log("item", item);
		isAdmin ? (this.itemSelected = null) : (this.itemSelectedAdmin = null);
		this.currentKey = item.key;
		this.configKeys[this.currentKey].pushAppContent = decode(
			this.configKeys[this.currentKey].pushAppContent
		);
		this.configKeys[this.currentKey].emailContent = decode(
			this.configKeys[this.currentKey].emailContent
		);
	}

	saveSetting() {
		if (this.configKeys[this.currentKey]?.adminEmailDisplay?.length) {
			this.configKeys[this.currentKey].adminEmail = this.configKeys[
				this.currentKey
			].adminEmailDisplay.map((obj) => obj.email);
		}
		var settings = Object.keys(this.configKeys).map((key) => {
			return {
				key,
				...this.configKeys[key],
			};
		});
		this.notificationService
			.createOrUpdateSystemNotification(settings, "real_estate")
			.subscribe(
				(data) => {
					return this.messageSuccess("Cập nhật thành công");
				},
				(error) => {
					return this.messageError("Lỗi khi cập nhật cấu hình thông báo"); 
				}
			);
	}

	insertImage(contentName) {
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

			let oldEmailContentValue = this.configKeys[this.currentKey][contentName];
			let a =
				oldEmailContentValue.slice(0, this.caretPos) +
				imagesUrl +
				oldEmailContentValue.slice(this.caretPos);
			this.configKeys[this.currentKey][contentName] = a;
		});
	}

	getCaretPos(oField) {
		if (oField.selectionStart || oField.selectionStart == "0") {
			this.caretPos = oField.selectionStart;
		}
	}
}
