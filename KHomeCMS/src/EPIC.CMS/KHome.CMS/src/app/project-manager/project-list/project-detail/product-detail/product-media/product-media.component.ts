import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectMedia } from '@shared/AppConsts';
import { CrudComponentBase } from '@shared/crud-component-base';
import { MessageService } from 'primeng/api';
import { TabView } from 'primeng/tabview';

@Component({
  selector: 'app-product-media',
  templateUrl: './product-media.component.html',
  styleUrls: ['./product-media.component.scss']
})
export class ProductMediaComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private _routeActive: ActivatedRoute,
  ) { 
    super(injector, messageService);
  }

  @ViewChild(TabView) tabView: TabView;

  filters = {
    position: null,
    status: null,
  }

  tabViewActive: {
    media: boolean,
    mediaGroup: boolean,
  } = {
    media: true,
    mediaGroup: false,
  };

  ProjectMedia = ProjectMedia;
  @Input() productId;

  ngOnInit(): void {
  }

  changeFilter(event) {}

  public changeTab(event: any) {
    let tabHeader = this.tabView.tabs[event.index].header;
    this.tabViewActive[tabHeader] = true;
  }

}
