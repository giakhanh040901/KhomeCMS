import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule, HashLocationStrategy, LocationStrategy } from "@angular/common";

// PrimeNG Components for demos
import { AccordionModule } from "primeng/accordion";
import { AutoCompleteModule } from "primeng/autocomplete";
import { AvatarModule } from "primeng/avatar";
import { AvatarGroupModule } from "primeng/avatargroup";
import { BadgeModule } from "primeng/badge";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { CarouselModule } from "primeng/carousel";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ChartModule } from "primeng/chart";
import { CheckboxModule } from "primeng/checkbox";
import { ChipModule } from "primeng/chip";
import { ChipsModule } from "primeng/chips";
import { CodeHighlighterModule } from "primeng/codehighlighter";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { ColorPickerModule } from "primeng/colorpicker";
import { ContextMenuModule } from "primeng/contextmenu";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { FieldsetModule } from "primeng/fieldset";
import { FileUploadModule } from "primeng/fileupload";
import { FullCalendarModule } from "@fullcalendar/angular";
import { GalleriaModule } from "primeng/galleria";
import { ImageModule } from "primeng/image";
import { InplaceModule } from "primeng/inplace";
import { InputNumberModule } from "primeng/inputnumber";
import { InputMaskModule } from "primeng/inputmask";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { KnobModule } from "primeng/knob";
import { LightboxModule } from "primeng/lightbox";
import { ListboxModule } from "primeng/listbox";
import { MegaMenuModule } from "primeng/megamenu";
import { MenuModule } from "primeng/menu";
import { MenubarModule } from "primeng/menubar";
import { MessagesModule } from "primeng/messages";
import { MessageModule } from "primeng/message";
import { MultiSelectModule } from "primeng/multiselect";
import { OrderListModule } from "primeng/orderlist";
import { OrganizationChartModule } from "primeng/organizationchart";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PaginatorModule } from "primeng/paginator";
import { PanelModule } from "primeng/panel";
import { PanelMenuModule } from "primeng/panelmenu";
import { PasswordModule } from "primeng/password";
import { PickListModule } from "primeng/picklist";
import { ProgressBarModule } from "primeng/progressbar";
import { RadioButtonModule } from "primeng/radiobutton";
import { RatingModule } from "primeng/rating";
import { RippleModule } from "primeng/ripple";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { ScrollTopModule } from "primeng/scrolltop";
import { SelectButtonModule } from "primeng/selectbutton";
import { SidebarModule } from "primeng/sidebar";
import { SkeletonModule } from "primeng/skeleton";
import { SlideMenuModule } from "primeng/slidemenu";
import { SliderModule } from "primeng/slider";
import { SplitButtonModule } from "primeng/splitbutton";
import { SplitterModule } from "primeng/splitter";
import { StepsModule } from "primeng/steps";
import { TabMenuModule } from "primeng/tabmenu";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { TagModule } from "primeng/tag";
import { TerminalModule } from "primeng/terminal";
import { TieredMenuModule } from "primeng/tieredmenu";
import { TimelineModule } from "primeng/timeline";
import { ToastModule } from "primeng/toast";
import { ToggleButtonModule } from "primeng/togglebutton";
import { ToolbarModule } from "primeng/toolbar";
import { TooltipModule } from "primeng/tooltip";
import { TreeModule } from "primeng/tree";
import { TreeTableModule } from "primeng/treetable";
import { VirtualScrollerModule } from "primeng/virtualscroller";
import { MenuItem } from "primeng/api";
import { MarkdownModule } from "ngx-markdown";

// Application Components
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppMainComponent } from "./layout/main/app.main.component";
import { AppMenuComponent } from "./layout/menu/app.menu.component";
import { AppMenuitemComponent } from "./layout/menu/app.menuitem.component";
import { AppBreadcrumbComponent } from "./layout/breadcrumb/app.breadcrumb.component";
import { AppTopBarComponent } from "./layout/top-bar/app.topbar.component";
import { AppFooterComponent } from "./layout/footer/app.footer.component";

import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ReactiveFormsModule } from "@angular/forms";

// Application services
import { BreadcrumbService } from "./layout/breadcrumb/breadcrumb.service";
import { MenuService } from "./layout/menu/app.menu.service";

