import { QuestionCategory } from './questionCategory.model';

export class QuestionModel {
  constructor(
    public title: string,
    public isMandatory: boolean,
    public questionCategory: QuestionCategory,
    public options: Array<string>,
    public expectedAnswer: Array<string> | null,
    public expectedTime: number | null,
    public sliderMinValue: number,
    public sliderMaxValue: number
  ) {}
}
