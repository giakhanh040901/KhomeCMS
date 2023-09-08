import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CollectMoneyBankConst, YesNoConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { Page } from '@shared/model/page';
import { QueryMoneyBankService } from '@shared/services/query-bank.service';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';

@Component({
	selector: 'app-pay-money-bank',
	templateUrl: './pay-money-bank.component.html',
	styleUrls: ['./pay-money-bank.component.scss']
})
export class PayMoneyBankComponent extends CrudComponentBase {

	constructor(
		injector: Injector,
		messageService: MessageService,
		private breadcrumbService: BreadcrumbService,
		private dialogService: DialogService,
		private _queryService: QueryMoneyBankService
	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Chi tiền ngân hàng" },
		]);
	}

	rows: any[] = [];
	_selectedColumns: any[];

	// ACTION BUTTON
	listAction: any[] = [];

	// Data Init
	YesNoConst = YesNoConst;
	CollectMoneyBankConst = CollectMoneyBankConst;

	cols: any[];

	isClose = "";


	status: any;
	queryDate: Date;

	statusSearch = [
		...CollectMoneyBankConst.statusSearchConst
	];

	page = new Page();
	offset = 0;
	minWidthTable: string;

	ngOnInit(): void {
		this.minWidthTable = '2000px';

		this.setPage({ page: this.offset });

		this.cols = [
			{ field: 'requestId', header: 'ID Lô', width: '8rem', isPin: false },
			{ field: 'dataTypeDisplay', header: 'Loại chi', width: '10rem', isPin: false },
			{ field: 'contractCodeDisplay', header: 'Mã hợp đồng', width: '11rem', isPin: false, class: 'b-cut-text-11' },
			{ field: 'approveDateDisplay', header: 'Gửi yêu cầu', width: '12rem', isPin: false },
			{ field: 'responseDate', header: 'Phản hồi', width: '12rem', isPin: false },
			{ field: 'amountMoneyDisplay', header: 'Số tiền', width: '15rem', isPin: false },
			{ field: 'bin', header: 'Tài khoản nhận', width: '10rem', isPin: false },
			{ field: 'note', header: 'Nội dung chuyển', isPin: false },
			{ field: 'exception', header: 'Nội dung lỗi', isPin: false },
		];
		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
		this._selectedColumns = [...(this.getLocalStorage('payMoneyBankRst') ?? this.cols)];
		console.log('_selectedColumns', this._selectedColumns);
	}

	setColumn(col, _selectedColumns) {
		const ref = this.dialogService.open(
			FormSetDisplayColumnComponent,
			this.getConfigDialogServiceDisplayTableColumn(col, _selectedColumns)
		);
		
		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				this._selectedColumns = dataCallBack.data.sort(function (a, b) {
					return a.position - b.position;
				});
				this.setLocalStorage(this._selectedColumns, 'payMoneyBankRst');
			}
		});
	}

	showData(rows) {
		for (let row of rows) {
			row.contractCodeDisplay = row?.investOrders[0]?.genContractCode || row?.investOrders[0]?.contractCode;
			row.dataTypeDisplay = CollectMoneyBankConst.getTypes(row?.dataType);
			row.amountMoneyDisplay = this.formatCurrency(row?.amountMoney);
			row.approveDateDisplay = this.formatDateTimeSecond(row.investOrders[0].approveDate);
			row.responseDate = this.formatDateTimeSecond(row.responseDate);
		}
		console.log('showData', rows);
	}

	changeQueryDate() {
		this.setPage();
	}

	changeStatus() {
		this.setPage();
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if (pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		if (this.queryDate) {
			var queryDate = moment(this.queryDate).format('YYYY-MM-DD')
		}
		//
		this._queryService.getAllPayMoneyBank(this.page, this.status, queryDate).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res)) {
				this.page.totalItems = res?.data?.totalItems;
				// this.rows = res.data.items;
				if (this.rows?.length) {
					// this.genListAction(this.rows);
					this.showData(this.rows);
				}
			}
			console.log({ resDistribution: res });
		}, (err) => {
			this.isLoading = false;
			console.log('Error-------', err);
		}
		);
	}

}