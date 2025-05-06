import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ellipsis',
    standalone: true
})
export class EllipsisPipe implements PipeTransform {

  transform(str: string = '', strLength: number = 20, completeWords = false, ellipsis = '...'): string {
    if (str) {
      const withoutHtml = str.replace(/(<([^>]+)>)/ig, '');
      if (str.length > strLength && !completeWords) {
        return `${withoutHtml.slice(0, strLength)}${ellipsis}`;
      }
      return withoutHtml;
    }
    return "";
  }
}
