import { Component, Injector, Input } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { DialogService } from "primeng/dynamicdialog";
import { AppConsts, FormNotificationConst, ProjectStructureConst, SaleConst } from '@shared/AppConsts';
import { ActivatedRoute, Router } from '@angular/router';
import { OBJECT_INVESTOR_EKYC } from '@shared/base-object';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import { SaleService } from '@shared/services/sale.service';
import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';
import { ProjectStructureService } from '@shared/services/project-structure.service';
import { CreateProjectStructureComponent } from './create-project-structure/create-project-structure.component';
import { NgxSpinnerService } from 'ngx-spinner';

const { DEFAULT_IMAGE } = OBJECT_INVESTOR_EKYC;

@Component({
    selector: 'app-project-structure',
    templateUrl: './project-structure.component.html',
    styleUrls: ['./project-structure.component.scss'],
    // providers: [DialogService, ConfirmationService, MessageService],
})
export class ProjectStructureComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        private breadcrumbService: BreadcrumbService,
        private dialogService: DialogService,
        private router: Router,
        private _projectStructureService: ProjectStructureService,
        private _dialogService: DialogService,
        private _saleService: SaleService,
        private routeActive: ActivatedRoute,
        private spinner: NgxSpinnerService
    ) {
        super(injector, messageService);
        this.projectId = +this.cryptDecode(this.routeActive.snapshot.paramMap.get('id'));
    }
    //
    @Input() projectDetail: any = {};
    dataTree: any[] = [];
    ProjectStructureConst = ProjectStructureConst;
    actions: any[] = [];
    projectId: any;
    departmentName: string;

    avatarDefault: any = DEFAULT_IMAGE.IMAGE_STRUCTURE;
    selectedNode: TreeNode;
    SaleConst = SaleConst;
    AppConsts = AppConsts;
    //
    rows: any[] = [];
    col: any;

    cols: any[];
    _selectedColumns: any[];
    listAction: any[] = [];
    listActionSale: any[] = [];
    visible: boolean = true;
    responseStructure: any = [];
    node2ndHanlde: any[] = [];
    showDetail: boolean = false;
    tree: any;

    ngOnInit() {
        this.zoomValue = +localStorage.getItem('ProjectStructureZoom') || 1;
        this.dataTree = [
            {
                "label": "Dự án",
                "id": null,
                "children": []
            }
        ];
        this.getDataTreeInit();
    }

    findObjectById(id: number, obj: any) {
        if (obj.id === id) {
          return obj;
        }
        //
        for (let i = 0; i < obj.children.length; i++) {
            const child = obj.children[i];
            const found = this.findObjectById(id, child);
            //
            if (found) {
                return found;
            }
        }
        //
        return null;
      }
      

    showDetailAction(showDetail, node) {
        const objWithId6 = this.findObjectById(node.id, this.dataTree[0]);
        if(showDetail) {
            // this.showDetail = false;
            if(this.findObjectById(node.id, this.dataTree[0])) {
                const parent = this.findObjectById(objWithId6.id, this.dataTree[0]);
    
                if (parent) {
                    parent.showDetail = true;
                }
            }
        } else if(!showDetail) {
            // this.showDetail = true;
            if(this.findObjectById(node.id, this.dataTree[0])) {
                const parent = this.findObjectById(objWithId6.id, this.dataTree[0]);
    
                if (parent) {
                    parent.showDetail = false;
                }
            }
        }
    }

    header(): string {
        return this.showDetail ? 'pi-angle-double-up' : 'pi pi-angle-double-down';
    }

    // SHOW RA
    showNode(event, node) {
        let screenRatio = 0;
        const x = event.clientX;
        if (x) screenRatio = (x / this.screenWidth) * 100;
        if (node?.id) {
            // this.getDataTreeInit();
        }
    }

    hanlde2ndNodeChildren(data) {
        return data.map(nodeChild => {
            // XỬ LÝ VỚI NODE LV2 </START>
            let nodeHanlde;
            nodeHanlde = {
                "label": nodeChild.name,
                "data": nodeChild,
                "id": nodeChild.id,
                "children": [],
                "expanded": true,
            };
            return nodeHanlde;
        });
    }

    hanldeNodeChildren(data: any[], parentId?: string | number): any[] {
        const children: any[] = [];
      
        data.forEach((node: any) => {
          if (node.parentId === parentId) {
            const treeNode = {
              label: node.name,
              data: node,
              id: node.id,
              children: this.hanldeNodeChildren(data, node.id),
              expanded: true
            };
      
            children.push(treeNode);
          }
        });
        return children;
      }
      

    getDataTreeInit(isLoading: boolean = true) {
        this.isLoadingPage = isLoading;
        this._projectStructureService.getDepartmentChild(this.projectId).subscribe((res) => {
            if (this.handleResponseInterceptor(res, '')) {
                if (res?.data) {
                    this.tree = res?.data;
                    this.responseStructure = res?.data?.projectStructures?.sort(function(a, b) {
                        return a.id - b.id;
                    });
                    //
                    this.node2ndHanlde = this.responseStructure.filter(element => {
                        return element.level == ProjectStructureConst.NODE_2;
                    })
                    //
                    this.dataTree[0].children = this.hanldeNodeChildren(this.responseStructure, null)
                    this.dataTree.forEach(elementTree => {
                        elementTree.children = elementTree.children.filter(element => {
                            return element !== undefined;
                        });
                    })
                    //
                    this.dataTree[0].expanded = true;
                    
                    setTimeout(() => {
                        document.getElementById('myCheck').click();
                    }, 100);
                }
            }
                this.isLoadingPage = false;
        }, (err) => {
            console.log('err----', err);
            this.isLoadingPage = false;
        });
    }

    delete(node) {
        const ref = this._dialogService.open(
            FormNotificationComponent,
            {
                header: "Thông báo",
                width: '540px',
                data: {
                    title: "Bạn có chắc chắn xóa cấu trúc này?",
                    icon: FormNotificationConst.IMAGE_CLOSE,
                },
            }
        );
        ref.onClose.subscribe((dataCallBack) => {
            console.log({ dataCallBack });
            if (dataCallBack?.accept) {
                this._projectStructureService.delete(node.id).subscribe((response) => {
                    if (this.handleResponseInterceptor(response, "Xóa thành công")) {
                        this.getDataTreeInit(false);
                    }
                });
            }
        });
    }

    createOrUpdate(node, actionType) {
        const ref = this.dialogService.open(CreateProjectStructureComponent, {
            header: actionType == ProjectStructureConst.CREATE ? "Thêm mới cấu trúc" : "Cập nhật cấu trúc",
            width: '350px',
            data: {
                node: actionType == ProjectStructureConst.CREATE ? {} : {...node, hasChild: Boolean(this.tree.projectStructures.find(item => item.parentId == node?.id))},
                projectId: this.projectId,
                parentNode: actionType == ProjectStructureConst.CREATE ? node : this.responseStructure.find(n => n.id == node?.parentId)
            },
        });
        //
        ref.onClose.subscribe((statusSuccess) => {
            if(statusSuccess) {
                this.getDataTreeInit(false);
            }
        });
    }

    zoomValue: number = 1;
    zoom(type) {
        if(type == 'zoomIn') {
            if(this.zoomValue >= 0.5) this.zoomValue = +(this.zoomValue - 0.05);
        } else if(type == 'zoomOut') {
            if(this.zoomValue < 1) this.zoomValue = +(this.zoomValue + 0.05);
        } else if(type == 'resetZoom') {
            this.zoomValue = 1;
        }
        //
        localStorage.setItem('ProjectStructureZoom', `${this.zoomValue}`);
    }

    showZoomValue(zoomValue) : number {
        return Math.round(zoomValue*100);
    }
}
