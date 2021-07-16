import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';
import { Template } from '../template.model';

@Component({
  selector: 'app-template-purchase',
  templateUrl: './template-purchase.component.html',
  styleUrls: ['./template-purchase.component.scss']
})
export class TemplatePurchaseComponent implements OnInit {

  choosenTemplate: Template;
  constructor(private modalService: ModalService,
    private userService: UserService,
    private builderService: BuilderService) { }

  ngOnInit(): void {
    this.userService.purchase.next(false);
    this.builderService.choosenTemplate$.subscribe((val) => {
      this.choosenTemplate = val;
    });
  }

  purchase() {
    this.userService.purchase.next(true);
    this.closeModal();
  }

  closeModal(): void {
    this.modalService.close();
  }
}
