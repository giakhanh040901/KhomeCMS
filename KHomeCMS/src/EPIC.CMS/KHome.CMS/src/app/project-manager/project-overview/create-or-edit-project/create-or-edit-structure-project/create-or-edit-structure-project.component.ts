import { Component, Injector, OnInit } from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";

@Component({
  selector: "create-or-edit-structure-project",
  templateUrl: "./create-or-edit-structure-project.component.html",
  styleUrls: ["./create-or-edit-structure-project.component.scss"],
})
export class CreateOrEditStructureProjectComponent extends CrudComponentBase {
  public isLoading: boolean = false;
  public dataSource: any[] = [];

  constructor(
    injector: Injector,
    messageService: MessageService,
    private dialogService: DialogService,
    private projectOverviewService: ProjectOverviewService
  ) {
    super(injector, messageService);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataSource = [
      {
        label: this.projectOverviewService.selectedProjectDTO?.name || '',
        key: null,
        children: [{}],
      },
    ];
    this.getDataTreeInit();
  }

  public getDataTreeInit() {
    this.isLoading = true;
    // this._departmentService.getDepartmentChild().subscribe(
    //   (res) => {
    //     this.isLoading = false;
    //     if (this.handleResponseInterceptor(res, "")) {
    //       console.log("DepartmentLv1", res);
    //       if (res?.data?.length) {
    //         if (this.departments.length == 0) {
    //           this.departments = res?.data;
    //         }

    //         this.dataTree[0].children = this.hanldeNodeChildren(res?.data);
    //         // Hiển thị sẵn danh sách các phòng ban lv 1
    //         this.dataTree[0].expanded = true;
    //       }
    //     }
    //   },
    //   (err) => {
    //     console.log("err----", err);
    //     this.isLoading = false;
    //   }
    // );
  }

  public clickInfo(event: any) {}
}
