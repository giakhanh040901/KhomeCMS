import { CrudComponentBase } from '@shared/crud-component-base';
import { Component, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OrderServiceProxy } from '@shared/service-proxies/trading-contract-service';
import { TabView } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderStepService } from '@shared/services/order-step-service';

@Component({
    selector: 'app-order-filter-customer',
    templateUrl: './order-filter-customer.component.html',
    styleUrls: ['./order-filter-customer.component.scss']
})

export class OrderFilterCustomerComponent extends CrudComponentBase {

    // CONST
    TabView = TabView;

    orderDefault = {
        cifCode: null,
        saleReferralCode: null,
        contractAddressId: null,
        keyword: '',
        activeIndex: 0,
        customerInfo: null,
        saleInfo: null,
        listBank: [],
        listAddress: [],
        isInvestor: true,
        paymentType: null,
        openSellDetailId: null,
    }

    salerDefault = {
      activeIndex: 0,
      referralCode: null,
    }


    orderInfo = {...this.orderDefault};

    keyword: string;
    //
    customers: any[] = [];
    businiessCustomers: any[] = [];

    salers: any[] = [];
    searchSaler: any;
    //
    constructor(
        injector: Injector,
        messageService: MessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public orderStepService: OrderStepService,
        private _orderService: OrderServiceProxy,
    ) {
        super(injector, messageService);
        const isCreateNew = this.activatedRoute.snapshot.queryParamMap.get('isCreateNew');
        if(isCreateNew) this.orderStepService.resetValue(); console.log('isCreateNew', isCreateNew);
    }
   
    ngOnInit() {
        for (const [key, value] of Object.entries(this.orderInfo)) {
            this.orderInfo[key] = this.orderStepService.orderInfo[key];
        }
        //
        if(this.orderStepService.orderInfo?.cifCode) {
            if (this.orderInfo?.saleInfo) {
                this.searchSaler = this.orderInfo?.saleInfo?.referralCode;
                this.salerDefault.referralCode = this.orderInfo?.saleInfo?.referralCode;
                this.salers = [this.orderInfo?.saleInfo];
            }
            this.keyword = this.orderInfo?.keyword;
            if(this.orderInfo.activeIndex == TabView.FIRST) this.customers = [this.orderInfo?.customerInfo];
            if(this.orderInfo.activeIndex == TabView.SECOND) this.businiessCustomers = [this.orderInfo?.customerInfo];
        }
    }

    getInfoReferralCode() {
      let keywordSearch;
        // this.salerDefault.isInvestor = true;
        if(this.searchSaler){
            this.isLoading = true;
            keywordSearch = this.searchSaler;
            this._orderService.getByTradingProvider(keywordSearch).subscribe((res) => {
                this.isLoading = false;
                if (this.handleResponseInterceptor(res, '') && res?.data) {
                  this.salers[0] = res?.data;
                } else {
                  this.salers = [];
                  // this.messageError('Không tìm thấy dữ liệu');
                }
              }, () => {
                this.isLoading = false;
            });
        } else {
            this.messageError("Vui lòng nhập mã giới thiệu!")
        }

    }

    resetData() {
        this.orderInfo = {...this.orderDefault};
        this.keyword = '';
        this.businiessCustomers = [];
        this.customers = [];
    }

    clearDataCustomer() {
        this.keyword = '';
        this.businiessCustomers = [];
        this.customers = [];
        //
        let fieldNotResets = ['activeIndex','saleReferralCode', 'saleInfo'];
        for (const [key, value] of Object.entries(this.orderInfo)) {
            if(!fieldNotResets.includes(key)) {
                this.orderInfo[key] = this.orderDefault[key];
            }
        }
    }

    clearDataSale() {
        this.searchSaler = '';
        this.salerDefault = 
            {   activeIndex: 0,
                referralCode: null,};
        let fieldResets = ['activeIndex','saleReferralCode', 'saleInfo'];
        for (const [key, value] of Object.entries(this.orderInfo)) {
            if(fieldResets.includes(key)) {
                this.orderInfo[key] = this.orderDefault[key];
            }
        }
        this.salers = [];
        
    }

    changeTabview(indexTab) {
        this.resetData();
        this.orderInfo.activeIndex = indexTab;
    }

    getInfoCustomer() {
        this.keyword = this.keyword.trim();
        if (this.keyword) {
            this.orderInfo.keyword = this.keyword;
            this.isLoading = true;
            if (this.orderInfo.activeIndex == TabView.FIRST) {
                this.orderInfo.isInvestor = true;
                this._orderService.getInfoInvestorCustomer(this.keyword).subscribe((res) => {
                    this.isLoading = false;
                    if (this.handleResponseInterceptor(res, '')) {
                        this.customers = res?.data?.items;
                        if (!this.customers.length) this.messageError('Không tìm thấy dữ liệu');
                    }
                }, (err) => {
                    console.log('Error-------', err);
                    this.isLoading = false;
                });
            }
            if (this.orderInfo.activeIndex == TabView.SECOND) {
                this.orderInfo.isInvestor = false;
                this.keyword = this.keyword.trim();
                if(this.keyword != "") {
                    this._orderService.getInfoBusinessCustomer(this.page, this.keyword).subscribe((res) => {
                        this.isLoading = false;
                        if (this.handleResponseInterceptor(res, '')) {
                            this.businiessCustomers = res?.data?.items;
                            if (!this.businiessCustomers.length) this.messageError('Không tìm thấy dữ liệu');
                        }
                    }, (err) => {
                        console.log('Error-------', err);
                        this.isLoading = false;
                    });
                } else {
                    this.isLoading = false;
                    this.messageError('Không tìm thấy dữ liệu');
                }
            }
        } else{
            this.messageError("Vui lòng nhập thông tin tìm kiếm")
        }
        

    }

