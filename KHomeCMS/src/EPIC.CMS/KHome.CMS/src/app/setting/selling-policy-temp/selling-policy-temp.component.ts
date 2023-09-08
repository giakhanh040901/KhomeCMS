import { Component, Injector } from "@angular/core";
import { FormNotificationConst, PolicyDetailTemplateConst, PolicyTemplateConst, SellingPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { PolicyTemplateService } from "@shared/services/policy-template.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";
import { CreateSellingPolicyTempComponent } from "./create-selling-policy-temp/create-selling-policy-temp.component";

@Component({
  selector: "app-selling-policy-temp",
  templateUrl: "./selling-policy-temp.component.html",
  styleUrls: ["./selling-policy-temp.component.scss"],
})
export class SellingPolicyTempComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _policyTemplateService: PolicyTemplateService,
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		public confirmationService: ConfirmationService,
		private _dialogService: DialogService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
		{ label: "Trang chủ", routerLink: ["/home"] },
        { label: 'Cài đặt'},
		{ label: "Chính sách ưu đãi đại lý" },
		]);
	}

	rows: any[] = [];

    PolicyTemplateConst = PolicyTemplateConst;
    PolicyDetailTemplateConst = PolicyDetailTemplateConst;
    SellingPolicyConst = SellingPolicyConst;
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
        this.minWidthTable = '1400px';
		this.setPage({ page: this.offset });
        this.cols = [
            { field: 'code', header: 'Mã chính sách', isPin: true },
            { field: 'name', header: 'Tên chính sách', isPin: true},
            { field: 'sourceDisplay', header: 'Loại hình đặt cọc', width: '11rem' },
            { field: 'sellingPolicyTypeDisplay', header: 'Loại áp dụng', width: '14rem' },
            { field: 'conversionValueDisplay', header: 'Quy đổi tiền', class: 'justify-content-end' },
        ];

        this.cols = this.cols.map((item, index) => {
            item.position = index + 1;
            return item;
          });
        this._selectedColumns = this.getLocalStorage('sellingPolicyTempRst') ?? this.cols;
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
            console.log('dataCallBack', dataCallBack);
            if (dataCallBack?.accept) {
                this._selectedColumns = dataCallBack.data.sort(function (a, b) {
                    return a.position - b.position;
                });
                this.setLocalStorage(this._selectedColumns, 'sellingPolicyTempRst')
            }
        });
    }

    showData(rows) {
        for (let row of rows) {
            row.code = row.code,
                row.name = row.name,
                row.sourceDisplay = this.SellingPolicyConst.getNameType(row.source),
                row.conversionValueDisplay = this.utils.transformMoney(row.conversionValue),
                row.sellingPolicyTypeDisplay = this.SellingPolicyConst.getSellingPolicy(row.sellingPolicyType)
        }
    }

    genListAction(data = []) {
        this.listAction = data.map((policy, index) => {
            const actions = [];
            actions.push({
                data: policy,
                index: index,
                label: 'Xem chi tiết',
                icon: 'pi pi-info-circle',
                command: ($event) => {
                    this.detail($event.item.data);
                }
            })

            if (this.isGranted([this.PermissionRealStateConst.RealStateCSBanHang_CapNhat])) {
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

			if(this.isGranted([this.PermissionRealStateConst.RealStateCSBanHang_DoiTrangThai])) {
                if (policy.status == this.PolicyTemplateConst.KICH_HOAT) {
                    actions.push({
                        data: policy,
                        label: 'Huỷ kích hoạt',
                        icon: 'pi pi-times',
                        command: ($event) => {
                            this.changeStatusPolicy($event.item.data);
                        }
                    });
                }
                
                if (policy.status == this.PolicyTemplateConst.KHOA) {
                    actions.push({
                        data: policy,
                        label: 'Kích hoạt',
                        icon: 'pi pi-check',
                        command: ($event) => {
                            this.changeStatusPolicy($event.item.data);
                        }
                    });
                }
            }

			if (this.isGranted([this.PermissionRealStateConst.RealStateCSBanHang_Xoa])) {
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
        console.log('listActions', this.listAction);

    }

    detail(policy) {
        const ref = this.dialogService.open(CreateSellingPolicyTempComponent, {
            header: "Thông tin chính sách",
            width: '900px',
            data: {
                policy: policy,
                isView: true,

            },
        });
        //
        ref.onClose.subscribe((res) => {
            
        });
    }

    create() {
        const ref = this.dialogService.open(
			CreateSellingPolicyTempComponent,
            {
                header: 'Thêm chính sách',
                width: '900px',
            }
        );
        //
        ref.onClose.subscribe((response) => {
            console.log('dataCallBack', response);
            if (response?.accept) {
                this.messageSuccess('Thêm thành công', '');
                this.setPage();
            }
        });
    }

    edit(policy, isCreateDetail?: boolean) {
        const ref = this.dialogService.open(
            CreateSellingPolicyTempComponent,
            {
                header: 'Sửa chính sách',
                width: '900px',
                data: {
                    policy: policy,
                    isCreateDetail: isCreateDetail,
                }
            }
        );
        //
        ref.onClose.subscribe((response) => {
            if (response?.accept) {
                this.messageSuccess('Cập nhật thành công', '');
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
                    title: "Bạn có chắc chắn muốn xóa chính sách này?",
                    icon: FormNotificationConst.IMAGE_CLOSE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this._policyTemplateService.deleteSelling(policy.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response,"Xóa chính sách thành công")) {
                        this.setPage({ page: this.page.pageNumber });
                    }
                }, (err) => {
                    console.log('err____', err);
                    this.messageError(`Không xóa được chính sách ${policy.name}`,'');
                });
            } 
        });
    }

    changeStatusPolicy(item) {
        this._policyTemplateService.changeStatusPolicy(item.id).subscribe(
            (response) => {
                var message = "Kích hoạt thành công";
                if (item.status == 'A') {
                    message = "Hủy kích hoạt thành công";
                } 
                if (this.handleResponseInterceptor(response, message)) {
                    this.setPage({ page: this.page.pageNumber });
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
        this._policyTemplateService.getAll(this.page, dataFilters).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {
                console.log('data', res?.data?.items);
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
