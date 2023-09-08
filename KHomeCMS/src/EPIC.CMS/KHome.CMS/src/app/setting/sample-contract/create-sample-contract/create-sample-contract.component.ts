import { Component, Injector } from "@angular/core";
import { MessageErrorConst, SampleContractConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { SampleContractService } from "@shared/services/sample-contract.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-create-sample-contract",
	templateUrl: "./create-sample-contract.component.html",
	styleUrls: ["./create-sample-contract.component.scss"],
})
export class CreateSampleContractComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public ref: DynamicDialogRef,
		public configDialog: DynamicDialogConfig,
		private _distributionService: DistributionService,
		private _sampleContractService: SampleContractService
	) {
		super(injector, messageService);
	}

	SampleContractConst = SampleContractConst;

    sampleContract: any = {
		name: null,
		contractType: null,
		contractSource: SampleContractConst.TAT_CA,
		fileInvestor: null,
		fileBusinessCustomer: null,
	  }

	submitted: boolean;
	
	ngOnInit(): void {
		if (this.configDialog?.data?.sampleContract) {
			this.sampleContract = this.configDialog?.data?.sampleContract;
		}
	}

	myUploaderInvestor(event) {
		if (event?.files[0]) {
			this._distributionService
				.uploadFileGetUrl(event?.files[0], "sample-contract-file")
				.subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Tải file thành công!")
						) {
							this.sampleContract.fileInvestor = response.data;
						}
					},
					(err) => {
						console.log("err__", err);
						this.messageError("Có sự cố khi upload!");
					}
				);
		}
	}

	myUploaderBusinessCustomer(event) {
		if (event?.files[0]) {
			this._distributionService
				.uploadFileGetUrl(event?.files[0], "sample-contract-file")
				.subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Tải file thành công!")
						) {
							this.sampleContract.fileBusinessCustomer = response.data;
						}
					},
					(err) => {
						console.log("err__", err);
						this.messageError("Có sự cố khi upload!");
					}
				);
		}
	}

	close() {
		this.ref.close();
	}

	save() {
		if (this.validForm()) {
			if (this.sampleContract?.id) {
				this.submitted = true;
				this._sampleContractService.update(this.sampleContract).subscribe(
					(response) => {
						if (
							this.handleResponseInterceptor(response, "Cập nhật thành công")
						) {
							this.ref.close(true);
						}
						this.submitted = false;
					},
					(err) => {
						console.log("err---", err);
						this.submitted = false;
					}
				);
			} else {
				this.submitted = true;
				this._sampleContractService.create(this.sampleContract).subscribe(
					(response) => {
						if (this.handleResponseInterceptor(response, "Thêm thành công")) {
							this.ref.close(true);
						}
					},
					(err) => {
						this.submitted = false;
						console.log("err---", err);
					}
				);
			}
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	validForm(): boolean {
		const validRequired =
			this.sampleContract?.name &&
			this.sampleContract?.contractType &&
			this.sampleContract?.contractSource &&
			this.sampleContract?.fileInvestor &&
			this.sampleContract?.fileBusinessCustomer;

		return validRequired;
	}
}
