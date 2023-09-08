import { Component, OnInit } from "@angular/core";
import { ProductConst } from "@shared/AppConsts";

@Component({
  selector: "product-detail-tooltip",
  templateUrl: "./product-detail-tooltip.component.html",
  styleUrls: ["./product-detail-tooltip.component.scss"],
})
export class ProductDetailTooltipComponent implements OnInit {
  public top: number = 0;
  public left: number = 0;
  public data: {
    view: number;
    name: string;
    acreage: string;
    rooms: string;
    direction: string;
    price: string;
    listDistribution: string[];
    status: number;
  } = {
    view: 0,
    name: "",
    acreage: "",
    rooms: "",
    direction: "",
    price: "",
    listDistribution: [],
    status: 0,
  };
  constructor() {}

  ngOnInit() {}

  public getStatus(status: number, atribution: string) {
    const findStatus = ProductConst.listCard.find(
      (card) => card.code == status
    );
    return findStatus ? findStatus[atribution] : null;
  }

  public get srcDescriptionItem() {
    return {
      acreage: 'assets/layout/images/card-product/acreage.png',
      rooms: 'assets/layout/images/card-product/rooms.png',
      direction: 'assets/layout/images/card-product/direction.png',
    }
  }

  public get showDescriptionItem() {
    return {
      acreage: this.data.acreage && this.data.acreage.length,
      rooms: this.data.rooms && this.data.rooms.length,
      direction: this.data.direction && this.data.direction.length,
    }
  }
}
