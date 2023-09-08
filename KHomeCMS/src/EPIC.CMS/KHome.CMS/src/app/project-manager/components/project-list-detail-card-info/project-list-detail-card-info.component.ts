import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "project-list-detail-card-info",
  templateUrl: "./project-list-detail-card-info.component.html",
  styleUrls: ["./project-list-detail-card-info.component.scss"],
})
export class ProjectListDetailCardInfoComponent implements OnInit {
  @Input()
  public isFull: boolean = false;
  @Input()
  public avatar: string = "";
  @Input()
  public fullName: string = "";
  @Input()
  public productCode: string = "";
  @Input()
  public colorProductCode: string = "";
  @Input()
  public tradingProviderName: string = "";
  @Input()
  public time: string = "";

  constructor() {}

  ngOnInit() {}

  public get sizeImage() {
    return this.isFull ? 140 : 100;
  }
}
