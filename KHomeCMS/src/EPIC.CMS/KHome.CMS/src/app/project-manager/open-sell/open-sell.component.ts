import { Component, Inject, Injector, ViewChild } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { Subscription, forkJoin } from 'rxjs';
import { OpenSellConst, FormNotificationConst, IDropdown, YesNoConst, PermissionRealStateConst } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { API_BASE_URL } from '@shared/service-proxies/service-proxies-base';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component'; import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';
import { Page } from '@shared/model/page';
import { Router } from '@angular/router';
import { OpenSellService } from '@shared/services/open-sell.service';
import { CreateOpenSellComponent } from './create-open-sell/create-open-sell.component';
import { ProjectListService } from '@shared/services/project-list.service';
import { OwnerServiceProxy } from '@shared/service-proxies/owner-service';
import { TradingProviderSelectedService } from '@shared/services/trading-provider.service';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-open-sell',
    templateUrl: './open-sell.component.html',
    styleUrls: ['./open-sell.component.scss'],
})
export class OpenSellComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private dialogService: DialogService,
        private breadcrumbService: BreadcrumbService,
        private _openSellService: OpenSellService,
        private _projectListService: ProjectListService,
        private _ownerService: OwnerServiceProxy,
		private _tradingProviderSelectedService: TradingProviderSelectedService,
        private router: Router,
        @Inject(API_BASE_URL) baseUrl?: string,
    ) {
        super(injector, messageService);
        this.breadcrumbService.setItems([
            { label: 'Trang chủ', routerLink: ['/home'] },
            { label: 'Quản lý dự án'},
            { label: 'Mở bán' },
        ]);
    }
    rows: any[] = [];
    OpenSellConst = OpenSellConst;
    YesNoConst = YesNoConst;
    routeSubcribe: any = null;

    row: any;
    col: any;

    _selectedColumns: any[];
    ownerFilters: IDropdown[] = [];
    cols: any[];

    listAction: any[] = [];
    //
    page = new Page();
    offset = 0;

    listRepeatFixedDate = [];

    fieldFilters = {
        status: null,
        ownerId: null,
        keyword: null,
        projectId: null,
    }

    projects:[] = [];
	sortData: any[] = [];

    public statusFilters = [];
    
	tradingProviderSub: Subscription;
    minWidthTable: string;

    ngOnInit(): void {
        this.minWidthTable = '1800px';

        this._tradingProviderSelectedService.TradingProviderObservable.subscribe((change) => {
			this.setPage();
		})
        this.setPage({ page: this.offset });

        this.subject.isSetPage.subscribe(() => {
            this.setPage();
        })
        // Xử lý ẩn hiện cột trong bảng
        this.cols = [
            { field: 'codeDisplay', header: 'Mã dự án', width: '12rem' },
            { field: 'nameDisplay', header: 'Tên dự án'},
            { field: 'quantity', fieldSort: 'Quantity', header: 'Số lượng', width: '8rem' },
            { field: 'quantityDeposit', fieldSort: 'QuantityDeposit', header: 'Đã cọc', width: '8rem' },
            { field: 'quantitySold', fieldSort: 'QuantitySold', header: 'HĐ mua', width: '8rem' },
            { field: 'startDateDisplay', fieldSort: 'StartDate', header: 'Ngày mở bán', width: '10rem' },
            { field: 'endDateDisplay', fieldSort: 'EndDate', header: 'Ngày kết thúc', width: '10rem' },
            { field: 'description', header: 'Ghi chú'},
            { field: '_isShowApp', header: 'Show App', width: '8rem',  class: 'justify-content-center' },
            { field: '_isOutstanding', header: 'Nổi bật', width: '6.5rem', class: 'justify-content-center b-checkbox-hightlight' },
        ];

        this.cols = this.cols.map((item, index) => {
            item.position = index + 1;
            return item;
        });
        // this._selectedColumns = this.cols;
        this._selectedColumns = this.getLocalStorage('openSell') ?? this.cols.filter(item => item.field !== 'codeDisplay');

        this.statusFilters = OpenSellConst.statuses.filter((status: any) => status.code !== OpenSellConst.CHO_DUYET && status.code !== OpenSellConst.HUY_DUYET);
    }

    onColResize(event){
        console.log('onColResize ', event);
    }

    ngOnDestroy(): void {
		if(this.tradingProviderSub) (<Subscription>this.tradingProviderSub).unsubscribe();
	}

    changeStatus() {
        this.setPage({ page: this.page.pageNumber });
    }

    setColumn(col, _selectedColumns) {
        const ref = this.dialogService.open(
            FormSetDisplayColumnComponent,
            this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
        );
        //
        ref.onClose.subscribe((dataCallBack) => {
            if (dataCallBack?.accept) {
                this._selectedColumns = dataCallBack.data.sort(function (a, b) {
                    return a.position - b.position;
                });
                this.setLocalStorage(this._selectedColumns, 'openSell')
            }
        });
    }

    showData(rows) {
        for (let row of rows) {
            row.nameDisplay = row?.project?.name;
            row.codeDisplay = row?.project?.code;
            row.startDateDisplay = this.formatDate(row?.startDate);
            row.endDateDisplay = this.formatDate(row?.endDate);
            row._isOutstanding = (row.isOutstanding == YesNoConst.YES);
            if (row.isShowApp === 'Y'){
                row._isShowApp = true;
            }
        }
    }

    genListAction(rows = []) {
        this.listAction = rows.map((row) => {

            const actions = [];
            //
			if (this.isGranted([PermissionRealStateConst.RealStateMoBan_ChiTiet])) {
                actions.push({
                    data: row,
                    label: "Thông tin chi tiết",
                    icon: "pi pi-info-circle",
                    command: ($event) => {
                        this.detail($event.item.data);
                    },
                })
            }
            
            if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DoiTrangThai]) && (row.status == this.OpenSellConst.DANG_BAN || row.status == this.OpenSellConst.TAM_DUNG)) {
                actions.push({
                    data: row,
                    label: row.status == this.OpenSellConst.TAM_DUNG ? "Mở bán" : "Tạm dừng",
                    icon:  row.status == this.OpenSellConst.TAM_DUNG ? "pi pi-bell" : "pi pi-stop-circle",
                    command: ($event) => {
                    this.pause($event.item.data);
                    },
                });
            }

            if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DungBan]) && row.status == this.OpenSellConst.DANG_BAN){
                actions.push({
                    data: row,
                    label: "Dừng bán",
                    icon:  "pi pi-ban",
                    command: ($event) => {
                    this.stop($event.item.data.id);
                    },
                });
            }
            
            if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DoiNoiBat]) && row.status == this.OpenSellConst.DANG_BAN){
                actions.push({
                data: row,
                label: row._isOutstanding ? "Hủy nổi bật" : "Set nổi bật",
                icon:  row._isOutstanding ? "pi pi-angle-double-down" : "pi pi-angle-double-up",
                command: ($event) => {
                    this.outstanding($event.item.data);
                },
                });
            }

            if (this.isGranted([PermissionRealStateConst.RealStateMoBan_DoiShowApp]) &&  row.status == this.OpenSellConst.DANG_BAN){
                actions.push({
                    data: row,
                    label: row.isShowApp == YesNoConst.YES ? "Tắt Showapp" : "Showapp",
                    icon:  row.isShowApp == YesNoConst.YES ? "pi pi-eye-slash" : "pi pi-eye",
                    command: ($event) => {
                        this.changeShowapp($event.item.data);
                    },
                    });
            }
            
            if (this.isGranted([PermissionRealStateConst.RealStateMoBan_Xoa]) && row.status == OpenSellConst.KHOI_TAO){
                actions.push({
                    data: row,
                    label: "Xoá",
                    icon: "pi pi-trash",
                    command: ($event) => {
                        this.delete($event.item.data);
                    },
                })
            }

            return actions;
        });
    }

    changeShowapp(data){
        const ref = this.dialogService.open(
          FormNotificationComponent,
          {
              header: "Thông báo",
              width: '600px',
              data: {	
                  title: data.isShowApp == YesNoConst.YES ? 'Xác nhận tắt showapp' : 'Xác nhận showapp',
                  icon: data.isShowApp == YesNoConst.YES ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
              },
          }
        );
        ref.onClose.subscribe((dataCallBack) => {
            
            if (dataCallBack?.accept) {
              this.isLoading = true;
              this._openSellService.changeShowappOpenSell(data?.id).subscribe((res)=> {
                if(this.handleResponseInterceptor(res, data.isShowApp == YesNoConst.YES ? 'Tắt showapp thành công' : 'Showapp thành công')) {
                  this.setPage();
                }
                }, (err) => {
                  console.log('err', err);
              });
            } else {
              this.isLoading = false;
            }
        });
      }
      
    outstanding(openCell){
        const ref = this.dialogService.open(FormNotificationComponent, {
            header: openCell._isOutstanding ? "Hủy nổi bật" : "Set nổi bật",
            width: "600px",
            data: {
              title: openCell._isOutstanding ? `Xác nhận hủy nổi bật` : `Xác nhận set nổi bật`,
              icon: openCell._isOutstanding ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
            },
          });
          ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
              this._openSellService.outstanding(openCell.id).subscribe((response) => {
                  if ( this.handleResponseInterceptor(response, openCell._isOutstanding ? "Hủy nổi bật thành công" : "Set nổi bật thành công")) {
                    this.setPage();
                  }
                }, (err) => {
                  console.log('err____', err);
                  this.messageError(openCell._isOutstanding ? `Hủy nổi bật thất bại` : `Set nổi bật thất bại`);
                });
            } else {
            }
          });
    }

    stop(id){
        const ref = this.dialogService.open(FormNotificationComponent, {
            header: "Dừng bán sản phẩm",
            width: "600px",
            data: {
              title: `Xác nhận dừng mở bán sản phẩm`,
              icon: FormNotificationConst.IMAGE_CLOSE,
            },
          });
          ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
              this._openSellService.stop(id).subscribe((response) => {
                  if ( this.handleResponseInterceptor(response, "Dừng bán thành công")) {
                    this.setPage();
                  }
                }, (err) => {
                  console.log('err____', err);
                  this.messageError(`Dừng bán thất bại`);
                });
            } else {
            }
          });
    }

    pause(openCell){
        const ref = this.dialogService.open(FormNotificationComponent, {
            header: openCell.status == this.OpenSellConst.TAM_DUNG ? "Mở bán sản phẩm" : "Tạm dừng bán sản phẩm",
            width: "600px",
            data: {
              title: openCell.status == this.OpenSellConst.TAM_DUNG ? `Xác nhận mở bán sản phẩm` : `Xác nhận tạm dừng mở bán sản phẩm`,
              icon: openCell.status == this.OpenSellConst.TAM_DUNG ? FormNotificationConst.IMAGE_APPROVE  : FormNotificationConst.IMAGE_CLOSE,
            },
          });
          ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
              this._openSellService.pauseOrActive(openCell.id).subscribe((response) => {
                  if ( this.handleResponseInterceptor(response, openCell.status == this.OpenSellConst.TAM_DUNG ? "Mở bán thành công" : "Dừng mở bán thành công")) {
                    this.setPage();
                  }
                }, (err) => {
                  console.log('err____', err);
                  this.messageError(openCell.status == this.OpenSellConst.TAM_DUNG ? `Mở bán thất bại` : `Dừng mở bán thất bại`);
                });
            } else {
            }
          });
    }

    changeFilter(value) {
        console.log('value', value);
        this.setPage({ page: this.offset });
    }

    delete (openCell){
        const ref = this.dialogService.open(FormNotificationComponent, {
            header: "Xoá mở bán",
            width: "600px",
            data: {
              title: `Bạn có chắc chắn muốn xóa mở bán ${openCell?.project?.name}?`,
              icon: FormNotificationConst.IMAGE_CLOSE,
            },
          });
          ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
              this._openSellService.delete(openCell.id).subscribe((response) => {
                  if ( this.handleResponseInterceptor(response, "Xóa phân mở bán thành công")) {
                    this.setPage();
                  }
                }, (err) => {
                  console.log('err____', err);
                  this.messageError(`Không xóa được mở bán`);
                });
            } else {
            }
        });
    }
    
    changeActionStatus(sampleContract) {
        // const ref = this._dialogService.open(
        //   FormNotificationComponent,
        //   {
        //     header: "Thông báo",
        //     width: '600px',
        //     contentStyle: { "max-height": "600px", "overflow": "auto", "padding-bottom": "50px" },
        //     styleClass: 'p-dialog-custom',
        //     baseZIndex: 10000,
        //     data: {
        //       title: sampleContract.status == ActiveDeactiveConst.ACTIVE ? 'Đóng hợp đồng' : 'Kích hoạt hợp đồng',
        //       icon: sampleContract.status == ActiveDeactiveConst.ACTIVE ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
        //     },
        //   }
        // );
        // ref.onClose.subscribe((dataCallBack) => {
        //   console.log({ dataCallBack });
        //   if (dataCallBack?.accept) {
        //     this.isLoading = true;
        //     this._openSellService.updateStatus(sampleContract).subscribe((response) => {
        //       if (this.handleResponseInterceptor(response, "Cập nhật thành công")) {
        //         this.isLoading = false;
        //         this.setPage({ page: this.page.pageNumber });
        //       }
        //     }, (err) => {
        //       this.isLoading = false;
        //       console.log('err____', err);

        //     });
        //   } else {
        //   }
        // });
    }

    create() {
        const ref = this.dialogService.open(CreateOpenSellComponent, {
            header: "Tạo thông tin mở bán",
            width: '550px',
        });
        //
        ref.onClose.subscribe((res) => {
            this.setPage();
        });
    }

    detail(item) {
        this.router.navigate(["/project-manager/open-sell/detail/" + this.cryptEncode(item?.id)]);
    }

    setPage(pageInfo?: any, type?: any) {
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;

        this.page.keyword = this.keyword;
        this.isLoading = true;
        forkJoin([this._openSellService.findAll(this.page, this.fieldFilters, this.sortData), this._projectListService.getAllProjectByTrading(), this._ownerService.getByPartner()]).subscribe(([res, resProject, resOwner]) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {

                this.page.totalItems = res.data.totalItems;
                this.rows = res?.data?.items;
                //
                if (this.rows?.length) {
                    this.showData(this.rows);
                    this.genListAction(this.rows);
                }
            }
            if (this.handleResponseInterceptor(resProject)) {
                this.projects = resProject?.data;
            }
            if (this.handleResponseInterceptor(resOwner)) {
                this.ownerFilters = resOwner?.data;
            }
        }, (err) => {
            this.isLoading = false;
            console.log('Error-------', err);

        });
    }
}






