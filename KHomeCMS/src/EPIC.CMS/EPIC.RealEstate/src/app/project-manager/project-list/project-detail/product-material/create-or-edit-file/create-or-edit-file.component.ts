import { Component, Injector, OnInit } from "@angular/core";
import { MessageErrorConst, ProductItemFileConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { ProductDiagramService } from "@shared/services/product-diagram.service";
import { ProductMaterialService } from "@shared/services/product-material.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
	selector: "app-create-or-edit-file",
	templateUrl: "./create-or-edit-file.component.html",
	styleUrls: ["./create-or-edit-file.component.scss"],
})
export class CreateOrEditFileComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		public configDialog: DynamicDialogConfig,
		private _contractTemplateService: DistributionService,
		public confirmationService: ConfirmationService,
		private _productMaterialService: ProductMaterialService,
		private _productDiagramService: ProductDiagramService,
		public ref: DynamicDialogRef
	) {
		super(injector, messageService);
	}

	productItemFile = {
		productItemId: 0,
		files: [{
			id: null,
			name: "",
			fileUrl: ""
		}],
	}
	source: string;
	isEdit: boolean = false;

	ngOnInit(): void {
		this.productItemFile.productItemId = this.configDialog?.data?.productItemId;
		this.source = this.configDialog?.data?.source;
		this.isEdit = this.configDialog?.data?.isEdit ?? false;
		if (this.configDialog?.data?.fileUpdate){
			this.productItemFile.files[0] = this.configDialog?.data?.fileUpdate; 
			
		}
		console.log('!!! ', this.productItemFile);
	}

	myUploader(event, index) {
		if (event?.files[0]) {
			this._contractTemplateService.uploadFileGetUrl(event?.files[0], this.source).subscribe((response) => {
			if (this.handleResponseInterceptor(response, "Upload thành công")) {
				console.log('response ', response);

				this.productItemFile.files[index].fileUrl = response.data;
			}},
				(err) => {
					this.messageError("Có sự cố khi upload!");
				}
			);
		}
	}

	addvalue() {
		this.productItemFile.files.push({
			id: null,
			name: "",
			fileUrl: ""
		});
	}


	close(event){}

	save(){
		if (this.validForm()) {
			if (this.productItemFile.files[0]?.id){
				let url = this._productMaterialService.updateFile(this.productItemFile.files[0]);
				if(this.source == ProductItemFileConst.DESIGN_DIAGRAM){
					url = this._productDiagramService.updateFile(this.productItemFile.files[0]);
				}
				url.subscribe((res) => {
					if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
						this.ref.close(true);
					}	
				})
			} else {
				let urlCreate = this._productMaterialService.createFile(this.productItemFile);
				if(this.source == ProductItemFileConst.DESIGN_DIAGRAM){
					urlCreate = this._productDiagramService.createFile(this.productItemFile);
				}
				urlCreate.subscribe(
					(res) => {
						if (this.handleResponseInterceptor(res, "Thêm thành công")) {
							this.ref.close(true);
						}
					},
					(err) => {
						console.log("err---", err);
						this.submitted = false;
					}
				);
			}
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	validForm(): boolean {
		let checked = true;
		if (this.productItemFile?.files.length > 0) {
			this.productItemFile?.files.forEach((file) => {
				if (!file?.name || !file?.fileUrl) {
					checked = false;
				}
			});
		} else {
			checked = false;
		}
		return checked;
	}
}
