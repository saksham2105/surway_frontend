import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { UserService } from 'src/services/user/user.service';
import { MySurveysModel } from '../user-my-surveys/my-surveys.model';
import { ParticipantsModel } from './participants.model';

import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ExportToCsv } from 'export-to-csv';
import { DatePipe, formatDate } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { SurveyModel } from 'src/services/builder/survey.model';

@Component({
  selector: 'app-user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.scss'],
})
export class UserStatisticsComponent implements OnInit, OnDestroy {
  animationValue: string = 'linear';

  /** Top Cards Variables */
  surveyID: string = '';
  surveyName: string = '';
  surveyCategory: string = '';
  surveyCreatedOn: string = '';
  surveyLastResponse: string = '';
  surveyViews: number = 0;
  surveyResponses: number = 0;
  engagementRate: number = 0.0;
  surveyStatus: Boolean = false;
  reportStatus: string;
  currentSurvey: SurveyModel;
  /**Survey Variables */
  surveyQuestionCount = 0;
  averageTimeTakenChartLabels: Label[] = [];
  averageTimeTakenValues = [];
  averageQuesTimeTaken = 0.0;

  /** Primary Variables */
  isLoading: Boolean = false;
  email: string = '';
  mySurveyList: MySurveysModel[] = []; //contains surveys

  participantsList: ParticipantsModel[] = [];
  responseTimestampList: string[] = [];
  isResponseTimelineChartContainsData: Boolean = false;

  noGraphTitle = 'No Data for this Survey Graph';

