import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { BuilderService } from 'src/services/builder/builder.service';
import { QuestionModel } from 'src/services/builder/question.model';
import { SurveyModel } from 'src/services/builder/survey.model';

@Component({
  selector: 'app-answer-editor',
  templateUrl: './answer-editor.component.html',
  styleUrls: ['./answer-editor.component.scss']
})
export class AnswerEditorComponent implements OnInit {

  form: FormGroup;
  faWindowClose = faWindowClose;
  optionsLength: number;

  survey: SurveyModel;
  question: QuestionModel;
  @Input() editQuestionPos: number;
  @Output() emitEvent = new EventEmitter<Array<string>>();

  constructor(private formBuilder: FormBuilder, private builderService: BuilderService) {
  }

  ngOnInit(): void {
    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.survey = survey;
      this.question = this.survey.questions[this.editQuestionPos];
      // this.optionsLength = this.question.expectedAnswer.length;
    })
    let answers = this.formBuilder.array([]);
    answers.push(this.formBuilder.control(this.question.expectedAnswer));

    this.form = this.formBuilder.group({
      answers
    })
  }
  //getter for options
  get answers(): FormArray {
    return this.form.get('answers') as FormArray;
  }

  //Adds new option to the question
  addNewAnswer(): void {
    let item: string = 'Answer-' + (this.answers.length + 1);
    this.answers.push(this.formBuilder.control(item));
    this.saveForm();
  }

  //removes options from option form
  removeAnswer(index: number): void {
    this.answers.removeAt(index);
    this.saveForm();
  }

  //Save the mini form
  saveForm(): void {
    if (this.form.invalid) {
      console.log("Invalid options form");
      return;
    } else {
      this.builderService.updatedSurvey$.next(this.survey);
      this.builderService.survey = this.survey;
      console.log('Saved answers form!');
      this.emitEvent.emit(this.answers.getRawValue());
    }
  }


  // Selects content
  selectContent(event): void {
    event.target.select();
  }
}
