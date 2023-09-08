import { Component, Injector, OnInit } from "@angular/core";
import { SearchConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "add-icon-dialog",
  templateUrl: "./add-icon-dialog.component.html",
  styleUrls: ["./add-icon-dialog.component.scss"],
})
export class AddIconDialogComponent extends CrudComponentBase {
  public page: Page;
  constructor(
    injector: Injector,
    messageService: MessageService,
    private ref: DynamicDialogRef,
    private projectOverviewService: ProjectOverviewService
  ) {
    super(injector, messageService);
  }

  ngOnInit() {
    this.setPage({ page: this.offset });
  }

  public searchIcon(keyword: string) {}

  public setPage(test) {

  }

  public save(event: any) {

  }

  public close(event: any) {

  }
}
