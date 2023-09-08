import { Component, Injector, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IssuerConst, DistributionContractConst, ApproveConst, PermissionRealStateConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ApproveFilter } from "@shared/interface/filter.model";
import { Page } from "@shared/model/page";
import { ApproveServiceProxy } from "@shared/service-proxies/approve-service";
import { ProjectServiceProxy } from "@shared/service-proxies/project-manager-service";
import { DistributionService } from "@shared/services/distribution.service";
import { OpenSellService } from "@shared/services/open-sell.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormApproveComponent } from "src/app/form-general/form-request-approve-cancel/form-approve/form-approve.component";
import { FormCancelComponent } from "src/app/form-general/form-request-approve-cancel/form-cancel/form-cancel.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";

@Component({
	selector: "app-approve",
	templateUrl: "./approve.component.html",
	styleUrls: ["./approve.component.scss"],
	providers: [DialogService],
})
export class ApproveComponent extends CrudComponentBase implements OnDestroy {
	constructor(
		injector: Injector,
		private dialogService: DialogService,
		private router: Router,
		private _projectService: ProjectServiceProxy,
		private routeActive: ActivatedRoute,
		private approveService: ApproveServiceProxy,
		messageService: MessageService,
		private breadcrumbService: BreadcrumbService,
		private _distributionService: DistributionService,
		private _openSellService: OpenSellService,

	) {
		super(injector, messageService);
		this.breadcrumbService.setItems([
			{ label: "Trang chủ", routerLink: ["/home"] },
			{ label: "Quản lý phê duyệt"},
		]);
	}

	ApproveConst = ApproveConst;
	IssuerConst = IssuerConst;
	DistributionContractConst = DistributionContractConst;

	approve: any = {};
	routeSubcribe: any = null;
	//
	rows: any[] = [];
	cols: any[];
	listAction: any[] = [];

	ref: DynamicDialogRef;
	page = new Page();

	_selectedColumns: any[];
	
	dataFilter: ApproveFilter = new ApproveFilter();
	minWidthTable: string;
	
	ngOnInit(): void {
		this.minWidthTable = '2200px';

		this.isLoading = true;
		//
		this.routeSubcribe = this.routeActive.params.subscribe((params) => {
			this.cols = [];
			if (params.dataType) {
				this.dataFilter.dataType = +params.dataType;
				this.setPage();
				this.setColumnData(params.dataType)
			}
		});		

		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
	}

	setColumnData(dataType) {
		this.cols = [];
		let colHeader = [
			{ field: 'summary', header: 'Nội dung duyệt', width: '16rem' },
			{ field: 'confirmDate', header: 'Ngày duyệt/ hủy', width: '11rem' },
		]
		//
		let colFooter = [
			{ field: 'requestNote', header: 'Ghi chú trình duyệt'},
			{ field: 'approveNote', header: 'Ghi chú duyệt'},
			{ field: 'cancelNote', header: 'Ghi chú hủy duyệt'},
			{ field: 'isCheck', header: 'EPIC duyệt', width: '8rem', class: 'justify-content-center' },
		];
		//
		if(dataType == ApproveConst.DATA_TYPE_PROJECT || dataType == ApproveConst.DATA_TYPE_OPEN_SELL) {
			this.cols = [
				...colHeader,
				...[
					{ field: 'projectName', header: 'Dự án' },
				],
				...colFooter
			];
		} else if ((dataType == ApproveConst.DATA_TYPE_DISTRIBUTION)) {
			this.cols = [
				...colHeader,
				...[
					{ field: 'projectName', header: 'Dự án' },
					{ field: 'tradingProviderName', header: 'Đại lý'},
				],
				...colFooter
			];
		} 
		this._selectedColumns = this.cols;
	}

	genListAction(data = []) {
		this.listAction = data.map((item) => {
			const actions = [
				{
					data: item,
					label: "Thông tin chi tiết",
					icon: "pi pi-info-circle",
					command: ($event) => {
						this.detail($event.item.data);
					},
				}
			];

			if ( item?.status == ApproveConst.STATUS_REQUEST 
				&& ( (this.isGranted([PermissionRealStateConst.RealStatePDDA_PheDuyetOrHuy]) && this.dataFilter.dataType == ApproveConst.DATA_TYPE_PROJECT) 
				|| (this.isGranted([PermissionRealStateConst.RealStatePDPP_PheDuyetOrHuy]) && this.dataFilter.dataType == ApproveConst.DATA_TYPE_DISTRIBUTION)
				|| (this.isGranted([PermissionRealStateConst.RealStatePDMB_PheDuyetOrHuy]) && this.dataFilter.dataType == ApproveConst.DATA_TYPE_OPEN_SELL))) {
				actions.push({
					data: item,
					label: "Phê duyệt",
					icon: "pi pi-check",
					command: ($event) => {
						this.approveSharing($event.item.data);
					},
				});
			}
			return actions;
		});
	}

	cancelSharing(investor) {
		const ref = this.dialogService.open(
			FormCancelComponent,
			this.getConfigDialogServiceRAC("Hủy duyệt", investor?.referId)
		);

		ref.onClose.subscribe((dataCallBack) => {
			if (dataCallBack?.accept) {
				const body1 = {
					cancelNote: dataCallBack?.data?.cancelNote,
					id: investor.referId,
				}
				if (investor.dataType == ApproveConst.DATA_TYPE_PROJECT) {

					this._projectService.cancel(body1).subscribe((response) => {
						if (this.handleResponseInterceptor(response, "Hủy duyệt thành công")) {
							this.setPage();
						}
					});
				}
			}
		});
	}

