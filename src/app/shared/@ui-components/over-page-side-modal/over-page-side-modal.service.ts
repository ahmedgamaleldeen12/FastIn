import { ElementRef, Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OverPageSideModalService {
  toggle = false;

  private customTemplate!: TemplateRef<any>;

  get template(): TemplateRef<any> {
    return this.customTemplate;
  }

  set template(template) {
    this.customTemplate = template;
  }

  constructor() {}

  toggleShow(): void {
    this.toggle = !this.toggle;
  }
}
