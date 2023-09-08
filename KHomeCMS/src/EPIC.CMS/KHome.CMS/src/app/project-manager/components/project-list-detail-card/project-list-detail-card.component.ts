import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProductConst, YesNoConst } from "@shared/AppConsts";

@Component({
  selector: "project-list-detail-card",
  templateUrl: "./project-list-detail-card.component.html",
  styleUrls: ["./project-list-detail-card.component.scss"],
})
export class ProjectListDetailCardComponent implements OnInit {
  @Input()
  public dataSource: any;
  @Input()
  public dataSourceIndex: number;
  @Input()
  public listAction: any[] = [];
  @Input()
  public isCardFull: boolean = false;
  @Output()
  public _onClickCard: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  public get YesNoConst() {
    return YesNoConst;
  }

  public handleClickCard(event: any) {
    if (event) {
      this._onClickCard.emit(this.dataSource);
    }
  }

  public get showRedBook() {
    const redBookType = this.dataSource.redBookType || this.dataSource.productItem.redBookType;
    return !!redBookType && redBookType !== ProductConst.CHUA_CO_SO;
  }

  public get code() {
    return this.dataSource.code || this.dataSource.productItem.code;
  }
}
