import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import {
  IConstant,
  IDropdown,
  ProjectOverviewConst,
  SearchConst,
} from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "manage-utiliti-project-dialog",
  templateUrl: "./manage-utiliti-project-dialog.component.html",
  styleUrls: ["./manage-utiliti-project-dialog.component.scss"],
})
export class ManageUtilitiProjectDialogComponent extends CrudComponentBase {
  public isLoading: boolean;
  public dataSource: any[] = [];
  public dataTable: any[] = [];
  public selectedData: any[] = [];
  public filter: {
    keyword: string;
    type?: number;
    group?: number;
  } = {
    keyword: "",
    type: undefined,
    group: undefined,
  };
  public selectAll: {
    isSelected: boolean;
    isHighlight: boolean;
  } = {
    isSelected: false,
    isHighlight: false,
  };
  public utilitiProjectGroupFilter: IDropdown[] = [];
  public labelCount: {
    isSelected: string;
    isHighlight: string;
  } = {
    isSelected: "",
    isHighlight: "",
  };

  constructor(
    injector: Injector,
    messageService: MessageService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private projectOverviewService: ProjectOverviewService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector, messageService);
  }

  public get utilitiProjectType() {
    return ProjectOverviewConst.utilitiProjectType;
  }

  public get utilitiProjectTypeFilter() {
    return ProjectOverviewConst.utilitiProjectType.map(
      (e: IConstant) =>
        ({
          code: e.id,
          name: e.value,
        } as IDropdown)
    );
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.config.data) {
      this.utilitiProjectGroupFilter = [
        ...this.config.data.utilitiProjectGroupFilter,
      ];
    }
    this.isLoading = true;
    this.projectOverviewService.getAllUtilitiProject().subscribe(
      (res) => {
        this.isLoading = false;
        if (this.handleResponseInterceptor(res, "")) {
          if (res.data?.items) {
            this.dataSource = res.data.items.map((item: any) => ({
              id: item.utilityId,
              name: item.name,
              group: item.groupId,
              groupName: item.groupName,
              type: item.type,
              typeName:
                this.utilitiProjectType.find(
                  (value: IConstant) => value.id === item.type
                )?.value || "",
              isSelected: item.isSelected === "Y",
              isHighlight: item.isHighlight === "Y",
            }));
            this.dataTable = [...this.dataSource];
            this.getDataCheckboxAll();
          }
        }
      },
      (err) => {
        this.isLoading = false;
      }
    );
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
  }

  public onChangeCheckbox(event: any, selectedRow: any, key: string) {
    if (event) {
      this.getDataSelectedData(selectedRow);
      this.getDataCheckboxAll(key);
      //
      this.constraintChecked(key);
    }
  }

  constraintChecked(key) {
    this.dataTable = this.dataTable.map((item) => {
      if(key === 'isSelected' && !item.isSelected) {
        item.isHighlight = false;
        if(!this.selectAll.isSelected) this.selectAll.isHighlight = false;
      }
      // 
      if(key === 'isHighlight' && item.isHighlight) {
        item.isSelected = true;
        if(this.selectAll.isHighlight) this.selectAll.isSelected = true;
      }
      return item;
    });
  }

  public close(event: any) {
    event && this.ref.close();
  }

  public save(event: any) {
    if (event) {
      this.isLoading = true;
      const param = {
        projectId: this.projectOverviewService.selectedProjectId,
        projectUtilites: this.dataTable.filter(row => row.isSelected).map((e: any) => ({
          utilityId: e.id,
          isSelected: e.isSelected ? "Y" : "N",
          isHighlight: e.isHighlight ? "Y" : "N",
        })),
      };
      this.projectOverviewService.updateUtilitiProject(param).subscribe(
        (response: any) => {
          this.isLoading = false;
          if (this.handleResponseInterceptor(response)) {
            this.ref.close({ data: response, accept: true });
          } else {
          }
        },
        (err) => {
          this.isLoading = false;
        }
      );
    }
  }

  public changeFilter(event: any) {
    if (event) {
      this.getDataTable();
    }
  }

  private getDataTable() {
    this.isLoading = true;
    this.dataTable = this.dataSource.filter((data: any) => {
      let result: {
        keyword: boolean;
        type: boolean;
        group: boolean;
      } = {
        keyword: false,
        type: false,
        group: false,
      };
      // filter keyword
      if (!this.filter.keyword || !this.filter.keyword.length) {
        result.keyword = true;
      } else {
        result.keyword = (data.name.toLowerCase()).includes(this.filter.keyword.toLowerCase());
      }
      // filter type
      if (!this.filter.type) {
        result.type = true;
      } else {
        result.type = data.type === this.filter.type;
      }
      // filter group
      if (!this.filter.group) {
        result.group = true;
      } else {
        result.group = data.group === this.filter.group;
      }
      return result.type && result.group && result.keyword;
    });
    this.isLoading = false;

  }

  public onChangeCheckboxAll(event: any, key: string) {
    if (event) {
      this.dataTable = this.dataTable.map((e: any) => {
        e[key] = this.selectAll[key];
        return e;
      });
      this.dataTable.forEach((data: any) => {
        this.getDataSelectedData(data);
      });
      this.getLabelCount(key);
      this.constraintChecked(key);
    }
  }

  public getDataCheckboxAll(key?: string) {
    if (!key) {
      Object.keys(this.selectAll).forEach((k: string) => {
        this.selectAll[k] = !this.dataTable.some((e: any) => e[k] === false);
      });
      this.getLabelCount();
    } else {
      this.selectAll[key] = !this.dataTable.some((e: any) => e[key] === false);
      this.getLabelCount(key);
    }
  }

  private getDataSelectedData(data: any) {
    const findIndex = this.selectedData.findIndex((e: any) => e.id === data.id);
    // nếu đã có => replace; nếu chưa có => push
    if (findIndex >= 0) {
      this.selectedData[findIndex] = { ...data };
    } else {
      this.selectedData.push({ ...data });
    }    
  }

  public getLabelCount(key?: string) {
    if (!key) {
      Object.keys(this.labelCount).forEach((k: string) => {
        const countSelected =
          [...this.dataTable].filter((data: any) => !!data[k])?.length || 0;
        this.labelCount[k] = `(${countSelected}/${this.dataTable.length})`;
      });
    } else {
      const countSelected =
        [...this.dataTable].filter((data: any) => !!data[key])?.length || 0;
      this.labelCount[key] = `(${countSelected}/${this.dataTable.length})`;
    }
  }
}
