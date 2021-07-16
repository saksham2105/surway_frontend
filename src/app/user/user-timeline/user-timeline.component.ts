import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { UserService } from 'src/services/user/user.service';
import {
  ActivityTimeLineModel,
  HuCoinsTimeLineModel,
} from './timeLineModel.model';

@Component({
  selector: 'app-user-timeline',
  templateUrl: './user-timeline.component.html',
  styleUrls: ['./user-timeline.component.scss'],
})
export class UserTimelineComponent implements OnInit, OnDestroy {
  isLoading: Boolean = false;

  huCoinsTimeLineList: HuCoinsTimeLineModel[] = [];
  filteredHUCoinsList: HuCoinsTimeLineModel[] = [];
  activityTimeLineList: ActivityTimeLineModel[] = [];
  filteredActivityList: ActivityTimeLineModel[] = [];

  isHuCoinsTimeLine = true;
  email: string = '';
  huCoinstimeLineSubs: Subscription;
  activitytimeLineSubs: Subscription;

  dateDropDownValue = 'today';
  typeDropDownValue = 'survey';

  emptyHUCoinsValue: string = "You didn't spend any HU Coins today";
  emptyActivityValue: string = "You hadn't any activity today";

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Timeline');
  }

  ngOnInit(): void {
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }

    this.userService.isTimeLineLoading.subscribe((flag) => {
      this.isLoading = flag;
    });

    this.huCoinsTimeLineResponse();
  }

  ngOnDestroy(): void {
    if (this.huCoinstimeLineSubs != null) {
      this.huCoinstimeLineSubs.unsubscribe();
    }
    if (this.activitytimeLineSubs != null) {
      this.activitytimeLineSubs.unsubscribe();
    }
  }

  onNavItemChanged(flag: boolean) {
    this.isHuCoinsTimeLine = flag;
    if (flag) {
      this.huCoinsTimeLineResponse();
    } else {
      this.activityTimeLineResponse();
    }
  }

  //This function is used to fetch and populate the HU coins timeline response in list
  private huCoinsTimeLineResponse() {
    if (this.huCoinsTimeLineList.length === 0) {
      this.userService.isTimeLineLoading.next(true);

      this.huCoinstimeLineSubs = this.authService
        .authenticateUser()
        .subscribe((response: any) => {
          let token: string = response.token;
          this.userService
            .fetchHUCoinsTimeline(token, this.email)
            .subscribe((response2: any) => {
              if (response2.success) {
                // console.log(JSON.stringify(response2.message));
                if (response2.message != null) {
                  let cnt = response2.message.length;
                  for (let i = cnt - 1; i >= 0; i--) {
                    //to reverse order (latest first)
                    var type = response2.message[i].purchaseType;
                    var imageIcon = '';
                    switch (response2.message[i].purchaseType) {
                      case 'survey': {
                        type = 'Survey';
                        imageIcon = 'mdi-flask';
                        break;
                      }
                      case 'template': {
                        type = 'Template';
                        imageIcon = 'mdi-chart-box-plus-outline';
                        break;
                      }
                      case 'group': {
                        type = 'Group';
                        imageIcon = 'mdi-chemical-weapon';
                        break;
                      }
                      case 'report': {
                        type =
                          'Report Generated of Survey (' +
                          response2.message[i].purchaseName +
                          ')';
                        imageIcon = 'mdi-cloud-download';
                        break;
                      }
                      case 'public_launch': {
                        type =
                          'Publicly Launch Survey (' +
                          response2.message[i].purchaseName +
                          ')';
                        imageIcon = 'mdi-earth';
                        break;
                      }
                    }

                    const data = new HuCoinsTimeLineModel(
                      String(i),
                      imageIcon,
                      type,
                      response2.message[i].huCoinsUsed,
                      response2.message[i].timestamp
                    );
                    // console.log(JSON.stringify(data));
                    this.huCoinsTimeLineList.push(data);
                  }
                }
              }
              this.userService.isTimeLineLoading.next(false);
              this.dateDropDownValue = 'today';
              this.typeDropDownValue = 'survey';
              this.onTimelineChange(this.dateDropDownValue);
              // this.onTypeChange(this.typeDropDownValue, false);
            });
        });
    } else {
      this.onTypeChange(this.typeDropDownValue);
    }
  }

  //This function is used to fetch and populate the Activity timeline response in list
  private activityTimeLineResponse() {
    if (this.activityTimeLineList.length === 0) {
      this.userService.isTimeLineLoading.next(true);

      this.activitytimeLineSubs = this.authService
        .authenticateUser()
        .subscribe((response: any) => {
          let token: string = response.token;
          this.userService
            .fetchActivityTimeline(token, this.email)
            .subscribe((response2: any) => {
              if (response2.success) {
                if (response2.message.trackingList != null) {
                  let cnt = response2.message.trackingList.length;
                  for (let i = cnt - 1; i >= 0; i--) {
                    //to reverse order (latest first)
                    const data = new ActivityTimeLineModel(
                      response2.message.trackingList[i].activity,
                      response2.message.trackingList[i].timestamp
                    );
                    this.activityTimeLineList.push(data);
                  }
                }
              }
              this.userService.isTimeLineLoading.next(false);
              this.dateDropDownValue = 'today';
              this.typeDropDownValue = 'survey';
              this.onTimelineChange(this.dateDropDownValue);
            });
        });
    } else {
      this.onTimelineChange(this.dateDropDownValue);
    }
  }

  //Filter By Date Function
  onTimelineChange(type: string) {
    this.dateDropDownValue = type;
    this.filteredHUCoinsList = [];
    this.filteredActivityList = [];
    //to get the current date, month, year
    var today = new Date();
    var curDate = String(today.getDate()).padStart(2, '0');
    var curMonth = String(today.getMonth() + 1).padStart(2, '0'); //January is 0
    var curYear = today.getFullYear();

    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayDate = String(yesterday.getDate()).padStart(2, '0');
    var yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0'); //January is 0
    var yesterdayYear = yesterday.getFullYear();

    //To get first and last day for week type
    var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6
    var firstdayWeek = new Date(today.setDate(first)).getDate();
    var lastdayWeek = new Date(today.setDate(last)).getDate();

    switch (type) {
      case 'today': {
        //setting the empty content data
        this.emptyHUCoinsValue = "You didn't spend any HU Coins today";
        this.emptyActivityValue = "You haven't any activity today";
        var list: any[] = [];
        if (this.isHuCoinsTimeLine) {
          list = this.huCoinsTimeLineList;
        } else {
          list = this.activityTimeLineList;
        }
        for (let i = 0; i < list.length; i++) {
          let curDateFormat = curYear + '-' + curMonth + '-' + curDate;
          let dateTime = String(list[i].timestamp).substr(0, 10);
          if (dateTime === curDateFormat) {
            if (this.isHuCoinsTimeLine) {
              this.filteredHUCoinsList.push(list[i]);
            } else {
              this.filteredActivityList.push(list[i]);
            }
          }
        }
        break;
      }
      case 'yesterday': {
        this.emptyHUCoinsValue = "You hadn't spend any HU Coins yesterday";
        this.emptyActivityValue = "You hadn't any activity yesterday";
        var list: any[] = [];
        if (this.isHuCoinsTimeLine) {
          list = this.huCoinsTimeLineList;
        } else {
          list = this.activityTimeLineList;
        }
        for (let i = 0; i < list.length; i++) {
          let curDateFormat =
            yesterdayYear + '-' + yesterdayMonth + '-' + yesterdayDate;
          let dateTime = String(list[i].timestamp).substr(0, 10);
          if (dateTime === curDateFormat) {
            if (this.isHuCoinsTimeLine) {
              this.filteredHUCoinsList.push(list[i]);
            } else {
              this.filteredActivityList.push(list[i]);
            }
            // this.isResponseTimelineChartContainsData = true;
          }
        }
        break;
      }
      case 'week': {
        this.emptyHUCoinsValue = "You hadn't spend any HU Coins in this week";
        this.emptyActivityValue = "You hadn't any activity in this week";
        var list: any[] = [];
        if (this.isHuCoinsTimeLine) {
          list = this.huCoinsTimeLineList;
        } else {
          list = this.activityTimeLineList;
        }
        for (let i = 0; i < list.length; i++) {
          let resDate = String(list[i].timestamp).substr(8, 2);
          let resMonth = String(list[i].timestamp).substr(5, 2);
          let resYear = String(list[i].timestamp).substr(0, 4);
          //this loop will work if first date is in the last week of month and last date is into the next month date
          if (lastdayWeek < firstdayWeek) {
            lastdayWeek = lastdayWeek + 7;
          }
          if (
            firstdayWeek <= +resDate &&
            +resDate <= lastdayWeek &&
            resMonth === curMonth &&
            +resYear === curYear
          ) {
            //date should be between first and last date of week and month and year should be current
            if (this.isHuCoinsTimeLine) {
              this.filteredHUCoinsList.push(list[i]);
            } else {
              this.filteredActivityList.push(list[i]);
            }
          }
        }
        break;
      }
      case 'month': {
        this.emptyHUCoinsValue = "You hadn't spend any HU Coins in this month";
        this.emptyActivityValue = "You hadn't any activity in this month";
        var list: any[] = [];
        if (this.isHuCoinsTimeLine) {
          list = this.huCoinsTimeLineList;
        } else {
          list = this.activityTimeLineList;
        }
        for (let i = 0; i < list.length; i++) {
          let resMonth = String(list[i].timestamp).substr(5, 2);
          let resYear = String(list[i].timestamp).substr(0, 4);

          if (resMonth === curMonth && +resYear === curYear) {
            if (this.isHuCoinsTimeLine) {
              this.filteredHUCoinsList.push(list[i]);
            } else {
              this.filteredActivityList.push(list[i]);
            }
          }
        }
        break;
      }
      case 'year': {
        this.emptyHUCoinsValue = "You hadn't spend any HU Coins in this year";
        this.emptyActivityValue = "You hadn't any activity in this year";

        var list: any[] = [];
        if (this.isHuCoinsTimeLine) {
          list = this.huCoinsTimeLineList;
        } else {
          list = this.activityTimeLineList;
        }

        for (let i = 0; i < list.length; i++) {
          let resYear = String(list[i].timestamp).substr(0, 4);
          if (+resYear === curYear) {
            if (this.isHuCoinsTimeLine) {
              this.filteredHUCoinsList.push(list[i]);
            } else {
              this.filteredActivityList.push(list[i]);
            }
          }
        }
        break;
      }
    }

    //Doubly connection b/w both filters => Case when user change the date drop down
    if (this.isHuCoinsTimeLine) {
      this.onTypeChangeFromTimeline(this.typeDropDownValue);
    }
  }

  //Responsible for filtering the data based on date Drop down and type drop down
  onTypeChangeFromTimeline(type: string) {
    var list: HuCoinsTimeLineModel[] = [];
    list = this.filteredHUCoinsList;
    var filteredList: HuCoinsTimeLineModel[] = [];

    for (let i = 0; i < list.length; i++) {
      if (
        String(list[i].purchaseType).toLowerCase().substr(0, 5) ===
        type.substr(0, 5)
      ) {
        //tricky check => filter based on first 5 chars and then based on index in our filtered list fetch the items from list
        filteredList.push(list[i]);
      }
    }

    this.filteredHUCoinsList = filteredList;
  }

  //Only responsible for changing type and call the timeline function
  onTypeChange(type: string) {
    this.typeDropDownValue = type;
    this.onTimelineChange(this.dateDropDownValue);
  }
}
