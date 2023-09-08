import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-define-color',
  templateUrl: './card-define-color.component.html',
  styleUrls: ['./card-define-color.component.scss']
})
export class CardDefineColorComponent implements OnInit {
  @Input()
  public backgroundColor: string;
  @Input()
  public colorNumber: string;
  @Input()
  public title: string;
  @Input()
  public quantity: number = 0;
  @Input()
  public isBottomPositionTitle: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
