import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectMedia } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ProjectOverviewService } from '@shared/services/project-overview.service';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TabView } from 'primeng/tabview';

@Component({
  selector: 'app-project-media',
  templateUrl: './project-media.component.html',
  styleUrls: ['./project-media.component.scss']
})
export class ProjectMediaComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private _routeActive: ActivatedRoute,
    private projectOverviewService: ProjectOverviewService,
  ) { 
    super(injector, messageService);
    this.projectOverviewService.selectedProjectId = +this.cryptDecode(this._routeActive.snapshot.paramMap.get('id'));
  }

  @ViewChild(TabView) tabView: TabView;

  filters = {
    position: null,
    status: null,
  }

  public tabViewActive: {
    media: boolean,
    mediaGroup: boolean,
  } = {
    media: true,
    mediaGroup: false,
  };

  ProjectMedia = ProjectMedia;
  @Input() projectId;


  ngOnInit(): void {
  }

  changeFilter(event) {}

  public changeTab(event: any) {
    let tabHeader = this.tabView.tabs[event.index].header;
    this.tabViewActive[tabHeader] = true;
  }
}