import { AngularEditorModule } from "@kolkov/angular-editor";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { HomeComponent } from "./home/home.component";
import { UserComponent } from "./user/user.component";
import { SharedModule } from "@shared/shared.module";
import { OrderService } from "@shared/service-proxies/shared-data-service";

import { UploadImageComponent } from "./components/upload-image/upload-image.component";
import {
	DialogService,
	DynamicDialogConfig,
	DynamicDialogModule,
	DynamicDialogRef,
} from "primeng/dynamicdialog";
import { ConfirmationService } from "primeng/api";

import { KeyFilterModule } from "primeng/keyfilter";

import { ApproveComponent } from "./approve-manager/approve/approve.component";
import { LoginUrlComponent } from "./login-url/login-url.component";

import { OwnerComponent } from "./setting/owner/owner.component";
import { OwnerDetailComponent } from "./setting/owner/owner-detail/owner-detail.component";
import { ContractTemplateServiceProxy } from "@shared/service-proxies/trading-contract-service";
import { TradingProviderComponent } from "./setting/trading-provider/trading-provider.component";
import { TradingProviderDetailComponent } from "./setting/trading-provider/trading-provider-detail/trading-provider-detail.component";
import { CreateTradingProviderAccountComponent } from "./setting/trading-provider/trading-provider-detail/trading-provider-account/create-trading-provider-account/create-trading-provider-account.component";
import { MediaComponent } from "./setting/media/media.component";
import { AddMediaComponent } from "./setting/media/add-media/add-media.component";
import { TradingProviderAccountComponent } from "./setting/trading-provider/trading-provider-detail/trading-provider-account/trading-provider-account.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { SystemTemplateComponent } from "./setting/system-template/system-template.component";
import { OperationalReportComponent } from "./export-report/operational-report/operational-report.component";
import { BusinessReportComponent } from "./export-report/business-report/business-report.component";
import { ManagementReportComponent } from "./export-report/management-report/management-report.component";
import { ContractCodeStructureComponent } from "./setting/contract-code-structure/contract-code-structure.component";
import { CreateContractCodeComponent } from "./setting/contract-code-structure/create-contract-code/create-contract-code.component";
import { SampleContractComponent } from "./setting/sample-contract/sample-contract.component";
import { CreateSampleContractComponent } from "./setting/sample-contract/create-sample-contract/create-sample-contract.component";
import { NgOtpInputModule } from "ng-otp-input";
import { FormRequestComponent } from "./form-general/form-request-approve-cancel/form-request/form-request.component";
import { FormApproveComponent } from "./form-general/form-request-approve-cancel/form-approve/form-approve.component";
import { FormCancelComponent } from "./form-general/form-request-approve-cancel/form-cancel/form-cancel.component";
import { FormCloseComponent } from "./form-general/form-request-approve-cancel/form-close/form-close.component";
import { FormViewPdfFileComponent } from "./form-general/form-view-pdf-file/form-view-pdf-file.component";
import { FormNotificationComponent } from "./form-general/form-notification/form-notification.component";
import { FormSetDisplayColumnComponent } from "./form-general/form-set-display-column/form-set-display-column.component";
import { CollectMoneyBankComponent } from "./query-manager/collect-money-bank/collect-money-bank.component";
import { PayMoneyBankComponent } from "./query-manager/pay-money-bank/pay-money-bank.component";
import { ProjectOverviewComponent } from "./project-manager/project-overview/project-overview.component";
import { CreateOrEditProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-project.component";
import { CreateOrEditOverviewProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-overview-project/create-or-edit-overview-project.component";
import { CreateOrEditDescriptionProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-description-project/create-or-edit-description-project.component";
import { CreateOrEditPolicyProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-policy-project/create-or-edit-policy-project.component";
import { CreateOrEditPolicyProjectElementComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-policy-project/create-or-edit-policy-project-element/create-or-edit-policy-project-element.component";
import { CreateOrEditFileProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-file-project/create-or-edit-file-project.component";
import { CreateOrEditUtilitiProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-utiliti-project/create-or-edit-utiliti-project.component";
import { CreateOrEditOverviewProjectDialogComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-overview-project-dialog/create-or-edit-overview-project-dialog.component";
import { ProjectStructureComponent } from "./project-manager/project-overview/create-or-edit-project/project-structure/project-structure.component";
import { AddMoreIconComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-project-element/add-more-icon/add-more-icon.component";
import { ManageUtilitiProjectDialogComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-utiliti-project/manage-utiliti-project-dialog/manage-utiliti-project-dialog.component";
import { CreateOrEditStructureProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-structure-project/create-or-edit-structure-project.component";
import { CreateOtherUtilitiProjectDialogComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-utiliti-project/create-other-utiliti-project-dialog/create-other-utiliti-project-dialog.component";
import { AddIconDialogComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-project-element/add-more-icon/add-icon-dialog/add-icon-dialog.component";
import { SelectIconElementComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-project-element/add-more-icon/add-icon-dialog/select-icon-element/select-icon-element.component";
import { CreateProjectStructureComponent } from "./project-manager/project-overview/create-or-edit-project/project-structure/create-project-structure/create-project-structure.component";
import { CreEditImageUtilitiProjectComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-utiliti-project/cre-edit-image-utiliti-project/cre-edit-image-utiliti-project.component";
import { CreateProjectFileComponent } from "./project-manager/project-overview/create-or-edit-project/create-or-edit-file-project/create-project-file/create-project-file.component";
import { TabMediaComponent } from "./project-manager/project-overview/create-or-edit-project/project-media/tab-media/tab-media.component";
import { TabMediaGroupComponent } from "./project-manager/project-overview/create-or-edit-project/project-media/tab-media-group/tab-media-group.component";
import { ProjectMediaComponent } from "./project-manager/project-overview/create-or-edit-project/project-media/project-media.component";
import { ProjectListComponent } from "./project-manager/project-list/project-list.component";
import { ProjectDetailComponent } from "./project-manager/project-list/project-detail/project-detail.component";
import { AddProductComponent } from "./project-manager/project-list/project-detail/add-product/add-product.component";
import { ProductDetailComponent } from "./project-manager/project-list/project-detail/product-detail/product-detail.component";
import { ProductLockComponent } from "./project-manager/project-list/project-detail/product-lock/product-lock.component";
import { ProductCloneComponent } from "./project-manager/project-list/project-detail/product-clone/product-clone.component";
import { ProductDistributionComponent } from "./project-manager/product-distribution/product-distribution.component";
import { CreateProductDistributionDialogComponent } from "./project-manager/product-distribution/create-product-distribution-dialog/create-product-distribution-dialog.component";
import { ProductDistributionDetailComponent } from "./project-manager/product-distribution/product-distribution-detail/product-distribution-detail.component";
import { ProductListComponent } from "./project-manager/product-distribution/product-distribution-detail/product-list/product-list.component";
import { CreateProductDialogComponent } from "./project-manager/product-distribution/product-distribution-detail/product-list/create-product-dialog/create-product-dialog.component";
import { LockApartmentDialogComponent } from "./project-manager/product-distribution/product-distribution-detail/product-list/lock-apartment-dialog/lock-apartment-dialog.component";
import { DistributionPolicyComponent } from "./project-manager/product-distribution/product-distribution-detail/distribution-policy/distribution-policy.component";
import { CreateDistributionPolicyDialogComponent } from "./project-manager/product-distribution/product-distribution-detail/distribution-policy/create-distribution-policy-dialog/create-distribution-policy-dialog.component";
import { ContractFormComponent } from "./project-manager/product-distribution/product-distribution-detail/contract-form/contract-form.component";
import { CreateOrEditContractFormDialogComponent } from "./project-manager/product-distribution/product-distribution-detail/contract-form/create-or-edit-contract-form-dialog/create-or-edit-contract-form-dialog.component";
import { ProductUtilityComponent } from "./project-manager/project-list/project-detail/product-utility/product-utility.component";
import { ManageProductUtilityComponent } from "./project-manager/project-list/project-detail/product-utility/manage-product-utility/manage-product-utility.component";
import { ProductMaterialComponent } from "./project-manager/project-list/project-detail/product-material/product-material.component";
import { ProductDiagramComponent } from "./project-manager/project-list/project-detail/product-diagram/product-diagram.component";
import { CreateOpenSellComponent } from "./project-manager/open-sell/create-open-sell/create-open-sell.component";
import { OpenSellComponent } from "./project-manager/open-sell/open-sell.component";
import { OpenSellPolicyComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-policy/open-sell-policy.component";
import { OpenSellFileComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-file/open-sell-file.component";
import { OpenSellContractComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-contract/open-sell-contract.component";
import { OpenSellProductComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-product/open-sell-product.component";
import { OpenSellDetailComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-detail.component";
import { OpenSellAddProductComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-product/open-sell-add-product/open-sell-add-product.component";
import { OpenSellPolicyDialogComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-policy/open-sell-policy-dialog/open-sell-policy-dialog.component";
import { OpenSellFileDialogComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-file/open-sell-file-dialog/open-sell-file-dialog.component";
import { OpenSellContractDialogComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-contract/open-sell-contract-dialog/open-sell-contract-dialog.component";
import { OpenSellFileUploadComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-file/open-sell-file-dialog/open-sell-file-upload/open-sell-file-upload.component";
import { ProductPolicyIncentivesComponent } from "./project-manager/project-list/project-detail/product-detail/product-policy-incentives/product-policy-incentives.component";
import { ManageProductPolicyIncentivesComponent } from "./project-manager/project-list/project-detail/product-detail/product-policy-incentives/manage-product-policy-incentives/manage-product-policy-incentives.component";
import { DistributionPolicyTempComponent } from "./setting/distribution-policy-temp/distribution-policy-temp.component";
import { SellingPolicyTempComponent } from "./setting/selling-policy-temp/selling-policy-temp.component";
import { CreateSellingPolicyTempComponent } from "./setting/selling-policy-temp/create-selling-policy-temp/create-selling-policy-temp.component";
import { ProductMediaComponent } from "./project-manager/project-list/project-detail/product-detail/product-media/product-media.component";
import { TabProductMediaComponent } from "./project-manager/project-list/project-detail/product-detail/product-media/tab-product-media/tab-product-media.component";
import { TabProductMediaGroupComponent } from "./project-manager/project-list/project-detail/product-detail/product-media/tab-product-media-group/tab-product-media-group.component";
import { CreateDistributionPolicyTempComponent } from "./setting/distribution-policy-temp/create-distribution-policy-temp/create-distribution-policy-temp.component";
import { UploadMediaComponent } from "./components/upload-media/upload-media.component";
import { SelectIconComponent } from "./components/select-icon/select-icon.component";
import { OrderComponent } from "./trading-contract/order/order.component";
import { CreateOrderComponent } from "./trading-contract/order/create-order/create-order.component";
import { OrderFilterCustomerComponent } from "./trading-contract/order/create-order/order-filter-customer/order-filter-customer.component";
import { OrderFilterProductComponent } from "./trading-contract/order/create-order/order-filter-product/order-filter-product.component";
import { CloneDepartmentDialogComponent } from "./project-manager/product-distribution/product-distribution-detail/product-list/clone-apartment-dialog/clone-department-dialog/clone-department-dialog.component";
import { AddJointOwnerComponent } from "./trading-contract/order/create-order/order-filter-product/add-joint-owner/add-joint-owner.component";
import { InvestorImageComponent } from "./components/investor-image/investor-image.component";
import { OrderViewComponent } from "./trading-contract/order/create-order/order-view/order-view.component";
import { OrderDetailComponent } from "./trading-contract/order/order-detail/order-detail.component";
import { OrderPaymentComponent } from "./trading-contract/order/order-detail/order-payment/order-payment.component";
import { FilterSaleComponent } from "./trading-contract/order/order-detail/filter-sale/filter-sale.component";
import { OrderSellingPolicyComponent } from "./trading-contract/order/order-detail/order-selling-policy/order-selling-policy.component";
import { ManageOrderSellingPolicyComponent } from "./trading-contract/order/order-detail/order-selling-policy/manage-order-selling-policy/manage-order-selling-policy.component";
import { ProductDetailViewComponent } from "./project-manager/project-list/project-detail/product-detail-view/product-detail-view.component";
import { ProductItemViewInfoComponent } from "./project-manager/project-list/project-detail/product-detail-view/product-item-view-info/product-item-view-info.component";
import { OrderViewImagesComponent } from "./trading-contract/order/order-detail/order-view-images/order-view-images.component";
import { OpenSellGeneralInformationComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-general-information/open-sell-general-information.component";
import { OrderHistoryUpdateComponent } from "./trading-contract/order/order-detail/order-history-update/order-history-update.component";
import { ContractProcessingComponent } from "./trading-contract/contract-processing/contract-processing.component";
import { ContractActiveComponent } from "./trading-contract/contract-active/contract-active.component";
import { OrderContractComponent } from "./trading-contract/order/order-detail/order-contract/order-contract.component";
import { ProductDistributionInfoComponent } from "./project-manager/product-distribution/product-distribution-detail/product-distribution-info/product-distribution-info.component";
import { CountdownModule } from "@ciri/ngx-countdown";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FormDisablePriceComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-product/form-disable-price/form-disable-price.component";
import { ProductDetailTooltipComponent } from "./project-manager/project-list/project-detail/product-detail-tooltip/product-detail-tooltip.component";
import { CardDefineColorComponent } from "./project-manager/project-list/project-detail/card-define-color/card-define-color.component";
import { ProductDetailTooltipDirective } from "./project-manager/project-list/project-detail/product-detail-tooltip/product.directive";
import { FunctionForDevComponent } from "./trading-contract/order/order-detail/order-payment/function-for-dev/function-for-dev.component";
import { ProductHistoryComponent } from "./project-manager/project-list/project-detail/product-detail/product-history/product-history.component";
import { OpenSellHistoryComponent } from "./project-manager/open-sell/open-sell-detail/open-sell-history/open-sell-history.component";
import { OrderExtendedTimeComponent } from "./trading-contract/order/order-extended-time/order-extended-time.component";
import { ProjectPostManageComponent } from "./project-manager/project-overview/create-or-edit-project/project-post-manage/project-post-manage.component";
import { FacebookComponent } from "./project-manager/project-overview/create-or-edit-project/project-post-manage/facebook/facebook.component";
import { AddPostManuallyComponent } from "./project-manager/project-overview/create-or-edit-project/project-post-manage/add-post-manually/add-post-manually.component";
import { CardDashboardOverviewComponent } from "./home/card-dashboard-overview/card-dashboard-overview.component";
import { CardDashboardGalleriaComponent } from "./home/card-dashboard-galleria/card-dashboard-galleria.component";
import { RecentActivityComponent } from "./home/recent-activity/recent-activity.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { ProjectListDetailComponent } from "./project-manager/components/project-list-detail/project-list-detail.component";
import { ProjectListDetailCardComponent } from "./project-manager/components/project-list-detail-card/project-list-detail-card.component";
import { ProjectListDetailFullComponent } from "./project-manager/components/project-list-detail-full/project-list-detail-full.component";
import { ProjectListDetailCardInfoComponent } from "./project-manager/components/project-list-detail-card-info/project-list-detail-card-info.component";
import { ProjectShareComponent } from "./project-manager/project-overview/create-or-edit-project/project-share/project-share.component";
import { CreateOrEditProjectShareComponent } from "./project-manager/project-overview/create-or-edit-project/project-share/create-or-edit-project-share/create-or-edit-project-share.component";
import { FilterBusinessCustomerComponent } from './components/filter-business-customer/filter-business-customer.component';
import { CreateOrEditFileComponent } from './project-manager/project-list/project-detail/product-material/create-or-edit-file/create-or-edit-file.component';
import { InvestorComponent } from './investor/investor.component';
import { TrinhDuyetInvestorComponent } from './investor/trinh-duyet-investor/trinh-duyet-investor.component';
import { InvestorDetailComponent } from './investor/investor-detail/investor-detail.component';
import { InvestorCancelHistoryComponent } from './investor/investor-cancel-history/investor-cancel-history.component';
import { FormApproveInvestorComponent } from './investor/form-approve-investor/form-approve-investor.component';
import { InvestorRequestPhoneComponent } from './investor/investor-detail/investor-request-phone/investor-request-phone.component';
import { ApproveTradingProviderComponent } from './investor/approve-trading-provider/approve-trading-provider.component';
import { InvestorDiffComponent } from './investor/investor-diff/investor-diff.component';
import { InvestorBankComponent } from './investor/investor-bank/investor-bank.component';
import { CreateOrEditInvestorBankComponent } from './investor/investor-bank/create-or-edit-investor-bank/create-or-edit-investor-bank.component';
import { InvestorStockComponent } from './investor/investor-detail/investor-stock/investor-stock.component';
import { InvestorAccountComponent } from './investor/investor-account/investor-account.component';
import { CreateUserComponent } from './investor/create-user/create-user.component';
import { InvestorFileComponent } from './investor/investor-file/investor-file.component';
import { ReplaceIdentificationComponent } from './investor/investor-file/replace-identification/replace-identification.component';
import { InvestorContactAddressComponent } from './investor/investor-contact-address/investor-contact-address.component';
import { InvestorProfessionalComponent } from './investor/investor-professional/investor-professional.component';
import { InvestorSaleComponent } from './investor/investor-detail/investor-sale/investor-sale.component';
import { AddInvestorSaleComponent } from './investor/investor-detail/investor-sale/add-investor-sale/add-investor-sale.component';
import { InvestorSaleFilerComponent } from './investor/investor-detail/investor-sale/add-investor-sale/investor-sale-filer/investor-sale-filer.component';
import { InvestorReferralComponent } from './investor/investor-detail/investor-referral/investor-referral.component';
import { CreateInvestorEkycComponent } from './investor/create-investor-ekyc/create-investor-ekyc.component';
import { InvestorApproveComponent } from './investor-approve/investor-approve.component';
import { CreateOrUpdateBusinessCustomerApproveComponent } from './business-customer/business-customer-approve/create-or-update-business-customer-approve/create-or-update-business-customer-approve.component';
import { BusinessCustomerApproveComponent } from "./business-customer/business-customer-approve/business-customer-approve.component";
import { BusinessCustomerApproveDetailComponent } from './business-customer/business-customer-approve/business-customer-approve-detail/business-customer-approve-detail.component';
import { FormApproveBusinessComponent } from './business-customer/business-customer-approve/business-customer-approve-detail/form-approve-business/form-approve-business.component';
import { FormShowChangeComponent } from './business-customer/business-customer-approve/business-customer-approve-detail/form-show-change/form-show-change.component';
import { BusinessCustomerBankApproveComponent } from './business-customer/business-customer-approve/business-customer-approve-detail/business-customer-bank-approve/business-customer-bank-approve.component';
import { BusinessCustomerComponent } from './business-customer/business-customer/business-customer.component';
import { BusinessCustomerBankComponent } from './business-customer/business-customer/business-customer-bank/business-customer-bank.component';
import { CreateOrUpdateBussinessCustomerBankComponent } from './business-customer/business-customer/business-customer-bank/create-or-update-bussiness-customer-bank/create-or-update-bussiness-customer-bank.component';
import { BusiCusApproveLicenseFileComponent } from './business-customer/business-customer-approve/busi-cus-approve-license-file/busi-cus-approve-license-file.component';
import { BusinessCustomerDetailComponent } from './business-customer/business-customer/business-customer-detail/business-customer-detail.component';
import { BusinessLicenseFileComponent } from './business-customer/business-customer/business-customer-detail/business-license-file/business-license-file.component';
import { CreateOrEditBusinessLicenseFileComponent } from './business-customer/business-customer/business-customer-detail/business-license-file/create-or-edit-business-license-file/create-or-edit-business-license-file.component';
import { BusinessCustomerDigitalSignComponent } from './business-customer/business-customer/business-customer-detail/business-customer-digital-sign/business-customer-digital-sign.component';
import { FormDigitalSignComponent } from './business-customer/business-customer/business-customer-detail/form-digital-sign/form-digital-sign.component';

FullCalendarModule.registerPlugins([
	dayGridPlugin,
	timeGridPlugin,
	interactionPlugin,
]);

@NgModule({
	imports: [
		SharedModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
		HttpClientModule,
		AccordionModule,
		AutoCompleteModule,
		AvatarModule,
		AvatarGroupModule,
		BadgeModule,
		BreadcrumbModule,
		ButtonModule,
		CalendarModule,
		CardModule,
		CarouselModule,
		CascadeSelectModule,
		ChartModule,
		CheckboxModule,
		ChipModule,
		ChipsModule,
		CodeHighlighterModule,
		ConfirmDialogModule,
		ConfirmPopupModule,
		ColorPickerModule,
		ContextMenuModule,
		DataViewModule,
		DialogModule,
		DividerModule,
		DropdownModule,
		FieldsetModule,
		FileUploadModule,
		FullCalendarModule,
		GalleriaModule,
		ImageModule,
		InplaceModule,
		InputNumberModule,
		InputMaskModule,
		InputSwitchModule,
		InputTextModule,
		InputTextareaModule,
		KnobModule,
		LightboxModule,
		ListboxModule,
		MegaMenuModule,
		MenuModule,
		MenubarModule,
		MessageModule,
		MessagesModule,
		MultiSelectModule,
		OrderListModule,
		OrganizationChartModule,
		OverlayPanelModule,
		PaginatorModule,
		PanelModule,
		PanelMenuModule,
		PasswordModule,
		PickListModule,
		ProgressBarModule,
		RadioButtonModule,
		RatingModule,
		RippleModule,
		ScrollPanelModule,
		ScrollTopModule,
		SelectButtonModule,
		SidebarModule,
		SkeletonModule,
		SlideMenuModule,
		SliderModule,
		SplitButtonModule,
		SplitterModule,
		StepsModule,
		TableModule,
		TabMenuModule,
		TabViewModule,
		TagModule,
		TerminalModule,
		TimelineModule,
		TieredMenuModule,
		ToastModule,
		ToggleButtonModule,
		ToolbarModule,
		TooltipModule,
		TreeModule,
		TreeTableModule,
		VirtualScrollerModule,
		ProgressSpinnerModule,
		AngularEditorModule,
		DynamicDialogModule,
		KeyFilterModule,
		PdfViewerModule,
		MarkdownModule.forRoot(),
		NgOtpInputModule,
		CountdownModule,
		DragDropModule,
		NgxSpinnerModule,
		NgxSkeletonLoaderModule.forRoot(),
	],

	declarations: [
		AppComponent,
		AppMainComponent,
		AppMenuComponent,
		AppMenuitemComponent,
		AppTopBarComponent,
		AppFooterComponent,
		AppBreadcrumbComponent,
		HomeComponent,
		UserComponent,
		UploadImageComponent,
		ApproveComponent,
		FormRequestComponent,
		FormApproveComponent,
		FormCancelComponent,
		FormCloseComponent,
		LoginUrlComponent,
		FormSetDisplayColumnComponent,
		OwnerComponent,
		OwnerDetailComponent,
		TradingProviderComponent,
		TradingProviderDetailComponent,
		CreateTradingProviderAccountComponent,
		MediaComponent,
		AddMediaComponent,
		TradingProviderAccountComponent,
		SystemTemplateComponent,
		FormViewPdfFileComponent,
		FormNotificationComponent,
		OperationalReportComponent,
		BusinessReportComponent,
		ManagementReportComponent,
		ContractCodeStructureComponent,
		CreateContractCodeComponent,
		SampleContractComponent,
		CreateSampleContractComponent,
		CollectMoneyBankComponent,
		PayMoneyBankComponent,
		ProjectOverviewComponent,
		CreateOrEditProjectComponent,
		CreateOrEditOverviewProjectComponent,
		CreateOrEditDescriptionProjectComponent,
		CreateOrEditPolicyProjectComponent,
		CreateOrEditPolicyProjectElementComponent,
		CreateOrEditFileProjectComponent,
		CreateOrEditUtilitiProjectComponent,
		CreateOrEditOverviewProjectDialogComponent,
		ProjectStructureComponent,
		AddMoreIconComponent,
		ManageUtilitiProjectDialogComponent,
		CreateOrEditStructureProjectComponent,
		CreateOtherUtilitiProjectDialogComponent,
		AddIconDialogComponent,
		SelectIconElementComponent,
		CreateProjectStructureComponent,
		CreEditImageUtilitiProjectComponent,
		CreateProjectFileComponent,
		ProjectMediaComponent,
		TabMediaComponent,
		TabMediaGroupComponent,
		AddProductComponent,
		ProductDetailComponent,
		ProductLockComponent,
		ProductCloneComponent,
		ProductUtilityComponent,
		ManageProductUtilityComponent,
		ProductMaterialComponent,
		ProductDiagramComponent,
		ProjectDetailComponent,
		ProjectListComponent,
		ProductDistributionComponent,
		CreateProductDistributionDialogComponent,
		ProductDistributionDetailComponent,
		ProductListComponent,
		CreateProductDialogComponent,
		LockApartmentDialogComponent,
		DistributionPolicyComponent,
		CreateDistributionPolicyDialogComponent,
		ContractFormComponent,
		CreateOrEditContractFormDialogComponent,
		CreateOpenSellComponent,
		OpenSellComponent,
		OpenSellPolicyComponent,
		OpenSellFileComponent,
		OpenSellContractComponent,
		OpenSellProductComponent,
		OpenSellDetailComponent,
		OpenSellAddProductComponent,
		OpenSellPolicyDialogComponent,
		OpenSellFileDialogComponent,
		OpenSellContractDialogComponent,
		OpenSellFileUploadComponent,
		ProductPolicyIncentivesComponent,
		ManageProductPolicyIncentivesComponent,
		DistributionPolicyTempComponent,
		SellingPolicyTempComponent,
		CreateSellingPolicyTempComponent,
		ProductMediaComponent,
		TabProductMediaComponent,
		TabProductMediaGroupComponent,
		CreateDistributionPolicyTempComponent,
		UploadMediaComponent,
		SelectIconComponent,
		OrderComponent,
		CreateOrderComponent,
		OrderFilterCustomerComponent,
		OrderFilterProductComponent,
		CloneDepartmentDialogComponent,
		AddJointOwnerComponent,
		InvestorImageComponent,
		OrderViewComponent,
		OrderDetailComponent,
		OrderPaymentComponent,
		FilterSaleComponent,
		OrderSellingPolicyComponent,
		ManageOrderSellingPolicyComponent,
		ProductDetailViewComponent,
		ProductItemViewInfoComponent,
		OrderViewImagesComponent,
		OpenSellGeneralInformationComponent,
		OrderHistoryUpdateComponent,
		ContractProcessingComponent,
		ContractActiveComponent,
		OrderContractComponent,
		ProductDistributionInfoComponent,
		FormDisablePriceComponent,
		CardDefineColorComponent,
		ProductDetailTooltipComponent,
		ProductDetailTooltipDirective,
		FunctionForDevComponent,
		ProductHistoryComponent,
		OpenSellHistoryComponent,
		OrderExtendedTimeComponent,
		ProjectPostManageComponent,
		FacebookComponent,
		AddPostManuallyComponent,
		CardDashboardOverviewComponent,
		CardDashboardGalleriaComponent,
		RecentActivityComponent,
		ProjectListDetailComponent,
		ProjectListDetailCardComponent,
		ProjectListDetailFullComponent,
		ProjectListDetailCardInfoComponent,
		ProjectShareComponent,
		CreateOrEditProjectShareComponent,
  		FilterBusinessCustomerComponent,
    CreateOrEditFileComponent,
    InvestorComponent,
    TrinhDuyetInvestorComponent,
    InvestorDetailComponent,
    InvestorCancelHistoryComponent,
    FormApproveInvestorComponent,
    InvestorRequestPhoneComponent,
    ApproveTradingProviderComponent,
    InvestorDiffComponent,
    InvestorBankComponent,
    CreateOrEditInvestorBankComponent,
    InvestorStockComponent,
    InvestorAccountComponent,
    CreateUserComponent,
    InvestorFileComponent,
    ReplaceIdentificationComponent,
    InvestorContactAddressComponent,
    InvestorProfessionalComponent,
    InvestorSaleComponent,
    AddInvestorSaleComponent,
    InvestorSaleFilerComponent,
    InvestorReferralComponent,
    CreateInvestorEkycComponent,
    InvestorApproveComponent,
    BusinessCustomerApproveComponent,
    CreateOrUpdateBusinessCustomerApproveComponent,
    BusinessCustomerApproveDetailComponent,
    FormApproveBusinessComponent,
    FormShowChangeComponent,
    BusinessCustomerBankApproveComponent,
    BusinessCustomerComponent,
    BusinessCustomerBankComponent,
    CreateOrUpdateBussinessCustomerBankComponent,
    BusiCusApproveLicenseFileComponent,
    BusinessCustomerDetailComponent,
    BusinessLicenseFileComponent,
    CreateOrEditBusinessLicenseFileComponent,
    BusinessCustomerDigitalSignComponent,
    FormDigitalSignComponent,
	],

	providers: [
		{ provide: LocationStrategy, useClass: HashLocationStrategy },
		MenuService,
		BreadcrumbService,
		OrderService,
		DialogService,
		ContractTemplateServiceProxy,
		DynamicDialogRef,
		DynamicDialogConfig,
		ConfirmationService
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
