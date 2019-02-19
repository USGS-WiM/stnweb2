import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { WeatherConditionType } from '../interfaces/weather-condition-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherConditionTypeService {

  constructor(private _http: Http) { }

  public getWeatherTypes(): Observable<WeatherConditionType[]> {
    return this._http.get(APPSETTINGS.WEATHER_CONDITION_TYPES_URL)
      .map((response: Response) => <WeatherConditionType[]>response.json())
      .catch(this.handleError);
  }
  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }
}
