import { Component, Injector, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CrudComponentBase } from "@shared/crud-component-base";
import { TradingProviderServiceProxy } from "@shared/service-proxies/setting-service";
import { DistributionService } from "@shared/services/distribution.service";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";

@Component({
  selector: "create-product-distribution-dialog",
  templateUrl: "./create-product-distribution-dialog.component.html",
  styleUrls: ["./create-product-distribution-dialog.component.scss"],
})
export class CreateProductDistributionDialogComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    public ref: DynamicDialogRef,
    private tradingProviderService: TradingProviderServiceProxy,
    private projectService: ProjectOverviewService,
    private distributionService: DistributionService,
    private router: Router,
  ) {
    super(injector, messageService);
  }

  tradingProviders = [];
  project: any;
  projects: any = [];
  distribution: any = {
    tradingProviderId: 0,
    projectId: 0,
    startDate: null,
    endDate: null,
    partnerBankAccountIds: null,
    description: null,
  };

  fieldDates = ['startDate', 'endDate'];

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.isLoading = true;
    forkJoin([this.tradingProviderService.getAllNoPaging(), this.projectService.getAllNoPaging()]).subscribe(([resTradingProvider, resProject]) => {
      this.isLoading = false;
      if(resTradingProvider?.status) {
        this.tradingProviders = resTradingProvider?.data?.items.map(item => {
          item.displlayName = item.aliasName ? (item.name + `(${item.aliasName})`) : item.name;
          return item;
        });
      }
      //
      if(resProject?.status) this.projects = resProject?.data?.items;
    }, (err) => {
      console.log('err', err);
    });
  }

  changeProject(projectId) {
    this.project = Object.assign({}, ...this.projects.filter(element => element.id === projectId)); 
    if (this.project?.owner?.businessCustomerBanks?.length) {
      this.project.owner.businessCustomerBanks.forEach(e => {
        const listLabel = [e?.bankName, e?.bankAccName, e?.bankAccNo].filter(name => name && name.length);
        e.label = listLabel.length ? listLabel.join(' - ') : '';
      })
    }
  }
  
  public save() {
    if(this.validForm()) {
      let body = this.distribution;
      this.submitted = true;
      this.distributionService.createOrEdit(body).subscribe((res) => {
        this.submitted = false;
        const messSuccess = body.id ? 'Cập nhật thành công' : 'Thêm thành công';
        if(this.handleResponseInterceptor(res, messSuccess)) {
          this.router.navigate(["project-manager/product-distribution/detail/" + this.cryptEncode(res?.data?.id)]);
          this.ref.close(true);
        }
      }, (err) => {
        console.log('err', err);
      });
    } else {
      this.messageError('Vui lòng nhập dữ liệu cho các trường có dấu sao!');
    }
  }

  validForm(): boolean {
    const validRequired = this.distribution?.projectId 
                        && this.distribution?.tradingProviderId
                        && this.distribution?.startDate;
    return Boolean(validRequired);
  }
}
