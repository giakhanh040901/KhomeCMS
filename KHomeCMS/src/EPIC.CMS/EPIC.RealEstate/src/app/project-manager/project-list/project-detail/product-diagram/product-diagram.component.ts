import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormNotificationConst, ISelectButton, ProductItemFileConst } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProductDiagramService } from "@shared/services/product-diagram.service";
import { AppUtilsService } from "@shared/services/utils.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";
import { FormNotificationComponent } from "src/app/form-general/form-notification/form-notification.component";
import { CreateOrEditFileComponent } from "../product-material/create-or-edit-file/create-or-edit-file.component";
import { forkJoin } from "rxjs";
import { HelpersService } from "@shared/services/helper.service";
export const MARKDOWN_OPTIONS = {
	MARKDOWN: "MARKDOWN",
	HTML: "HTML",
};

@Component({
	selector: "product-diagram",
	templateUrl: "./product-diagram.component.html",
	styleUrls: ["./product-diagram.component.scss"],
})
export class ProductDiagramComponent extends CrudComponentBase {
	public htmlMarkdownOptions: ISelectButton[] = [
		{
			name: "MARKDOWN",
			value: MARKDOWN_OPTIONS.MARKDOWN,
		},
		{
			name: "HTML",
			value: MARKDOWN_OPTIONS.HTML,
		},
	];
	public isEdit: boolean = false;
	public dataSource: {
		id: number;
		designDiagramContentType: string;
		designDiagramContent: string;
	} = {
		id: 0,
		designDiagramContentType: MARKDOWN_OPTIONS.MARKDOWN,
		designDiagramContent: "",
	};
	public filter: {
		keyword?: string;
		status?: number;
		selected?: string;
	} = {
		keyword: "",
		status: undefined,
		selected: "y",
	};
	public baseUrl: string = "";
	public caretPos: number = 0;
	public messSuccess: string = "Cập nhật thành công!";

	cols: any[];
	_selectedColumns: any[];
	rows: any[] = [];
	public listAction: any[] = [];

	constructor(
		injector: Injector,
		messageService: MessageService,
		public dialogService: DialogService,
		public changeDetectorRef: ChangeDetectorRef,
		private _productDiagramService: ProductDiagramService,
		private _routeActive: ActivatedRoute,
		private _utilsService: AppUtilsService,
		private _helpersService : HelpersService 
	) {
		super(injector, messageService);
		this.productId = +this.cryptDecode(
			this._routeActive.snapshot.paramMap.get("productId")
		);
	}
	productId: number;
	ngOnInit() {
		this.baseUrl = this.AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		this.setPage({ page: this.offset });
		this.cols = [
			{ field: 'name', header: 'Tên file', width: '20rem' },
			{ field: 'fileUrl', header: 'File mô tả ', width: '30rem'},
		];
	  
		this.cols = this.cols.map((item, index) => {
			item.position = index + 1;
			return item;
		});
	  
		this._selectedColumns = this.getLocalStorage("productMaterialRst") ?? this.cols;
	}

	public genListAction(data = []) {
		this.listAction = data.map((projectItem: any, index: number) => {
			const actions = [];

				actions.push({
					data: projectItem,
					index: index,
					label: "Sửa",
					icon: "pi pi-pencil",
					command: ($event) => {
						this.edit($event.item.data);
					},
				});

				actions.push({
					data: projectItem,
					label: "Tải xuống",
					icon: "pi pi-download",
					command: ($event) => {
						this.downloadFile($event.item.data);
					},
				});

				actions.push({
					data: projectItem,
					label: "Xóa",
					icon: "pi pi-trash",
					command: ($event) => {
						this.delete($event.item.data);
					},
				});

			return actions;
		});
	}

	create(event: any) {
		if (event) {
			const ref = this.dialogService.open(CreateOrEditFileComponent, {
				header: "Thêm mới file sơ đồ thiết kế",
				width: "800px",
				data: {
					productItemId: this.productId,
					source: ProductItemFileConst.DESIGN_DIAGRAM
				},
			});
			ref.onClose.subscribe((statusResponse) => {
				if (statusResponse) {
					this.setPage();
				}
			});
		}
	}

