import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderFilterType } from '../../Enums/Enums';
import {
  LocalizedDatePipe,
  LocalizedMonthYearPipe,
} from '../../pipes/time-span.pipe';
import { AdminSortPage } from '../admin-sort/admin-sort.page';
import { InquirySortPage } from '../inquiry-sort/inquiry-sort.page';
import {funnelSharp, cloudDownloadOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-header-sort-area',
  templateUrl: './header-sort-area.page.html',
  styleUrls: ['./header-sort-area.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TranslateModule,
    LocalizedDatePipe,
    LocalizedMonthYearPipe,
    AdminSortPage,
    InquirySortPage,
  ],
})
export class HeaderSortAreaPage implements OnInit {
  @Input() currentCount = 0;
  @Input() totalCount = 0;
  @Input() useSort = true;
  @Input() useFilter = true;
  @Input() ascSortType = false;
  @Input() fromDate: any;
  @Input() toDate: any;
  @Input() dayDate: any;
  @Input() year!: number;
  @Input() type: HeaderFilterType = 2;
  @Output() sort: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();

  @Input() isAdmin = false;
  @Input() sortTypeId = 0;
  @Input() Typesort = 0;
  @Input() isStciky!: boolean;
  @Input() fieldNames = ['startDate', 'startDate', 'employeeId'];
  @Input() useDownload = false;
  @Output() downloadPdf: EventEmitter<any> = new EventEmitter<any>();

  constructor(public localize: TranslationService) { addIcons({cloudDownloadOutline,funnelSharp}); }

  ngOnInit() {
    if (this.dayDate == undefined || this.dayDate == null)
      this.dayDate = new Date();
    if (this.fromDate == undefined || this.fromDate == null)
      this.fromDate = new Date();
    if (this.toDate == undefined || this.toDate == null)
      this.toDate = new Date();
    if (this.year == undefined || this.year == null)
      this.year = new Date().getFullYear();
  }

  showFilterModal() {
    this.filter.emit();
  }

  showDownloadPdf() {
    this.downloadPdf.emit();
  }

  sortData(data: any) {
    if (data !== null && data !== undefined) {
      this.ascSortType = data.ascSortType;
    }
    this.sort.emit(data);
  }

  sortDataAdmin(data: any) {
    this.sort.emit(data);
  }
}
