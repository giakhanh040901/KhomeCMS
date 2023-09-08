import { Component, Injector, Input, OnInit } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PolicyTemplateService } from '@shared/services/policy-template.service';
import { ProductConst, ProjectStructureConst } from '@shared/AppConsts';
import { ProductService } from '@shared/services/product.service';
import { ProjectStructureService } from '@shared/services/project-structure.service';
import { SelectIconComponent } from 'src/app/components/select-icon/select-icon.component';
import { OpenSellService } from '@shared/services/open-sell.service';
import { DEFAULT_MEDIA_RST } from '@shared/base-object';

@Component({
  selector: 'app-product-item-view-info',
  templateUrl: './product-item-view-info.component.html',
  styleUrls: ['./product-item-view-info.component.scss']
})
export class ProductItemViewInfoComponent extends CrudComponentBase {

  constructor(
    injector: Injector,
    messageService: MessageService,
    private openSellService: OpenSellService,
    private projectStructure: ProjectStructureService,
    ) {
    super(injector, messageService);
  }

  projectId: number;

  filedDates = ['handoverTime'];

  ProductConst = ProductConst;
  ProjectStructureConst = ProjectStructureConst;
  //
	imageStyle: any = {objectFit: 'cover', 'background-color': '#D9D9D9', 'margin-right': '1rem'};

  @Input() productData: any = {};
  defaultIcon =  DEFAULT_MEDIA_RST.DEFAULT_ICON.ICON_DEFAULT;

  ngOnInit(): void {}

  calculatePrice(value, name) { 
    if(this.productData.priceArea && this.productData.unitPrice) {
      if(name == 'priceArea') {
        this.productData.price = value * this.productData.unitPrice;
      } else {
        this.productData.price = value * this.productData.priceArea;
      }
    }
  }
}