	edit(file){
		const ref = this.dialogService.open(CreateOrEditFileComponent, {
			header: "Sửa file sơ đồ thiết kế",
			width: "800px",
			data: {
				productItemId: this.productId,
				source: ProductItemFileConst.DESIGN_DIAGRAM,
				isEdit: true,
				fileUpdate: file
			},
		});
		ref.onClose.subscribe((statusResponse) => {
			if (statusResponse) {
				this.setPage();
			}
		});
	}

	delete(file) {
		const ref = this.dialogService.open(FormNotificationComponent, {
			header: "Thông báo",
			width: "600px",
			data: {
				title: `Bạn có chắc chắn muốn xóa file ${file.name}?`,
				icon: FormNotificationConst.IMAGE_CLOSE,
			},
		});
		ref.onClose.subscribe((dataCallBack) => {
			console.log({ dataCallBack });
			if (dataCallBack?.accept) {
				this._productDiagramService.deleteFile(file.id).subscribe(
					(response) => {
						if (this.handleResponseInterceptor(response, "Xóa file thành công")) {
							this.setPage();
						}
					},
					(err) => {
						console.log("err____", err);
						this.messageError(`Không xóa được hồ sơ ${file.name}`);
					}
				);
			} else {
			}
		});
	}

	downloadFile(file) {
		const url = this.baseUrl + "/" + file?.fileUrl;
		this._utilsService.makeDownload("", url);
	}

	public setPage(pageInfo?: any) {
		this.isLoading = true;
		this.page.pageNumber = pageInfo?.page ?? this.offset;
		this.isLoading = false;
		forkJoin([this._productDiagramService.findAll(this.page, this.productId, this.filter), this._productDiagramService.findAllFile(this.productId)]).subscribe(([res, resFile]) => {
			this.isLoading = false;
			if (this.handleResponseInterceptor(res, "")) {
				this.dataSource = res?.data;
				if (!this.dataSource.designDiagramContentType) {
					this.dataSource.designDiagramContentType =
						MARKDOWN_OPTIONS.MARKDOWN;
				}
			}
			if (this.handleResponseInterceptor(resFile, "")) {
				this.rows = resFile?.data;
				if (this.rows?.length) {
					this.genListAction(this.rows);
				}
			}
		},
		(err) => {
			this.isLoading = false;
			console.log("Error-------", err);
		})
	}

	public get MARKDOWN_OPTIONS() {
		return MARKDOWN_OPTIONS;
	}

	public get displayContent() {
		if (this.dataSource.designDiagramContent)
			return this.dataSource.designDiagramContent;
		return "Nội dung hiển thị";
	}

	public save(event: any) {
		if (event) {
			if (this.validData) {
				const param = {
					id: this.dataSource.id,
					designDiagramContentType: this.dataSource.designDiagramContentType,
					designDiagramContent: this.dataSource.designDiagramContent,
				};
				this._productDiagramService.updateDiagramContent(param).subscribe(
					(response) => {
						if (this.handleResponseInterceptor(response, this.messSuccess)) {
							this.isEdit = false;
							this.setPage({ page: this.offset });
						}
					},
					(err) => {
						this.submitted = false;
					}
				);
			} else {
				this.messageError(this.messSuccess);
			}
		}
	}

	public insertImage() {
		const ref = this.dialogService.open(UploadImageComponent, {
			header: "Chèn hình ảnh",
			width: "600px",
			data: {
				inputData: [],
				showOrder: false,
			},
		});
		ref.onClose.subscribe((images) => {
			let imagesUrl = "";
			images.forEach((image) => {
				imagesUrl += `![](${this.baseUrl}/${image.data}) \n`;
			});

			let oldContentValue = this.dataSource.designDiagramContent;
			let a =
				oldContentValue?.slice(0, this.caretPos) +
				imagesUrl +
				oldContentValue?.slice(this.caretPos);
			this.dataSource.designDiagramContent = a;
		});
	}

	getCaretPos(oField) {
		if (oField.selectionStart || oField.selectionStart == "0") {
			this.caretPos = oField.selectionStart;
			console.log("this.caretPos", this.caretPos);
		}
	}

	private validData() {
		return (
			this.dataSource.designDiagramContent &&
			this.dataSource.designDiagramContent.length
		);
	}
}
