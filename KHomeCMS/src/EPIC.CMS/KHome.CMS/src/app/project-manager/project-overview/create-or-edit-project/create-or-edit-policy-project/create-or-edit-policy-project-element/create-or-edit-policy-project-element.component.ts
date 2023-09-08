import { Component, Injector, OnInit } from "@angular/core";
import { IDropdown, MessageErrorConst, ProjectPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectPolicyService } from "@shared/services/project-policy.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
selector: "app-create-or-edit-policy-project-element",
templateUrl: "./create-or-edit-policy-project-element.component.html",
styleUrls: ["./create-or-edit-policy-project-element.component.scss"],
})
export class CreateOrEditPolicyProjectElementComponent extends CrudComponentBase {
constructor(
	injector: Injector,
	messageService: MessageService,
    public configDialog: DynamicDialogConfig,
	private _projectPolicyService: ProjectPolicyService,
	public ref: DynamicDialogRef
) {
	super(injector, messageService);
}

policyProject: any ={
	id: 0,
	projectId: null,
	code: null,
	name: null,
	policyType: ProjectPolicyConst.CHINH_SACH_QUA_TANG, // fix cứng chính sách quà tặng
	description: null,
	source: ProjectPolicyConst.TAT_CA, // fix default tất cả
	conversionValue: null
};

ProjectPolicyConst = ProjectPolicyConst;
ngOnInit() {
	if (this.configDialog?.data?.policyProject) {
		this.policyProject = this.configDialog?.data?.policyProject;
	}
    this.policyProject.projectId = this.configDialog?.data?.projectId;
}	

close(event: any) {
	this.ref.close();
}

save() {
	if (this.validForm()){
		if (this.policyProject.id){
			this._projectPolicyService.update(this.policyProject).subscribe((res) => {
				if (this.handleResponseInterceptor(res, "Cập nhật thành công")) {
					this.ref.close(true);
				  }
				  //
				},(err) => {
				  console.log("err---", err);
				  this.submitted = false;
				}
			  );
		} else {
			this._projectPolicyService.create(this.policyProject).subscribe((res) => {
				if (this.handleResponseInterceptor(res, "Thêm thành công")) {
					this.ref.close(true);
				}
			},(err) => {
				console.log("err---", err);
				this.submitted = false;
			})
		}
	} else {
		this.messageError(MessageErrorConst.message.Validate);
	}
}

	validForm(): boolean {
		const validRequired = this.policyProject?.code
						&& this.policyProject?.name
						&& this.policyProject?.policyType
						&& this.policyProject?.source;
		return validRequired;
	}

}
