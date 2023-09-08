import { Component, Inject, Injector } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { FormNotificationConst, ContractFormConst, SampleContractConst, ActiveDeactiveConst, UserTypes } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { SampleContractService } from '@shared/services/sample-contract.service';
import { AppUtilsService } from '@shared/services/utils.service';
import { API_BASE_URL } from '@shared/service-proxies/service-proxies-base';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';
import { CreateSampleContractComponent } from './create-sample-contract/create-sample-contract.component';
import { Page } from '@shared/model/page';

@Component({
    selector: 'app-sample-contract',
    templateUrl: './sample-contract.component.html',
    styleUrls: ['./sample-contract.component.scss'],
})
export class SampleContractComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private dialogService: DialogService,
        private breadcrumbService: BreadcrumbService,
        public confirmationService: ConfirmationService,
        private _dialogService: DialogService,
        private _sampleContractService: SampleContractService,
        private _utilsService: AppUtilsService,
        @Inject(API_BASE_URL) baseUrl?: string,
    ) {
        super(injector, messageService);
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
        this.userLogin = this.getUser();
        this.breadcrumbService.setItems([
            { label: 'Trang chủ', routerLink: ['/home'] },
            { label: 'Cài đặt'},
            { label: UserTypes.TYPE_PARTNERS.includes(this.userLogin.user_type) ? 'Mẫu hợp đồng CĐT' : 'Mẫu hợp đồng đại lý' },
        ]);
    }
    userLogin: any = {};
    headerTable: string = '';
    private baseUrl: string;
    rows: any[] = [];
    SampleContractConst = SampleContractConst;
    ContractFormConst = ContractFormConst;
	routeSubcribe: any = null;

    row: any;
    col: any;

    _selectedColumns: any[];

    cols: any[];

    listAction: any[] = [];
    //
    page = new Page();
    offset = 0;

    listRepeatFixedDate = [];

    fieldFilters = {
        status: null,
        contractSource: null,
        contractType: null,
        createdDate: null
    };

	fieldFilterDates = ['createdDate'];
    minWidthTable: string;

    ngOnInit(): void {   
        this.minWidthTable = '1200px';     
        this.headerTable = UserTypes.TYPE_PARTNERS.includes(this.userLogin.user_type) ? 'Mẫu hợp đồng CĐT' : 'Mẫu hợp đồng đại lý';
        this.setPage({ page: this.offset });

        // Xử lý ẩn hiện cột trong bảng
        this.cols = [
            { field: 'name', header: 'Tên hợp đồng', isPin: true },
            { field: 'contractTypeDisplay', header: 'Loại hợp đồng', width: '11rem'},
            { field: 'contractSourceGetAll', header: 'Kiểu hợp đồng', width: '10rem'},
            { field: 'description', header: 'Mô tả'},
            { field: 'createdDateDisplay', header: 'Ngày tạo', width: '11rem' },
        ];

        this.cols = this.cols.map((item, index) => {
            item.position = index + 1;
            return item;
          });
        this._selectedColumns = this.getLocalStorage('sampleContractRst') ?? this.cols;
    }

    changeStatus() {
        this.setPage();
    }

    setColumn(col, _selectedColumns) {
        const ref = this.dialogService.open(
            FormSetDisplayColumnComponent,
            this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
        );
        //
        ref.onClose.subscribe((dataCallBack) => {
            console.log('dataCallBack', dataCallBack);
            if (dataCallBack?.accept) {
                this._selectedColumns = dataCallBack.data.sort(function (a, b) {
                    return a.position - b.position;
                });
                this.setLocalStorage(this._selectedColumns, 'sampleContractRst')
            }
        });
    }

    showData(rows) {
        for (let row of rows) {
            row.name = row.name;
            row.contractTypeDisplay = SampleContractConst.getContractType(row.contractType, 'name');
			row.contractTypeGetAll = SampleContractConst.getContractType(row.contractType, 'name');
            row.contractSourceGetAll = SampleContractConst.getContractSource(row.contractSource, 'name');
            row.createdDateDisplay = this.formatDateTime(row?.createdDate);;
        }
        console.log('row', rows);
    }

    genListAction(data = []) {
        this.listAction = data.map((sampleContract, index) => {

            const actions = [];

            if (this.isGranted([this.PermissionRealStateConst.RealStateMauHDCDT_TaiFileCaNhan, this.PermissionRealStateConst.RealStateMauHDDL_TaiFileCaNhan])) {
                actions.push({
                    data: sampleContract,
                    index: index,
                    label: 'Tải file cá nhân',
                    icon: 'pi pi-download',
                    command: ($event) => {
                        this.downloadFileInvestor($event.item.data);
                    }
                })
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateMauHDCDT_TaiFileDoanhNghiep, this.PermissionRealStateConst.RealStateMauHDDL_TaiFileDoanhNghiep])) {
                actions.push({
                    data: sampleContract,
                    index: index,
                    label: 'Tải file d/nghiệp',
                    icon: 'pi pi-download',
                    command: ($event) => {
                        this.downloadFileBusiCus($event.item.data);
                    }
                })
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateMauHDCDT_CapNhat, this.PermissionRealStateConst.RealStateMauHDDL_CapNhat])) {
                actions.push({
                    data: sampleContract,
                    index: index,
                    label: 'Sửa',
                    icon: 'pi pi-pencil',
                    command: ($event) => {
                        this.edit($event.item.data);
                    }
                })
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateMauHDCDT_DoiTrangThai, this.PermissionRealStateConst.RealStateMauHDDL_DoiTrangThai ])) {
                actions.push({
                    data: sampleContract,
                    index: index,
                    label: sampleContract.status == ActiveDeactiveConst.ACTIVE ? 'Đóng' : 'Kích hoạt',
                    icon: sampleContract.status == ActiveDeactiveConst.ACTIVE ? 'pi pi-lock' : 'pi pi-lock-open',
                    command: ($event) => {
                        this.changeActionStatus($event.item.data);
                    }
                })
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateMauHDCDT_Xoa, this.PermissionRealStateConst.RealStateMauHDDL_Xoa])) {
                actions.push({
                    data: sampleContract,
                    label: 'Xoá',
                    icon: 'pi pi-trash',
                    command: ($event) => {
                        this.delete($event.item.data);
                    }
                })
            }

            return actions;
        });
        console.log('listActions', this.listAction);

    }

    changeActionStatus(sampleContract) {
        const ref = this._dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '600px',
                data: {	
                    title: sampleContract.status == ActiveDeactiveConst.ACTIVE ? 'Đóng hợp đồng' : 'Kích hoạt hợp đồng',
                    icon: sampleContract.status == ActiveDeactiveConst.ACTIVE ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this.isLoading = true;
                this._sampleContractService.updateStatus(sampleContract).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Cập nhật thành công")) {
                        this.isLoading = false;
                        this.setPage();
                    }
                }, (err) => {
                    this.isLoading = false;
                    console.log('err____', err);
                    
                });
            } else {
            }
        });
    }


    downloadFileInvestor(file) {
        let fileUrl = file.fileInvestor;
        const url = this.baseUrl + "/" + fileUrl;
        this._utilsService.makeDownload("", url);
    }

    downloadFileBusiCus(file) {
        let fileUrl = file.fileBusinessCustomer;
        const url = this.baseUrl + "/" + fileUrl;
        this._utilsService.makeDownload("", url);
    }

    create() {
		const ref = this.dialogService.open(CreateSampleContractComponent, {
      header: "Thêm mới hợp đồng mẫu",
      width: '800px',
    });
    //
    ref.onClose.subscribe((res) => {
        this.setPage();
    });
	}

    edit(sampleContract) {
      const ref = this.dialogService.open(CreateSampleContractComponent, {
        header: "Sửa hợp đồng mẫu",
        width: '800px',
        data: {
          sampleContract : sampleContract
        },
      });
      //
      ref.onClose.subscribe((res) => {
        this.setPage();
      });
    }

    delete(sampleContract) {
        const ref = this._dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '600px',
                data: {
                    title: "Bạn có chắc chắn muốn xóa chính sách này?",
                    icon: FormNotificationConst.IMAGE_CLOSE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this._sampleContractService.delete(sampleContract.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Xóa mẫu hợp đồng thành công")) {
                        this.setPage();
                    }
                }, (err) => {
                    console.log('err____', err);
                    this.messageError(`Không xóa được mẫu hợp đồng ${sampleContract.name}`);
                });
            } else {
            }
        });
    }

    setPage(pageInfo?: any, type?: any) {
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		let dataFilters = this.formatCalendar(this.fieldFilterDates, {...this.fieldFilters});

        this.page.keyword = this.keyword;
        this.isLoading = true;
        this._sampleContractService.getAll(this.page, dataFilters).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {
                
                this.page.totalItems = res.data.totalItems;
                this.rows = res?.data?.items;
                //
                if (this.rows?.length) {
                    this.genListAction(this.rows);
                    this.showData(this.rows);
                }
            }
        }, (err) => {
            this.isLoading = false;
            console.log('Error-------', err);
            
        });
    }
}