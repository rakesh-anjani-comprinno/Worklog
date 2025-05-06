import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appNumber',
  standalone: true
})
export class NumberPipe implements PipeTransform {

  transform(value: string | number = 0, decimals = 2): string {
    return `${(+value)}`;
    // toRound(decimals);
  }

}
