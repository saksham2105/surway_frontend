import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";

export class HttpInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('Requesting server...');
    const modifiedReq = req.clone();
    return next.handle(modifiedReq);
  }
}
