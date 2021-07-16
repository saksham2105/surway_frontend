import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BuilderService } from 'src/services/builder/builder.service';
import { QuestionModel } from 'src/services/builder/question.model';
import { SurveyModel } from 'src/services/builder/survey.model';

@Component({
  selector: 'app-option-editor',
  templateUrl: './option-editor.component.html',
  styleUrls: ['./option-editor.component.scss']
})
export class OptionEditorComponent implements OnInit {

  form: FormGroup;
  question: QuestionModel;
  @Input() editQuestionPos: number;
  @Output() emitEvent = new EventEmitter<Array<string>>();

  constructor(private formBuilder: FormBuilder, private builderService: BuilderService) {
  }

  ngOnInit(): void {
    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.question = survey.questions[this.editQuestionPos];
    })
    let questionOptions = this.question.options;
    let options = this.formBuilder.array([]);
    questionOptions.forEach((option, index) => {
      options.push(this.formBuilder.control(option));
    });
    this.form = this.formBuilder.group({
      options
    });
  }
  //getter for options
  get options() {
    return this.form.get('options') as FormArray;
  }

  //Adds new option to the question
  addNewOption() {
    let item: string = 'Option-' + (this.options.length + 1);
    this.options.push(this.formBuilder.control(item));
    this.saveForm();
  }

  //removes options from option form
  removeOption(index: number) {
    this.options.removeAt(index);
    this.saveForm();
  }

  //Save the mini form
  saveForm() {
    if (this.form.invalid) {
      console.log("Invalid options form");
      return;
    } else {
      console.log('Saved options form!');
      this.emitEvent.emit(this.options.getRawValue());
    }
  }
}
