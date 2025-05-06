import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';
// import { environment } from '@environments/environment';

@Pipe({
    name: 'status',
    standalone: true
})
export class StatusPipe implements PipeTransform {

  transform(value: string): string {
    return StatusPipe.transform(value);
  }

  static transform(value: string): string {
    return value.toCapitalize();
  }

}
