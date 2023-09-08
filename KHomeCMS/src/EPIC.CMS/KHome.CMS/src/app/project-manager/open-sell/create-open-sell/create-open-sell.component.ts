import { Component, Injector, OnInit } from '@angular/core';
import { COMPARE_TYPE, MessageErrorConst, OpenSellConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { DistributionService } from '@shared/services/distribution.service';
import { OpenSellService } from '@shared/services/open-sell.service';
import { ProjectOverviewService } from '@shared/services/project-overview.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-create-open-sell',
    templateUrl: './create-open-sell.component.html',
    styleUrls: ['./create-open-sell.component.scss']
})
export class CreateOpenSellComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        public ref: DynamicDialogRef,
        public configDialog: DynamicDialogConfig,
        private _openSellService: OpenSellService,
        private _distributionService: DistributionService,
        private projectService: ProjectOverviewService,
    ) {
        super(injector, messageService);
    }

    openSell: any = {
        projectId: null,
        startDate: null,
        endDate: null,
        keepTime: null,
        openSellBanks: [],
        hotline: null,
    }
    //
    OpenSellConst = OpenSellConst;
    fieldDates = ['startDate', 'endDate'];

    projects = [];
    bankList = [];
    openSellBanks: any = [];
    // Group Bank
    listBankNew = [];
    listBankTrading = {
        label: 'Tài khoản đại lý',
        value: OpenSellConst.TK_DAI_LY,
        items: []
    }
    listBanksOwner = {
        label: 'Tài khoản chủ đầu tư',
        value: OpenSellConst.TK_DOI_TAC,
        items: []
    }
  

    ngOnInit(): void {
        if (this.configDialog?.data?.openSell) {
            this.openSell = this.configDialog?.data?.openSell;
        }
        //
        this.getDistributionByTrading();
        
    }

    changeBankTypes(value) {
        let openSell = this.projects.find(item => item.id == this.openSell.distributionId);
        this.openSell.projectId = openSell?.project?.id;
        
        if(this.openSell.projectId && this.openSell.fromType) {
            this.getBankList();
        }
    }

    resetBank(){
        this.listBankTrading.items = [];
        this.listBanksOwner.items = [];
        this.listBankNew = [];
    }

    getBankList() {
        this.isLoading = true;
        this._openSellService.getBankList(this.openSell.projectId).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {
                this.bankList = res?.data.map(bank => {
					bank.labelName = bank?.bankAccount?.bankName + ' - ' + bank?.bankAccount?.bankAccNo + ' - ' + bank?.bankAccount?.bankAccName;
                    bank.bankAccountId = bank?.partnerBankAccountId || bank?.tradingBankAccountId;
					return bank;
				});    
            }

            //
            this.resetBank();
            res?.data?.map(bank => {
                if (bank.tradingBankAccountId){
                    this.listBankTrading.items.push({
                        labelName: bank?.bankAccount?.bankName + ' - ' + bank?.bankAccount?.bankAccNo + ' - ' + bank?.bankAccount?.bankAccName,
                        bankAccountId: bank.tradingBankAccountId
                    })
                }
                if (bank.partnerBankAccountId){
                    this.listBanksOwner.items.push({
                        labelName: bank?.bankAccount?.bankName + ' - ' + bank?.bankAccount?.bankAccNo + ' - ' + bank?.bankAccount?.bankAccName,
                        bankAccountId: bank.partnerBankAccountId
                    })
                }
            });
            if (this.openSell.fromType == OpenSellConst.TAT_CA_TK) {
                if (this.listBankTrading.items.length > 0) this.listBankNew.push(this.listBankTrading);
                if (this.listBanksOwner.items.length > 0) this.listBankNew.push(this.listBanksOwner);
            }
            else if (this.openSell.fromType == OpenSellConst.TK_DAI_LY){
            this.listBankNew = [this.listBankTrading];
            }
            else if (this.openSell.fromType == OpenSellConst.TK_DOI_TAC){
            this.listBankNew = [this.listBanksOwner];
            }
        }, (err) => {
            this.isLoading = false;
        });
    }

    getDistributionByTrading() {
        this.isLoading = true;
        this._distributionService.getAllByTrading().subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res, '')) {
                this.projects = res?.data?.map(distribution => {
                    distribution.labelName = `${distribution?.project?.name} - ` + this.formatDate(distribution?.startDate)
                    return distribution;
                });
            }
        }, (err) => {
            this.isLoading = false;
        });
    }

    save() {
        if (this.validForm()) {
            this.openSell.openSellBanks = this.bankList.filter(obj => {            
                return this.openSellBanks.includes(obj.bankAccountId) ;
            });
            if(this.openSell.fromType == OpenSellConst.TK_DAI_LY){
                this.openSell.openSellBanks = this.openSell.openSellBanks.filter(function(bank){
                    return bank.tradingBankAccountId != null;
                })
            }
            else if(this.openSell.fromType == OpenSellConst.TK_DOI_TAC){
                this.openSell.openSellBanks = this.openSell.openSellBanks.filter(function(bank){
                    return bank.partnerBankAccountId != null;
                })
            }
            let body = { ...this.openSell,
                keepTime: this.openSell.keepTime * 60 // Đổi thời gian sang giây
            }
            // 
            this.submitted = true;
            this._openSellService.createOrUpdate(body).subscribe((response) => {
                this.submitted = false;
                if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
                    this.ref.close(true);
                }
            }, (err) => {
                this.submitted = false;
                console.log('err---', err);
            });
        }
    }

    validForm(): boolean {
        let validRequired: boolean = this.openSell?.projectId && this.openSell?.startDate;
        if (validRequired) {
            if (this.openSell.endDate && this.compareDate(new Date(this.openSell.endDate), new Date(this.openSell.startDate), COMPARE_TYPE.LESS)) {
                validRequired = false;
                this.messageError('Ngày kết thúc không được nhỏ hơn Ngày mở bán');
            }
        } else {
            this.messageError(MessageErrorConst.message.Validate);
        }
        return validRequired;
    }

}


