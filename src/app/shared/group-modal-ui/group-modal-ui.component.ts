import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserGroupModel } from 'src/app/user/user-groups/user-groups.model';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { ModalService } from 'src/services/modal/modal.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-group-modal-ui',
  templateUrl: './group-modal-ui.component.html',
  styleUrls: ['./group-modal-ui.component.scss'],
})
export class GroupModalUiComponent implements OnInit {
  groupModalForm: FormGroup;
  groupData: UserGroupModel;
  counterMember: number = 0;
  errorString: string = 'Same email cannot be entered more than once';
  isCounterMemberError: Boolean = false;
  membersSet: string[] = []; //manages the duplication of members in group
  membersFormArray = new FormArray([]);
  isGroupCardFirstTimeClicked: Boolean = false;
  email: string = '';
  preDefinedGroupList: number = 0;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private authService: AuthService,
    private paymentConfService: PaymentConfirmationService
  ) {}

  ngOnInit(): void {
    this.email = (<UserCookieModel>(
      JSON.parse(localStorage.getItem('userCookies'))
    )).email.toLowerCase();
    //insert user email, not allow to add himself in the group

    this.modalService.contactGroupData.subscribe((data) => {
      this.groupData = data;
      if (this.groupData != null) {
        this.preDefinedGroupList = this.groupData.groupMembers.length;
      }
      if (this.isGroupCardFirstTimeClicked) {
        this.groupModalForm.reset();
      }
      this.initContactGroupForm();
    });
    this.initContactGroupForm();
  }

  private initContactGroupForm() {
    this.counterMember = 0;
    this.membersSet = [];
    this.membersSet.push(this.email.toLowerCase());
    this.isGroupCardFirstTimeClicked = true; //checks true if user clicks card more than once, issue solve of resetting the form
    this.membersFormArray = new FormArray([]);
    let groupName: string = '';

    if (this.groupData != null) {
      groupName = this.groupData.groupName;
      for (let item of this.groupData.groupMembers) {
        if (item.length > 1) {
          //not null email id
          //no check of duplication because data is coming from API and it is stored uniquely
          this.membersSet.push(item.toLowerCase());
        }
        this.counterMember++;
        this.membersFormArray.push(
          new FormGroup({
            memberName: new FormControl(item, [
              Validators.required,
              Validators.email,
              Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
            ]),
          })
        );
      }
    } else {
      this.counterMember++;
      this.membersFormArray.push(
        new FormGroup({
          memberName: new FormControl('', [
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        })
      );
    }

    this.groupModalForm = new FormGroup({
      groupName: new FormControl(groupName, Validators.required),
      members: this.membersFormArray,
    });

    // this.counterMember--;
    // console.log(
    //   'error init ' + this.preDefinedGroupList + ' ' + this.counterMember
    // );
    console.log(this.counterMember);
  }

  get controls() {
    return (<FormArray>this.groupModalForm.get('members')).controls;
  }

  onAddMember() {
    if (this.counterMember < 10) {
      if (this.preDefinedGroupList != this.counterMember) {
        let enteredEmail =
          this.groupModalForm.get('members').value[this.counterMember - 1]
            .memberName;
        //check duplication of email and render error
        if (
          searchStringInArray(enteredEmail.toLowerCase(), this.membersSet) != -1
        ) {
          //present email in array
          this.errorString = 'Same email cannot be entered more than once';
          this.isCounterMemberError = true;
          return;
        } else {
          //not found
          this.membersSet.push(enteredEmail.toLowerCase());
        }
      }

      (<FormArray>this.groupModalForm.get('members')).push(
        new FormGroup({
          memberName: new FormControl(null, [
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        })
      );
      this.counterMember++;
      this.isCounterMemberError = false;
    } else {
      this.errorString = 'You cannot add more than 10 members in a group';
      this.isCounterMemberError = true;
    }
  }

  onDeleteGroup(groupId: string, creatorMail: string) {
    this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.userService
          .deleteCreatorGroup(token, groupId, creatorMail)
          .subscribe(
            (res) => {
              console.log(JSON.stringify(res));
              if (res.success) {
                this.userService.isContactGroupLoading.next(true);
                this.userService.isGroupCreatedUpdated.next(true);
                this.onCancel();
              }
            },
            (err) => {
              // console.log('ERR: ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        // alert(error.error);
      }
    );
  }

  onDeleteItem(memberEmail: string, item: number) {
    if (memberEmail == null) {
      this.counterMember--;
      (<FormArray>this.groupModalForm.get('members')).removeAt(item);
      return;
    }
    memberEmail = memberEmail.toString().toLowerCase();
    //delete email from list which manages the duplication of entries
    this.membersSet = this.membersSet.filter((e) => e !== memberEmail);

    (<FormArray>this.groupModalForm.get('members')).removeAt(item);
    this.isCounterMemberError = false;
    if (this.counterMember === 1) {
      this.membersFormArray.push(
        new FormGroup({
          memberName: new FormControl('', [
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        })
      );
    } else {
      this.counterMember--;

      this.preDefinedGroupList = Math.min(
        this.preDefinedGroupList,
        this.counterMember
      );
      console.log(
        'error del ' + this.preDefinedGroupList + ' ' + this.counterMember
      );
    }
  }

  onSubmit() {
    console.log('e1 ' + this.preDefinedGroupList + ' ' + this.counterMember);
    // let enteredEmail: string =
    //   this.groupModalForm.get('members').value[this.counterMember - 1]
    //     .memberName;
    //check for last entry duplication (last entry(10th) is not verified)
    // if (this.preDefinedGroupList != this.counterMember) {
    // console.log('mat aao isme');

    //check duplication of email and render error
    if (this.preDefinedGroupList != this.counterMember) {
      let enteredEmail =
        this.groupModalForm.get('members').value[this.counterMember - 1]
          .memberName;
      if (
        searchStringInArray(enteredEmail.toLowerCase(), this.membersSet) != -1
      ) {
        //present email in array
        this.errorString = 'Same email cannot be entered more than once';
        this.isCounterMemberError = true;
        return;
      }
    }

    // } else {
    //not found
    let groupName = this.groupModalForm.get('groupName').value;
    let groupMembersList = this.groupModalForm.get('members').value;
    let memberList = [];
    for (let i = 0; i < groupMembersList.length; i++) {
      memberList.push(groupMembersList[i].memberName);
    }
    if (this.groupData != null) {
      //data not null => edit contact group
      // console.log('edit api');
      this.editContactGroup(
        this.groupData.groupID,
        this.email,
        groupName,
        memberList
      );
    } else {
      // new group creation
      this.createContactGroup(this.email, groupName, memberList);
    }
    // }
  }
  onCancel() {
    this.modalService.close();
    this.groupModalForm.reset();
  }

  createContactGroup(
    email: string,
    groupName: string,
    groupMembersList: Array<string>
  ) {
    this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.userService
          .addCreatorGroup(token, groupName, email, groupMembersList)
          .subscribe(
            (res) => {
              console.log(JSON.stringify(res));
              if (res.success) {
                this.userService.isContactGroupLoading.next(true);
                this.userService.isGroupCreatedUpdated.next(true);
                //Show the popup
                this.paymentConfService.modalHeader.next('Create Group');
                this.paymentConfService.imagePath.next(
                  './../../assets/tick-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'Group has been created!'
                );
                this.paymentConfService.alertopen();
                this.onCancel();
              } else {
                this.paymentConfService.isPaymentAuthorized.next(false);

                this.paymentConfService.purchaseCost$.next(5);
                this.paymentConfService.modalHeader.next('Create Group');
                this.paymentConfService.imagePath.next(
                  './../../assets/ill-groups.svg'
                );
                this.paymentConfService.questionString.next('create a group');
                this.paymentConfService.open();

                // CODE TO BE WRITTEN
                this.paymentConfService.isPaymentAuthorized.subscribe(
                  (flag) => {
                    // Payment authorized
                    if (flag) {
                      // console.log('Payment authorized');
                      // fetch user
                      let user: UserCookieModel;
                      if (localStorage.getItem('userCookies')) {
                        user = <UserCookieModel>(
                          JSON.parse(localStorage.getItem('userCookies'))
                        );
                      }
                      // generate token
                      this.authService
                        .authenticateUser()
                        .subscribe((res: any) => {
                          let token: string = res.token;
                          // purchase call
                          this.userService
                            .purchaseGroup(token, user.email)
                            .subscribe((response: any) => {
                              // payment success
                              // console.log(response);

                              if (response.success) {
                                // alert('Payment success')!
                                //update the local storage
                                let user: UserCookieModel;
                                this.userService.user.subscribe((userInfo) => {
                                  user = userInfo;
                                });
                                let updatedUser = new UserCookieModel(
                                  user.firstName,
                                  user.secondName,
                                  user.email,
                                  user.verified,
                                  user.huCoins - 5,
                                  user.contact,
                                  true,
                                  user.registeredDate,
                                  user.imageString
                                );
                                this.userService.user.next(updatedUser);
                                localStorage.setItem(
                                  'userCookies',
                                  JSON.stringify(updatedUser)
                                );

                                //Create Group automatically
                                let groupName =
                                  this.groupModalForm.get('groupName').value;
                                let groupMembersList =
                                  this.groupModalForm.get('members').value;
                                let memberList = [];
                                for (
                                  let i = 0;
                                  i < groupMembersList.length;
                                  i++
                                ) {
                                  memberList.push(
                                    groupMembersList[i].memberName
                                  );
                                }
                                this.createContactGroup(
                                  this.email,
                                  groupName,
                                  memberList
                                );
                              }
                              // payment failed
                              else {
                                this.paymentConfService.paymentFailed.next(
                                  true
                                );
                                // alert('Payment failed')!
                                this.paymentConfService.message$.next(
                                  'Payment failed!!'
                                );
                                this.paymentConfService.alertopen();
                              }
                              this.modalService.close();
                            });
                        });
                    }
                  }
                );
              }
            },
            (err) => {
              // console.log('ERR: ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        // alert(error.error);
      }
    );
  }

  editContactGroup(
    groupId: string,
    email: string,
    groupName: string,
    groupMembersList: Array<string>
  ) {
    this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.userService
          .editCreatorGroup(token, groupId, groupName, email, groupMembersList)
          .subscribe(
            (res) => {
              console.log(JSON.stringify(res));
              if (res.success) {
                this.userService.isContactGroupLoading.next(true);
                this.userService.isGroupCreatedUpdated.next(true);
                this.onCancel();
              }
            },
            (err) => {
              // console.log('ERR: ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        // alert(error.error);
      }
    );
  }
}

//function used to search element in list, returns -1 if not present and index if present.
function searchStringInArray(str: string, strArray) {
  for (var j = 0; j < strArray.length; j++) {
    if (String(strArray[j]).match(str)) return j;
  }
  return -1;
}
