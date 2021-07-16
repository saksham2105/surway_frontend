import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';
import { UserGroupModel } from './user-groups.model';

@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss'],
})
export class UserGroupsComponent implements OnInit, OnDestroy {
  isContactGroupLoading: Boolean = false;

  contactGroupsList = [];
  email: string = '';
  groupHeader: string = '';

  groupSubs: Subscription;

  isGroupModal: Boolean = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private modalService: ModalService
  ) {
    this.titleService.setTitle('SurWay Groups');
  }

  ngOnInit(): void {
    this.isContactGroupLoading = true;
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }

    this.userService.isContactGroupLoading.subscribe((flag) => {
      this.isContactGroupLoading = flag;
    });

    this.userService.isGroupCreatedUpdated.subscribe((flag) => {
      if (flag) {
        this.myContactGroups();
      }
    });

    this.modalService.contactGroupModal.subscribe((flag) => {
      this.isGroupModal = flag;
    });

    this.myContactGroups();
  }

  ngOnDestroy(): void {
    if (this.groupSubs != null) {
      this.groupSubs.unsubscribe();
    }
    this.modalService.contactGroupModal.next(false);
  }

  onCreateGroup() {
    this.modalService.contactGroupModal.next(true);
    this.modalService.contactGroupData.next(null);
    this.modalService.open('contactGroupModal');
  }

  onGroupItemClick(item: UserGroupModel) {
    console.log(JSON.stringify(item));
    this.modalService.contactGroupModal.next(true);
    this.modalService.contactGroupData.next(item);
    this.modalService.open('contactGroupModal');
  }

  private myContactGroups() {
    this.contactGroupsList = [];
    this.userService.isContactGroupLoading.next(true);
    this.groupSubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        //after getting token
        this.userService
          .getCreatorGroupList(this.email, token)
          .subscribe((response2: any) => {
            if (response2.success) {
              // console.log(JSON.stringify(response2));
              let groupCount = response2.message.length;

              for (let i = 0; i < groupCount; i++) {
                let group = response2.message[i];

                const contactGroup = new UserGroupModel(
                  group.id,
                  group.userMail,
                  group.name,
                  group.members,
                  group.timestamp
                );
                this.contactGroupsList.push(contactGroup);
              }
              //dynamically set button name
              this.groupHeader = `My Contact Groups (${this.contactGroupsList.length})`;
            } else {
              //error
            }
            setTimeout(() => {
              this.userService.isContactGroupLoading.next(false);
              this.userService.isGroupCreatedUpdated.next(false);
            }, 1000);
          });
      });
  }
}
