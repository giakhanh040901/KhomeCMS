import { Component, Injector, OnInit } from '@angular/core';
import { SaleConst, SearchConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { InvestorServiceProxy } from '@shared/service-proxies/investor-service';
import { SaleService } from '@shared/services/sale.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-investor-sale-filer',
  templateUrl: './investor-sale-filer.component.html',
  styleUrls: ['./investor-sale-filer.component.scss']
})
export class InvestorSaleFilerComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    public ref: DynamicDialogRef, 
    public configDialog: DynamicDialogConfig,
    private dialogService: DialogService,
    private _saleService: SaleService,
    public _investorService: InvestorServiceProxy,
  ) { 
    super(injector, messageService);
  }

  dataFilter = {
    phone: null,
  }

  SaleConst = SaleConst;
  isLoading = false;
  rows: any[] = [];

  ngOnInit(): void {
    this.subject.keyword.pipe(debounceTime(SearchConst.DEBOUNCE_TIME)).subscribe(() => {
      if (this.keyword?.trim() === "") {
        this.rows = [];
        // this.setPage({ page: this.offset });
      } else {
        this.setPage();
      }
    });

    
  }

  setPage() {
    this.isLoading = true;
    this._investorService.getAllSaleFilter(this.keyword).subscribe((res) => {
      this.isLoading = false;
      if(this.handleResponseInterceptor(res, '')) {
        if(res?.data?.items?.length) {
          this.rows = res.data?.items;
        } else {
          this.getMessageError();
        }
      } else {
        this.getMessageError();
      }
    }, (err) => {
      console.log('err---', err);
      this.isLoading = false;
      this.getMessageError();
    });
  }

  getMessageError() {
    this.messageService.add({ severity: 'error', detail: 'Không tìm thấy dữ liệu',life: 1200 });
  }

  isChoose(investor) {
    this.ref.close(investor);
  }


}
