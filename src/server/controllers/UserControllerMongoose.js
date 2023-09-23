const bcrypt = require("bcryptjs");
const fs = require("node:fs/promises");

const UserModel = require("../models/UserModel");
const BoardModel = require("../models/BoardModel");

exports.listUsers = () => {
  return new Promise((resolve, reject) => {
    UserModel.find({}, "-password")
      .then((users) => {
        resolve(users);
      })
      .catch((err) => {
        reject( err );
      });
  });
};

exports.findUser = (username) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ _id: username }, "-password")
      .then((user) => {
        if( user === null ){
          let userNotFoundError = new Error(`No user found with username "${username}"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        } else {
          resolve(user);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.addUser = (username, password) => {
  return new Promise((resolve, reject) => {
    //Check if username is already taken before hashing the password
    UserModel.findOne({ username: username }, "-password")
      .then((user) => {
        if ( user === null ) {
          return bcrypt.hash(password, 12);
        } else {
          let userTakenError = new Error( "Username is taken!" );
          userTakenError.name = "UserTakenError";
          throw userTakenError;
        }
      })
      .then((hash) => {
        let newUser = new UserModel({
          username: username,
          password: hash,
        });
        return newUser.save();
      })
      .then((user) => {
        user.password = undefined;
        resolve(user);
      })
      .catch((err) => {
        reject( err );
      });
  });
};

exports.loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    let retUser;
    UserModel.findOne({ username: username })
      .then((user) => {
        if( user === null ){
          let userNotFoundError = new Error(`No user found with username "${username}"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        } else {
          retUser = user;
          return bcrypt.compare(password, user.password);
        }
      })
      .then((res) => {
        if (res) {
          retUser.password = undefined;
          resolve( retUser );
        } else {
          let wrongCredentialsError = new Error("Password did not match");
          wrongCredentialsError.name = "WrongCredentialsError";
          throw wrongCredentialsError;
        }
      })
      .catch((err) => {
        reject( err );
      });
  });
};

exports.getUserBoards = ( userId ) => {
  return new Promise( ( resolve, reject ) => {
    UserModel.findById( userId, "username boards").populate("boards")
      .then( ( user ) => {
        if( user === null ){
          let userNotFoundError = new Error(`No user found in session"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        }
        resolve( user.boards );
      })
      .catch( ( err ) => {
        reject( err );
      })
  });
};

exports.addBoardToUser = ( board ) => {
  let boardId;
  return new Promise( ( resolve, reject ) => {
    UserModel.findById( board.ownerId)
      .then( ( user ) => {
        if( user === null ){
          let userNotFoundError = new Error(`No user found in session"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        }
        if( !user.boards.includes( board._id ) ){
          user.boards.push( board._id );
        }
        boardId = board._id;
        return user.save();
      })
      .then( ( _user ) => {
        return BoardModel.findById( boardId );
      })
      .then( ( board ) => {
        if( board === null ){
          reject();
        } else {
          resolve( board );
        }
      })
      .catch( ( err ) => {
        reject( err );
      })
  });
};

exports.updateProfilePicture = ( userId, pfpFilename ) => {
  return new Promise( ( resolve, reject ) => {
    UserModel.findByIdAndUpdate( userId, { pfpFilename: pfpFilename } )
      .then( ( userBefore ) => {
        if( userBefore === null ){
          let userNotFoundError = new Error(`No user found in session"`);
          userNotFoundError.name = "NotFoundError";
          throw userNotFoundError;
        }
        if( userBefore.pfpFilename !== null ){
          return fs.rm( "public/uploads/" + userBefore.pfpFilename );
        } else {
          return undefined;
        }
      })
      .then( () => {
        return UserModel.findById( userId , {}, { new: true });
      })
      .then( ( user ) => {
        resolve( user );
      })
      .catch( ( err ) => {
        reject( err );
      })
  });
};
