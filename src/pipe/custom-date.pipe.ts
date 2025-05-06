import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: any, format?: string): string {
    if (!value) return '';
    const defaultFormat = 'dd-MMM-yyyy H:mm';
    const dateFormat = format || defaultFormat; 
    return this.datePipe.transform(value, dateFormat) || '';
  }
}