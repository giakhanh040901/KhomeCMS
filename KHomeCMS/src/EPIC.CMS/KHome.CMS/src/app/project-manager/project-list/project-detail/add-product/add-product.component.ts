import { Component, Injector, Input, OnInit } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PolicyTemplateService } from '@shared/services/policy-template.service';
import { FormNotificationConst, ProductConst, ProjectStructureConst } from '@shared/AppConsts';
import { ProductService } from '@shared/services/product.service';
import { ProjectStructureService } from '@shared/services/project-structure.service';
import { SelectIconComponent } from 'src/app/components/select-icon/select-icon.component';
import { DEFAULT_MEDIA_RST } from '@shared/base-object';
import { FormNotificationComponent } from 'src/app/form-general/form-notification/form-notification.component';

@Component(
  {
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  providers: [ ConfirmationService ]
  }
)
export class  AddProductComponent extends CrudComponentBase {
  //
  constructor(
    injector: Injector,
    messageService: MessageService,
    public ref: DynamicDialogRef,
    public configDialog: DynamicDialogConfig,
    private productService: ProductService,
    private projectStructure: ProjectStructureService,
    public confirmationService: ConfirmationService,
    public dialogService: DialogService,

    ) {
    super(injector, messageService);
  }

  projectId: number;

  productModel: any = {
    "id": 0,
    "projectId": 0,
    "redBookType": 0,
    "classifyType": 0,
    "code": '',
    "name": '',
    "roomType": null,
    "doorDirection": null,
    "handingType": null,
    "balconyDirection": 0,
    "productLocation": 0,
    "productType": 0,
    "viewDescription": '',
    "buildingDensityId": 0,
    "price": 0,
    "priceArea": 0,
    "unitPrice": 0,
    "floorBuildingArea": 0,
    "handoverTime": null,
    "productItemExtends": [{index: 1, }]
  };
  //
  productClassifyType1 = {
    "noFloor": 0,
    "carpetArea": 0,
    "builtUpArea": 0,
  }
  //
  productClassifyType2 = {
    "numberFloor": 0,
    "landArea": 0,
    "constructionArea": 0,
  }
  //
  productGraftType = {
    "compoundRoom": null,
    "compoundFloor": null,
  }
  classifyTypes: any[];
  productData: any = {};

  ProductConst = ProductConst;
  ProjectStructureConst = ProjectStructureConst;
  //
  buildingDensitys = [];
	imageStyle: any = {objectFit: 'cover', 'background-color': '#D9D9D9', 'margin-right': '1rem'};
  buildingDensityDisable: boolean = true;
  @Input() productId: number;

  defaultIcon =  DEFAULT_MEDIA_RST.DEFAULT_ICON.ICON_DEFAULT;

  ngOnInit(): void {
    this.productModel.projectId = this.configDialog.data?.projectId;
    this.productData.projectId = this.configDialog.data?.projectId;
    //
    if(this.productId) {
      this.isLoading = true;
      this.productService.findById(this.productId).subscribe((res) => {
        if(this.handleResponseInterceptor(res)) {
          this.productData = {...res?.data};
          //
          this.productData.productItemExtends = [{index: 1}];
          //
          this.getBuildingDensity(this.productData.projectId);
        }
      });
    } else {
      this.isLoading = true;
      this.getBuildingDensity(this.productModel.projectId);
      this.productData.productItemExtends = [{index: 1}];
    }
    
  }

  getBuildingDensity(projectId) {
    this.projectStructure.getNodeLasts(projectId).subscribe((res) => {
      this.isLoading = false;
      if(res.status) {
        this.buildingDensitys = res?.data.map(item => {
          item.nameDisplay = ProjectStructureConst.getBuildingDensityTypeName(item.buildingDensityType) + ' ' + item.name;
          return item;
        });
        this.changeBuildingDensityType()
      }
    });
  }

  changeBuildingDensityType() {
    this.classifyTypes = ProductConst.classifyTypes;
    
    // let item = this.buildingDensitys.find(element => element.id === this.productData.buildingDensityId);
    // if(item) {
    //   this.buildingDensityDisable = (item.buildingDensityType === ProjectStructureConst.TOA) ? false : true;
    //   this.classifyTypes = (item.buildingDensityType === ProjectStructureConst.TOA) ? 
    //             ProductConst.classifyTypesToa : 
    //             (item.buildingDensityType === ProjectStructureConst.LO) ? 
    //             ProductConst.classifyTypesLo : ProductConst.classifyTypes;
    // } else {
    // this.classifyTypes = ProductConst.classifyTypes;
    // }
  }

