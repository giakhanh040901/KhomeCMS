import { Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { OrderConst, ProductConst, YesNoConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { DistributionService } from "@shared/services/distribution.service";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { TradingProviderSelectedService } from "@shared/services/trading-provider.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { forkJoin, Subject, Subscription } from "rxjs";
import { FormSetDisplayColumnComponent } from "src/app/form-general/form-set-display-column/form-set-display-column.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";

@Component({
  selector: "app-contract-active",
  templateUrl: "./contract-active.component.html",
  styleUrls: ["./contract-active.component.scss"],
})
export class ContractActiveComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private _orderService: OrderServiceProxy,
		private _distributionService: DistributionService,
		private breadcrumbService: BreadcrumbService,
		private confirmationService: ConfirmationService,
		private projectService: ProjectOverviewService,
		private _tradingProviderSelectedService: TradingProviderSelectedService,
		private dialogService: DialogService,
		private router: Router
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
		{ label: "Trang chủ", routerLink: ["/home"] },
		{ label: "Quản lý giao dịch cọc" },
		{ label: "Hợp đồng đặt cọc" },
		]);
	}

	OrderConst = OrderConst;
	ProductConst = ProductConst;

	distributions: any[] = [];
	status: any;
	source: any;

	customerName = "";
	contractCode = "";

	subject = {
		keyword: new Subject(),
		isSetPage: new Subject()
		// keyword2nd: new Subject(),
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
		depositDate: null,
		searchField: null,
		source: null,
		orderSource: null,
		orderer: null,
		projectId: null,
	};
	fieldFilterDates = ['depositDate'];
	sources: any[] = [...OrderConst.sources];

	policies: any[] = [];
	policyDetails: any[] = [];
	projects = [];

	//
	sortFields: string[];
	sortOrders: number[];
	sortData: any[] = [];
	tradingProviderSub: Subscription;

	minWidthTable: string;

	ngOnInit(): void {
		this.minWidthTable = '1800px';

		this.isPartner = this.getIsPartner();

		this._tradingProviderSelectedService.TradingProviderObservable.subscribe((change) => {
			this.setPage();
		})
		this.init();

		this.subject.isSetPage.subscribe(() => {
			this.setPage();
		});

		this.cols = [
			{ field: 'contractCode', fieldSort: 'ContractCode', header: 'Mã HĐ', width: '10rem', isPin: true},
			{ field: 'customerName', header: 'Tên khách hàng', isPin: true},
			{ field: 'projectName', header: 'Dự án'},
			{ field: 'productItemCode', header: 'Mã căn', width: '10rem'},
			{ field: 'depositDate', fieldSort: 'DepositDate', header: 'Ngày đặt cọc', width: '11rem'},
			{ field: 'depositMoneyDisplay', fieldSort: 'DepositMoney', header: 'Số tiền cọc', width: '11rem', class:'justify-content-end'},
			{ field: 'classifyTypeDisplay', header: 'Kiểu sản phẩm', width: '13rem', isDefaultShow: false },
			{ field: 'distributionPolicyName', header: 'Chính sách', width: '18rem', isDefaultShow: false },
			{ field: '_paymentType', fieldSort: 'PaymentType', header: 'Vay ngân hàng', width: '12rem', class:'justify-content-center' },
			{ field: 'source', fieldSort: 'Source', header: 'Loại', width: '10rem', class:'justify-content-center', isDefaultShow: false},
			{ field: 'orderer', header: 'Nguồn đặt lệnh', width: '10rem', class:'justify-content-center'},
			{ field: 'priceArea', header: 'Diện tích tính giá', width: '11rem', class:'justify-content-center'},
			{ field: 'customerTypeDisplay', header: 'Loại KH', width: '10rem', isDefaultShow: false},
			// { field: 'keepTimeDisplay', header: 'Thời gian còn lại (s)', width: '12rem', class:'justify-content-center'},
			// { field: 'columnResize', header: '', type:'hidden' },
		];
		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
		this._selectedColumns = this.getLocalStorage('contractActiveRst') ?? this.cols.filter(item => item.isDefaultShow != false);
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
		//
		ref.onClose.subscribe((dataCallBack) => {
			console.log('dataCallBack', dataCallBack);
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, 'contractActiveRst')
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
			row.depositDate = this.formatDateTime(row?.depositDate),
			row.policyName = row?.policy?.name,
			row.policyDetailName = row?.policyDetail?.name,
			row.totalValue = this.utils.transformMoney(row?.totalValue),
			row.profitDisplay = row?.policyDetail?.profit ? this.utils.transformMoney(row?.policyDetail?.profit) + "%/năm" : "";
			row.depositMoneyDisplay = this.formatCurrency(row.depositMoney);
			row.keepTimeDisplay = row.keepTime/60 + ' phút';	// Quy đổi ra phút
		};
		console.log('row', rows);
	}

	genListAction(data = []) {
		this.listAction = data.map(orderItem => {
			const actions = [];

			if (true) {
				actions.push({
					data: orderItem,
					label: 'Thông tin chi tiết',
					icon: 'pi pi-info-circle',
					command: ($event) => {
						this.detail($event.item.data);
					}
				})
			}



			return actions;
		});
	}

	detail(order) {
		this.router.navigate(['/trading-contract/order/detail/' + this.cryptEncode(order?.id)]);
	}

	init() {
		this.isLoading = true;
		forkJoin([this._orderService.getAll(this.page, 'orderContract', this.status, this.dataFilter), this.projectService.getAllByTrading()]).subscribe(([res, resProject]) => {
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
				// console.log({ rowsOrder: res.data.items, totalItems: res.data.totalItems, resBondSecondary: resBondSecondary.data.items });
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
		console.log(" this.policies", this.policies);
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
		// let dataFilters = this.formatCalendar(this.fieldFilterDates, {...this.dataFilter});

		// console.log('!!! filter: ', dataFilters);
		
		this._orderService.getAll(this.page, 'orderContract', this.status, this.dataFilter, this.sortData).subscribe((res) => {
			
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
