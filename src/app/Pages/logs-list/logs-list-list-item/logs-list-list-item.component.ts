import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from 'src/app/core/localization/translation.service';
import { IonicModule } from '@ionic/angular';
import { NgClass } from '@angular/common';
import { LocalizedDatePipe } from 'src/app/shared/pipes/time-span.pipe';

import { chevronForwardOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-logs-list-list-item',
  templateUrl: './logs-list-list-item.component.html',
  styleUrls: ['./logs-list-list-item.component.scss'],
  standalone: true,
  imports: [TranslateModule, IonicModule, NgClass, LocalizedDatePipe]
})
export class LogsListListItemComponent {

  @Input() item: any;
  constructor(public localize: TranslationService) { addIcons({ chevronForwardOutline }); }
  isExpanded!: boolean;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
