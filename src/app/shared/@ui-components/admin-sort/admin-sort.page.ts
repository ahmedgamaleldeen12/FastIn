import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSelectOption,
  IonSelect,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar, IonIcon, IonItem } from '@ionic/angular/standalone';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { OverPageModalService } from '../over-page-modal/over-page-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-sort',
  templateUrl: './admin-sort.page.html',
  styleUrls: ['./admin-sort.page.scss'],
  standalone: true,
  imports: [IonItem, IonIcon,IonSelect,IonSelectOption,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TranslateModule,
  ],
})
export class AdminSortPage implements OnInit {
  @Input() sortTypeId = 1;
  @Input() Typesort = 0;

  sortTypes = [
    { id: 0, name: this.localize.translate.instant('Data.descByDate') },
    { id: 1, name: this.localize.translate.instant('Data.ascByDate') },
    { id: 2, name: this.localize.translate.instant('Data.groupByEmployee') },
  ];
  data: any = {
    column: ' startDate',
    direction: 'ascending',
    sortTypeId: 0,
  };
  @Input() fieldNames = ['startDate', 'startDate', 'employeeId'];
  @Output() sortData = new EventEmitter<any>();

  @ViewChild('filterContent', { read: TemplateRef })
  filterContent!: TemplateRef<any>;
  constructor(
    public localize: TranslationService,
    public modal: OverPageModalService
  ) {}

  ngOnInit() {
    if (this.Typesort != 0) {
      this.sortTypes.push({
        id: 3,
        name: this.localize.translate.instant('Data.groupByByType'),
      });
    }
  }

  changeSort() {
    if (this.sortTypeId == 0) {
      this.data.column = this.fieldNames[0];
      this.data.direction = 'descending';
    } else if (this.sortTypeId == 1) {
      this.data.column = this.fieldNames[1];
      this.data.direction = 'ascending';
    } else if (this.sortTypeId == 2) {
      this.data.column = this.fieldNames[2];
      this.data.direction = 'descending';
    } else if (this.sortTypeId == 3) {
      this.data.column = this.fieldNames[3];
      this.data.direction = 'descending';
    }
    this.data.sortTypeId = this.sortTypeId;
    this.sortData.emit(this.data);
    this.modal.toggleShow();
  }

  showModal() {
    this.modal.template = this.filterContent;
    this.modal.toggleShow();
  }
}
