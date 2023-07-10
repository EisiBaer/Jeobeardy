import { ANSWER_TYPES } from "../services/GameService";

export default class Answer{
  constructor( text, answerTypeOpt = "textAnswer", answerInteraction = "buzzerInteraction" ){
    this.answerText = text;
    this.answerType = answerTypeOpt;
    this.answerInteraction = answerInteraction;
  }

  // get answerText(){
  //   return this.answerText;
  // }

  // get answerType(){
  //   return this.answerType;
  // }

}