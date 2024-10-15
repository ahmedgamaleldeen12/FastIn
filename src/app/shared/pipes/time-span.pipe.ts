import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { TranslationService } from 'src/app/core/localization/translation.service';

@Pipe({
  name: 'timeSpanPipe',
  standalone: true,
})
export class TimeSpanPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(timeObj: any, format = 'hh:mm a') {
    if (!timeObj) {
      return '';
    }
    let currentCulture = 'en-US';
    if (this.translateService.currentLang == 'ar') currentCulture = 'ar';

    if (!moment(timeObj).isValid())
      return moment
        .parseZone(timeObj, 'hh:mm:ss', currentCulture)
        .format(format);
    else
      return moment.parseZone(timeObj, 'HH:mm', currentCulture).format(format);
  }
}

@Pipe({
  name: 'totalHours',
  standalone: true,
})
export class TotalHoursPipe implements PipeTransform {
  transform(minutesObj: any, format = 'HH:mm') {
    if (minutesObj == 0 || !minutesObj) {
      return '--';
    }
    return moment
      .utc()
      .startOf('day')
      .add(minutesObj, 'minutes')
      .format(format);
  }
}

@Pipe({
  name: 'smallestRssi',
  standalone: true
})
export class NearestPipe implements PipeTransform {
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    let rssis = items.map(a => a.rssi);
    let minrssi = Math.min(...rssis);
    let res = items.filter(item => item.rssi == minrssi);
    return res;
  }
}


@Pipe({
  name: 'localizedDate',
  standalone: true
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: any, withTime: boolean = false, formate: string = 'DD MMM yyyy'): any {
    if (value !== '' && value !== null && value != undefined) {
      let dateObj = new Date(value);
      let currentCulture = this.translateService.currentLang == 'ar' ? 'ar-EG' : 'en-US';
      if (withTime) {
        return moment.parseZone(dateObj, 'dd MMM yyyy', currentCulture).format('DD MMM yyyy (hh:mm a)');
      }
      else {
        return moment.parseZone(dateObj, 'dd MMM yyyy', currentCulture).format(formate);
      }
    }
    return "";
  }
}


@Pipe({
  name: 'localizedMonthYear',
  standalone: true
})
export class LocalizedMonthYearPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: any): any {
    if (value !== '' && value !== null && value != undefined) {
      let dateObj = new Date(value);
      let currentCulture = this.translateService.currentLang == 'ar' ? 'ar-EG' : 'en-US';
      return moment.parseZone(dateObj, 'dd MMM yyyy', currentCulture).format('MMM yyyy');
    }
    return "";
  }
}


@Pipe({
  name: 'monthName',
  standalone: true
})
export class MonthNamePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {
  }
  monthsListAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  monthsListEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  transform(monthNumber: number): any {
    if (!monthNumber || monthNumber > 12 || monthNumber < 1) {
      return monthNumber;
    }
    return this.translateService.currentLang == 'ar' ? this.monthsListAr[monthNumber - 1] : this.monthsListEn[monthNumber - 1];
  }
}



@Pipe({
  name: 'minutesToHours',
  standalone: true
})
export class MinutesToHoursPipe implements PipeTransform {
  constructor(private Localize: TranslationService) {
  }
  transform(minutes: number): any {
    //   
    if (minutes == 0) {
      return '00:00';

    }
    if (!minutes) {
      return minutes;
    }
    let hours = Math.floor(minutes / 60);
    let extraMin = (minutes % 60).toString().padStart(2, '0');
    let rr = this.Localize.translate.instant('Message.UpdateSuccess');
    let result = `${hours}:${extraMin} `
    return result;
  }
}