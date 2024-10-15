import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OverPageSideModalPage } from './shared/@ui-components/over-page-side-modal/over-page-side-modal.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, OverPageSideModalPage],
})
export class AppComponent {
  constructor() {}
}
