import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { UserHomeComponent } from './user/user-home/user-home.component';
import { UserComponent } from './user/user.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { UserMySurveysComponent } from './user/user-my-surveys/user-my-surveys.component';
import { UserGroupsComponent } from './user/user-groups/user-groups.component';
import { UserTemplatesComponent } from './user/user-templates/user-templates.component';
import { UserStatisticsComponent } from './user/user-statistics/user-statistics.component';
import { UserTopBarComponent } from './user/user-top-bar/user-top-bar.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthMailOtpVerificationComponent } from './auth/auth-mail-otp-verification/auth-mail-otp-verification.component';
import { AuthResetPasswordComponent } from './auth/auth-reset-password/auth-reset-password.component';
import { ProfileBlockComponent } from './profile/profile-block/profile-block.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ProfileSideBarComponent } from './profile/profile-side-bar/profile-side-bar.component';

import { MainService } from '../services/main/main.service';
import { UserService } from '../services/user/user.service';
import { AuthService } from 'src/services/auth/auth.service';
import { HttpInterceptorService } from '../services/interceptor/http-interceptor.service';

import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { BaseModalComponent } from './shared/base-modal/base-modal.component';
import { AlertComponent } from './shared/alert/alert.component';
import { GroupModalUiComponent } from './shared/group-modal-ui/group-modal-ui.component';
import { PaymentService } from 'src/services/payment/payment.service';

import { SurveyBuilderComponent } from './survey-builder/survey-builder.component';
import { QuestionBlockComponent } from './survey-builder/question-block/question-block.component';
import { QuestionEditorComponent } from './survey-builder/question-editor/question-editor.component';
import { DateQuestionComponent } from './survey-builder/question-editor/date-question/date-question.component';
import { OptionEditorComponent } from './survey-builder/question-editor/option-editor/option-editor.component';
import { AnswerEditorComponent } from './survey-builder/question-editor/answer-editor/answer-editor.component';
import { SurveyShareComponent } from './survey-builder/survey-share/survey-share.component';
import { LaunchV1Component } from './survey-builder/launch-v1/launch-v1.component';
import { SurveyErrorComponent } from './survey-builder/survey-error/survey-error.component';
import { SurveyAppearComponent } from './survey-appear/survey-appear.component';
import { AttemptQuestionComponent } from './survey-appear/attempt-question/attempt-question.component';

import { ClipboardModule } from 'ngx-clipboard';
import { UserTimelineComponent } from './user/user-timeline/user-timeline.component';
import { PaymentConfirmationModalComponent } from './shared/payment-confirmation-modal/payment-confirmation-modal.component';
import { AlertModalComponent } from './shared/alert-modal/alert-modal.component';
import { TemplatePurchaseComponent } from 'src/app/user/user-templates/template-purchase/template-purchase.component';
import { HomeComponent } from './home/home.component';
import { CaptchaService } from 'src/services/captcha/captcha.service';
import { ResponseService } from 'src/services/Survey-Response/response.service';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '404', component: ErrorPageComponent },
  { path: 'auth', component: AuthComponent },
  {
    path: 'auth/otp-mail-verification',
    component: AuthMailOtpVerificationComponent,
  },
  {
    path: 'auth/reset-password',
    component: AuthResetPasswordComponent,
  },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'builder/:id', component: SurveyBuilderComponent },
  { path: 'builder', component: SurveyBuilderComponent },
  { path: 'editSurvey/:id', component: SurveyBuilderComponent },
  { path: 'appearSurvey/:id', component: SurveyAppearComponent },
  { path: 'template', component: SurveyBuilderComponent },
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: 'home', component: UserHomeComponent },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'my-surveys', component: UserMySurveysComponent },
      { path: 'groups', component: UserGroupsComponent },
      { path: 'templates', component: UserTemplatesComponent },
      { path: 'timeline', component: UserTimelineComponent },
      { path: 'statistics', component: UserStatisticsComponent },
      { path: '404', component: ErrorPageComponent },
      { path: '**', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: 'user/404', redirectTo: '/404' },
  { path: 'home/404', redirectTo: '/404' },
  { path: '**', redirectTo: '/404' },
];
@NgModule({
  declarations: [
    AppComponent,
    SideBarComponent,
    UserHomeComponent,
    UserComponent,
    UserDashboardComponent,
    UserMySurveysComponent,
    UserGroupsComponent,
    UserTemplatesComponent,
    UserStatisticsComponent,
    UserTopBarComponent,
    AuthComponent,
    ProfileComponent,
    ProfileBlockComponent,
    LoadingSpinnerComponent,
    AuthMailOtpVerificationComponent,
    AuthResetPasswordComponent,
    BaseModalComponent,
    SubscriptionComponent,
    AlertComponent,
    ProfileSideBarComponent,
    SurveyBuilderComponent,
    QuestionBlockComponent,
    QuestionEditorComponent,
    DateQuestionComponent,
    OptionEditorComponent,
    AnswerEditorComponent,
    SurveyShareComponent,
    LaunchV1Component,
    SurveyErrorComponent,
    SurveyAppearComponent,
    AttemptQuestionComponent,
    GroupModalUiComponent,
    UserTimelineComponent,
    PaymentConfirmationModalComponent,
    AlertModalComponent,
    TemplatePurchaseComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    ChartsModule,
  ],
  providers: [
    MainService,
    UserService,
    PaymentService,
    ResponseService,
    CaptchaService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
