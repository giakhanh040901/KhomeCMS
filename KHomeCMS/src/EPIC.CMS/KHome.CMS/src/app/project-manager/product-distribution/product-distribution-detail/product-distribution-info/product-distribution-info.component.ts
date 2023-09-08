import { ChangeDetectorRef, Component, Injector, Input } from "@angular/core";
import { IActionTable, IHeaderColumn, OpenSellConst, ProductConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductListModel } from "@shared/interface/project-manager/product-distribution/ProductDistribution.model";
import { Page } from "@shared/model/page";
import { DistributionService } from "@shared/services/distribution.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
@Component({
    selector: 'app-product-distribution-info',
    templateUrl: './product-distribution-info.component.html',
    styleUrls: ['./product-distribution-info.component.scss'],
})
export class ProductDistributionInfoComponent extends CrudComponentBase {

    public dataSource: ProductListModel[] = [];
    public page: Page = new Page();
    public listAction: IActionTable[][] = [];
    public isSelectAll: boolean = false;
    public isEdit: boolean = false;

    constructor(
        injector: Injector,
        messageService: MessageService,
        private distributionService: DistributionService,
    ) {
        super(injector, messageService);
    }

    distributionInfo: any = {
        project: {
            name: null,
        },
        tradingProvider: {
            name: null,
        },
    };
    @Input() distributionId: number;

    ProductConst = ProductConst;
    OpenSellConst = OpenSellConst;


    selectedColumns = [];
    headerColumns: IHeaderColumn[] = [];
    selectedItems = [];
    projects = [];
    bankList = [];
    project: any;
    tradingProviders = [];

    ngOnInit() {
        this.getDetail();
    }

    setStatusEdit() {
        this.isEdit = !this.isEdit;
    }

    changeEdit() {
        if (this.isEdit) {
            let body = this.distributionInfo;
            body = {
                ...this.distributionInfo,
                tradingProviderId: this.distributionInfo.tradingProvider.tradingProviderId
            }
            this.distributionService.createOrEdit(body).subscribe((response) => {
                if (this.handleResponseInterceptor(response, 'Cập nhật thành công')) {
                    this.setStatusEdit();
                    this.getDetail();
                }
            });
        } else {
            this.setStatusEdit();
        }
    }

    getDetail() {
        this.isLoading = true;
        this.distributionService.findById(this.distributionId).subscribe((res) => {
            this.isLoading = false;
            if (this.handleResponseInterceptor(res)) {
                this.distributionInfo = res?.data;
                //
                if(this.distributionInfo?.project?.owner?.businessCustomerBanks) {
                    this.distributionInfo.project.owner.businessCustomerBanks = this.distributionInfo.project.owner.businessCustomerBanks.map(item => {
                        item.bankInfo = [item.bankAccName, item.bankAccNo, item.bankName].join(' - ');
                        return item;
                    })
                }
            }
        });
    }
}


