import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-inquiry-sort',
  templateUrl: './inquiry-sort.page.html',
  styleUrls: ['./inquiry-sort.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class InquirySortPage implements OnInit {
  data: any = {
    column: 'startDate',
    direction: 'ascending',
    sortTypeId: 0,
  };

  @Input() ascSortType = false;
  @Output() sortData = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  changeSort() {
    if (this.ascSortType) {
      this.data.direction = 'ascending';
    } else {
      this.data.direction = 'descending';
    }
    this.data.ascSortType = !this.ascSortType;
    this.sortData.emit(this.data);
  }
}
