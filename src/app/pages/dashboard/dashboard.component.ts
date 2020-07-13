import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OpenweathermapService } from '../../core/services/weather/openweathermap.service';
import { GlobalFunctionService } from 'src/app/core/services/global-function.service';
import { forkJoin, Subject, } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { KeysService } from '../../core/services/keys.service';
import { GeocodeService } from '../../core/services/geo/geocode.service';
import { geocodeInterface } from '../../core/interfaces/geocode.interface';
import { currentWeatherInterface, listWeatherOneElementInterface } from '../../core/interfaces/openweathermap.interace';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(private openWeatherMap: OpenweathermapService, private fn: GlobalFunctionService, private modalService: BsModalService,
              private localStorageService: LocalStorageService,
              private keys: KeysService, private geoCodeService: GeocodeService) {
  }

  @ViewChild('modalAppKey') modalAppKey: ElementRef;

  public weatherData: Array<listWeatherOneElementInterface> = [];
  public currentPage: number;
  public totalItems: number;
  public weatherDataList: Array<listWeatherOneElementInterface> = [];
  public key: string;
  public coordUpd = new Subject();
  public errorApiMsg = false;
  public modalRef;
  public itemPerPage = 8;

  public currentCity = 'Chelyabinsk';
  public currentCityTemp: number;
  public tempConverter = this.fn.tempConverter;

  ngOnInit() {
    if (this.localStorageService.getApiKey() !== null) {
      this.keys.getApiKey();
      this.getDataByCity();
    }

    this.coordUpd.pipe(debounceTime(500)).subscribe(({lng, lat}) => {
      this.updateDataByGeo(lng, lat);
    });
  }

  ngAfterViewInit() {
    if (this.localStorageService.getApiKey() === null) {
      this.modalRef = this.modalService.show(this.modalAppKey, {
        backdrop: true,
        ignoreBackdropClick: true,
        class: 'modal-md'
      });
    }
  }

  pageChanged(e) {
    this.weatherDataList = (this.weatherData);
    this.weatherDataList = this.weatherData.filter((data, index) => {
      return index < e.page * this.itemPerPage && index >= e.page * this.itemPerPage - this.itemPerPage;
    });
  }

  getDataByCity() {
    this.openWeatherMap.getWeather().subscribe((data) => {
      this.weatherData = data.list.map((dataCol, index) => {
        return {
          unit: 'C',
          ...dataCol,
        };
      });
      this.totalItems = data.list.length;
      this.pageChanged({page: 1});
      this.getCurrentWeatherByCity(61.387, 55.171);
    });
  }


  getCurrentWeatherByCity(lng, lat) {
    const req = [this.geoCodeService.getCityNameByGeoCoord(lng, lat), this.openWeatherMap.getCurrentWeather(lng, lat)];
    this.geoCodeService.getCityNameByGeoCoord(lng, lat).pipe(switchMap((data) => {
      const geoData: geocodeInterface = data;
      this.currentCity = geoData.city;
      return this.openWeatherMap.getCurrentWeather(lng, lat);
    })).subscribe((data) => {
      const tempData: currentWeatherInterface = data;
      this.currentCityTemp = tempData.main.temp;
    });
  }

  updateDataByGeo(lng: number, lat: number) {
    this.getCurrentWeatherByCity(lng, lat);
    this.openWeatherMap.getWeatherByGeo(lng, lat).subscribe((data) => {
      this.weatherData = data.list.map((dataCol, index) => {
        return {
          unit: 'C',
          ...dataCol
        };
      });
      this.totalItems = data.list.length;
      this.pageChanged({page: 1});
    });
  }


  checkApiKey(key) {
    this.openWeatherMap.checkApiKey(key).subscribe((valid: boolean) => {
      if (!valid) {
        this.errorApiMsg = true;
      } else {
        this.modalRef.hide();
        this.localStorageService.setApiKey(this.key);
        this.keys.getApiKey();
        this.getDataByCity();
      }
    });
  }

  resetApikey() {
    this.errorApiMsg = false;
    this.localStorageService.removeApiKey();
    this.modalRef = this.modalService.show(this.modalAppKey, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-md'
    });
  }
}