    isChooseBusinessCustomer(row) {
        this.orderInfo.customerInfo = row;
        this.orderInfo.listBank = [];
        const listBank = row?.businessCustomerBanks;
        if (listBank?.length) {
            this.orderInfo.listBank = listBank.map(bank => {
                bank.bankAccId = bank?.businessCustomerBankId || bank?.businessCustomerId;
                bank.labelName = bank.bankName + ' - ' + bank.bankAccNo + ' - ' + bank.bankAccName;
                return bank;
            });
        }
        //
        this.orderInfo.cifCode = this.orderInfo?.customerInfo?.cifCode;
        this.messageSuccess('Thêm dữ liệu khách hàng thành công!');
    }

    isChooseInvestorCustomer(row) {
        this.orderInfo.customerInfo = row;
        this.orderInfo.listBank = [];
        //
        const listBank = row?.listBank;
        if (listBank?.length) {
            this.orderInfo.listBank = listBank.map(bank => {
                bank.bankAccId = bank.id;
                bank.labelName = bank.coreBankName + ' - ' + bank.bankAccount + (bank.ownerAccount ? ' - ' + bank.ownerAccount : '') + (bank.bankName ? (' - ' + bank.bankName) : '');
                return bank;
            });
        }
        //
        if(row?.listContactAddress?.length){
            this.orderInfo.listAddress = row?.listContactAddress.map(item => {
                item.fullAddress = item.contactAddress + ' - ' + item.detailAddress;
                return item;
            });
        }
        //
        this.orderInfo.cifCode = this.orderInfo?.customerInfo?.cifCode;
        this.messageSuccess('Thêm dữ liệu khách hàng thành công!');
    }

    isChooseSale(row) {
        console.log("row___",row);
        this.orderInfo.saleInfo = row;
        this.salerDefault.referralCode = row.referralCode
        this.orderInfo.saleReferralCode = row.saleReferralCode;
       
        // this.orderInfo.cifCode = this.orderInfo?.customerInfo?.cifCode;
        this.messageSuccess('Thêm dữ liệu khách hàng thành công!');
    }

    clearKeyword() {
        if (this.keyword === '') {
            this.getInfoCustomer();
        }
    }

    showSale() {
        // const ref = this.dialogService.open(FilterSaleComponent,
        //     {
        //         header: 'Tìm kiếm sale',
        //         width: '1000px',
        //         styleClass: 'p-dialog-custom filter-business-customer customModal',
        //         contentStyle: { "max-height": "600px", "overflow": "auto" },
        //         style: { 'top': '-15%', 'overflow': 'hidden' },
        //         data: {},
        //     });

        // ref.onClose.subscribe((sale) => {
        //     if (sale) {
        //         this.orderInfo.saleInfo = {...sale};
        //         this.orderInfo.saleReferralCode = this.orderInfo?.saleInfo?.referralCode;
        //     }
        // });
    }

    nextPage() {
        // let customerId = this.orderInfo?.customerInfo?.investorId || this.orderInfo?.customerInfo?.businessCustomerId;
        // let saleCustomerId = this.orderInfo?.saleInfo?.investorId || this.orderInfo?.saleInfo?.businessCustomerId;
        // let checkCoincidentSaleCustomer: boolean = false;
        // // Check Sale có có trùng với khách hàng hay không
        // if(customerId == saleCustomerId && customerId) {
        //     checkCoincidentSaleCustomer = true;
        // }
        //
        // if (this.orderInfo?.cifCode && this.orderInfo?.bankAccId && !checkCoincidentSaleCustomer) {


        if (this.orderInfo?.cifCode ) { //&& this.orderInfo?.bankAccId
            for (const [key, value] of Object.entries(this.orderInfo)) {
                this.orderStepService.orderInfo[key] = value;
            }
            this.router.navigate(['trading-contract/order/create/filter-product']);
        } else {
            if (!this.orderInfo?.cifCode) this.messageError('Vui lòng chọn khách hàng!');
            // if (this.orderInfo?.cifCode && !this.orderInfo?.bankAccId) this.messageError('Vui lòng chọn tài khoản ngân hàng!');
            // if (checkCoincidentSaleCustomer) this.messageError('Nhân viên Sale không được trùng với khách hàng!');
        }
    }
}
