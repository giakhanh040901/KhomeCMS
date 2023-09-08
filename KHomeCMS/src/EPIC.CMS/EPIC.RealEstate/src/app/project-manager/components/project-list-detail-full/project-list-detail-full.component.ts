import {
  Component,
  HostListener,
  Injector,
  Input,
  OnInit,
} from "@angular/core";
import { IDropdown, ProductConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductService } from "@shared/services/product.service";
import { SignalrService } from "@shared/services/signalr.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Subscription } from "rxjs";

@Component({
  selector: "project-list-detail-full",
  templateUrl: "./project-list-detail-full.component.html",
  styleUrls: ["./project-list-detail-full.component.scss"],
})
export class ProjectListDetailFullComponent extends CrudComponentBase {
  public selectedSort: {
    field: string;
    order: number;
  } = {
    field: "",
    order: 1,
  };
  sortData: any[] = [
    {
      field: "Id",
      order: 1,
    },
  ];
  public listSortField: IDropdown[] = [];
  public dataSource: any[] = [];
  public service: any;
  public apiSetPage: any;
  public functionMapDataSetPage: Function;

  productItemSubcription: Subscription;
  updateProductItemSubscription: Subscription;
  lastestItemSubcription: Subscription;

  constructor(
    injector: Injector,
    messageService: MessageService,
    public productService: ProductService,
    public ref: DynamicDialogRef,
    public configDialog: DynamicDialogConfig,
    private _signalrService: SignalrService
  ) {
    super(injector, messageService);
  }

  ngOnInit() {
    this.listSortField = this.configDialog.data.listSortField;
    this.service = this.configDialog.data.service;
    this.apiSetPage = this.configDialog.data.apiSetPage;
    this.functionMapDataSetPage = this.configDialog.data.functionMapDataSetPage;
    this.setPage();

    this._signalrService
      .startConnection()
      .then(() => {
        // Đổi trạng thái căn hộ
        this._signalrService.listenProductItemStatuses();
        this.productItemSubcription =
          this._signalrService.AllProductItemObservable.subscribe((res) => {
            this.dataSource = this.dataSource.map((data) => {
              if (data.id == res.productItemId) {
                data.status = res.status;
                const findCard = ProductConst.listCard.find(
                  (card: any) => card.code === res.status
                );
                if (findCard) {
                  data.backgroundTopColor = findCard.backgroundColor;
                  data.titleColor = findCard.numberColor;
                }
              }
              return data;
            });
          });

        // Đổi điểm số lượng căn hộ theo trạng thái
        // this._signalrService.listenUpdateCountProductItem();
        // this.updateProductItemSubscription = this._signalrService.UpdateProductItemObservable.subscribe((resCount) => {
        //   console.log('signalR count ', resCount);
        //   for (const key in resCount) {
        //   this.productService.listCard = this.productService.listCard.map(card => {
        //       if (card.countName == key && resCount[key] != null){
        //         card.quantity = resCount[key];
        //         return card;
        //       } else {
        //         return card;
        //       }
        //   });
        //   }
        // })

        // Đổi thông tin sản phẩm mới
        this._signalrService.listenUpdateLastestProductItem();
        this.lastestItemSubcription =
          this._signalrService.LastestProductItemObservable.subscribe((res) => {
            this.productService.lastestProduct = {
              ava: res.avatarImageUrl,
              fullName: res.fullName,
              productCode: res.productItemCode,
              tradingProviderName: res.tradingProviderName,
              time: res.expTimeDeposit,
            };
          });
      })
      .catch((err) => {});
  }

  public get listCard() {
    let result: any[] = [];
    if (this.service && this.service.listCard && this.service.listCard.length) {
      result = [...this.service.listCard];
      const sum = result.reduce((res: number, val: any) => {
        return (res += val.quantity || 0);
      }, 0);
      result.unshift({
        backgroundColorFull: "#fff",
        numberColorFull: "#000",
        title: "Tổng số căn",
        quantity: sum,
      });
    }
    return result;
  }

  public get classIconSort() {
    return this.selectedSort.order < 0
      ? "pi pi-sort-amount-down"
      : "pi pi-sort-amount-up";
  }

  public get lastestProduct() {
    if (this.service && this.service.lastestProduct) {
      return {
        ...this.service.lastestProduct,
        colorProductCode:
          ProductConst.listCard.find(
            (card: any) => card.code === this.service.lastestProduct?.status
          )?.backgroundColorFull || "",
      };
    }
    return undefined;
  }

  public handleSort(event: any, key: string) {
    if (event) {
      if (key === "order") {
        this.selectedSort.order = this.selectedSort.order * -1;
      }
      this.sortData = [
        {
          field: this.selectedSort.field,
          order: this.selectedSort.order,
        },
      ];
      this.setPage();
    }
  }

  public handleClick(event: any) {
    if (event) {
      this.ref.close();
    }
  }

  public setPage() {
    if (this.apiSetPage) {
      this.apiSetPage
        .bind(this, this.sortData)()
        .subscribe((res: any) => {
          if (this.handleResponseInterceptor(res, "")) {
            this.dataSource = res.data.items.map((e: any) => {
              this.functionMapDataSetPage(e);
              return e;
            });
          }
        });
    }
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event) {
    if (event) {
      this.ref.close();
    }
  }
}
