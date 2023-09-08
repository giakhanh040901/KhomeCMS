import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CrudComponentBase } from "@shared/crud-component-base";
import { DistributionService } from "@shared/services/distribution.service";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-open-sell-file-upload',
  templateUrl: './open-sell-file-upload.component.html',
  styleUrls: ['./open-sell-file-upload.component.scss']
})
export class OpenSellFileUploadComponent extends CrudComponentBase {

  @Input()
  public name: string = "";
  @Output()
  public nameChange = new EventEmitter<string>();
  @Input()
  public file: string = "";
  @Output()
  public fileChange = new EventEmitter<string>();
  constructor(
    injector: Injector,
    messageService: MessageService,
    private _contractTemplateService: DistributionService
  ) {
    super(injector, messageService);
  }

  ngOnInit() {}

  public onInput(event: any) {
    this.nameChange.emit(this.name);
  }

  public remove(event: any) {}

  public upload(event) {
    if (event?.files[0]) {
      // this._contractTemplateService
      //   .uploadFileGetUrl(event?.files[0], "open-sell-file")
      //   .subscribe(
      //     (response) => {
      //       console.log({
      //         response,
      //       });
      //       if (response?.code === 0) {
      //         switch (response?.status) {
      //           case 200:
      //             break;
      //           case 0:
      //             this.messageError(response?.message || "");
      //             break;
      //           default:
      //             this.messageError("Có sự cố khi upload!");
      //             break;
      //         }
      //       } else if (response?.code === 200) {
      //         this.file = response.data;
      //       }
      //     },
      //     (err) => {
      //       this.messageError("Có sự cố khi upload!");
      //     }
      //   );
    }
  }

}
