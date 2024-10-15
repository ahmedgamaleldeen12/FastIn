import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OverPageSideModalService } from './over-page-side-modal.service';
import { TranslationService } from 'src/app/core/localization/translation.service';

@Component({
  selector: 'app-over-page-side-modal',
  templateUrl: './over-page-side-modal.page.html',
  styleUrls: ['./over-page-side-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OverPageSideModalPage {

  constructor(
    public service: OverPageSideModalService,
    public lang: TranslationService
  ) {}

}
