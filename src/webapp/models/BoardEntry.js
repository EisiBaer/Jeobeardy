export default class BoardEntry{

  constructor( questionArray, answer, points ){
    this.questions = questionArray;
    this.answer = answer;
    this.points = points;
    this.isAnswered = false;
  }

}