	approveSharing(item) {
		if (item.dataType == ApproveConst.DATA_TYPE_PROJECT) {
			const params = {
				id: item.referId,
				summary: 'Phê duyệt sản phẩm',
				data: item.project,
				type: 'projectInfo'
			}
			//
			const ref = this.dialogService.open(
				FormApproveComponent,
				this.getConfigDialogServiceRAC("Trình duyệt", params)
			);
			//
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this._projectService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove ).subscribe((response) => {
						if (this.handleResponseInterceptor(response, "Thao tác thành công!")) {
							this.setPage();
						}
					});
				}
			});
		}
		if (item.dataType == ApproveConst.DATA_TYPE_DISTRIBUTION) {
			const params = {
				id: item.referId,
				summary: 'Phân phối sản phẩm',
				data: item.distribution,
				type: 'distributionProductInfo'
			}
			//
			const ref = this.dialogService.open(
				FormApproveComponent,
				this.getConfigDialogServiceRAC("Trình duyệt", params)
			);
			//
			ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
					this._distributionService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove ).subscribe((response) => {
						if (this.handleResponseInterceptor(response, "Thao tác thành công!")) {
							this.setPage();
						}
					});
				}
			});
		}

		if (item.dataType == ApproveConst.DATA_TYPE_OPEN_SELL) {
			const params = {
				id: item.referId,
				summary: "Mở bán sản phẩm",
				data: item.openSell,
				type: "openSellInfo",
			  };
			  //
			  const ref = this.dialogService.open(
				FormApproveComponent,
				this.getConfigDialogServiceRAC("Trình duyệt", params)
			  );
			  //
			  ref.onClose.subscribe((dataCallBack) => {
				if (dataCallBack?.accept) {
				  this._openSellService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove).subscribe((response) => {
					  if (this.handleResponseInterceptor(response, "Thao tác thành công!")) {
						this.setPage();
					  }
					});
				}
			  });
		}
	}

	changeRequestDate() {
		this.routeSubcribe = this.routeActive.params.subscribe((params) => {
			if (params.dataType) {
				this.setPage();
			}
		});
	}

	changeActionType() {
		this.isLoading = true;
		this.routeSubcribe = this.routeActive.params.subscribe((params) => {
			if (params.dataType) {
				this.setPage();
			}
		});
	}

	changeStatus() {
		this.isLoading = true;
		this.routeSubcribe = this.routeActive.params.subscribe((params) => {
			if (params.dataType) {
				this.setPage();
			}
		});
	}

	showData(rows) {
		for (let row of rows) {
			row.requestDate = row?.requestDate,
			row.summary = row?.summary,
			row.requestNote = row.requestNote ;
			row.confirmDate = (row.approveDate || row.cancelDate) ? this.formatDateTime(row?.approveDate || row.cancelDate) : null;
			if ( this.dataFilter.dataType == ApproveConst.DATA_TYPE_DISTRIBUTION ) {
				row.distribution.startDate = this.formatDate(row?.distribution?.startDate);
				row.distribution.endDate = this.formatDate(row?.distribution?.endDate);
				row.tradingProviderName = row?.distribution?.tradingProvider?.name;
				row.projectName = row?.distribution?.project?.name;
			}
			if ( this.dataFilter.dataType == ApproveConst.DATA_TYPE_OPEN_SELL) {
				row.openSell.startDate = this.formatDate(row?.openSell?.startDate);
				row.openSell.endDate = this.formatDate(row?.openSell?.endDate);
				row.projectName = row?.openSell?.project?.name || row?.project?.name;
				// row.openSell.keepTime = row?.openSell?.keepTime / 60; 
			} else if(this.dataFilter.dataType == ApproveConst.DATA_TYPE_PROJECT) {
				row.projectName = row?.openSell?.project?.name || row?.project?.name;
			}
		};
	}

	ngOnDestroy(): void {
		this.routeSubcribe.unsubscribe();
	}

	detail(approve) {
		let url_: string;
		if(this.dataFilter.dataType === ApproveConst.DATA_TYPE_PROJECT) url_= ApproveConst.LINK_PROJECT;
		if(this.dataFilter.dataType === ApproveConst.DATA_TYPE_DISTRIBUTION) url_= ApproveConst.LINK_DISTRIBUTION;
		if(this.dataFilter.dataType === ApproveConst.DATA_TYPE_OPEN_SELL) url_= ApproveConst.LINK_OPEN_SELL;
		if(url_) this.router.navigate([url_ + this.cryptEncode(approve.referId)]);
	}

	setPage(event?: Page) {
		if(!event) this.page.pageNumber = 0;
		this.page.keyword = this.keyword;
		this.isLoading = true;
		// DataType = 1: Phê duyệt dự án
		// DataType = 2: Phê duyệt phân phối dự án
		// DataType = 3: Phê duyệt mở bán

		this.approveService.getAll(this.page, this.dataFilter).subscribe((res) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, "")) {
				this.page.totalItems = res.data.totalItems;
				this.rows = res.data.items;
				if (this.rows?.length) {
					this.showData(this.rows);
					this.genListAction(this.rows);
				}
				console.log({ rows: res.data.items, totalItems: res.data.totalItems });
			}
		},
			(err) => {
				this.isLoading = false;
				console.log('Error-------', err);
				
			}
		);
	}
}
