import { Component, OnDestroy, OnInit } from '@angular/core';

import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { UserService } from 'src/services/user/user.service';
import { RecentSurveyModel } from './recentsurvey.model';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  // //Different Animations for charts
  // easing: Easing = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' |
  //   'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInSine' | 'easeOutSine' |
  //   'easeInOutSine' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInElastic' |
  //   'easeOutElastic' | 'easeInOutElastic' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';

  animationValue: string = 'linear';

  countSurveys: string = '0';
  surveyResponses: string = '0';
  surveyAvgTimeTaken: string = '0 (secs)';
  huCoins = '0';
  surveyViews = '0';
  countGroups = '0';
  recentSurveys: RecentSurveyModel[] = [];

  isLoading: Boolean = false;
  email: string = '';

  dashboardSubs: Subscription;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Dashboard');
  }

  ngOnInit(): void {
    // this.initList();

    if (localStorage.getItem('userCookies')) {
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }

    this.userService.isUserDashboardLoading.subscribe((flag) => {
      this.isLoading = flag;
    });
    this.getDashboardDetails(this.email);
  }

  ngOnDestroy(): void {
    if (this.dashboardSubs != null) {
      this.dashboardSubs.unsubscribe();
    }
  }

  onClickAllSurveysDashboard() {
    this.userService.isMySurveyLoading.next(true);
  }

  /** Data List based on dashboard APIs */
  // monthBasedResponseList: MonthBasedResponseModel[] = [];
  surveyCategorizeValues = [];
  surveyCategorizeChartLabels = [];
  viewsMonthValues = [];
  responsesMonthValues = [];
  engagementRate = 0.0;
  emptyAreaRate = 0.0;
  viewsRadarValues = [];
  responsesRadarValues = [];
  radarChartLabels: Label[] = [];

  onDashboardGenerateReport() {
    document.getElementById('dashboard-generate-btn').style.visibility =
      'hidden';

    let data = document.getElementById('dashboard-container');
    var currentPosition = data.scrollTop;
    var w = data.offsetWidth;
    var h = data.offsetHeight;
    data.style.height = 'auto';

    html2canvas(data).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      // let pdf = new jspdf('p', 'mm', 'a4');
      let pdf = new jspdf('p', 'mm', [w, h]);
      var imgWidth = 208;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(contentDataURL, 'PNG', 0, 0, w, h, '', 'FAST');
      // pdf.addPage();
      pdf.save('Dashboard_Report.pdf');
    });
    // data.style.height = '100px';
    data.scrollTop = currentPosition;
    document.getElementById('dashboard-generate-btn').style.visibility =
      'visible';
  }

  private getDashboardDetails(email: string) {
    this.userService.isUserDashboardLoading.next(true);
    this.dashboardSubs = this.authService
      .authenticateUser()
      .subscribe((res: any) => {
        let token = res.token;
        this.userService
          .getDashboardDetails(email, token)
          .subscribe((response: any) => {
            if (response.success) {
              console.log(JSON.stringify(response));
              let cnt = 0;

              //Top Cards Data
              //Total Surveys
              let totalNoOfSurveys = response.message.surveysCount;
              this.countSurveys = String(totalNoOfSurveys);

              //Total Survey Responses
              let surveyResponseCount = 0;
              if (response.message.surveyResponses != null) {
                cnt = response.message.surveyResponses.length;
              }
              for (let i = 0; i < cnt; i++) {
                surveyResponseCount +=
                  response.message.surveyResponses[i].surveyResponseList.length;
              }
              this.surveyResponses = String(surveyResponseCount);

              //Average Time taken
              let averageTimeTakenCount = 0.0;
              if (response.message.averageTimeTaken != null) {
                cnt = response.message.averageTimeTaken.length;
              }
              for (let i = 0; i < cnt; i++) {
                averageTimeTakenCount +=
                  response.message.averageTimeTaken[i].averageTimeTaken;
              }
              if (averageTimeTakenCount > 0.0) {
                this.surveyAvgTimeTaken =
                  String(
                    (averageTimeTakenCount / (1.0 * totalNoOfSurveys)).toFixed(
                      2
                    )
                  ) + '(secs)';
              }

              //HU Coins
              this.huCoins = response.message.huCoins;

              //Views
              this.surveyViews = response.message.overAllViews;

              //Count Groups
              this.countGroups = response.message.groupsCount;

              //Recent 5 Surveys
              if (response.message.topRecentSurveys != null) {
                cnt = response.message.topRecentSurveys.length;
              }
              for (let i = 0; i < cnt; i++) {
                const recentSurveyModel = new RecentSurveyModel(
                  response.message.topRecentSurveys[i].name,
                  response.message.topRecentSurveys[i].surveyCategory,
                  response.message.topRecentSurveys[i].timestamp
                );
                this.recentSurveys.push(recentSurveyModel);
              }

              //Overall Views + Views & Response Chart Data
              if (response.message.monthBasedResponseList != null) {
                cnt = response.message.monthBasedResponseList.length;
              }
              for (let i = 0; i < cnt; i++) {
                //need to change api sorting order as month wise
                this.viewsMonthValues.push(
                  response.message.monthBasedResponseList[i].views
                );
                this.responsesMonthValues.push(
                  response.message.monthBasedResponseList[i].responsesCount
                );
              }

              //Survey Categorization Chart Data
              if (response.message.categoryWiseSurveys != null) {
                cnt = response.message.categoryWiseSurveys.length;
              }
              for (let i = 0; i < cnt; i++) {
                this.surveyCategorizeChartLabels.push(
                  response.message.categoryWiseSurveys[i].category
                );
                this.surveyCategorizeValues.push(
                  response.message.categoryWiseSurveys[i].surveyCount
                );
              }

              //Engagement Rate Chart Data
              if (response.message.surveyEngagementRates != null) {
                cnt = response.message.surveyEngagementRates.length;
              }
              let engageRates = 0.0;
              for (let i = 0; i < cnt; i++) {
                engageRates +=
                  response.message.surveyEngagementRates[i].engagementRate;
              }
              if (engageRates > 0.0) {
                this.engagementRate = +(
                  engageRates /
                  (1.0 * totalNoOfSurveys)
                ).toFixed(2);
              }
              this.engagementRate = this.engagementRate * 20;
              this.emptyAreaRate = 100 - this.engagementRate;
              this.engageChartData = [
                {
                  data: [this.engagementRate, this.emptyAreaRate],
                  backgroundColor: ['#19726b', '#e5efee'],
                  hoverBackgroundColor: ['#00635b', '#eaf2f1'],
                  hoverBorderColor: 'rgba(234, 236, 244, 1)',
                },
              ];

              //Views vs Response Category Wise Chart Data
              if (
                response.message.categoryWiseSurveyViewsAndResponsesList != null
              ) {
                cnt =
                  response.message.categoryWiseSurveyViewsAndResponsesList
                    .length;
              }
              for (let i = 0; i < cnt; i++) {
                this.radarChartLabels.push(
                  response.message.categoryWiseSurveyViewsAndResponsesList[i]
                    .surveyCategory
                );
                this.viewsRadarValues.push(
                  response.message.categoryWiseSurveyViewsAndResponsesList[i]
                    .views
                );
                this.responsesRadarValues.push(
                  response.message.categoryWiseSurveyViewsAndResponsesList[i]
                    .numberOfResponses
                );
              }
            } else {
              //failure of api
            }
            this.userService.isUserDashboardLoading.next(false);
          });
      });
  }

  /**********************************************************************/
  /********************* Overall Views Chart ****************************/
  /**********************************************************************/

  overallViewChartType = 'line';
  overallViewChartLabels: Label[] = [
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
  overallViewChartData: ChartDataSets[] = [
    {
      label: 'Views',
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
      data: this.viewsMonthValues,
    },
  ];
  overallViewChartOptions = {
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
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
    },
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

  /******************************************************************************/
  /********************* Survey Categorization Chart ****************************/
  /******************************************************************************/

  surveyCategorizeChartType = 'pie';
  surveyCategorizeChartData: ChartDataSets[] = [
    {
      data: this.surveyCategorizeValues,

      backgroundColor: ['#dbb7fc', '#f691b1', '#9eb183', '#c18a81', '#66bbee'],
      hoverBackgroundColor: [
        '#c388fb',
        '#f0487d',
        '#5e7e31',
        '#993d2e',
        '#008ee3',
      ],
      hoverBorderColor: 'rgba(234, 236, 244, 1)',
    },
  ];
  surveyCategorizeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 2000,
      easing: this.animationValue,
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
    },
    tooltips: {
      backgroundColor: 'rgb(255,255,255)',
      bodyFontColor: '#858796',
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },

    cutoutPercentage: 0,
  };

  /**************************************************************************/
  /********************* Views & Responses Chart ****************************/
  /**************************************************************************/
  //Views and Response Monthly

  viewsResponseChartType = 'bar';
  viewsResponseChartLegend = true;
  viewsResponseChartLabels = [
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
  viewsResponseChartColors: Color[] = [
    { backgroundColor: '#dbb7fc' },
    { backgroundColor: '#f691b1' },
  ];
  viewsResponseChartData = [
    {
      data: this.viewsMonthValues,
      label: 'Views',
    },
    {
      data: this.responsesMonthValues,
      label: 'Responses',
    },
  ];
  viewsResponseChartOptions = {
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
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: this.animationValue,
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
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

  /************************************************************************/
  /********************* Engagement Rate Chart ****************************/
  /************************************************************************/

  engageChartType = 'doughnut';
  engageChartLabels = ['Engagement Rate', 'Empty Rate'];
  engageChartData: ChartDataSets[] = [
    {
      data: [this.engagementRate, this.emptyAreaRate],
      backgroundColor: ['#19726b', '#e5efee'],
      hoverBackgroundColor: ['#00635b', '#eaf2f1'],
      hoverBorderColor: 'rgba(234, 236, 244, 1)',
    },
  ];

  engageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 2000,
      easing: this.animationValue,
    },
    tooltips: {
      backgroundColor: 'rgb(255,255,255)',
      bodyFontColor: '#858796',
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
    },
    cutoutPercentage: 90,
  };

  /****************************************************************************************/
  /********************* Views vs Response Category Wise Chart ****************************/
  /****************************************************************************************/

  radarChartType = 'radar';

  radarChartData: ChartDataSets[] = [
    { data: this.viewsRadarValues, label: 'Views' },
    { data: this.responsesRadarValues, label: 'Response' },
  ];
  radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: this.animationValue,
    },
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 12,
        usePointStyle: true,
      },
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
