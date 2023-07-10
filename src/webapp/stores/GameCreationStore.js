import { defineStore } from "pinia";

import Question from "@/models/Question";
import UserService from "@/services/UserService";
import Answer from "@/models/Answer";
import BoardEntry from "../models/BoardEntry";
import Board from "@/models/Board";
import Category from "@/models/Category";
import { boardResponseToBoardModel } from "@/services/util";

const uService = new UserService();


export const useGameCreationStore = defineStore('gameCreation', {
  state: ()=>{
    return {
      board: new Board( undefined, "New Board", []),
      images: [],
      audios: [],
      answerImages: [],
    }
  },
  actions: {
    addNewCategory(){
      let newCategory = new Category("Category " + ( this.board.categories.length + 1 ), "", [] );
      this.board.categories.push( newCategory );
    },
    deleteCategoryOnIndex( index ){
      this.board.splice( index, 1 );
    },
    addEmptyBoardEntryToCategoryOnIndex( cIndex ){
      let question = new Question( "", "textQuestion" );
      let answer = new Answer( "", "textAnswer", "buzzerInteraction");
      let questions = []
      questions.push( question );
      this.board.categories[cIndex].boardEntries.push( new BoardEntry( questions, answer, 100, false ) );
    },
    addEmptyQuestionToBoardEntry( cIndex, boardEntryIndex, insertIndex ){
      let question = new Question( "", "textQuestion" );
      this.board.categories[cIndex].boardEntries[boardEntryIndex].questions.splice( insertIndex, 0, question );
    },
    removeQuestionFromBoardEntry( cIndex, boardEntryIndex, removeIndex ){
      if( this.board.categories[cIndex].boardEntries[boardEntryIndex].questions.length > 1 ){
        this.board.categories[cIndex].boardEntries[boardEntryIndex].questions.splice( removeIndex, 1 );
      }
    },
    addBoardEntryToCategoryOnIndex( boardEntry, cIndex ){
      this.board.categories[cIndex].boardEntries.push( boardEntry );
    },
    setBoardEntryOnCategoryOnIndex( index, boardEntry, cIndex ){
      if( index >= this.board.categories[cIndex].boardEntries.length || index < 0  ){
        return false;
      }
      this.board.categories[cIndex].boardEntries[index] = boardEntry;
    },
    deleteBoardEntry( cIndex, boardEntryIndex ){
      this.board.categories[cIndex].boardEntries.splice( boardEntryIndex, 1 );
    },
    addImageToQuestion( cIndex, bEIndex, questionIndex, file ){
      let fileObj = {
        cIndex: cIndex,
        bEIndex: bEIndex,
        qIndex: questionIndex,
        data: file,
        url: URL.createObjectURL( file ),
      };
      let imageIndex = this.images.findIndex( imageEntry => imageEntry.cIndex === cIndex && imageEntry.bEIndex === bEIndex && imageEntry.qIndex === questionIndex )
      if( imageIndex === -1 ){
        this.images.push( fileObj );
      } else {
        this.images.splice( imageIndex, 1, fileObj );
      }
    },
    addImageToAnswer( cIndex, bEIndex, file ){
      let fileObj = {
        cIndex: cIndex,
        bEIndex: bEIndex,
        data: file,
        url: URL.createObjectURL( file ),
      };
      let imageIndex = this.answerImages.findIndex( imageEntry => imageEntry.cIndex === cIndex && imageEntry.bEIndex === bEIndex );
      if( imageIndex === -1 ){
        this.answerImages.push( fileObj );
      } else {
        this.answerImages.splice( imageIndex, 1, fileObj );
      }
    },
    addAudioToQuestion( cIndex, bEIndex, questionIndex, file ){
      let fileObj = {
        cIndex: cIndex,
        bEIndex: bEIndex,
        qIndex: questionIndex,
        data: file,
        url: URL.createObjectURL( file ),
      };
      let audioIndex = this.audios.findIndex( imageEntry => imageEntry.cIndex === cIndex && imageEntry.bEIndex === bEIndex && imageEntry.qIndex === questionIndex )
      if( audioIndex === -1 ){

        this.audios.push( fileObj );
      } else {
        this.audios.splice( audioIndex, 1, fileObj );
      }
    },
    setBoardWithConversion( board ){
      this.board = boardResponseToBoardModel( board );
    },

    saveBoard(){
      return new Promise( ( resolve, reject ) => {
        let saveBoard = JSON.parse( JSON.stringify( this.board ) );
        let formData = new FormData();
        formData.set("board", JSON.stringify( saveBoard ) );
        for( let imageData of this.images ){
          let formDataName = imageData.cIndex + ":" + imageData.bEIndex + ":" + imageData.qIndex;
          formData.append( "images", imageData.data, formDataName );
        }
        for( let imageData of this.answerImages ){
          let formDataName = imageData.cIndex + ":" + imageData.bEIndex + ":answer";
          formData.append( "images", imageData.data, formDataName );
        }
        for( let audioData of this.audios ){
          let formDataName = audioData.cIndex + ":" + audioData.bEIndex + ":" + audioData.qIndex;
          formData.append( "audio", audioData.data, formDataName );
        }
        uService.saveUserBoard( formData )
        .then( ( response ) => {
          if( !response.data.success ){
            throw new Error( response.data );
          } else {
            this.setBoardWithConversion( response.data.board );
            this.images = [];
            this.answerImages = [];
            this.audios = [];
            resolve();
          }
        })
        .catch( ( error ) => {
          reject( error );          
        });

      })
    },

    saveImagesOfBoard(){
      return new Promise( ( resolve, reject ) => {
      });
    }
  }
})