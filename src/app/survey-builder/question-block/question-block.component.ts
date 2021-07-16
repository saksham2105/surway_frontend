import { Component, HostListener, Input, OnInit } from '@angular/core';
import { QuestionModel } from 'src/services/builder/question.model';
import { SurveyModel } from 'src/services/builder/survey.model';
import { BuilderService } from 'src/services/builder/builder.service';

@Component({
  selector: 'app-question-block',
  templateUrl: './question-block.component.html',
  styleUrls: ['./question-block.component.scss'],
})
export class QuestionBlockComponent implements OnInit {
  question: QuestionModel;
  currentSliderValue: number;
  sliderMin: number;
  sliderMax: number;
  isPreviewMode: Boolean;
  range: HTMLInputElement = <HTMLInputElement>document.getElementById('range');
  rangeV: HTMLInputElement = <HTMLInputElement>(
    document.getElementById('rangeV')
  );

  @Input() questionPos: number;

  @Input() colorTheme: string;
  colorTheme2: string;
  constructor(private builderService: BuilderService) {}
  ngOnInit(): void {
    this.builderService.isPreviewMode$.subscribe((val) => {
      this.isPreviewMode = val;
    });
    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.question = survey.questions[this.questionPos];
      if (this.question.questionCategory.categoryName === 'slider') {
        this.currentSliderValue = this.question.sliderMinValue;
        this.sliderMin = this.question.sliderMinValue;
        this.sliderMax = this.question.sliderMaxValue;
      }
    });
    // document.addEventListener("DOMContentLoaded", this.setValue);
    // this.range.addEventListener('input', this.setValue);
  }
  //Add new question block
  addQuestion() {
    this.builderService.addQuestion(this.questionPos + 1);
  }
  //Delete question from survey
  deleteQuestion(): void {
    this.builderService.deleteQuestion(this.questionPos);
  }

  //Edit question
  editQuestion(): void {
    // console.log('clicked pen icon');
    this.builderService.editQuestion(this.questionPos);
  }

  // setValue(): void {
  //   let newValue = Number((+this.range.value - +this.range.min) * 100 / (+this.range.max - +this.range.min));
  //   const newPosition = 10 - (newValue * 0.2);
  //   this.rangeV.innerHTML = `<span>${this.range.value}</span>`;
  //   this.rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
  // };
}
