import { ChangeDetectorRef, Component, Injector, OnInit } from "@angular/core";
import { AppConsts, IDropdown } from "@shared/AppConsts";
import { CrudComponentBase } from "@shared/crud-component-base";
import { ProjectOverviewService } from "@shared/services/project-overview.service";
import { MessageService } from "primeng/api";
import {
	DialogService,
	DynamicDialogConfig,
	DynamicDialogRef,
} from "primeng/dynamicdialog";
import { UploadImageComponent } from "src/app/components/upload-image/upload-image.component";

@Component({
	selector: "cre-edit-image-utiliti-project",
	templateUrl: "./cre-edit-image-utiliti-project.component.html",
	styleUrls: ["./cre-edit-image-utiliti-project.component.scss"],
})
export class CreEditImageUtilitiProjectComponent extends CrudComponentBase {
	public dataSource: {
		name: string;
		type: number | undefined;
		url: string;
	} = {
		name: "",
		type: undefined,
		url: "",
	};
	public utilitiTypes: IDropdown[] = [];
	public isEdit: boolean = false;
	public selectedId: number | undefined = undefined;
	public baseUrl: string = "";

	constructor(
		injector: Injector,
		messageService: MessageService,
		private ref: DynamicDialogRef,
		private projectOverviewService: ProjectOverviewService,
		private config: DynamicDialogConfig,
		private changeDetectorRef: ChangeDetectorRef,
		private dialogService: DialogService
	) {
		super(injector, messageService);
	}

	ngOnInit() {
		this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
		if (this.config.data) {
			this.utilitiTypes = [...this.config.data.utilitiTypes];
			this.isEdit = !!this.config.data.isEdit;
			this.selectedId = this.config.data.selectedId;
		}
	}

	ngAfterViewInit() {
		if (this.selectedId !== undefined && this.config.data.dataSource) {
			this.dataSource = {
				name: this.config.data.dataSource.title,
				type: this.config.data.dataSource.type,
				url: this.config.data.dataSource.url,
			};
		}
		this.changeDetectorRef.detectChanges();
		this.changeDetectorRef.markForCheck();
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
				imagesUrl += image.data;
			});

			this.dataSource.url = imagesUrl;
		});
	}

	public save(event: any) {
		if (event) {
			this.isLoadingPage = true;
			if (!this.isEdit) {
				// CREATE
				const body: any = {
					projectId: this.projectOverviewService.selectedProjectId,
					title: this.dataSource.name,
					url: this.dataSource.url,
					type: this.dataSource.type,
				};
				this.projectOverviewService.createImageUtilitiProject(body).subscribe(
					(response: any) => {
						this.isLoadingPage = false;
						if (this.handleResponseInterceptor(response)) {
							this.ref.close({ data: response, accept: true });
						} else {
						}
					},
					(err) => {
						this.isLoadingPage = false;
					}
				);
			} else {
				// EDIT
				const body: any = {
					projectId: this.projectOverviewService.selectedProjectId,
					title: this.dataSource.name,
					url: this.dataSource.url,
					type: this.dataSource.type,
					id: this.selectedId,
				};
				this.projectOverviewService.updateImageUtilitiProject(body).subscribe(
					(response: any) => {
						this.isLoadingPage = false;
						if (this.handleResponseInterceptor(response)) {
							this.ref.close({ data: response, accept: true });
						} else {
						}
					},
					(err) => {
						this.isLoadingPage = false;
					}
				);
			}
		}
	}

	close(event: any) {
		event && this.ref.close();
	}
}
