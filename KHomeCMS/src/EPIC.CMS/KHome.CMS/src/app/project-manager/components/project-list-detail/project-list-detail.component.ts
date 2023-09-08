import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { YesNoConst } from "@shared/AppConsts";
import { DialogService } from "primeng/dynamicdialog";
import { ProjectListDetailFullComponent } from "../project-list-detail-full/project-list-detail-full.component";

@Component({
  selector: "project-list-detail",
  templateUrl: "./project-list-detail.component.html",
  styleUrls: ["./project-list-detail.component.scss"],
})
export class ProjectListDetailComponent implements OnInit {
  @Input()
  public dataSource: any[] = [];
  @Input()
  public listAction: any[] = [];
  @Input()
  public listCard: any[] = [];
  @Input()
  public service: any;
  @Input()
  public apiSetPage: any;
  @Input()
  public functionMapDataSetPage: Function;
  @Input()
  public listSortField: any[] = [];
  @Input()
  public lastestProduct: any;
  @Input()
  public dataView: {
    grid: boolean;
    list: boolean;
  } = {
    grid: true,
    list: false,
  };
  @Output() dataViewChange = new EventEmitter<{
    grid: boolean;
    list: boolean;
  }>();
  @Output()
  public _onClickCard: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialogService: DialogService) {}

  ngOnInit() {}

  public get haveData() {
    return this.dataSource && this.dataSource.length;
  }

  public get labelDataView() {
    return this.dataView["grid"]
      ? "Dạng lưới"
      : this.dataView["list"]
      ? "Dạng bảng"
      : "";
  }

  public get YesNoConst() {
    return YesNoConst;
  }

  public changeView(event: any, viewType: string) {
    if (event) {
      Object.keys(this.dataView).forEach((key: string) => {
        this.dataView[key] = key === viewType;
      });
      this.dataViewChange.emit(this.dataView);
    }
  }

  public onClickZoom(event: any) {
    if (event) {
      const ref = this.dialogService.open(ProjectListDetailFullComponent, {
        width: "100vw",
        height: "100vh",
        showHeader: false,
        contentStyle: {maxHeight: "100vh"},
        data: {
          apiSetPage: this.apiSetPage,
          functionMapDataSetPage: this.functionMapDataSetPage,
          listSortField: this.listSortField,
          service: this.service,
        },
      });
    }
  }

  public onClickCard(event: any) {
    if (event) {
      this._onClickCard.emit(event);
    }
  }
}
