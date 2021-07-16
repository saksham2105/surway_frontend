import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Template } from 'src/app/user/user-templates/template.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserCookieModel } from '../auth/userCookie.model';
import { SurveyModel } from '../builder/survey.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user = new BehaviorSubject<UserCookieModel>(null);
  //side-bar loading issue, on tap of home icon and survey icon because of same component loading again and again
  sideBarHomeIconCall = new BehaviorSubject<Boolean>(false);

  isAssignedSurveyLoading = new BehaviorSubject<Boolean>(true);
  isUserDashboardLoading = new BehaviorSubject<Boolean>(true);
  isPublicSurveyLoading = new BehaviorSubject<Boolean>(true);
  isMySurveyLoading = new BehaviorSubject<Boolean>(true);
  isContactGroupLoading = new BehaviorSubject<Boolean>(true);
  isGroupCreatedUpdated = new BehaviorSubject<Boolean>(false);
  isTimeLineLoading = new BehaviorSubject<Boolean>(false);
  isStatsLoading = new BehaviorSubject<Boolean>(true);
  purchase = new BehaviorSubject<Boolean>(false);
  isTemplateLoading = new BehaviorSubject<Boolean>(false);

  isBackFromTemplate = new BehaviorSubject<Boolean>(false);
  isMySurveyModal = new BehaviorSubject<Boolean>(false);

  constructor(private authService: AuthService, private http: HttpClient) {}

  //Is called by component to fetch user-details from service
  subscribeUser() {
    this.user.next(JSON.parse(localStorage.getItem('userCookies')));
  }

  /** This function is used for getting image paths dynamically for different category */
  getImagePath(category: string): string {
    /** Asset Paths */
    let researchImagePath = './../../assets/research.jpg';
    let educationImagePath = './../../assets/education.jpg';
    let eventsImagePath = './../../assets/events.jpg';
    let hrImagePath = './../../assets/human-resource.jpg';
    let customerImagePath = './../../assets/customer-satisfaction.jpg';

    switch (category) {
      case 'research':
        return researchImagePath;
      case 'education':
        return educationImagePath;
      case 'events':
        return eventsImagePath;
      case 'hr':
        return hrImagePath;
      case 'customer':
        return customerImagePath;
    }
  }

  //This function is used to fetch the assigned User surveys to show in dashboard
  getUserAssignedSurveys(email: string, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/getAssignedSurveyToUser',
      data,
      header
    );
  }

  //This function is used to fetch all the public surveys in portal/DB
  getAllPublicSurveys(token: string, email: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/getAllPublicSurveys/' + email,
      header
    );
  }

  /** ---------------------------------CREATOR SIDE APIs------------------------------------------------------ */

  //This function is used to fetch dashboard APIs
  getDashboardDetails(email: string, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL +
        '/surway/survey/getDashboardDetailsOfUser/' +
        email,
      header
    );
  }

  //This function is used to fetch all the surveys made by the creator
  getCreatorMySurveys(email: string, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/getSurveyByMail',
      data,
      header
    );
  }

  //This function is used to enable the surveys
  enableSurvey(token: string, id: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/enableSurvey/' + id,
      header
    );
  }

  //This function is used to disable the surveys
  disableSurvey(token: string, id: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/disableSurvey/' + id,
      header
    );
  }

  //This function is used to delete the surveys
  deleteSurvey(token: string, surveyID: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/deleteSurvey/' + surveyID,
      header
    );
  }

  //This function is used to create group by the creator
  addCreatorGroup(
    token: string,
    groupName: string,
    email: string,
    listOfMembers: Array<string>
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      name: groupName,
      userMail: email,
      members: listOfMembers,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/addToGroup',
      data,
      header
    );
  }

  //This function is used to edit group details by the creator
  editCreatorGroup(
    token: string,
    groupID: string,
    groupName: string,
    email: string,
    listOfMembers: Array<string>
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      id: groupID,
      name: groupName,
      userMail: email,
      members: listOfMembers,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/editGroup',
      data,
      header
    );
  }

  //This function is used to fetch all the creators groups, if any
  getCreatorGroupList(email: string, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/getMyGroups',
      data,
      header
    );
  }

  //This function is used to delete the group
  deleteCreatorGroup(
    token: string,
    groupId: string,
    email: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      id: groupId,
      userMail: email,
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/deleteGroup',
      data,
      header
    );
  }

  //This function is used to fetch all the hu coins timeline
  fetchHUCoinsTimeline(token: string, email: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/purchase/getHuCoinsTimeline/' + email,
      header
    );
  }

  //This function is used to fetch all the hu coins timeline
  fetchActivityTimeline(token: string, email: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/survey/getUserHistory/' + email,
      header
    );
  }

  //This function is used to fetch the statistics of survey by survey ids
  fetchStatistics(token: string, surveyID: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/statistics/' + surveyID,
      header
    );
  }

  //This API is used to assign the survey to list of emails
  assignSurveyToEmails(
    token: string,
    fromUserEmail: string,
    toUsersList: Array<string>,
    surveyID: string
  ) {
    let data = {
      fromUser: fromUserEmail,
      toUsers: toUsersList,
      surveyId: surveyID,
    };

    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/assignSurvey',
      data,
      header
    );
  }

  // assigns a survey to a group
  assignSurveyToGroup(
    token: string,
    surveyId: string,
    groupId: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL +
        '/surway/survey/assignSurveyUsingGroup/' +
        groupId +
        '/' +
        surveyId,
      header
    );
  }
  //This function is used to save the survey model at the time of launch
  launchAddSurvey(token: string, surveyData: SurveyModel): Observable<any> {
    let data = { survey: surveyData };
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/add',
      surveyData,
      header
    );
  }
  //This function is used to save the survey model at the time of launch
  launchEditSurvey(token: string, surveyData: SurveyModel): Observable<any> {
    let data = { survey: surveyData };
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/editSurvey',
      data,
      header
    );
  }

  // sends a mail to group members that survey has been assigned
  sendMail(
    token: string,
    usersList: Array<string>,
    surveyId: string
  ): Observable<any> {
    let data = { toUsers: usersList };
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.post(
      this.authService.baseURL + '/surway/survey/sendMail/' + surveyId,
      data,
      header
    );
  }

  //fetch list of allowed users
  fetchAllowedUsers(token: string, surveyId: string): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL +
        '/surway/survey/getAllowedUsersForSurvey/' +
        surveyId,
      header
    );
  }

  // get all templates
  getAllTemplatesByUser(token: string, userMail: string): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    return this.http.get(
      this.authService.baseURL + '/surway/getAllTemplatesByMail/' + userMail,
      header
    );
  }

  // purchase a template
  purchaseTemplate(
    token: string,
    template: Template,
    userMail: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.authService.baseURL +
        '/surway/purchase/addToPurchaseList/' +
        userMail +
        '/template/' +
        template.id +
        '/' +
        template.surveyCategory +
        '-' +
        template.color,
      header
    );
  }

  // purchase public survey
  purchasePublicSurvey(
    token: string,
    survey: SurveyModel,
    userMail: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.authService.baseURL +
        '/surway/purchase/addToPurchaseList/' +
        userMail +
        '/public_launch/' +
        survey.id +
        '/' +
        survey.name,
      header
    );
  }

  // purchase group
  purchaseGroup(token: string, userMail: string): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.authService.baseURL +
        '/surway/purchase/addToPurchaseList/' +
        userMail +
        '/group/' +
        'purchase' +
        '/' +
        'group',
      header
    );
  }

  // purchase survey count
  purchaseSurvey(token: string, userMail: string): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.authService.baseURL +
        '/surway/purchase/addToPurchaseList/' +
        userMail +
        '/survey/' +
        'purchase' +
        '/' +
        'survey',
      header
    );
  }

  // purchase report generation
  purchaseReportGeneration(
    token: string,
    surveyId: string,
    surveyName: string,
    userMail: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.authService.baseURL +
        '/surway/purchase/addToPurchaseList/' +
        userMail +
        '/report/' +
        surveyId +
        '/' +
        surveyName,
      header
    );
  }
}
