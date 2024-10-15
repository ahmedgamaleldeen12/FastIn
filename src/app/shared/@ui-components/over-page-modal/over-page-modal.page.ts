import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OverPageModalService } from './over-page-modal.service';

@Component({
  selector: 'app-over-page-modal',
  templateUrl: './over-page-modal.page.html',
  styleUrls: ['./over-page-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OverPageModalPage {
  constructor(public service: OverPageModalService) {}
}
