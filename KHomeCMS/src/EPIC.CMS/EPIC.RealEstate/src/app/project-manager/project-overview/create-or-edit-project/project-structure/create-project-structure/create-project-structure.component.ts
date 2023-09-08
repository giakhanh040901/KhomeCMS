import { Component, Injector, OnInit } from '@angular/core';
import { PolicyDetailTemplateConst, ProjectStructureConst, SampleContractConst } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { DistributionService } from '@shared/services/distribution.service';
import { ProjectStructureService } from '@shared/services/project-structure.service';
import { SampleContractService } from '@shared/services/sample-contract.service';
import { AppUtilsService } from '@shared/services/utils.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-create-project-structure',
    templateUrl: './create-project-structure.component.html',
    styleUrls: ['./create-project-structure.component.scss']
})
export class CreateProjectStructureComponent extends CrudComponentBase {

    constructor(
        injector: Injector,
        messageService: MessageService,
        public ref: DynamicDialogRef,
        public configDialog: DynamicDialogConfig,
        private _distributionService: DistributionService,
        private _projectStructureService: ProjectStructureService,
        private _utilsService: AppUtilsService,
    ) {
        super(injector, messageService);
    }

    SampleContractConst = SampleContractConst;
    ProjectStructureConst = ProjectStructureConst;
    row: any;
    col: any;

    structureItem: any = {};
    parentNode: any = {};
    //
    projectId: any;
    parentId: any
    actions: any;
    blockText: RegExp = /[0-9,.]/;
    submitted: boolean;
    cols: any[];
    statuses: any[];
    actionType: any;

    ngOnInit(): void {
        this.structureItem = this.configDialog?.data?.node;
        this.parentNode = this.configDialog?.data?.parentNode;
        this.structureItem.projectId = this.configDialog?.data?.projectId;
        if (this.parentNode) this.structureItem.parentId = this.parentNode.id;
    }

    close() {
        this.ref.close();
    }

    save() {
        this.submitted = true;
        let createOrUpdateObservable: Observable<any>;
        createOrUpdateObservable = this._projectStructureService.create(this.structureItem);
        if (this.structureItem.id) createOrUpdateObservable = this._projectStructureService.update(this.structureItem);
        createOrUpdateObservable.subscribe((response) => {
            if (this.handleResponseInterceptor(response, 'Thao tác thành công')) {
                this.ref.close(true);
            }
            this.submitted = false;
        }, (err) => {
            console.log('err---', err);
            this.submitted = false;
            }
        );
    }

    validForm(): boolean {
        const validRequired = this.structureItem?.name;
        return validRequired;
    }

}

