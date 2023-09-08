import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "select-icon-element",
  templateUrl: "./select-icon-element.component.html",
  styleUrls: ["./select-icon-element.component.scss"],
})
export class SelectIconElementComponent implements OnInit {
  @Input()
  public src: string =
    "https://primefaces.org/primeng/showcase/assets/showcase/images/primeng-icon.svg";
  @Input()
  public alt: string = "";
  @Input()
  public label: string = "Hello world";
  @Input()
  public selected: boolean = false;
  @Output()
  public selectedChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  public onChangeSelected(event: any) {
    this.selectedChange.emit(this.selected);
  }
}
