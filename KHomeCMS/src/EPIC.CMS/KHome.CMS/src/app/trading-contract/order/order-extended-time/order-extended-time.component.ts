import { Component, Injector, OnInit } from '@angular/core';
import { COMPARE_TYPE, IDropdown, MessageErrorConst, OpenSellConst, OrderConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { OrderServiceProxy } from '@shared/service-proxies/trading-contract-service';
import { OpenSellService } from '@shared/services/open-sell.service';
import { ProjectOverviewService } from '@shared/services/project-overview.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
@Component({
  selector: 'app-order-extended-time',
  templateUrl: './order-extended-time.component.html',
  styleUrls: ['./order-extended-time.component.scss']
})
export class OrderExtendedTimeComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        public ref: DynamicDialogRef,
        public configDialog: DynamicDialogConfig,
        private _orderService: OrderServiceProxy,
        private _appSessionService: AppSessionService,
    ) {
        super(injector, messageService);
    }

    OrderConst = OrderConst;
    public listReason: IDropdown[] = [];
    orderExtendedTime: any = {   
    }

    ngOnInit(): void {
        if (this.configDialog?.data?.order) {
            this.orderExtendedTime = {...this.configDialog?.data?.order} ;
        }  
        this.orderExtendedTime.createDate = this.formatDateTime(new Date());
        this.orderExtendedTime.createUser = this._appSessionService.user?.userName;
    }

    save() {
        if (this.validForm()) { 
            let body = {
                reason: this.orderExtendedTime.reason,
                orderId: this.orderExtendedTime.id,
                summary: this.orderExtendedTime.summary,
                keepTime: this.orderExtendedTime.extendedKeepTime * 60 // Đổi thời gian sang giây
            }
            
            this.submitted = true;
            this._orderService.extendedTime(body).subscribe((response) => {
                this.submitted = false;
                if (this.handleResponseInterceptor(response, 'Thêm thành công')) {
                    this.ref.close(true);
                }
            }, (err) => {
                this.submitted = false;
                console.log('err---', err);
            });
        } else {
			this.messageError(MessageErrorConst.message.Validate);
		}
    }

    validForm(): boolean {
        let validRequired: boolean = this.orderExtendedTime?.extendedKeepTime ;
        return validRequired;
    }

}



