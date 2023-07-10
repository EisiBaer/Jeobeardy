import { QUESTION_TYPES } from "@/services/GameService";

export default class Question{
  constructor( text, questionTypeOpt = QUESTION_TYPES.textQuestion ){
    this.questionText = text;
    this.questionType = questionTypeOpt;
  }

  // get questionText(){
  //   return this.questionText;
  // }
  
  // set questionText( newQuestionText ){
  //   this.questionText = newQuestionText;
  // }

  // get questionType(){
  //   return this.questionType;
  // }

}