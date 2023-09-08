import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, PolicyTemplateConst, ProductDistributionConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateOrEditDistributionPolicy } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { ProductDistributionService } from "@shared/services/product-distribution.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: "create-distribution-policy-dialog",
  templateUrl: "./create-distribution-policy-dialog.component.html",
  styleUrls: ["./create-distribution-policy-dialog.component.scss"],
})
export class CreateDistributionPolicyDialogComponent extends CrudComponentBase {
  public distributionPolicy: CreateOrEditDistributionPolicy =
    new CreateOrEditDistributionPolicy();
  public listPolicy: IDropdown[] = [];
  public isView: boolean = false;

  constructor(
    injector: Injector,
    messageService: MessageService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private changeDetectorRef: ChangeDetectorRef,
    private productDistributionService: ProductDistributionService
  ) {
    super(injector, messageService);
  }

  public get listPayType() {
    return ProductDistributionConst.listPayType;
  }

  public get listDepositType() {
    return ProductDistributionConst.listDepositType;
  }

  public get listLockType() {
    return ProductDistributionConst.listLockType;
  }

  PolicyTemplateConst = PolicyTemplateConst;
  ngOnInit() {
    if (this.config.data) {
      this.isView = !!this.config.data.isView;
      if (this.isView) {
        this.distributionPolicy.mapDTOToModel(this.config.data.dataSource);
      } else {
        this.listPolicy = this.config.data.listPolicy;
        // this.listPolicy.length && (this.distributionPolicy.policy = Number(this.listPolicy[0].code));
      }
    }
  }

  save(event: any) {
    if (event) {
      if (this.distributionPolicy.isValidData()) {
        this.productDistributionService
          .createDistributionPolicy(
            this.distributionPolicy.toObjectSendToAPI(
              this.productDistributionService.distributionId
            )
          )
          .subscribe(
            (response) => {
              if (this.handleResponseInterceptor(response, "")) {
                this.ref.close(response.data);
              }
            },
            (err) => {}
          );
      } else {
        const messageError = this.distributionPolicy.dataValidator.length
          ? this.distributionPolicy.dataValidator[0].message
          : undefined;
        messageError && this.messageError(messageError);
      }
    }
  }

  close(event: any) {
    if (event) {
      this.ref.close();
    }
  }

  public onChangePolicy(event: any) {
    if (event) {
      const rawData = this.listPolicy.find(
        (e: IDropdown) => e.code === event.value
      )?.rawData;
      if (rawData) {
        this.distributionPolicy.mapDTOToModel(rawData);
        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
      }
    }
  }
}
