import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';

declare const DG: any;


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  constructor() {
  }

  @Output() coordChange = new EventEmitter();

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    DG.then(() => {
      const map = DG.map('map', {
        center: [55.171, 61.387],
        zoom: 15
      });
      const marker = DG.marker([55.171, 61.387], {
        draggable: true
      }).addTo(map);
      marker.on('drag', (e) => {
        const lat = e.target._latlng.lat.toFixed(3);
        const lng = e.target._latlng.lng.toFixed(3);
        this.coordChange.emit({lat, lng});
      });
    });
  }
}
