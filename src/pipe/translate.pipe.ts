import { map, Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'appTranslate',
    standalone: true
})
export class TranslatePipe implements PipeTransform {

  constructor(
    private translateService: TranslateService,
  ) { }

  transform(key: string, prefix = []): Observable<string> {
    if (!key) { return };
    const arr = prefix.filter(e => e).map(e => `${e}.${key}`);
    return this.translateService.get([key, ...arr])
      .pipe(map(e => {
        const arrKey = arr.find(k => k !== e[k]);
        const value = arrKey ? e[arrKey] : e[key];
        return value === key ? key.toCamelCase().toUpperCaseEachWord() : value;
      }));
  }

}
