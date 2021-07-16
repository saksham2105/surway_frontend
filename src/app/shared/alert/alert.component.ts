import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalService } from 'src/services/modal/modal.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  constructor(private modalService: ModalService) {}
  loginError: string = 'Login Error';
  errorDescription: string = 'Login Credentials are wrong';
  imagePath: string = './../../../assets/error.png';

  ngOnInit(): void {
    this.modalService.errorTitle.subscribe((title) => {
      this.loginError = title;
    });
    this.modalService.errorDescription.subscribe((desc) => {
      this.errorDescription = desc;
    });
    this.modalService.errorImagePath.subscribe((imagePath) => {
      this.imagePath = imagePath;
    });
  }

  onClose() {
    this.modalService.close();
  }
}