  changeClassifyType(){
    if(ProductConst.classifyTypeGroupFirst.includes(this.productData.classifyType)){
      this.productData.numberFloor = 0;
      this.productData.landArea = 0;
      this.productData.constructionArea = 0;
    }
    if(ProductConst.classifyTypeGroupSecond.includes(this.productData.classifyType)){
      this.productData.noFloor = 0;
      this.productData.carpetArea = 0;
      this.productData.builtUpArea = 0;
    }
  }

  calculatePrice(event, name) {
    let value = name == 'unitPrice' ? +event.value : +event.target.value;
    let onUnitPrice = Boolean(name == 'unitPrice' && this.productData.priceArea);
    let onPriceArea = Boolean(name == 'priceArea' && this.productData.unitPrice);
    if((onUnitPrice || onPriceArea) && value >= 0) {
      this.productData.price = value * (onUnitPrice ? this.productData.priceArea : this.productData.unitPrice);
    }
  }

  isEdit: boolean = false;
  //

  checkIcon(list){
    let check = true;
    !this.isEdit && Array.isArray(list) && list.forEach((item, index) => {
      if((!item.title && !item.description && !item.iconName)) {
        return
      }
      //
      if((!item.title || !item.description || !item.iconName)) {
        check = false;
      }
   }) 
   return check;
  }

  save() {
    this.isEdit = !this.isEdit;
    let body = JSON.parse(JSON.stringify(this.productData));
    if (this.checkIcon(body.productItemExtends)) {
      if((!this.isEdit && body?.id) || !body?.id) {
        body.productItemExtends.forEach((item, index) => {
          if(!item.title && !item.description && !item.iconName) {
            body.productItemExtends.splice(index, 1);
          }
        })
        //
        let productModel;
        // Nhóm sản phẩm 1
        if(ProductConst.classifyTypeGroupFirst.includes(body?.classifyType)) {
          productModel = { ...this.productModel,...this.productClassifyType1 }
        } // Nhóm sản phẩm 2
        else {
          productModel = { ...this.productModel,...this.productClassifyType2 }
        }
        // Loại căn ghép
        if(body.productType == ProductConst.GRAFT_TYPE) productModel = { ...productModel,...this.productGraftType};
        body = this.setDataSendApi(body, {...productModel});
  
        console.log('body', body, productModel);
        
        this.isLoading = true;
        this.submitted = true;
        this.productService.createOrEdit(body).subscribe((res) => {
          const messSuccess = body?.id ? 'Cập nhật thành công' : 'Thêm thành công';
          this.submitted = false;
          this.isLoading = false;
          if(this.handleResponseInterceptor(res, messSuccess)) {
            this.ref.close({id: res?.data?.id});
          }
        }, (err) =>  {
          console.log('err', err);
        });
      } 
    } else {
      this.messageError('Vui lòng nhập đủ thông tin khác', '');
    }
  }

  insertIcon(){
    if (!this.isEdit && this.productData.id != null){
      // không cho update
    } else {
      const ref = this.dialogService.open(SelectIconComponent, {
        header: 'Chọn Icon',
        width: '1000px',
        height: '600px',
      });
      ref.onClose.subscribe(listIcon => {
        if (listIcon){
          if (this.productData.productItemExtends === undefined) {
            this.productData.productItemExtends = [{index: 1}]; // khởi tạo mảng
          }
          listIcon.forEach( (icon) => {
            this.productData.productItemExtends.push(icon);
          })
        }
      })
    }
  }

  changeIcon(icon){
    if (!this.isEdit && this.productData.id != null){

    } else {
      const ref = this.dialogService.open(SelectIconComponent, {
        header: 'Chọn Icon',
        data: {
          isUpdate: true
        },
        width: '1000px',
        height: '600px',
        
      });
      ref.onClose.subscribe(result => {
        if (result){
          icon.id = result[0]?.id;
          icon.iconName = result[0]?.iconName;
          icon.path = result[0]?.path;
        }
        
      })
    }
    
  }

  deleteIcon(index){
    if (!this.isEdit && this.productData.id != null){

    } else {
      const ref = this.dialogService.open(FormNotificationComponent, {
        header: "Xoá thông tin",
        width: "600px",
        data: {
          title: `Bạn có chắc chắn muốn xóa thông tin này?`,
          icon: FormNotificationConst.IMAGE_CLOSE,
        },
      });
      ref.onClose.subscribe((dataCallBack) => {
        console.log({ dataCallBack });
        if (dataCallBack?.accept) {
          this.productData.productItemExtends.splice(index, 1);

        } 
      });
    }
  }

  close() {
    this.ref.close();
  }

}
