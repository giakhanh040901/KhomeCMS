import { Component, Injector } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { Page } from '@shared/model/page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import { OrderServiceProxy } from '@shared/service-proxies/trading-contract-service';
import { AtributionConfirmConst, OrderConst, PermissionRealStateConst, ProductConst, YesNoConst } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { ProjectOverviewService } from '@shared/services/project-overview.service';
import { OrderExtendedTimeComponent } from './order-extended-time/order-extended-time.component';
import { TradingProviderSelectedService } from '@shared/services/trading-provider.service';

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
})
export class OrderComponent extends CrudComponentBase {

	constructor(
		injector: Injector,
		messageService: MessageService,
		private _orderService: OrderServiceProxy,
		private breadcrumbService: BreadcrumbService,
		private confirmationService: ConfirmationService,
        private projectService: ProjectOverviewService,
		private _tradingProviderSelectedService: TradingProviderSelectedService,
		private dialogService: DialogService,
		private router: Router,
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: 'Trang chủ', routerLink: ['/home'] },
			{ label: 'Quản lý giao dịch cọc' },
			{ label: 'Sổ lệnh' },
		]);
		//
	}

	modalDialog: boolean;

	OrderConst = OrderConst;
	ProductConst = ProductConst;

	distributions: any[] = [];
	tradingDate: null;
	status: any;
	source: any;

	customerName = '';
	contractCode = '';

	subject = {
		keyword: new Subject(),
		keyword2nd: new Subject(),
		isSetPage: new Subject()
	};

	rows: any[] = [];
	row: any;
	col: any;

	cols: any[];
	defaultCols: any[];
	_selectedColumns: any[];

	submitted: boolean;
	listAction: any[] = [];
	YesNoConst = YesNoConst;
	page = new Page();
	offset = 0;

	order: any = {};

	dataFilter = {
		distributionId: null,
		policyId: null,
		policyDetailId: null,
		tradingDate: null,
		searchField: null,
		source: null,
        orderSource: null,
		orderer: null,
		projectId: null,
	}

	policies: any[] = [];
	policyDetails: any[] = [];
	projects = [];

	//
	tradingProviderSub: Subscription;

	//
	sortFields: string[];
	sortOrders: number[];
	sortData: any[] = [];
	
	minWidthTable: string;

	ngOnInit() {
		this.minWidthTable = '1800px'
		this.isPartner = this.getIsPartner();
		this._tradingProviderSelectedService.TradingProviderObservable.subscribe((change) => {
			this.setPage();
		})
		this.init();

		this.subject.isSetPage.subscribe(() => {
			this.setPage();
		});

		this.cols = [
			{ field: 'productItemCode', header: 'Mã căn', width: '9rem', isPin: true, cutText: 'b-cut-text-8' },
			{ field: 'contractCode', fieldSort: 'ContractCode', header: 'Mã HĐ', width: '10rem'},
			{ field: 'customerName', header: 'Tên khách hàng'},
			{ field: 'projectName', header: 'Dự án', width: '12rem'},
			{ field: 'createdDate', fieldSort: 'CreatedDate', header: 'Ngày đặt lệnh', width: '11rem'},
			{ field: 'depositMoneyDisplay', fieldSort: 'DepositMoney', header: 'Số tiền', width: '10rem'},
			{ field: 'classifyTypeDisplay', header: 'Kiểu sản phẩm', width: '13rem', isDefaultShow: false },
			{ field: 'distributionPolicyName', header: 'Chính sách', width: '18rem', isDefaultShow: false },
			{ field: '_paymentType', fieldSort: 'PaymentType', header: 'Vay ngân hàng', width: '12rem', class:'justify-content-center' },
			{ field: 'source', fieldSort: 'Source', header: 'Loại', width: '10rem', class:'justify-content-center', isDefaultShow: false},
			{ field: 'orderer', header: 'Nguồn đặt lệnh', width: '10rem', class:'justify-content-center'},
			{ field: 'priceArea', header: 'Diện tích tính giá', width: '10rem', class:'justify-content-center'},
			{ field: 'customerTypeDisplay', header: 'Loại KH', width: '10rem', isDefaultShow: false},
			{ field: 'coutdownTime', fieldSort: 'ExpTimeDeposit', header: 'Thời gian giữ chỗ', width: '13rem', class:'justify-content-center'},
		];
		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
		this._selectedColumns = this.getLocalStorage('orderRst') ?? this.cols.filter(item => item.isDefaultShow != false);
	}

	ngOnDestroy(): void {
		if(this.tradingProviderSub) (<Subscription>this.tradingProviderSub).unsubscribe();
	}

	changeStatus() {
		this.setPage({ Page: this.offset })
	}

	setColumn(col, _selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
		);

		ref.onClose.subscribe((dataCallBack) => {
			console.log('dataCallBack', dataCallBack);
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, 'orderRst')
			}
		});
	}

	showData(rows) {
		for (let row of rows) {
			row.customerName = row?.businessCustomer?.name || (row?.investor?.investorIdentification?.fullname || row?.investor?.name),
			row.contractCode = row?.contractCode,
			row.productItemCode = row?.productItem?.code,
			row.distributionPolicyName = row?.distributionPolicy?.name,
			row._paymentType = row?.paymentType === OrderConst.TRA_GOP,
			row.classifyTypeDisplay = ProductConst.getclassifyTypesName(row?.productItem?.classifyType),
			row.priceArea = row?.productItem?.priceArea,
			row.customerTypeDisplay = row.investor ? 'Cá nhân' : 'Doanh nghiệp',
			row.projectName = row?.project?.code,

			row.createdDate = this.formatDateTime(row?.createdDate),
			row.policyName = row?.policy?.name,
			row.policyDetailName = row?.policyDetail?.name,
			row.totalValue = this.utils.transformMoney(row?.totalValue),
			row.profitDisplay = row?.policyDetail?.profit ? this.utils.transformMoney(row?.policyDetail?.profit) + "%/năm" : "";
			// row.quantity = this.utils.transformMoney(row?.quantity)
			row.depositMoneyDisplay = this.formatCurrency(row.depositMoney);
		
			// Tính thời gian giữ chỗ còn lại (millisecond)
			let coutdownTime = new Date(row.expTimeDeposit).getTime() - new Date().getTime();
			row.coutdownTime = coutdownTime > 0 ? coutdownTime : 0;	// Quy đổi ra phút
		};
		console.log('row', rows);
	}

	genListAction(data = []) {
		this.listAction = data.map(orderItem => {
			const actions = [];

			if (this.isGranted([PermissionRealStateConst.RealStateMenuSoLenh_ChiTiet])) {
				actions.push({
					data: orderItem,
					label: 'Thông tin chi tiết',
					icon: 'pi pi-info-circle',
					command: ($event) => {
						this.detail($event.item.data);
					}
				})
			}

			if (this.isGranted([PermissionRealStateConst.RealStateMenuSoLenh_GiaHanGiuCho]) && (orderItem.status == OrderConst.KHOI_TAO || orderItem.status == OrderConst.CHO_THANH_TOAN)) {
				actions.push({
				  data: orderItem,
				  label: 'Gia hạn thời gian giữ chỗ',
				  icon: 'pi pi-clock',
				  command: ($event) => {
					this.extendedTime($event.item.data);
					console.log("event...",$event.item.data);
				  }
				});
			  }

			if (this.isGranted([PermissionRealStateConst.RealStateMenuSoLenh_Xoa])) {
			  actions.push({
			    data: orderItem,
			    label: 'Xoá',
			    icon: 'pi pi-trash',
			    command: ($event) => {
			      this.delete($event.item.data);
			    }
			  });
			}

			return actions;
		});
	}

	extendedTime(orderItem) {
		const ref = this.dialogService.open(OrderExtendedTimeComponent, {
            header: "Gia hạn thời gian giữ chỗ",
            width: '550px',
            data: {
				order : orderItem
            },
        });
        //
        ref.onClose.subscribe((res) => {
			if(res) {
				this.setPage();
			}
        });
	}

	delete(order) {
		this.confirmationService.confirm({
			message: 'Bạn chắc chắn xoá số lệnh này?',
			...AtributionConfirmConst,
			accept: () => {
				this._orderService.delete(order?.id).subscribe((response) => {
					if (this.handleResponseInterceptor(response, "Xóa thành công")) {
						this.setPage();
					}
				});
			},
			reject: () => {

			},
		});
	}

	detail(order) {
		this.router.navigate(['/trading-contract/order/detail/' + this.cryptEncode(order?.id)]);
	}

	create() {
		this.router.navigate(['/trading-contract/order/create/filter-customer'], { queryParams : { isCreateNew: true }});
	}

	init() {
		this.isLoading = true;
		forkJoin([this._orderService.getAll(this.page, 'order', this.status, this.dataFilter), this.projectService.getAllByTrading()]).subscribe(([res, resProject]) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, '')) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res?.data?.items;
				//
				this.projects = resProject?.data;
				if (this.rows?.length) {
					this.genListAction(this.rows);
					this.showData(this.rows)
				}
				console.log({ rowsOrder: res.data.items, totalItems: res.data.totalItems });
			}
		}, (err) => {
			this.isLoading = false;
			console.log('Error-------', err);
			
		});
	}

	changeDistribution(id) {
		this.policies = [];
		const distribution = this.distributions.find(item => item.id == id);
		this.policies = distribution?.policies ?? [];
		if (this.policies?.length) {
			this.policies = [...this.policies];
		}
		this.setPage();
	}

	changePolicy(policyId) {
		this.setPage();
	}

	changeFieldFilter() {
		if (this.keyword?.trim()) {
		  this.setPage();
		}
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		//
		this._orderService.getAll(this.page, 'order', this.status, this.dataFilter, this.sortData).subscribe((res) => {
			
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, '')) {
				this.page.totalItems = res.data.totalItems;
				this.rows = res.data.items;
				//
				if (this.rows?.length) {
					this.genListAction(this.rows);
					this.showData(this.rows);
				}
				console.log({ rowsOrder: res.data.items, totalItems: res.data.totalItems });
			}
		}, (err) => {
			this.isLoading = false;
			console.log('Error-------', err);
		});

	}
}