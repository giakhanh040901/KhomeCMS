import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { InvestorConst, KeyFilter } from "@shared/AppConsts";
import { OBJECT_INVESTOR_EKYC } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { NationalityConst } from "@shared/nationality-list";
import { FileServiceProxy } from "@shared/service-proxies/file-service";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { OrderStepService } from "@shared/services/order-step-service";

import { AppUtilsService } from "@shared/services/utils.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
const { DEFAULT_IMAGE, MODAL_EKYC_TYPE } = OBJECT_INVESTOR_EKYC;
const DATE_FIELDS_EKYC = ["dateOfBirth", "idIssueDate", "idIssueExpDate"];

@Component({
	selector: "app-add-joint-owner",
	templateUrl: "./add-joint-owner.component.html",
	styleUrls: ["./add-joint-owner.component.scss"],
})
export class AddJointOwnerComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public ref: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
		private _fileService: FileServiceProxy,
		private _orderService: OrderServiceProxy,
		public _orderStepService: OrderStepService
	) {
		super(injector, messageService);
	}
	isTemp: any;
	investorId: any;
	isSend: boolean;
	row: any;
	col: any;
	InvestorConst = InvestorConst;
	NatinalityList = NationalityConst.List;
	KeyFilter = KeyFilter;
	replaceIdentification: any = {};
	isInvestorVerified: boolean;
	listIdentification: any;
	investorGroupId: any;
	isLoadingBank: boolean;
	blockText: RegExp = /[0-9,.]/;
	submitted: boolean;
	cols: any[];
	statuses: any[];
	public investorEkyc: any = {};
	isDisable: boolean;
	public model: any = {
		frontImage: DEFAULT_IMAGE.IMAGE_FRONT,
		backImage: DEFAULT_IMAGE.IMAGE_BACK,
		passportImage: DEFAULT_IMAGE.IMAGE_PASSPORT,
		type: "",
	};
	fieldDates = [
		"dateOfBirth",
		"idDate",
		"idExpiredDate",
		"idIssueDate",
		"idIssueExpDate",
	];
	isToastIdentifi: boolean = true;

	ngOnInit(): void {
		if (this.configDialog?.data?.listIdentification) {
			this.model = this.configDialog?.data?.listIdentification;
			this.model.idFrontImageUrl =
				this.configDialog?.data?.listIdentification?.idFrontImageUrl;
		}
	}

	fixFloatToast() {
		this.isToastIdentifi = false;
		setTimeout(() => {
			this.isToastIdentifi = true;
		}, 0);
	}

	genBodyInvestor(imageFront, imageBack) {
		let investorEkyc = this.formatCalendar(this.fieldDates, {
			...this.investorEkyc,
		});
		let fixRequired;
		if (investorEkyc?.ownerAccount != null) {
			// fixRequired = this.removeVietnameseTones(investorEkyc?.ownerAccount).toUpperCase( );
		}

		const body = {
			phone: investorEkyc.phone,
			email: investorEkyc.email,
			representativePhone: investorEkyc.representativePhone,
			representativeEmail: investorEkyc.representativeEmail,
			idType: this.model.type,
			idNo: investorEkyc.idNo,
			fullname: investorEkyc.name,
			dateOfBirth: investorEkyc.dateOfBirth,
			nationality: investorEkyc.nationality,
			personalIdentification: "",
			idIssuer: investorEkyc.idIssuer,
			idDate: investorEkyc.idIssueDate,
			idExpiredDate: investorEkyc.idIssueExpDate,
			placeOfOrigin: investorEkyc.placeOfOrigin,
			placeOfResidence: investorEkyc.placeOfResidence,
			sex: investorEkyc.sex,
			idFrontImageUrl: imageFront,
			idBackImageUrl: imageBack,
			idExtraImageUrl: "",
			faceImageUrl: "",
			faceVideoUrl: "",
			bankId: investorEkyc.bankId,
			bankAccount: investorEkyc.bankAccount,
			ownerAccount: fixRequired,
			address: "",
			securityCompany: 0,
			stockTradingAccount: "",
			investorId: 0,
			investorGroupId: 0,
			isTemp: true,
			identificationId: this.replaceIdentification.identificationId,
		};

		return body;
	}

	onSaveFinal() {
		const folder = "order/joint-owner";
		const temp = this.isTemp === 1;
		if (this.isPassport()) {
			this._fileService
				.uploadFile(
					{
						file: this.model.passportImage,
					},
					folder
				)
				.subscribe((res) => {
					let body = {};
					body = {
						...this.genBodyInvestor(res.data, res.data),
					};
					this.ref.close(body);
				});
		} else {
			this.isLoading = true;
			forkJoin([
				this._fileService.uploadFile({ file: this.model.frontImage }, folder),
				this._fileService.uploadFile({ file: this.model.backImage }, folder),
			]).subscribe(([resFront, resBack]) => {
				let body = {};
				body = {
					...this.genBodyInvestor(resFront.data, resBack.data),
				};
				this.ref.close(body);
			});
		}
	}

	genBodyEkyc(model) {
		if (this.isPassport()) {
			return {
				FrontImage: model.passportImage,
				BackImage: model.passportImage,
				Type: model.type.toLowerCase(),
			};
		}
		return {
			FrontImage: model.frontImage,
			BackImage: model.backImage,
			Type: model.type.toLowerCase(),
		};
	}

	postEkyc() {
		const body = this.genBodyEkyc(this.model);
		this.isSend = true;
		this.isLoading = true;
		this._orderService
			.postEkyc(body)
			.subscribe(
				(res) => {
					if (this.handleResponseInterceptor(res, "Lấy thông tin thành công")) {
						this.investorEkyc = {
							...res?.data,
						};

						DATE_FIELDS_EKYC.forEach((field) => {
							const value = res?.data[field];
							this.investorEkyc[field] = value ? new Date(value) : null;
						});
					} else {
						this.callTriggerFiledError(res, {});
					}
				},
				(err) => {}
			)
			.add(() => {
				this.isSend = false;
				this.isLoading = false;
			});
	}

	onSave() {
		if (Object.keys(this.investorEkyc).length > 0) {
			this.isDisable = true;
			this.onSaveFinal();
		} else {
			this.postEkyc();
		}
	}

	saveLabel() {
		if (Object.keys(this.investorEkyc).length > 0) {
			this.isDisable = true;

			return "Lưu lại";
		}
		return "Gửi";
	}

	undo() {
		this.isDisable = false;
		this.investorEkyc = {};
		Object.keys(this.model).forEach((key) => {
			this.model[key] = "";
		});

		this.model.frontImage = DEFAULT_IMAGE.IMAGE_FRONT;
		this.model.backImage = DEFAULT_IMAGE.IMAGE_BACK;
		this.model.passportImage = DEFAULT_IMAGE.IMAGE_PASSPORT;
	}

	isPassport() {
		return this.model.type === InvestorConst.ID_TYPES.PASSPORT;
	}

	close(statusResponse?: boolean) {
		this.ref.close(statusResponse);
	}

	validForm(): boolean {
		const validRequired = this.replaceIdentification?.name;

		return validRequired;
	}
}
