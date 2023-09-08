import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, ProductDistributionConst, SampleContractConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateOrEdiContractForm } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { ProductDistributionService } from "@shared/services/product-distribution.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
  selector: "create-or-edit-contract-form-dialog",
  templateUrl: "./create-or-edit-contract-form-dialog.component.html",
  styleUrls: ["./create-or-edit-contract-form-dialog.component.scss"],
})
export class CreateOrEditContractFormDialogComponent extends CrudComponentBase {
  public contractForm: CreateOrEdiContractForm = new CreateOrEdiContractForm();
  public isView: boolean = false;
  public listContract: IDropdown[] = [];
  public listPolicy: IDropdown[] = [];
  public listStructure: IDropdown[] = [];
  public onChangeContractFilter: BehaviorSubject<boolean | undefined>;
  public onChangeContractFilter$: Observable<boolean | undefined>;

  constructor(
    injector: Injector,
    messageService: MessageService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private changeDetectorRef: ChangeDetectorRef,
    private productDistributionService: ProductDistributionService
  ) {
    super(injector, messageService);
    this.onChangeContractFilter = new BehaviorSubject<boolean | undefined>(
      true
    );
    this.onChangeContractFilter$ = this.onChangeContractFilter.asObservable();
  }

  public get listContractModel() {
    return SampleContractConst.contractSource;
  }

  public get listContractType() {
    return SampleContractConst.contractType;
  }

  public get isEdit() {
    return !!this.contractForm.id;
  }

  ngOnInit() {
    if (this.config.data.dataSource) {
      this.contractForm.mapDTOToModel(this.config.data.dataSource);
    }
  }

  ngAfterViewInit() {
    this.productDistributionService.init();
    !this.isEdit &&
      this.listContractModel.length &&
      (this.contractForm.contractModel = this.listContractModel[0].code);
    !this.isEdit &&
      this.listContractType.length &&
      (this.contractForm.contractType = this.listContractType[0].code);
    this.productDistributionService._listContractFormCode$.subscribe((res) => {
      if (res) {
        this.listStructure = res;
        !this.isEdit &&
          this.listStructure.length &&
          (this.contractForm.structure = Number(this.listStructure[0].code));
      }
    });
    this.isLoadingPage = true;
    this.productDistributionService
      .getListDistributionPolicy()
      .subscribe((res: any) => {
        if (res?.data?.items) {
          this.listPolicy = res.data.items.reduce(
            (result: IDropdown[], value: any) => {
              if (value.status === ProductDistributionConst.ACTIVE) {
                result.push({
                  code: value.id,
                  name: value.name,
                } as IDropdown);
              }
              return result;
            },
            []
          );
          !this.isEdit &&
            this.listPolicy.length &&
            (this.contractForm.policy = Number(this.listPolicy[0].code));
        }
      });
    this.onChangeContractFilter$.subscribe((res: any) => {
      if (res) {
        this.productDistributionService
          .getListContract(
            this.contractForm.contractModel,
            this.contractForm.contractType
          )
          .subscribe((res: any) => {
            if (res?.data?.items) {
              this.listContract = res.data.items.map(
                (e: any) =>
                  ({
                    code: e.id,
                    name: e.name,
                    rawData: e,
                  } as IDropdown)
              );
              if (this.isEdit) {
                const contract = this.listContract.find(
                  (e: IDropdown) => e.code === this.contractForm.contract
                );
                if (contract) {
                  this.contractForm.contractModel =
                    contract.rawData.contractSource;
                  this.contractForm.contractType =
                    contract.rawData.contractType;
                }
              } else {
                this.listContract.length &&
                  (this.contractForm.contract = Number(
                    this.listContract[0].code
                  ));
              }
            }
          });
      }
    });
    this.isLoadingPage = false;
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
  }

  save(event: any) {
    if (event) {
      if (this.contractForm.isValidData()) {
        this.productDistributionService.createOrEditContractForm(this.contractForm.toObjectSendToAPI(this.productDistributionService.distributionId)).subscribe((response) => {
              if (this.handleResponseInterceptor(response, "")) {
                this.ref.close(response.data);
              }
            },
            (err) => {}
          );
      } else {
        const messageError = this.contractForm.dataValidator.length
          ? this.contractForm.dataValidator[0].message
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

  public onChange(event: any) {
    if (event) {
      this.onChangeContractFilter.next(true);
    }
  }
}
