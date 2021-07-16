import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  generateCaptcha(token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/generateCaptcha/',
      header
    );
  }
}
