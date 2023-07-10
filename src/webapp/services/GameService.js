import axios from "axios";

let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}

const API_URL = `${protocol}${hostname}/api`;

export default class GameService{

    checkExistingGame( gameId ){
        return axios.get(
            API_URL + `/game/check/${gameId}`,
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        );
    }

    setupNewHostGame(){
        return axios.post(
            API_URL + "/game/host",
            {},
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        );
    }

    setupJoinGame( code ){
        return axios.get(
            API_URL + "/game/join/setup/" + code,
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        );
    }

    getBoardToGame( gameId ){
        return axios.get(
            API_URL + `/game/${gameId}/board`,
            {
                withCredentials: true,
            }
        );
    }
    
}

export const GAME_STATES = Object.freeze({
	none: "gameUndefined",
  init: "initializing",
  joining: "joining",
  waiting: "waiting",
  inProgress: "inProgress",
  ended: "ended",
});

export const QUESTION_TYPES = Object.freeze({
  textQuestion: "Simple question with text",
  multilineQuestion: "Question with multiline text",
  imageQuestion: "Question with text and image(s)",
  audioQuestion: "Question with text and audio",
})

export const ANSWER_TYPES = Object.freeze({
  textAnswer: "Answer with text",
  imageAnswer: "Answer with text and image",
})

export const ANSWER_INTERACTION = Object.freeze({
  buzzerInteraction: "Buzzer",
  freeTextInteraction: "Free Text",
})