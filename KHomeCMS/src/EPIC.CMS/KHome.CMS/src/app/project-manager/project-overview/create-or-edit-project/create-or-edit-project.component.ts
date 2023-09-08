import { Component, Injector, Input, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectOverviewConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { CreateOrEditOverviewProject } from "@shared/interface/project-manager/ProjectOverview.model";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { TabView } from "primeng/tabview";
import { FormApproveComponent } from "src/app/form-general/form-request-approve-cancel/form-approve/form-approve.component";
import { FormRequestComponent } from "src/app/form-general/form-request-approve-cancel/form-request/form-request.component";
import { BreadcrumbService } from "src/app/layout/breadcrumb/breadcrumb.service";

@Component({
  selector: "create-or-edit-project",
  templateUrl: "./create-or-edit-project.component.html",
  styleUrls: ["./create-or-edit-project.component.scss"],
})
export class CreateOrEditProjectComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    private dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private _routeActive: ActivatedRoute,
    private projectOverviewService: ProjectOverviewService
  ) {
    super(injector, messageService);
    this.breadcrumbService.setItems([
      { label: "Trang chủ", routerLink: ["/home"] },
      { label: "Quản lý dự án", routerLink: ["/home"] },
      {
        label: "Tổng quan dự án",
        routerLink: ["/project-manager/project-overview"],
      },
      { label: "Chi tiết dự án" },
    ]);
    this.projectOverviewService.selectedProjectId = +this.cryptDecode(
      this._routeActive.snapshot.paramMap.get("id")
    );
  }

  public overviewProject: CreateOrEditOverviewProject = new CreateOrEditOverviewProject();

  tabViewActive: {
    overview: boolean;
    description: boolean;
    utiliti: boolean;
    structure: boolean;
    media: boolean;
    policy: boolean;
    file: boolean;
    post: boolean;
    share: boolean;
  } = {
    overview: true,
    description: false,
    utiliti: false,
    structure: false,
    media: false,
    policy: false,
    file: false,
    post: false,
    share: false
  };
  //
  @ViewChild(TabView) tabView: TabView;

  ProjectOverviewConst = ProjectOverviewConst;

  @Input() projectId;

  ngOnInit() {
    this.getDetail();
  }

  getDetail() {
    this.projectOverviewService.getProjectById();
  }

  changeTab(event: any) {
    let tabHeader = this.tabView.tabs[event.index].header;
    this.tabViewActive[tabHeader] = true;
  }

   // TRÌNH DUYỆT DỰ ÁN
   requestApprove() {
      const params = {
      id: this.projectOverviewService.selectedProjectId,
      summary: 'Trình duyệt dự án',
        data: this.projectOverviewService.selectedProjectDTO,
        type: 'projectInfo'
      }
      //
      const ref = this.dialogService.open(
        FormRequestComponent,
        this.getConfigDialogServiceRAC("Trình duyệt", params)
      );
    //
    ref.onClose.subscribe((dataCallBack) => {
      if (dataCallBack?.accept) {
        this.projectOverviewService.requestApprove(dataCallBack.data).subscribe((response) => {
          if (this.handleResponseInterceptor(response, "Trình duyệt thành công!")) {
            this.getDetail(); 
          }
        })
      }
    });
  }

  approve() {
    const params = {
      id: this.projectOverviewService.selectedProjectId,
      summary: 'Phê duyệt dự án',
        data: this.projectOverviewService.selectedProjectDTO,
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
        this.projectOverviewService.approveOrCancel(dataCallBack.data, dataCallBack?.checkApprove ).subscribe((response) => {
            if (this.handleResponseInterceptor(response, "Thao tác thành công!")) {
              this.getDetail();
            }
        });
      }
    });
  }
}
