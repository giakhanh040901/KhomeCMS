import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActiveDeactiveConst, FormNotificationConst, OrderSellingPolicyConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { Page } from "@shared/model/page";
import { OrderSellingPolicyService } from "@shared/services/order-selling-policy.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { ManageOrderSellingPolicyComponent } from "./manage-order-selling-policy/manage-order-selling-policy.component";

@Component({
 	selector: "app-order-selling-policy",
	templateUrl: "./order-selling-policy.component.html",
	styleUrls: ["./order-selling-policy.component.scss"],
})
export class OrderSellingPolicyComponent extends CrudComponentBase {
  constructor(
    injector: Injector,
    messageService: MessageService,
    private _dialogService: DialogService,
    private _orderSellingPolicyService: OrderSellingPolicyService,
    private _routeActive: ActivatedRoute
  ) {
    super(injector, messageService);
    this.orderId = +this.cryptDecode(
      this._routeActive.snapshot.paramMap.get("id")
    );
  }

	orderId: number;
	public filter: {
		keyword?: string;
		status?: number;
		selected?: string;
	} = {
		keyword: "",
		status: undefined,
		// selected: 'y',
	};
	public isLoading: boolean = false;
	public page: Page;
	public dataSource: any[] = [];
	public dataSelected: any[] = [];
	public listAction: any[] = [];

	OrderSellingPolicyConst = OrderSellingPolicyConst; 

	ngOnInit(): void {
		this.setPage({ page: this.offset });
	}

	public genListAction(data = []) {
		this.listAction = data.map((data, index) => {
		  const actions = [];
	
		  if (true) {
			actions.push({
				data: data,
				index: index,
				label: data.status == ActiveDeactiveConst.ACTIVE ? 'Đóng' : 'Kích hoạt',
				icon: data.status == ActiveDeactiveConst.ACTIVE ? 'pi pi-lock' : 'pi pi-lock-open',
				command: ($event) => {
					this.changeActionStatus($event.item.data);
				}
			})
		}
	
		  return actions;
		});
	}

	changeActionStatus(data) {
		const ref = this._dialogService.open(
			FormNotificationComponent,
			{
				header: "Thông báo",
				width: '600px',
				data: {	
					title: data.status == ActiveDeactiveConst.ACTIVE ? 'Đóng chính sách' : 'Kích hoạt chính sách',
					icon: data.status == ActiveDeactiveConst.ACTIVE ? FormNotificationConst.IMAGE_CLOSE : FormNotificationConst.IMAGE_APPROVE,
				},
			}
		);
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			// if (dataCallBack?.accept) {
			// 	this.isLoading = true;
			// 	this._orderSellingPolicyService.updateStatus(data).subscribe((response) => {
			// 		if (this.handleResponseInterceptor(response,"Cập nhật thành công")) {
			// 			this.isLoading = false;
			// 			this.setPage({ page: this.page.pageNumber });
			// 		}
			// 		this.isLoading = false;
			// 	}, (err) => {
			// 		this.isLoading = false;
			// 	});
			// } else {
			//   this.isLoading = false;
			// }
		});
	}

	clickInfo(event: any) {
		if (event) {
			const ref = this._dialogService.open(ManageOrderSellingPolicyComponent, {
				header: "Chính sách ưu đãi CĐT",
				width: "800px",
				baseZIndex: 10000,
				data: {
				orderId: this.orderId,
				},
			});
			ref.onClose.subscribe((response: any) => {
				if (response) {
					this.messageSuccess("Đã lưu thành công chính sách");
				this.setPage({ page: this.offset });
				}
			});
		}
	}
	
	setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this.isLoading = false;
		this._orderSellingPolicyService.findAll(this.page, this.orderId, this.filter).subscribe((resSelected) => {
		  this.isLoading = false;
		  if (this.handleResponseInterceptor(resSelected, "")) {
			this.page.totalItems = resSelected.data.totalItems;
			if (resSelected.data?.items) {
			  this.dataSelected = resSelected?.data?.items;
			  this.genListAction(this.dataSelected)
			}
		  }
		 
		  
		}, (err) => {
		  this.isLoading = false;
		  console.log('Error-------', err);
		});
		
	  }
}
