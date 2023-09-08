import { Component, Injector } from "@angular/core";
import { AppConsts, InvestorConst, KeyFilter } from "@shared/AppConsts";
import { OBJECT_INVESTOR_EKYC } from "@shared/base-object";
import { CrudComponentBase } from "@shared/crud-component-base";
import { NationalityConst } from "@shared/nationality-list";
import { OrderStepService } from "@shared/services/order-step-service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
const { DEFAULT_IMAGE, MODAL_EKYC_TYPE } = OBJECT_INVESTOR_EKYC;
const DATE_FIELDS_EKYC = ["dateOfBirth", "idIssueDate", "idIssueExpDate"];

@Component({
	selector: "app-order-view-images",
	templateUrl: "./order-view-images.component.html",
	styleUrls: ["./order-view-images.component.scss"],
})
export class OrderViewImagesComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public ref: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
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
	AppConsts = AppConsts;
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
	model: any = {
		frontImage: DEFAULT_IMAGE.IMAGE_FRONT,
		backImage: DEFAULT_IMAGE.IMAGE_BACK,
		passportImage: DEFAULT_IMAGE.IMAGE_PASSPORT,
		idType: "",
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
		if (this.configDialog?.data?.jointOwner) {
			this.model = this.configDialog?.data?.jointOwner;
			this.model.idFrontImageUrl =
				this.configDialog?.data?.jointOwner?.idFrontImageUrl;
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

	genBodyEkyc(model) {
		if (this.isPassport()) {
			return {
				FrontImage: model.passportImage,
				BackImage: model.passportImage,
				Type: model.idType.toLowerCase(),
			};
		}
		return {
			FrontImage: model.frontImage,
			BackImage: model.backImage,
			Type: model.idType.toLowerCase(),
		};
	}

	isPassport() {
		return this.model.idType === InvestorConst.ID_TYPES.PASSPORT;
	}

	close(statusResponse?: boolean) {
		this.ref.close(statusResponse);
	}
}
