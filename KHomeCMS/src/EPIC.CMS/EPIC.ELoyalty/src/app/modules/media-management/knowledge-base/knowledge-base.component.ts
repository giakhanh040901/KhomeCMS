import { Component, Injector, OnInit } from '@angular/core';
import { CrudComponentBase } from '@shared/crud-component-base';
import { Page } from '@shared/model/page';
import { MessageService } from 'primeng/api';
import { AppConsts, MediaNewsConst, MediaConst, FormNotificationConst } from '@shared/AppConsts';
import { DialogService } from 'primeng/dynamicdialog';
import { BreadcrumbService } from 'src/app/layout/breadcrumb/breadcrumb.service';
import {decode} from 'html-entities';
import { BroadcastService } from '@shared/services/broadcast.service';
import { HelpersService } from '@shared/services/helpers.service';
import { IconConfirm } from '@shared/consts/base.const';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent extends CrudComponentBase implements OnInit {

  baseUrl: string;
  page = new Page()
  rows: any[] = [];
  MediaConst = MediaConst;
  showAddNewModel: Boolean
  addNewModelSubmitted: Boolean;
  newsMedia: any;
  uploadedFiles: any[] = []
  baseImgUrl: String;
  actions: any[];
  currentKnowledgeBase: any;
  listAction: any [] = [];
  statusSearch = [
    {
      name: "Tất cả",
      code: ''
    },
    ...MediaNewsConst.statusList
  ];
  categorySearch = [
    {
      name: "Tất cả",
      code: ''
    },
    ...MediaNewsConst.categoryList
  ];
  category: any;

  constructor(
    private broadcastService: BroadcastService,
    injector: Injector,
    messageService: MessageService,
    public dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    public _dialogService: DialogService,
    private _helpersService: HelpersService,
  ) {
    super(injector, messageService);
    this.showAddNewModel = false;
    this.addNewModelSubmitted = false;
  }

  ngOnInit(): void {
    this.baseUrl = AppConsts.remoteServiceBaseUrl ?? this.baseUrl;
    this.setPage({ page: this.offset });
    this.breadcrumbService.setItems([
      { label: 'Trang chủ', routerLink: ['/home'] },
      { label: 'Danh sách kiến thức đầu tư' }
    ]);
  }

  genListAction(data = []) {
		this.listAction = data.map((item) => {
			const actions = [];

      if ( item?.status != MediaConst.ACTIVE ) {
        actions.push({
					data: item,
					label: "Chỉnh sửa",
					icon: "pi pi-user-edit",
					command: ($event) => {
						this.editKnowledge();
					},
				});
      }
      
      if (true) {
        actions.push({
					data: item,
					label: "Xoá",
					icon: "pi pi-trash",
					command: ($event) => {
						this.confirm();
					},
				});
      }

      if ((item?.status == MediaConst.NHAP || item?.status == MediaConst.TRINH_DUYET)) {
        actions.push({
          data: item,
          label: "Duyệt đăng",
          icon: "pi pi-check-circle",
          command: ($event) => {
            this.approve($event.item.data);
          },
        });
      }

      if (item?.status == MediaConst.ACTIVE ) {
        actions.push({
          data: item,
          label: "Bỏ duyệt đăng",
          icon: "pi pi-check-circle",
          command: ($event) => {
            this.approve($event.item.data);
          },
        });
      }

			return actions;
		});
	}
  
  clickDropdown(row) {
    this.currentKnowledgeBase = row;
  }

  changeStatus() {
    this.setPage({ page: this.offset });
  }

  changeCategory() {
    this.setPage({ page: this.offset });
  }
 
  create() {
    // let modal = this.dialogService.open(CreateUpdateComponent, {
    //   data: {
    //     inputData: null
    //   },
    //   header: 'Thêm mới kiến thức đầu tư',
    //   width: '100%',
    //   style: {'max-height': '100%', 'border-radius': '0px'},
    //   contentStyle: { "overflow": "auto", "margin-bottom": "60px" },
    //   baseZIndex: 10000,
    //   footer: ""
    // })
    // modal.onClose.subscribe(result => {
    //   if(result) {
    //     this.messageSuccess('Thêm mới thành công');
    //     this.offset = 0;
    //     this.setPage({ page: this.offset });
    //   }
    // })

  }

  setPage(pageInfo?: any) {
    this.page.pageNumber = pageInfo?.page ?? this.offset;
    if(pageInfo?.rows) this.page.pageSize = pageInfo?.rows;

    this.page.keyword = this.keyword;
    this.isLoading = true;
    // this.page.pageSize = 20;
    this.broadcastService.getAllKnowledgeBase(this.page, this.status, this.category).subscribe((res) => {
      this.isLoading = false;
      this.page.totalItems = res.totalResults;
      this.rows = res.results.map(this.detectVideo);
      this.genListAction(this.rows);
      console.log("dữ liệu đầu ra toàn bộ get all", this.rows);
      
    }, (err) => {
      this.isLoading = false;
      console.log('Error-------', err);
      
    });
  }

  setLengthStringInScreen(ratio) {
    return (this.screenWidth/ratio).toFixed();
  }

  //
  hideDialog() {
    this.showAddNewModel = false;
    this.addNewModelSubmitted = false;
  }
  //
  detectVideo(row) {
    row.content = decode(row.content)
    if (row.mainImg) {
      var isVideo = false;
      const images = ["jpg", "gif", "png"]
      let videos = ["mp4", "3gp", "ogg", "mkv"]
      for (var i = 0; i < videos.length; i++) {
        if (row.mainImg.search(videos[i]) > -1) {
          isVideo = true;
          break;
        }
      }
    }
    return { ...row, isVideo }
  }

  getTypes() {
    let keys: any = [];
    for (let key in MediaConst.newsTypes) {
      keys.push({ key: key, value: MediaConst.newsTypes[key] });
    }
    return keys;
  }

  getStatus() {
    let keys: any = [];
    for (let key in MediaConst.mediaStatus) {
      keys.push({ key: key, value: MediaConst.mediaStatus[key] });
    }
    return keys;
  }
  header() {
    return "Thêm mới kiến thức đầu tư"
  }


  save() {
    console.log(this.newsMedia);
  }

  editKnowledge() {    
    // let modal = this.dialogService.open(CreateUpdateComponent, {
    //   data: {
    //     inputData: this.currentKnowledgeBase,
    //     unDisableStatus: true,
    //   },
    //   header: 'Chỉnh sửa kiến thức đầu tư',
    //   width: '100%',
    //   style: {'max-height': '100%', 'border-radius': '0px'},
    //   contentStyle: { "overflow": "auto", "margin-bottom": "60px" },
    //   baseZIndex: 10000,
    //   footer: ""
    // })
    // modal.onClose.subscribe(result => {
    //   if(result) {
    //     this.messageSuccess('Cập nhật thành công');
    //     this.offset = 0;
    //     this.setPage({ page: this.offset });
    //   }
    // })
  }


  confirm() {
    this._helpersService.dialogConfirmRef(
      "Xác nhận xóa kiến thức đầu tư?",
      IconConfirm.DELETE
    ).onClose.subscribe((accept: boolean) => {
      if(accept) {
        this.currentKnowledgeBase.status = "DELETED";
        this.broadcastService.deleteKnowledgeBase(this.currentKnowledgeBase.id).subscribe(res => {
          this.messageSuccess('Xóa thành công!');
          this.setPage({ page: 0 })
        });
      }
    })
  }

  approve(row) {
    var message = "Xác nhận duyệt đăng kiến thức đầu tư?";
    if (row.status == 'ACTIVE') {
      message = "Xác nhận bỏ duyệt đăng kiến thức đầu tư?"
    }
    //
    this._helpersService.dialogConfirmRef(
      message,
      IconConfirm.QUESTION
    ).onClose.subscribe((accept: boolean) => {
      if(accept) {
        row.status = row.status == 'ACTIVE' ? 'PENDING' : 'ACTIVE';
        this.broadcastService.saveKnowledgeBase(row).subscribe(res => {
          this.messageSuccess('Thao tác thành công!');
          this.setPage({ page: 0 })
        })
      }
    })
  }
}
