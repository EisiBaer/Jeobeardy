
const BoardModel = require("../models/BoardModel");
const ImageModel = require("../models/ImageModel");

exports.listBoards = (req, res) => {
  return new Promise((resolve, reject) => {
    BoardModel.find({})
      .then((boards) => {
        resolve(boards);
      })
      .catch((err) => {
        reject( err );
      });
  });
};

exports.findBoard = ( boardId ) => {
  return new Promise((resolve, reject) => {
    BoardModel.findOne({ _id: boardId })
      .then( ( board ) => {
        if( board === null ){
          let userNotFoundError = new Error(`No board found with id "${boardId}"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        } else {
          resolve( board );
        }
      })
      .catch( ( err ) => {
        reject ( err );
      });
  });
};

exports.isBoardFromUser = ( boardId, userId ) => {
  return new Promise((resolve, reject) => {
    BoardModel.findOne({ _id: boardId, ownerId: userId })
      .then( ( board ) => {
        resolve( board !== null );
      })
      .catch( ( err ) => {
        reject ( err );
      });
  });
};

exports.addBoard = ( postObject, ownerId ) => {
  return new Promise((resolve, reject) => {
    BoardModel.findOne({ _id: postObject.boardId })
      .then( ( board ) => {
        if ( board === null ) {
          //TODO validate postObject at some point!
          let newBoard = new BoardModel({
            ownerId: ownerId,
            name: postObject.boardName,
            categories: postObject.categories,
          });
          return newBoard.save();
        } else {
          board.setFromPostObject = postObject;
          return board.save();
        }
      })
      .then( ( board ) => {
        resolve( board );
      })
      .catch((err) => {
        reject( err );
      });
  });
};

exports.addUploadedImages = ( imagesArray, ownerId ) => {
  return new Promise((resolve, reject) => {
    let imageArray = [];
    for( let iIdx in imagesArray ){
      let imageIndex = Number(iIdx);
      let indices = imagesArray[imageIndex].originalname.split(":");
      let image = new ImageModel({
        ownerId: ownerId,
        categoryIndex: indices[0],
        boardEntryIndex: indices[1],
        questionIndex: indices[2],
        filename: imagesArray[imageIndex].filename,
      });
      imageArray.push( image );
    }
    ImageModel.bulkSave( imageArray )
    .then( ( images ) => {
      if( images ){
        resolve( images );
      }
      reject( new Error("Error while persisting image References") );
    } )
    .catch( ( err ) => {
      reject( err );
    })
  });
};