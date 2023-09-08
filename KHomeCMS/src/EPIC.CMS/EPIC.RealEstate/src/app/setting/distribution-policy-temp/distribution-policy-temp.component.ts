import { Component, Injector } from "@angular/core";
import { FormNotificationConst, PolicyDetailTemplateConst, PolicyTemplateConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { PolicyTemplateService } from "@shared/services/policy-template.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { CreateDistributionPolicyTempComponent } from "./create-distribution-policy-temp/create-distribution-policy-temp.component";

@Component({
  selector: "app-distribution-policy-temp",
  templateUrl: "./distribution-policy-temp.component.html",
  styleUrls: ["./distribution-policy-temp.component.scss"],
})
export class DistributionPolicyTempComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _policyTemplateService: PolicyTemplateService,
		private _dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		public confirmationService: ConfirmationService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
            { label: 'Cài đặt'},
			{ label: "Chính sách bán hàng" },
		]);
	}

	rows: any[] = [];

    PolicyTemplateConst = PolicyTemplateConst;
    PolicyDetailTemplateConst = PolicyDetailTemplateConst;

    row: any;
    col: any;

    _selectedColumns: any[];

    cols: any[];

    listAction: any[] = [];
    //
    page = new Page();
    offset = 0;

    fieldFilter = {
        keyword: '',
        status: null,
        type: null,
        createdDate: null
    }
	fieldFilterDates = ['createdDate'];
	minWidthTable: string;

  	ngOnInit(): void {
        this.minWidthTable = '1600xp'
        this.setPage({ page: this.offset });
        // Xử lý ẩn hiện cột trong bảng
        this.cols = [
            // { field: 'id', header: '#ID', width: '5rem', position: 1, class:"b-border-frozen-left", isPin:true },
            { field: 'code', header: 'Mã chính sách', width: '16rem', isDefaultShow: false },
            { field: 'name', header: 'Tên chính sách', isPin: true},
            { field: 'depositTypeDisplay', header: 'Loại hình cọc', width: '12rem' },
            { field: 'depositTypeDisplay', header: 'Loại hình lock', width: '12rem' },
            { field: 'createdBy', header: 'Người cài đặt', width: '12rem'},
            { field: 'createdDate', header: 'Ngày cài đặt', width: '9rem'},
        ];

        this.cols = this.cols.map((item, index) => {
            item.position = index + 1;
            return item;
          });
        // this._selectedColumns = this.cols;
        this._selectedColumns = this.getLocalStorage('disPolicyTemplateRst') ?? this.cols.filter(item => item.isDefaultShow != false);
	}


    changeStatus() {
        this.setPage();

    }

    setColumn(col, _selectedColumns) {
        const ref = this._dialogService.open(
            FormSetDisplayColumnComponent,
            this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
        );
        //
        ref.onClose.subscribe((dataCallBack) => {
            if (dataCallBack?.accept) {
                this._selectedColumns = dataCallBack.data.sort(function (a, b) {
                    return a.position - b.position;
                });
                this.setLocalStorage(this._selectedColumns, 'disPolicyTemplateRst')
            }
        });
    }

    setData(rows) {
        for (let row of rows) {
            row.depositTypeDisplay = this.PolicyTemplateConst.getNameDepositType(row.depositType),
            row.createdDate = this.formatDate(row.createdDate)
        }
        console.log('row', rows);
    }

    genListAction(data = []) {
        this.listAction = data.map((policy, index) => {

            const actions = [];

            if (this.isGranted([this.PermissionRealStateConst.RealStateCSPhanPhoi_CapNhat])) {
                actions.push({
                    data: policy,
                    index: index,
                    label: 'Sửa',
                    icon: 'pi pi-pencil',
                    command: ($event) => {
                        this.edit($event.item.data);
                    }
                })
            }
            if (this.isGranted([this.PermissionRealStateConst.RealStateCSPhanPhoi_DoiTrangThai])) {
                actions.push({
                    data: policy,
                    label: policy.status == this.PolicyTemplateConst.KHOA ? 'Kích hoạt' : 'Huỷ kích hoạt',
                    icon: policy.status == this.PolicyTemplateConst.KHOA ? 'pi pi-check' : 'pi pi-times',
                    command: ($event) => {
                        this.changeStatusPolicy($event.item.data);
                    }
                });
            }
            if (this.isGranted([this.PermissionRealStateConst.RealStateCSPhanPhoi_Xoa])) {
                actions.push({
                    data: policy,
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

    create() {
        const ref = this._dialogService.open(
            CreateDistributionPolicyTempComponent,
            {
                header: 'Thêm chính sách',
                width: '600px',
            }
        );
        //
        ref.onClose.subscribe((response) => {
            if (response) {
                this.setPage();
            }
        });
    }

    edit(policy) {
        const ref = this._dialogService.open(
            CreateDistributionPolicyTempComponent,
            {
                header: 'Sửa chính sách',
                width: '600px',
                data: {
                    policyTemplate: policy,
                }
            }
        );
        //
        ref.onClose.subscribe((response) => {
            if (response) {
                this.setPage();
            }
        });
    }

    delete(policy) {
        const ref = this._dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '600px',
                data: {
                    title: `Bạn có chắc chắn muốn xóa chính sách ${policy.name}?`,
                    icon: FormNotificationConst.IMAGE_CLOSE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this._policyTemplateService.delete(policy.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Xóa chính sách thành công")) {
                        this.setPage();
                    }
                }, (err) => {
                    console.log('err____', err);
                    this.messageError(`Không xóa được chính sách ${policy.name}`,'');
                });
            } 
        });
    }


    changeStatusPolicy(item) {
        this._policyTemplateService.changeStatusPartnerTemp(item.id).subscribe(
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
                this.messageError(`Không thay đổi được trạng thái của chính sách ${item.name}`);
            }
        );
    }

    setPage(pageInfo?: any) {
        this.page.pageNumber = pageInfo?.page ?? this.offset;
        if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		let dataFilters = this.formatCalendar(this.fieldFilterDates, {...this.fieldFilter});

        this.page.keyword = this.keyword;
        this.isLoading = true;
        this._policyTemplateService.getAllPartnerTemp(this.page, dataFilters).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {
                this.page.totalItems = res.data.totalItems;
                this.rows = res?.data?.items;
                //
                if (this.rows?.length) {
                    this.genListAction(this.rows);
                    this.setData(this.rows);
                }
            }
        }, (err) => {
            this.isLoading = false;
            console.log('Error-------', err);
            
        });
    }
}
