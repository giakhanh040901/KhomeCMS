import { Component, Injector, Input, ViewChild } from '@angular/core';
import { OrderConst, PolicyTempConst, ProductConst, ProductPolicyConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { OrderServiceProxy } from '@shared/service-proxies/trading-contract-service';
import { DistributionService } from '@shared/services/distribution.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SaleService } from '@shared/services/sale.service';
import { TabView } from 'primeng/tabview';

@Component({
    selector: 'app-delivery-contract-detail',
    templateUrl: './delivery-contract-detail.component.html',
    styleUrls: ['./delivery-contract-detail.component.scss']
  })

export class DeliveryContractDetailComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private routeActive: ActivatedRoute,
        private _orderService: OrderServiceProxy,
        private breadcrumbService: BreadcrumbService,
        private _distributionService: DistributionService,
    ) {
        super(injector, messageService);

        this.breadcrumbService.setItems([
            { label: 'Trang chủ', routerLink: ['/home'] },
            { label: 'Sổ lệnh', routerLink: ['/trading-contract/order'] },
            { label: 'Chi tiết sổ lệnh', },
        ]);

        this.orderId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));

    }

    orderInformation: any;
    customerInformation: any = {};

    bondSecondaryInformation: any = {};
    bondSecondary: any = {};
    bondInfos: any[] = [];
    policies: any[] = [];
    policyInfo: any = {};
    policyDetails: any[] = [];
    policyDetail: any = {};
    profit:number = null;
    orderData: any = {};
    fieldDates = ['buyDate'];
    sale: any = {};
    totalInvestment = 0;
    //
    OrderConst = OrderConst;
    ProductPolicyConst = ProductPolicyConst;
    PolicyTempConst = PolicyTempConst;
    
    isEdit = false;
    isEditAll = false;
    fieldErrors: any = {};

    orderId: number;
    orderDetail: any = {};
    labelButtonEdit = "Chỉnh sửa";

    distributions: any[] = [];
    //
    listBank: any[] = [];
    listAddress: any[] = [];
    //
    distributionInfo: any = {};
    projectInformation: any = {};
    fieldUpdates = {
        totalValue: {
            'isEdit': false,
            'apiPath': '/api/invest/order/update/total-value',
            'name': 'totalValue',
        },
        policy: {
            'isEdit': false,
            'apiPath': '/api/invest/order/update/update-policy-detail',
            'name': 'policyDetailId',
            'messageRequired': 'Vui lòng chọn kỳ hạn!',
        },
        referralCode: {
            'isEdit': false,
            'apiPath': '/api/invest/order/update/referral-code',
            'name': 'saleReferralCode',
            'messageRequired': 'Vui lòng nhập mã giới thiệu!',
        },
        bankAccount: {
            'isEdit': false,
            'apiPath': '/api/invest/order/update/bank-account',
            'name': 'investorBankAccId',
            'messageRequired': 'Vui lòng chọn tài khoản ngân hàng!',
        },
    };

    tabViewActive = {
		'thongTinChung': true,
		'thongTinThanhToan': false,
		'HSKHDangKy': false,
		'loiNhuan': false,
	};
	
	@ViewChild(TabView) tabView: TabView;

    ngOnInit() {
        
        this.init();
        
        this.isLoadingPage = true;
        this.isLoading = true;
        this._distributionService.getDistributionsOrder().subscribe((res) => {
            if (this.handleResponseInterceptor(res, '') && res?.data?.length) {
                this.isLoadingPage = false;
                this.isLoading = false;
                this.distributions = res.data.map(distribution => {
                    distribution.labelName = ProductConst.getTypeName(distribution?.garnerProduct?.productType) + ' - ' + distribution?.garnerProduct?.name;
                    return distribution;
                });
                console.log('resDistribution', res);
            }
        }, (err) => {
            this.isLoading = false;
            this.isLoadingPage = false;
            console.log('Error-------', err);
            
        });
    }

    changeProject(distribution) {
        console.log("distributionInfo...", distribution);

        // this.distributionInfo = this.distributions.find( item => item.id == distribution.id );
        this.policies = distribution?.policies;
        this.orderDetail.projectId = distribution?.projectId;
        this.orderDetail.distributionId = distribution?.id;

        this.projectInformation = distribution?.project;
        console.log("policies...", this.policies);
    }

    changeTab(e) {
        let tabHeader = this.tabView.tabs[e.index].header;
		this.tabViewActive[tabHeader] = true;
    }

    init() {
        this.isLoadingPage = true;
        this._orderService.get(this.orderId).subscribe((resOrder) => {
            if (this.handleResponseInterceptor(resOrder, '')) {

                // this.initSale(resOrder?.data?.saleReferralCode);
                this.orderDetail = {
                    ...resOrder.data,
                    buyDate: resOrder.data?.buyDate ? new Date(resOrder.data?.buyDate) : null,
                    paymentFullDate: resOrder.data?.paymentFullDate ?? resOrder.data?.buyDate,
                    bankAccId: resOrder.data?.investorBankAccId || resOrder.data?.businessCustomerBankAccId,
                };
                this.sale = this.orderDetail?.sale;
                console.log("orderDetail,");

                console.log("resOrder...", this.orderDetail);
                this.initDistributionInfo(resOrder?.data.distributionId);
                if (this.orderDetail.status < this.OrderConst.CHO_KY_HOP_DONG) {
                    this.isEditAll = true;
                }
                //
                let listBank: any[] = [];
                // listBank khach
                if (this.orderDetail?.businessCustomer) {
                    listBank = this.orderDetail.businessCustomer?.businessCustomerBanks;
                    if (listBank?.length) {
                        this.listBank = listBank.map(bank => {
                            bank.investorBankAccId = bank.businessCustomerBankId;
                            bank.labelName = bank.bankAccNo + ' - ' + bank.bankAccName + ' - ' + bank.bankName;
                            return bank;
                        });
                    }
                } else
                    if (this.orderDetail?.investor) {
                        listBank = this.orderDetail.investor?.listBank;
                        if (listBank?.length) {
                            this.listBank = listBank.map(bank => {
                                bank.investorBankAccId = bank.id;
                                bank.labelName = bank.bankAccount + (bank.ownerAccount ? ' - ' + bank.ownerAccount : '') + (bank.bankName ? (' - ' + bank.bankName) : '');
                                return bank;
                            });
                        }
                    }
                this.isLoadingPage = false;

            } else {
                this.isLoadingPage = false;
            }
        });
    }

    initDistributionInfo(distributionId) {
        this._distributionService.getById(distributionId).subscribe((res) => {
            this.isLoading = false;
            this.isLoadingPage = false;
            if (this.handleResponseInterceptor(res, '')) {
                this.distributionInfo = res?.data;
                this.projectInformation = res?.data.project;
                this.policies = res?.data?.policies;
                this.policyInfo = this.policies?.find(item => item.id == this.orderDetail?.policyId);
                
                this.policyDetails = this.policyInfo?.policyDetail
                this.policyDetail = this.policyDetails?.find(item => item.id == this.orderDetail.policyDetailId);
                this.profit = this.policyDetail?.profit;
            }
        }, (err) => {
            this.isLoading = false;
            this.isLoadingPage = false;
            console.log('Error-------', err);
            
        });
    }

    getInterestment() {
        let product = this.distributionInfo?.garnerProduct;
        let totalInterestment = 0;
        let remainAmount = 0;
        if(product?.productType == ProductConst.INVEST) {
            totalInterestment = product?.invTotalInvestment;
            remainAmount = totalInterestment - +this.distributionInfo?.isInvested;
        } 
        //
        else if(product?.productType == ProductConst.SHARE) {
            totalInterestment = product?.cpsParValue * product?.cpsQuantity;
            remainAmount = totalInterestment - +this.distributionInfo?.isInvested;
        }
        //
        this.distributionInfo.remainAmount = remainAmount;
        this.totalInvestment = totalInterestment;
        return this.formatCurrency(totalInterestment);
    }

    resetStatusFieldUpdates() {
        for (const [key, value] of Object.entries(this.fieldUpdates)) {
            this.fieldUpdates[key].isEdit = false;
        }
    }

    setFieldError() {
        for (const [key, value] of Object.entries(this.orderDetail)) {
            this.fieldErrors[key] = false;
        }
        console.log({ filedError: this.fieldErrors });
    }

    resetValid(field) {
        this.fieldErrors[field] = false;
    }

    setStatusEdit() {
        this.isEdit = !this.isEdit;
        this.labelButtonEdit = this.isEdit ? "Lưu lại" : "Chỉnh sửa";
        this.editorConfig.editable = this.isEdit;
    }

    changePolicy(policy) {
        this.orderDetail.policyId = policy.id;

        this.policyInfo = this.policies.find(item => item.id == policy.id);
        this.policyDetails = policy.policyDetail;
        this.profit = null;
    }

    changePolicyDetail(policyDetailId) {
        this.orderDetail.policyDetailId = policyDetailId;
        this.policyDetail = this.policyDetails.find(item => item.id == policyDetailId);
        this.profit = this.policyDetail.profit;
    }


    changeEdit() {
        if (this.isEdit) {
            let body = this.formatCalendar(this.fieldDates, {...this.orderDetail});
            this._orderService.update(body).subscribe((response) => {
                if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
                    console.log("order data ...", this.orderData);
                    this.setStatusEdit();
                }
            });
        } else {
            this.setStatusEdit();
        }
    }

    updateField(field) {
        if (this.isEdit) {
            if (this.orderDetail[this.fieldUpdates[field].name]) {
                this._orderService.updateField(this.orderDetail, this.fieldUpdates[field]).subscribe((response) => {
                    if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
                        this.setStatusEdit();
                        this.resetStatusFieldUpdates();
                    }
                });
            } else {
                this.messageService.add({ severity: 'error', summary: '', detail: this.fieldUpdates[field].messageRequired, life: 1500 });
            }
        } else {
            this.setStatusEdit();
            this.fieldUpdates[field].isEdit = true;
        }
    }

}
