import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CollectMoneyBankConst, YesNoConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { Page } from '@shared/model/page';
import { QueryMoneyBankService } from '@shared/services/query-bank.service';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormSetDisplayColumnComponent } from 'src/app/form-general/form-set-display-column/form-set-display-column.component';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-collect-money-bank',
  templateUrl: './collect-money-bank.component.html',
  styleUrls: ['./collect-money-bank.component.scss']
})
export class CollectMoneyBankComponent extends CrudComponentBase {

	constructor(
		injector: Injector,
			messageService: MessageService,
			private router: Router,
			private breadcrumbService: BreadcrumbService,
			private dialogService: DialogService,
			private _queryService: QueryMoneyBankService,
	) {
		super(injector, messageService);
			this.breadcrumbService.setItems([
				{ label: "Trang chủ", routerLink: ['/home'] },
				{ label: "Thu tiền ngân hàng" }
			]);
	}

	rows: any[] = [];
	_selectedColumns: any[];
	
	// ACTION BUTTON
	listAction: any[] = [];
	
	// Data Init
	YesNoConst = YesNoConst;
	CollectMoneyBankConst = CollectMoneyBankConst;
	
	///////
	status: any;
	queryDate: Date;
	
	statusSearch = [...CollectMoneyBankConst.statusConst];
	
	cols: any[];
	
	fieldDates = ["openCellDate", "closeCellDate"];
	isClose = '';
	
	page = new Page();
	offset = 0;
	
	fieldCheckBoxs = [];
	minWidthTable: string;
 

  	ngOnInit(): void {
		//
		this.minWidthTable = '1800px';
		this.setPage({ page: this.offset });
		//
		this.fieldCheckBoxs = ['isCheck', 'isShowApp', 'isClose'];
		this.cols = [
			{ field: 'vaNumber', header: 'Mã giao dịch', width: '12rem', isPin: false },
			{ field: 'genContractCode', header: 'Mã hợp đồng', width: '11rem', isPin: false, class: 'b-cut-text-11' },
			{ field: 'createdDateDisplay', header: 'Gửi yêu cầu', width: '12rem', isPin: false},
			{ field: 'transferDateDisplay', header: 'Phản hồi', width: '12rem', isPin: false},
			{ field: 'tranAmountDisplay', header: 'Số tiền', width: '10rem', isPin: false, class:'justify-content-end'}, 
			{ field: 'tranRemark', header: 'Nội dung chuyển', isPin: false },
			{ field: 'exception', header: 'Nội dung lỗi', isPin: false },
			{ field: 'ip', header: 'IP', width: '10rem', isPin: false},
		];
		//
		this.cols = this.cols.map((item,index) => {
			item.position = index + 1;
			return item;
		});
		// this._selectedColumns = this.cols;
		this._selectedColumns = [...(this.getLocalStorage('collectMoneyBankInv') ?? this.cols)];
		console.log('_selectedColumns', this._selectedColumns);
  }

  showData(rows) {
	for (let row of rows) {
			row.createdDateDisplay = this.formatDateTimeSecond(row?.createdDate);
			row.transferDateDisplay = this.formatDateTimeSecond(row?.transferDate);		
			row.tranAmountDisplay = this.formatCurrency(+row?.tranAmount);
			row.genContractCode = row?.genContractCode || row?.rstOrder?.contractCode;	
		}
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
				this.setLocalStorage(this._selectedColumns, 'collectMoneyBankInv');
			}
		});
	}

	changeQueryDate(){
		this.setPage();
	}
	
	changeStatus() {
		this.setPage();
	}

	setPage(pageInfo?: any) {
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		if(this.queryDate){
			var queryDate = moment(this.queryDate).format('YYYY-MM-DD')
		}
		//
		this._queryService.getAllCollectMoneyBank(this.page, this.status, queryDate).subscribe((res) => {
			this.isLoading = false;
			if(this.handleResponseInterceptor(res) ) {
				this.page.totalItems = res?.data?.totalItems;
				this.rows = res.data.items;
				if(this.rows?.length) { 
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

	/* ACTION */
	genListAction(data = []) {
		this.listAction = data.map(distribution => {
			const actions = [];

			// if (this.isGranted([this.PermissionRealStateConst.RealStateHDPP_SoLenh_TTCT])) {
				actions.push({
					data: distribution,
					label: 'Thông tin chi tiết',
					icon: 'pi pi-info-circle',
					command: ($event) => {
						this.view($event.item.data?.id);
					}
				});
			// }
			//
		
			//
			return actions;
		});
	}
  
	view(distributionId) {
		this.router.navigate(["product-manager/distribution/detail/" + this.cryptEncode(distributionId)]);
	}

}
