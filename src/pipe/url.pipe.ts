import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'url',
    standalone: true
})
export class UrlPipe implements PipeTransform {

  transform(value: string): unknown {
    if (!value) {
      return value;
    }
    return (value.startsWith('http://') || value.startsWith('https://')) ? value : 'http://' + value;
  }

}
