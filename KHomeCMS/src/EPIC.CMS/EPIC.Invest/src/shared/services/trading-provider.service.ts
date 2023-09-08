import { AppConsts } from '@shared/AppConsts';
import {
    mergeMap as _observableMergeMap,
    catchError as _observableCatch,
} from "rxjs/operators";
import {
    Observable,
    throwError as _observableThrow,
    of as _observableOf,
} from "rxjs";
import { Injectable, Inject, Optional, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { API_BASE_URL, ServiceProxyBase } from "../service-proxies/service-proxies-base";
import { Page } from "@shared/model/page";
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { ChangePasswordDto } from '../service-proxies/service-proxies';

@Injectable()
export class TradingProviderService extends ServiceProxyBase {
    constructor(
        messageService: MessageService,
        _cookieService: CookieService,
        @Inject(HttpClient) http: HttpClient,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        super(messageService, _cookieService, http, baseUrl);
    }

    create(body): Observable<any> {
        return this.requestPost(body, "/api/core/trading-provider/add");
    }

    update(body): Observable<any> {
        return this.requestPut(body, "/api/core/trading-provider/update/" + body.tradingProviderId);
    }

    delete(id: number): Observable<void> {
        let url_ = "/api/core/trading-provider/delete/" + id;
        return this.requestDelete(url_);
    }

    getTradingProvider(id: number): Observable<any> {
        let url_ = "/api/core/trading-provider/find/" + id;
        return this.requestGet(url_);
    }
    get(id: number): Observable<any> {
        let url_ = "/api/core/business-customer/find/" + id;
        return this.requestGet(url_);
    }
    getAll(page: Page): Observable<any> {
        let url_ = "/api/core/business-customer/find?";
        url_ += this.convertParamUrl("keyword", page.keyword);
        url_ += this.convertParamUrl('pageSize', page.pageSize);
        url_ += this.convertParamUrl('pageNumber', page.getPageNumber());

        return this.requestGet(url_);
    }
    getTradingProviderTaxCode(taxCode :String): Observable<any> {
        let url_ = "/api/core/trading-provider/find/tax-code/" + taxCode;
        // url_ += this.convertParamUrl("keyword", page.keyword);
        // url_ += this.convertParamUrl('pageSize', page.pageSize);
        // url_ += this.convertParamUrl('pageNumber', page.getPageNumber());

        return this.requestGet(url_);
    }

    getAllTradingProviderNoPermision(): Observable<any> {
        return this.requestGet('/api/core/trading-provider/find-no-permission?pageSize=-1');
    }
    getAllTradingProvider(page: Page): Observable<any> {
        let url_ = "/api/core/trading-provider/find?";
        url_ += this.convertParamUrl("keyword", page.keyword);
        url_ += this.convertParamUrl("pageSize", page.pageSize);
        url_ += this.convertParamUrl("pageNumber", page.getPageNumber());

        return this.requestGet(url_);
    }

    createUser(body: any): Observable<any> {
        let url_ = "/api/core/trading-provider/user/create";
        return this.requestPost(body, url_);
    }

    changePassword(body: ChangePasswordDto | undefined): Observable<boolean> {
        let url_ = "/api/core/trading-provider/user/change-password";
        return this.requestPut(body, url_);
    }

    getAllUser(page: Page): Observable<any> {
        let url_ = "/api/core/trading-provider/user/find-all-user?";
        url_ += this.convertParamUrl("keyword", page.keyword);
        url_ += this.convertParamUrl("pageSize", page.pageSize);
        url_ += this.convertParamUrl("pageNumber", page.getPageNumber());

        return this.requestGet(url_);
    }

    active(body, id: number): Observable<any> {
        return this.requestPut(body, "/api/core/trading-provider/user/active/" + id);
    }

    updateUser(body: any): Observable<any> {
        let url_ = "/api/core/trading-provider/update/" + body.userId;
        url_ = url_.replace(/[?&]$/, "");
        return this.requestPut(body, url_);
    }

    deleteUser(userId: number | undefined): Observable<void> {
        let url_ = "/api/core/trading-provider/user/delete/" + userId;
        url_ = url_.replace(/[?&]$/, "");
        return this.requestDelete(url_);
    }
}