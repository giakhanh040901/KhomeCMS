import { Component, Injector } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { FormNotificationConst, ContractFormConst, ActiveDeactiveConst, UserTypes } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { CreateContractCodeComponent } from './create-contract-code/create-contract-code.component';
import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';
import { Page } from '@shared/model/page';
import { ContractCodeStructureService } from '@shared/services/contract-code-structure.service';

@Component({
    selector: 'app-contract-code-structure',
    templateUrl: './contract-code-structure.component.html',
    styleUrls: ['./contract-code-structure.component.scss'],
})
export class ContractCodeStructureComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private dialogService: DialogService,
        private breadcrumbService: BreadcrumbService,
        public confirmationService: ConfirmationService,
        private _dialogService: DialogService,
        private _contractCodeStructureService: ContractCodeStructureService,
    ) {
        super(injector, messageService);
        this.userLogin = this.getUser();
        this.breadcrumbService.setItems([
            { label: 'Trang chủ', routerLink: ['/home'] },
            { label: 'Cài đặt'},
            { label: UserTypes.TYPE_PARTNERS.includes(this.userLogin.user_type) ? 'Cấu trúc mã HĐ giao dịch' : 'Cấu trúc mã HĐ cọc' },
        ]);
    }
    userLogin: any = {};
    headerTable: string = '';
    rows: any[] = [];

    ContractFormConst = ContractFormConst;

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
        keyword: '',
        status: null,
        createdDate: null
    }
	fieldFilterDates = ['createdDate'];

    ActiveDeactiveConst = ActiveDeactiveConst;

    minWidthTable: string;

    ngOnInit(): void {
        this.minWidthTable = '1600px';
        this.headerTable = UserTypes.TYPE_PARTNERS.includes(this.userLogin.user_type) ? 'Cấu trúc mã HĐ giao dịch' : 'Cấu trúc mã HĐ cọc';
            
        
        this.setPage({ page: this.offset });
        this.cols = [
            { field: 'name', header: 'Tên cấu hình', isPin: true },
            { field: 'contractCode', header: 'Cấu trúc mã hợp đồng' },
            { field: 'description', header: 'Ghi chú' },
            { field: 'createdBy', header: 'Người cài đặt', width: '11rem' },
            { field: 'createdDateDisplay', header: 'Ngày cài đặt', width: '11rem' },
        ];

        this.cols = this.cols.map((item, index) => {
            item.position = index + 1;
            return item;
        });
        this._selectedColumns = this.getLocalStorage('contractCodeStructureRst') ?? this.cols;
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
            if (dataCallBack?.accept) {
                this._selectedColumns = dataCallBack.data.sort(function (a, b) {
                    return a.position - b.position;
                });
                this.setLocalStorage(this._selectedColumns, 'contractCodeStructureRst')
            }
        });
    }

    showData(rows) {
        
        for (let row of rows) {
            // row.id = row.id,
            row.code = row.code;
            row.name = row.name;
            row.customerTypeGetAll = ContractFormConst.getCustomerInfo(row.customerType, 'name');
            row.contractCode = this.genContractCodeStructure(row?.configContractCodeDetails);
            row.createdDateDisplay = this.formatDateTime(row?.createdDate);
        }
        console.log('row', rows);
    }

    genContractCodeStructure(configContractCodeDetails) {
        let contractCodeStructure = '';
        if (configContractCodeDetails?.length) {
            configContractCodeDetails.sort(function(a , b) {
                return a.sortOrder - b.sortOrder;
            })
            configContractCodeDetails.forEach(element => {
                contractCodeStructure += '<' + (element?.value ? element.value : element?.key) + '>';
            });
        }
        //
        return contractCodeStructure;
    }

    genListAction(data = []) {
        this.listAction = data.map((contractCodeStructure, index) => {
            const actions = [];
            
            actions.push({
                data: contractCodeStructure,
                index: index,
                label: 'Xem chi tiết',
                icon: 'pi pi-info-circle',
                command: ($event) => {
                    this.detail($event.item.data);
                }
            })

            if (this.isGranted([this.PermissionRealStateConst.RealStateCTMaHDGiaoDich_CapNhat, this.PermissionRealStateConst.RealStateCTMaHDCoc_CapNhat])) {
                actions.push({
                    data: contractCodeStructure,
                    index: index,
                    label: 'Sửa',
                    icon: 'pi pi-pencil',
                    command: ($event) => {
                        this.edit($event.item.data);
                    }
                })
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateCTMaHDGiaoDich_DoiTrangThai, this.PermissionRealStateConst.RealStateCTMaHDCoc_DoiTrangThai])) {
                actions.push({
                    data: contractCodeStructure,
                    label: contractCodeStructure.status == ActiveDeactiveConst.ACTIVE ? 'Khóa' : 'Kích hoạt',
                    icon: contractCodeStructure.status == ActiveDeactiveConst.ACTIVE ? 'pi pi-lock' : 'pi pi-lock-open',
                    command: ($event) => {
                        this.updateStatus($event.item.data);
                    }
                });
            }

            if (this.isGranted([this.PermissionRealStateConst.RealStateCTMaHDGiaoDich_Xoa, this.PermissionRealStateConst.RealStateCTMaHDCoc_Xoa])) {
                actions.push({
                    data: contractCodeStructure,
                    label: 'Xoá',
                    icon: 'pi pi-trash',
                    command: ($event) => {
                        this.delete($event.item.data);
                    }
                })
            }

            return actions;
        });

    }

    updateStatus(item) {
        this._contractCodeStructureService.updateStatus(item).subscribe(
            (response) => {
                var message = "";
                if (item.status == 'A') {
                    message = "Hủy kích hoạt thành công";
                } else {
                    message = "Kích hoạt thành công";
                }
                if (this.handleResponseInterceptor(response, message)) {
                    this.setPage();
                }
            }, () => {
                this.messageError(`Không thay đổi được trạng thái của  ${item.name}`);
            }
        );
    }

    create() {
        const ref = this.dialogService.open(CreateContractCodeComponent, {
            header: "Thêm mới cấu trúc hợp đồng",
            width: '800px',
        });
        //
        ref.onClose.subscribe((res) => {
            this.setPage();
        });
    }

    
    detail(contractCodeStructure) {
        const ref = this.dialogService.open(CreateContractCodeComponent, {
            header: "Thông tin cấu trúc hợp đồng",
            width: '800px',
            data: {
                contractCodeStructure: contractCodeStructure,
                isView: true,

            },
        });
        //
        ref.onClose.subscribe((res) => {
            this.setPage();
        });
    }

    edit(contractCodeStructure) {
        const ref = this.dialogService.open(CreateContractCodeComponent, {
            header: "Sửa cấu trúc hợp đồng",
            width: '800px',
            data: {
                contractCodeStructure: contractCodeStructure
            },
        });
        //
        ref.onClose.subscribe((res) => {
            this.setPage();
        });
    }

    delete(contractCodeStructure) {
        const ref = this._dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '600px',
                data: {
                    title: "Bạn có chắc chắn muốn xóa cấu trúc này?",
                    icon: FormNotificationConst.IMAGE_CLOSE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this._contractCodeStructureService.delete(contractCodeStructure.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response, "Xóa thành công")) {
                        this.setPage();
                    }
                }, (err) => {
                    console.log('err____', err);
                    this.messageError(`Không xóa được ${contractCodeStructure.name}`);
                });
            } else {
            }
        });
    }

    setPage(pageInfo?: any) {
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		let dataFilters = this.formatCalendar(this.fieldFilterDates, {...this.fieldFilters});

        this.page.keyword = this.keyword;
        this.isLoading = true;
        this._contractCodeStructureService.getAll(this.page, dataFilters).subscribe((res) => {
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





