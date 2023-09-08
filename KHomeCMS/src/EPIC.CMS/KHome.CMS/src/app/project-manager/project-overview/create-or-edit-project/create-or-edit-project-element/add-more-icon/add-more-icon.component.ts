import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IDropdown } from "@shared/AppConsts";
import { DialogService } from "primeng/dynamicdialog";
import { SelectIconComponent } from "src/app/components/select-icon/select-icon.component";
import { AddIconDialogComponent } from "./add-icon-dialog/add-icon-dialog.component";

@Component({
  selector: "add-more-icon",
  templateUrl: "./add-more-icon.component.html",
  styleUrls: ["./add-more-icon.component.scss"],
})
export class AddMoreIconComponent implements OnInit {
  @Input()
  private index: number = 0;
  @Input()
  public type: string = "";
  // otherUtiliti
  @Input()
  public utilitiName: string = "";
  @Output()
  public utilitiNameChange = new EventEmitter<string>();
  @Input()
  public utilitiTypes: IDropdown[] = [];
  @Input()
  public utilitiType: number;
  @Output()
  public utilitiTypeChange = new EventEmitter<number>();
  @Input()
  public utilitiGroups: IDropdown[] = [];
  @Input()
  public utilitiGroup: number;
  @Output()
  public utilitiGroupChange = new EventEmitter<number>();

  @Input()
  public label: string = "";
  @Input()
  public content: string = "";
  @Input()
  public iconName: string = "";

  @Output() updateIcon = new EventEmitter<any>();

  @Input()
  public showBtnRemove: boolean = true;
  @Input() path: string = 'assets/layout/images/default-icon.png';

  @Output()
  public _onRemoveInfor: EventEmitter<number> = new EventEmitter();

  constructor(public dialogService: DialogService) {}

  imageStyle: any = {objectFit: 'cover', 'background-color': '#D9D9D9', 'margin-right': '1rem', 'border-radius': '10%'};


  ngOnInit() {}

  public get labelInfor() {
    return "Tiêu đề thông tin " + this.index;
  }

  public onInput(event: any) {
    this.utilitiNameChange.emit(this.utilitiName);
  }

  public onChange(event: any, key: string) {
    if (event) {
      if (key === "utilitiType") {
        this.utilitiTypeChange.emit(this.utilitiType);
      }
      if (key === "utilitiGroup") {
        this.utilitiGroupChange.emit(this.utilitiGroup);
      }
    }
  }

  public clickPickIcon(event: any) {
    const ref = this.dialogService.open(SelectIconComponent, {
      header: 'Chọn Icon',
      width: '1000px',
      height: '80vh',
      data: {
        isUpdate: true
      }
    });
    ref.onClose.subscribe(icon => {
      if (icon) {
        this.iconName = icon[0].iconName;
        this.path =  icon[0].path;

        this.updateIcon.emit({index: this.index, iconName: this.iconName, path: this.path});
      }
      
    })
  }

  public clickRemoveInfor(event: any) {
    if (event) {
      this._onRemoveInfor.emit(this.index);
    }
  }
}
