import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { IDropdown, LockApartmentConst, MessageErrorConst, ProductConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { OpenSellService } from "@shared/services/open-sell.service";
import { ProductService } from "@shared/services/product.service";
import { AppSessionService } from "@shared/session/app-session.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: "lock-apartment-dialog",
  templateUrl: "./lock-apartment-dialog.component.html",
  styleUrls: ["./lock-apartment-dialog.component.scss"],
})
export class LockApartmentDialogComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private _appSessionService: AppSessionService,
    public configDialog: DynamicDialogConfig,
    private changeDetectorRef: ChangeDetectorRef,
    private productService: ProductService,
    private distributionService: DistributionService,
    private openSellService: OpenSellService,
  ) {
    super(injector, messageService);
  }
  ProductConst = ProductConst;
  LockApartmentConst = LockApartmentConst;

  lockApartment: any = {
    lockingReason: null,
  };
  typeCallApi: string;
  public listReason: IDropdown[] = [];
  projectId: any;

  ngOnInit() {
    this.lockApartment = { ...this.lockApartment, ...this.configDialog?.data?.lockApartment };
    if (this.lockApartment.typeCallApi == ProductConst.OPEN_SELL) {
      this.listReason = LockApartmentConst.listReason.filter(reason => reason.type.includes(LockApartmentConst.typeLock.OPEN_SELL));
    } else {
      this.listReason = LockApartmentConst.listReason.filter(reason => reason.type.includes(LockApartmentConst.typeLock.PRODUCT_ITEM));
    }
    this.lockApartment.createDate = this.getDateNow();
    this.lockApartment.createUser = this._appSessionService.user?.userName;
  }

  save(event: any) {
    if (this.validForm() && this.lockApartment.typeCallApi == ProductConst.PROJECT_LIST) {
      this.productService.lock(this.lockApartment).subscribe((response) => {
        this.isLoading = false;
        this.isLoadingPage = false;
        if (this.handleResponseInterceptor(response, "Khoá căn thành công")) {
          this.ref.close({ accept: true });
        }
      }, (err) => {
        console.log('err____', err);
        this.messageError(`Khoá căn thất bại`);
      });

    } else if (this.validForm() && this.lockApartment.typeCallApi == ProductConst.PRODUCT_LIST) {
      this.distributionService.lockOrUnlock(this.lockApartment).subscribe((response) => {
        if (this.handleResponseInterceptor(response, "Khoá căn thành công")) {
          this.ref.close({ accept: true });
        }
      }, (err) => {
        console.log('err____', err);
        this.messageError(`Khoá căn thất bại`);
      });
    } else if (this.validForm() && this.lockApartment.typeCallApi == ProductConst.OPEN_SELL) {
      this.openSellService.lockOrUnlock(this.lockApartment).subscribe((response) => {
        if (this.handleResponseInterceptor(response, "Khoá căn thành công")) {
          this.ref.close({ accept: true });
        }
      }, (err) => {
        console.log('err____', err);
        this.messageError(`Khoá căn thất bại`);
      });
    }
    else {
      this.messageError(MessageErrorConst.message.Validate);
    }
  }

  close(event: any) {
    this.ref.close();
  }

  validForm(): boolean {
    const validRequired = this.lockApartment?.lockingReason && this.lockApartment?.summary;
    return validRequired;
  }
}
