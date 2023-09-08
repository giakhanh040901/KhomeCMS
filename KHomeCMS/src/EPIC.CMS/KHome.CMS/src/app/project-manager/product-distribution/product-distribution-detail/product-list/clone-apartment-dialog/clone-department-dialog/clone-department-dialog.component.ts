import { Component, Injector } from "@angular/core";
import { MessageErrorConst, ProductConst, FormNotificationConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";

@Component({
	selector: "app-clone-department-dialog",
	templateUrl: "./clone-department-dialog.component.html",
	styleUrls: ["./clone-department-dialog.component.scss"],
})
export class CloneDepartmentDialogComponent extends CrudComponentBase {
	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		public dialogService: DialogService,
		private config: DynamicDialogConfig,
	) {
		super(injector, messageService);
	}

	departmentClones = [];
	selectedCities = [];
	productItem: any = {};

	chinhSachUuDaiCDT = false;
	tienIch = false;
	vatLieu = false;
	soDoThietKe = false;
	hinhAnh = false;

	ProductConst = ProductConst;

	tabChung = [
		{
			name: "Chính sách ưu đãi CĐT",
			code: 'chinhSachUuDaiCDT',
			value: false
		},
		{
			name: "Tiện ích",
			code: 'tienIch',
			value: false
		},
		{
			name: "Vật liệu",
			code: 'vatLieu',
			value: false
		},
		{
			name: "Sơ đồ thiết kế",
			code: 'soDoThietKe',
			value: false
		},
		{
			name: "Hình ảnh",
			code: 'hinhAnh',
			value: false
		}
	]

	ngOnInit(): void {
		this.productItem = this.config.data.productItem;
		this.departmentClones = [
			{ 
				name: '', 
				code: '', 
				numberFloor: this.productItem?.numberFloor, 
				noFloor:  this.productItem?.noFloor,
				classifyType:  this.productItem?.classifyType,
			}
		];
	}

	addvalue() {
		this.departmentClones.push( {name: '', code: '', numberFloor:  this.productItem?.numberFloor, noFloor: this.productItem?.noFloor});
	}

	save(){	
		if (this.valid() ){
			let body:any = {
				'chinhSachUuDaiCDT': this.chinhSachUuDaiCDT,
				'tienIch': this.tienIch,
				'vatLieu': this.vatLieu,
				'soDoThietKe': this.soDoThietKe,
				'hinhAnh': this.hinhAnh,
			};
			body.items = this.departmentClones;
			this.confirm(body);
		} else {
			this.messageError(MessageErrorConst.message.Validate);
		}
	}

	confirm(body){
        const ref = this.dialogService.open(FormNotificationComponent, {
            header: "Xác thực thông tin",
            width: "600px",
            data: {
              title: `Xác nhận nhân bản thông tin sản phẩm/căn hộ`,
              icon: FormNotificationConst.IMAGE_APPROVE,
            },
          });
          ref.onClose.subscribe((dataCallBack) => {
            if (dataCallBack?.accept) {
				this.ref.close(body);
            } 
        });
    }

	close(event: any) {
		this.ref.close();
	}

	valid(){
		let check = true
		this.departmentClones.forEach(e => {
			if (e.name == '' || e.code == '' || (e.numberFloor == null && e.noFloor == null)){
				check = false;
			}
		});
		return check;
	}
}
