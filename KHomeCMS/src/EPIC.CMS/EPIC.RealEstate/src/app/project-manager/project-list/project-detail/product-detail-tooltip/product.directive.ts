import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  Injector,
  Input,
  SimpleChanges,
} from "@angular/core";
import { ProductConst } from "@shared/AppConsts";
import { ProductDetailTooltipComponent } from "./product-detail-tooltip.component";

@Directive({
  selector: "[productDetailTooltip]",
})
export class ProductDetailTooltipDirective {
  @Input()
  public dataSource: any;
  @Input()
  public hide: boolean = false;
  private componentRef: ComponentRef<any> = null;

  constructor(
    private elementRef: ElementRef,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.hide){
      this.hide && this.destroy();
    }
  }

  @HostListener("mouseenter")
  onMouseEnter(): void {
    if (this.componentRef === null && !this.hide) {
      const componentFactory =
        this.componentFactoryResolver.resolveComponentFactory(
          ProductDetailTooltipComponent
        );
      this.componentRef = componentFactory.create(this.injector);

      this.appRef.attachView(this.componentRef.hostView);
      const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
      this.setTooltipComponentProperties();
    }
  }
  private setTooltipComponentProperties() {
    if (this.componentRef !== null) {
      const { left, right, bottom } =
        this.elementRef.nativeElement.getBoundingClientRect();
      this.dataSource &&
        (this.componentRef.instance.data = {
          view: 1234,
          name: this.dataSource.code,
          acreage:
            this.dataSource.priceAreaDisplay &&
            this.dataSource.priceAreaDisplay.length
              ? this.dataSource.priceAreaDisplay.replace(" ", "")
              : "",
          rooms:
            this.dataSource.roomTypeName && this.dataSource.roomTypeName.length
              ? this.dataSource.roomTypeName.replace(" ", "")
              : "",
          direction: this.dataSource.doorDirection
            ? ProductConst.doorDirections.find(
                (e: any) => e.code === this.dataSource.doorDirection
              )?.name
            : "",
          price: this.dataSource.priceText,
          listDistribution: this.dataSource.listTradingProviderName,
          status: this.dataSource.status,
        });
      this.componentRef.instance.left = (right - left) / 2 + left - 120;
      this.componentRef.instance.top = bottom;
    }
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.destroy();
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.componentRef !== null) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
