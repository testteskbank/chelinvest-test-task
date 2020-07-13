import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalFunctionService {

  constructor() {
  }

  tempConverter = (val: number, from: string, to: string) => {
    switch (from) {
      case 'K':
        return this.tempK(val, to);
      default:
        return;
    }
  };

  tempK(val: number, to: string) {
    switch (to) {
      case 'C':
        return val - 273.15;
      case 'F':
        return (val - 273.15) * 9 / 5 + 32;
      case 'K':
        return val;
      default:
        return;
    }
  }
}