  isStats: Boolean = true; //Nav-tab management
  loadSurveyStatsSubs: Subscription;
  enableDisableSurveySubs: Subscription;
  mySurveySubs: Subscription;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private paymentConfService: PaymentConfirmationService
  ) {
    this.titleService.setTitle('SurWay Statistics');
  }

  ngOnInit(): void {
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }
    this.userService.isStatsLoading.subscribe((flag) => {
      this.isLoading = flag;
    });
    this.mysurvey();
  }

  ngOnDestroy(): void {
    if (this.mySurveySubs != null) {
      this.mySurveySubs.unsubscribe();
    }
    if (this.enableDisableSurveySubs != null) {
      this.enableDisableSurveySubs.unsubscribe();
    }
    if (this.loadSurveyStatsSubs != null) {
      this.loadSurveyStatsSubs.unsubscribe();
    }
  }

  //This is used for changing active styling for nav/tab bootstrap
  onStats(flag: Boolean) {
    this.isStats = flag;
  }

  //This function is responsible for generating reports in PDF
  onStatsGenerateReport() {
    if (this.reportStatus === 'unlock') {
      document.getElementById('stats-generate-btn').style.visibility = 'hidden';
      if (this.isStats) {
        //when on stats page, hide participants nav in report
        document.getElementById('nav-item-participants').style.visibility =
          'hidden';
        document.getElementById('enable-disable-survey').style.display = 'none';

        //ONLY export Statistics Screen in PDF
        let data = document.getElementById('stats-container');
        var currentPosition = data.scrollTop;
        var w = data.offsetWidth;
        var h = data.offsetHeight;
        data.style.height = 'auto';

        html2canvas(data).then((canvas) => {
          const contentDataURL = canvas.toDataURL('image/png');
          // let pdf = new jspdf('p', 'mm', 'a4');
          let pdf = new jspdf('p', 'mm', [w, h]);
          pdf = this.addWaterMark(pdf);

          var imgWidth = 208;
          var imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(contentDataURL, 'PNG', 0, 0, w, h - 40, '', 'FAST');
          // pdf.addPage();
          pdf.save(this.surveyName + ' Report.pdf');
        });
        // data.style.height = '100px';
        data.scrollTop = currentPosition;
        document.getElementById('nav-item-participants').style.visibility =
          'visible';
        document
          .getElementById('enable-disable-survey')
          .style.removeProperty('display');
      } else {
        /***************** CSV EXPORT ***********************/
        document.getElementById('nav-item-stats').style.visibility = 'hidden';
        //Export Participants List in CSV Format
        this.exportToCsv();
        document.getElementById('nav-item-stats').style.visibility = 'visible';
      }

      document.getElementById('stats-generate-btn').style.visibility =
        'visible';
    } else {
      // Launch Modal for payment authorization
      this.paymentConfService.open();
      this.paymentConfService.purchaseCost$.next(5);
      this.paymentConfService.questionString.next('buy report generation');

      this.paymentConfService.isPaymentAuthorized.next(false);
      // PAYMENT CHECK
      this.paymentConfService.isPaymentAuthorized.subscribe((flag) => {
        // Payment authorized
        if (flag) {
          console.log('Payment authorized');
          // fetch user
          let user: UserCookieModel;
          if (localStorage.getItem('userCookies')) {
            user = <UserCookieModel>(
              JSON.parse(localStorage.getItem('userCookies'))
            );
          }
          // generate token
          this.authService.authenticateUser().subscribe((res: any) => {
            let token: string = res.token;
            // purchase call
            this.userService
              .purchaseReportGeneration(
                token,
                this.surveyID,
                this.surveyName,
                user.email
              )
              .subscribe((response: any) => {
                console.log(response);
                if (response.success) {
                  // alert('Payment success! Report generation unlocked!');
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

                  this.paymentConfService.message$.next(
                    'Payment success!! Report generation unlocked!'
                  );
                  this.paymentConfService.alertopen();
                  this.reportStatus = 'unlock';
                } else {
                  this.paymentConfService.paymentFailed.next(true);
                  // alert('Payment failed! Report generation locked!');
                  this.paymentConfService.message$.next(
                    'Payment failed!! Report generation locked!'
                  );
                  this.paymentConfService.alertopen();
                }
              });
          });
        }
      });
    }
  }

  //This function is used to add watermark in report in bottom of the pdf pages
  addWaterMark(doc) {
    var totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      //doc.addImage(imgData, 'PNG', 40, 40, 75, 75);
      doc.setTextColor(150);
      doc.setFontSize(50);
      doc.text(
        doc.internal.pageSize.width - (60 * doc.internal.pageSize.width) / 100,
        doc.internal.pageSize.height - 20,
        'SurWay Report'
      );
    }

    return doc;
  }

  //This function is used to export the participants details in CSV format
  exportToCsv() {
    var csvData = [];
    var pipe = new DatePipe('en-IN');
    for (let i = 0; i < this.participantsList.length; i++) {
      csvData.push({
        'Participant Email': this.participantsList[i].userMail,
        'Time Taken': this.participantsList[i].actualTimeTaken,
        'Answered at': String(
          formatDate(
            this.participantsList[i].timestamp,
            'MMMM dd, YYYY hh:mm a',
            'en-IN'
          )
        ),
      });
    }

    const options = {
      fieldSeparator: ',',
      filename: 'Survey Participants',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Participants of ' + this.surveyName,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(csvData);
  }

  //This function is used to fetch all the surveys and used in populating the drop down
  private mysurvey() {
    this.mySurveyList = [];

    this.userService.isStatsLoading.next(true);
    this.mySurveySubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        this.userService
          .getCreatorMySurveys(this.email, token)
          .subscribe((response2: any) => {
            if (response2.success) {
              let surveyCount = response2.message.length;

              for (let i = 0; i < surveyCount; i++) {
                let survey = response2.message[i];
                let surveyImagePath = this.userService.getImagePath(
                  survey.surveyCategory
                );
                let surveyCompletionRate: number = 0;
                let viewsCount = survey.views;
                let surveyResponseCount = 0;
                let surveyLastResponseTime: string = '';
                //this is the case when user responses are null and views count is 0
                if (survey.surveyResponses != null) {
                  surveyResponseCount =
                    survey.surveyResponses.surveyResponseList.length;
                  surveyLastResponseTime =
                    survey.surveyResponses.lastResponseTime;
                  if (viewsCount != 0) {
                    surveyCompletionRate =
                      (surveyResponseCount / viewsCount) * 100;
                  }
                }

                const publicSurveyModel = new MySurveysModel(
                  survey.id,
                  survey.name,
                  surveyImagePath,
                  survey.surveyCategory,
                  survey.timestamp,
                  survey.views,
                  surveyResponseCount,
                  surveyCompletionRate,
                  surveyLastResponseTime,
                  survey.active
                );
                this.mySurveyList.push(publicSurveyModel);
              }
              //dynamically set button name
              if (this.mySurveyList.length > 0) {
                this.surveyStatsLoad(this.mySurveyList[0].surveyID);
              } else {
                this.userService.isStatsLoading.next(false); //stop the loader and show the empty survey content
              }
            } else {
              //error
              this.userService.isStatsLoading.next(false); //stop the loader and show the empty survey content
            }
          });
      });
  }

  //Data sets of both graphs
  averageTimeTakenChartData = [];
  responseChartData = [];

  //This function is loading the survey stats
  surveyStatsLoad(surveyID: string) {
    this.userService.isStatsLoading.next(true);
    this.surveyQuestionCount = 0;
    this.participantsList = [];
    this.averageTimeTakenChartLabels = [];
    this.responseTimestampList = [];
    this.averageTimeTakenValues = [];
    this.averageTimeTakenChartData = [];
    this.responseChartData = [];

    this.loadSurveyStatsSubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        this.userService
          .fetchStatistics(token, surveyID)
          .subscribe((response2: any) => {
            console.log(response2);
            if (response2.success) {
              this.surveyID = surveyID;
              this.surveyName = response2.message.name;
              this.surveyCategory = response2.message.surveyCategory;
              this.surveyCreatedOn = response2.message.surveyCreatedOn;
              this.surveyStatus = response2.message.surveyStatus;
              this.reportStatus = response2.message.reportStatus;
              this.surveyLastResponse = response2.message.lastResponseTime;

              this.surveyViews = response2.message.views;
              this.surveyResponses = response2.message.responses;
              this.engagementRate = +(
                +response2.message.completionRate * 100
              ).toFixed(2);

              if (response2.message.surveyResponses != null) {
                if (
                  response2.message.surveyResponses[0].surveyAnswers != null
                ) {
                  this.surveyQuestionCount =
                    response2.message.surveyResponses[0].surveyAnswers.length;
                }
                let avgTimeTakenList: number[] = [];
                for (let i = 0; i < this.surveyQuestionCount; i++) {
                  //initialization of time taken list with 0
                  avgTimeTakenList.push(0);
                }

                let totalParticipants =
                  response2.message.surveyResponses.length;
                for (let i = 0; i < totalParticipants; i++) {
                  let itemParticipant =
                    response2.message.surveyResponses[
                      totalParticipants - i - 1
                    ]; //response sort in decreasing order
                  const participantModel = new ParticipantsModel(
                    itemParticipant.userMail,
                    itemParticipant.surveyAnswers,
                    itemParticipant.actualTimeTaken,
                    itemParticipant.timestamp
                  );
                  //record all survey responses timestamp (Response timeline graph)
                  this.responseTimestampList.push(itemParticipant.timestamp);
                  if (itemParticipant.surveyAnswers != null) {
                    this.surveyQuestionCount =
                      itemParticipant.surveyAnswers.length;

                    for (let j = 0; j < this.surveyQuestionCount; j++) {
                      avgTimeTakenList[j] =
                        avgTimeTakenList[j] +
                        itemParticipant.surveyAnswers[j].timeTaken;
                    }
                  }

                  this.participantsList.push(participantModel);
                } //END of for loop

                //Populate the average time taken chart data and labels
                let avgQuesTime = 0.0;
                for (let i = 1; i <= this.surveyQuestionCount; i++) {
                  this.averageTimeTakenChartLabels.push('Q.' + i);

                  this.averageTimeTakenValues.push(
                    avgTimeTakenList[i - 1] / (1.0 * totalParticipants)
                  );
                  avgQuesTime =
                    avgQuesTime +
                    avgTimeTakenList[i - 1] / (1.0 * totalParticipants);
                }
                this.averageQuesTimeTaken =
                  avgQuesTime / (1.0 * this.surveyQuestionCount);

                this.averageQuesTimeTaken =
                  +this.averageQuesTimeTaken.toFixed(2);
                //Populating the line chart data after getting response
                this.averageTimeTakenChartData = [
                  {
                    label: 'Avg Time Taken',
                    lineTension: 0.3,
                    backgroundColor: '#e5efee',
                    borderColor: '#19726b',
                    pointRadius: 3,
                    pointBackgroundColor: '#19726b',
                    pointBorderColor: '#19726b',
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: '#00635b',
                    pointHoverBorderColor: '#00635b',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: this.averageTimeTakenValues,
                  },
                ];
                //Populating the bar chart data after getting response
                this.onEditResponseGraph('today');
              }
            } else {
              //error
            }

            setTimeout(() => {
              this.userService.isStatsLoading.next(false);
            }, 1000);
          });
      });
  }

  //This function is used to enable/disable the survey on click of radio button
  onEnableDisableSurvey(isSurveyActive: Boolean, id: string) {
    setTimeout(() => {
      this.userService.isStatsLoading.next(true);
      if (isSurveyActive) {
        //call the disable survey API
        this.enableDisableSurveySubs = this.authService
          .authenticateUser()
          .subscribe((res: any) => {
            let token = res.token;
            this.userService
              .disableSurvey(token, id)
              .subscribe((response: any) => {
                if (response.success) {
                  this.surveyStatsLoad(id);
                } else {
                  //
                  this.userService.isStatsLoading.next(false);
                }
              });
          });
      } else {
        //call the enable survey API
        this.enableDisableSurveySubs = this.authService
          .authenticateUser()
          .subscribe((res: any) => {
            let token = res.token;
            this.userService
              .enableSurvey(token, id)
              .subscribe((response: any) => {
                if (response.success) {
                  this.surveyStatsLoad(id);
                } else {
                  //
                  this.userService.isStatsLoading.next(false);
                }
              });
          });
      }
    }, 1000);
  }

  //This function is triggered on click of dropdown of response timeline graph
  onResponseTimelineChange(type: string) {
    this.onEditResponseGraph(type);
  }

  /**********************************************************************/
  /********************* Average Time Taken Chart ****************************/
  /**********************************************************************/

  averageTimeTakenChartType = 'line';
  averageTimeTakenChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0,
      },
    },
    scales: {
      xAxes: [
        {
          time: {
            unit: 'number',
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            maxTicksLimit: 7,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function (value) {
              if (0 <= value && value < 1000) {
                return value + ' (secs)';
              } else if (1000 <= value && value < 100000) {
                return value / 1000 + 'K (secs)';
              } else {
                return value / 1000000 + 'M (secs)';
              }
            },
          },
          gridLines: {
            color: 'rgb(234, 236, 244)',
            zeroLineColor: 'rgb(234, 236, 244)',
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2],
          },
        },
      ],
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: this.animationValue,
    },
    tooltips: {
      backgroundColor: 'rgb(255,255,255)',
      bodyFontColor: '#858796',
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
      callbacks: {
        label: function (tooltipItem, chart) {
          var datasetLabel =
            chart.datasets[tooltipItem.datasetIndex].label || '';
          if (0 <= tooltipItem.yLabel && tooltipItem.yLabel < 1000) {
            return datasetLabel + ':' + tooltipItem.yLabel + ' (secs)';
          } else if (
            1000 <= tooltipItem.yLabel &&
            tooltipItem.yLabel < 100000
          ) {
            return datasetLabel + ':' + tooltipItem.yLabel / 1000 + 'K (secs)';
          } else {
            return (
              datasetLabel + ':' + tooltipItem.yLabel / 1000000 + 'M (secs)'
            );
          }
        },
      },
    },
  };

  /**************************************************************************/
  /********************* Responses Timeline Chart ****************************/
  /**************************************************************************/
  responseChartLabels: Label[] = [];
  responseList = [];

  onEditResponseGraph(type: string) {
    this.responseList = [];
    this.responseChartLabels = [];
    this.isResponseTimelineChartContainsData = false;

    //to get the current date, month, year
    var today = new Date();
    var curDate = String(today.getDate()).padStart(2, '0');
    var curMonth = String(today.getMonth() + 1).padStart(2, '0'); //January is 0
    var curYear = today.getFullYear();

    //To get first and last day for week type
    var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6
    var firstdayWeek = new Date(today.setDate(first)).getDate();
    var lastdayWeek = new Date(today.setDate(last)).getDate();

    switch (type) {
      case 'today': {
        //labels initialization
        this.responseChartLabels.push('12:00 AM');
        for (let i = 1; i < 12; i++) {
          this.responseChartLabels.push(i + ':00 AM');
        }
        this.responseChartLabels.push('12:00 PM');
        for (let i = 1; i < 12; i++) {
          this.responseChartLabels.push(i + ':00 PM');
        }
        this.noGraphTitle = 'No Survey Data for Today'; //No Graph content

        //values initialization
        for (let i = 0; i < 24; i++) {
          this.responseList.push(0);
        }
        for (let i = 0; i < this.responseTimestampList.length; i++) {
          let curDateFormat = curYear + '-' + curMonth + '-' + curDate;
          let dateTime = String(this.responseTimestampList[i]).substr(0, 10);
          let hourTime = String(this.responseTimestampList[i]).substr(11, 2);

          if (String(dateTime) === curDateFormat) {
            if (hourTime === '00') {
              //to convert 00 to 0 for fixing the index in responseList
              hourTime = '0';
            }
            this.responseList[+hourTime] = this.responseList[+hourTime] + 1;
            this.isResponseTimelineChartContainsData = true;
          }
        }
        break;
      }
      case 'week': {
        //labels initialization
        this.responseChartLabels = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        this.noGraphTitle = 'No Survey Data for this Week'; //No Graph content
        //values initialization
        for (let i = 0; i < 7; i++) {
          this.responseList.push(0);
        }
        for (let i = 0; i < this.responseTimestampList.length; i++) {
          let resDate = String(this.responseTimestampList[i]).substr(8, 2);
          let resMonth = String(this.responseTimestampList[i]).substr(5, 2);
          let resYear = String(this.responseTimestampList[i]).substr(0, 4);

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
            this.responseList[+resDate - firstdayWeek] =
              this.responseList[+resDate - firstdayWeek] + 1;
            this.isResponseTimelineChartContainsData = true;
          }
        }
        break;
      }
      case 'month': {
        //labels initialization
        this.responseChartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        this.noGraphTitle = 'No Survey Data for this Month'; //No Graph content
        //values initialization
        for (let i = 0; i < 4; i++) {
          this.responseList.push(0);
        }
        for (let i = 0; i < this.responseTimestampList.length; i++) {
          let resDate = String(this.responseTimestampList[i]).substr(8, 2);
          let resMonth = String(this.responseTimestampList[i]).substr(5, 2);
          let resYear = String(this.responseTimestampList[i]).substr(0, 4);

          if (resMonth === curMonth && +resYear === curYear) {
            if (1 <= +resDate && +resDate <= 7) {
              this.responseList[0] = this.responseList[0] + 1;
              this.isResponseTimelineChartContainsData = true;
            } else if (8 <= +resDate && +resDate <= 14) {
              this.responseList[1] = this.responseList[1] + 1;
              this.isResponseTimelineChartContainsData = true;
            } else if (15 <= +resDate && +resDate <= 21) {
              this.responseList[2] = this.responseList[2] + 1;
              this.isResponseTimelineChartContainsData = true;
            } else {
              this.responseList[3] = this.responseList[3] + 1;
              this.isResponseTimelineChartContainsData = true;
            }
          }
        }
        break;
      }
      case 'year': {
        //labels initialization
        this.responseChartLabels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        this.noGraphTitle = 'No Survey Data for this Year'; //No Graph content
        //values initialization
        for (let i = 0; i < 12; i++) {
          this.responseList.push(0);
        }
        for (let i = 0; i < this.responseTimestampList.length; i++) {
          let resDate = String(this.responseTimestampList[i]).substr(5, 2);
          let resYear = String(this.responseTimestampList[i]).substr(0, 4);

          if (resDate.substr(0, 1) === '0') {
            resDate = resDate.substr(1);
          }
          if (+resYear === curYear) {
            this.responseList[+resDate - 1] =
              this.responseList[+resDate - 1] + 1;
            this.isResponseTimelineChartContainsData = true;
          }
        }
        break;
      }
    }
    this.responseChartData = [
      {
        data: this.responseList,
        label: 'Responses',
      },
    ];
  }
  responseChartType = 'bar';
  responseChartColors: Color[] = [{ backgroundColor: '#f691b1' }];

  responseChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          time: {
            unit: 'date',
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            maxTicksLimit: 7,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function (value) {
              if (0 <= value && value < 1000) {
                return value;
              } else if (1000 <= value && value < 100000) {
                return value / 1000 + 'K';
              } else {
                return value / 1000000 + 'M';
              }
            },
          },
          gridLines: {
            color: 'rgb(234, 236, 244)',
            zeroLineColor: 'rgb(234, 236, 244)',
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2],
          },
        },
      ],
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
      easing: this.animationValue,
    },
    tooltips: {
      backgroundColor: 'rgb(255,255,255)',
      bodyFontColor: '#858796',
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
      callbacks: {
        label: function (tooltipItem, chart) {
          var datasetLabel =
            chart.datasets[tooltipItem.datasetIndex].label || '';
          if (0 <= tooltipItem.yLabel && tooltipItem.yLabel < 1000) {
            return datasetLabel + ':' + tooltipItem.yLabel;
          } else if (
            1000 <= tooltipItem.yLabel &&
            tooltipItem.yLabel < 100000
          ) {
            return datasetLabel + ':' + tooltipItem.yLabel / 1000 + 'K';
          } else {
            return datasetLabel + ':' + tooltipItem.yLabel / 1000000 + 'M';
          }
        },
      },
    },
  };
}
