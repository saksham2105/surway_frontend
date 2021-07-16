import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

var Razorpay: any;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  isPaymentLoading = new BehaviorSubject<Boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) {}

  createOrder(
    name: string,
    email: string,
    amount: number,
    plan: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.post(
      this.authService.baseURL + '/surway/api/order',
      {
        customerName: name,
        email: email,
        amount: amount,
        plan: plan,
      },
      header
    );
  }

  updateOrder(order: any, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.post(
      this.authService.baseURL + '/surway/api/update',
      {
        razorpayOrderId: order.razorpay_order_id,
        razorpayPaymentId: order.razorpay_payment_id,
        razorpaySignature: order.razorpay_signature,
      },
      header
    );
  }
}
