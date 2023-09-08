import { CrudComponentBase } from '@shared/crud-component-base';
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppConsts, InvestorConst, OrderConst, PolicyDetailTemplateConst, ProductConst, TabView } from '@shared/AppConsts';
import * as moment from 'moment';
import { DistributionService } from '@shared/services/distribution.service';
import { DialogService } from 'primeng/dynamicdialog';
import { OBJECT_ORDER } from '@shared/base-object';
import { OrderServiceProxy } from '@shared/service-proxies/trading-contract-service';
import { OrderStepService } from '@shared/services/order-step-service';

@Component({
    selector: 'app-order-view',
    templateUrl: './order-view.component.html',
    styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        public orderStepService: OrderStepService,
        private dialogService: DialogService,
        public _orderService: OrderServiceProxy,
        private _distributionService: DistributionService,
        private router: Router
    ) {
        super(injector, messageService);
    }

    //
    order = {...OBJECT_ORDER.CREATE};

    orderInfo: any = {
        productInfo : {
            openSells: [],
            projectId: 0,
        },
    };
    rstOrderCoOwner: any[] = [];

    distributions = [];
    policies = [];
    policyDetails = [];
    //
    distributionInfo: any = {};
    policyInfo: any = {};
    policyDetailInfo: any = {}
    //
    profitPolicyDetail: number;

    //
    projectInformation: any = {};
    totalInvestment = 0;

    buyDate = this.getDateNow();

    OrderConst = OrderConst;
    ProductConst = ProductConst;
    TabView = TabView;
    InvestorConst = InvestorConst;
    AppConsts = AppConsts;

    ngOnInit() {
        if (!this.orderStepService?.orderInfo?.cifCode) {
            this.router.navigate(['trading-contract/order/create/filter-customer']);
        }
   
        this.orderInfo = {...this.orderStepService.orderInfo};
        
        //
        // this.isLoadingPage = true;
        // this._orderService.getProduct().subscribe((res) => {
        //     this.isLoadingPage = false;
        //     if (this.handleResponseInterceptor(res, '')) {
        //         this.distributions = res.data.map(distribution => {
        //             distribution.labelName = ProductConst.getTypeName(distribution?.garnerProduct?.productType) + ' - ' + distribution?.garnerProduct?.name;
        //             return distribution;
        //         });
        //         this.setData();
        //     } else {
        //       this.messageError('Không lấy được danh sách sản phẩm. Vui lòng thử lại sau!');
        //     }
        // }, (err) => {
        //     console.log('Error-------', err);
        //     this.isLoadingPage = false;
        // });

    }

    setData() {
        if(this.orderInfo.distributionId) {
          this.changeDistribution(this.orderInfo?.distributionId, false);
        }
    }

    changeDistribution(distributionId, onChange = true) {
        this.distributionInfo = {...this.distributions.find( item => item.id == distributionId)};
        this.orderInfo.productId = this.distributionInfo?.garnerProduct?.id;
        //Reset data
        if(onChange) {
            this.policyInfo = {};
            this.policyDetailInfo = {};
            this.orderInfo.policyDetailId = null;
            this.orderInfo.policyId = null;
            this.profitPolicyDetail = null;
        }
        //
        if(this.distributionInfo) {
          this.policies = this.distributionInfo?.policies;
        }
    }

    async handleOrder() {
        this.submitted = true;
        this.orderInfo.jointOwnerInfo.jointOwners = this.orderInfo?.jointOwnerInfo?.jointOwners.map(item => {
            if(item?.investorId && item?.investorId != 0) {
                item.investorIdenId = item?.id;
            } else {
                item.investorIdenId = null;
            }
            return item;
        })
        await this.complete();
    }

    async complete() { 
        let body = {
            cifCode: this.orderInfo.cifCode,
            contractAddressId: this.orderInfo?.contractAddressId,
            saleReferralCode: this.orderInfo?.saleInfo?.referralCode,
            openSellDetailId: this.orderInfo?.productInfo?.listOfProducts[0].id,
            paymentType: this.orderInfo?.jointOwnerInfo?.paymentOptionType,
            rstOrderCoOwners: this.orderInfo?.jointOwnerInfo?.jointOwners,
        };

        this._orderService.create(body).subscribe((res) => {
            this.submitted = false;
            if (this.handleResponseInterceptor(res, 'Thêm thành công')) {
                this.detail(res.data.id);
            } 
        }, (err) => {
            this.submitted = false;
            this.router.navigate(['trading-contract/order/create/filter-customer']);
        });
        //
        this.orderStepService.complete();
    }

    detail(orderId) {
        this.router.navigate(['/trading-contract/order/detail/' + this.cryptEncode(orderId)]);
    }

    prevPage() {
        this.formatCurrency
        this.router.navigate(['trading-contract/order/create/filter-product']);
    }

}
