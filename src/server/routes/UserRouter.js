const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require("node:fs/promises");
const { v4: uuidv4 } = require("uuid");

const userController = require("../controllers/UserControllerMongoose");
const boardController = require("../controllers/BoardControllerMongoose");

// Initialize Multer File Uplaod
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb( null, 'public/uploads' )
    },
    filename: (req, file, cb) => {
        let fileExtension = '.jpg';
        if( file.mimetype === 'image/png' ){
            fileExtension = '.png';
        }
        if( file.mimetype === 'image/gif' ){
            fileExtension = '.gif';
        }
        if( file.mimetype === 'audio/mpeg' ){
            fileExtension = '.mp3';
        }

        let filename = uuidv4() + fileExtension;

        fs.access( "public/uploads/" + filename, fs.constants.F_OK )
        .then( ( ) =>{
            return fs.rm( "public/uploads/" + filename );
        })
        .then( () => {

        })
        .catch( ( _err ) => {
            //No need to delete, but need to catch it so it won't bubble
        })
        .finally( () => {
            cb( null, filename );
        });

    }
});

const fileFilterFn = function( req, file, cb ){

    if( req.session.user === undefined ){
        cb( new Error( "Only logged in Users can upload pictures" ) );
        return;
    }

    if( !["image/jpeg","image/jpg","image/png","image/gif","audio/mpeg"].includes( file.mimetype ) ){
        cb( new Error( "MIME Type not supported!" ) );
        return;
    }
    
    if( file.size > 1024 * 1024 * 5){
        cb( new Error( "File is too large! Must be less than 5MB" ) );
        return;
    }

    if( req.body.board ){

        let board = JSON.parse( req.body.board );

        boardController.isBoardFromUser( board.boardId, req.session.user )
        .then( ( isFromUser ) => {
            if( !isFromUser && board.boardId !== undefined ){
                cb( new Error( "The associated board is not the users" ) );
            } else {
                if( req.session.user === undefined ){
                    cb( new Error( "Only logged in Users can upload pictures" ) );
                    return;
                }
            
                cb( null, true );
            }
        });
    } else {
        cb( null, true );
    }

}

const upload = multer({ storage: storage, fileFilter: fileFilterFn });

router.get("/", (req, res)=>{
    if( req.session.user !== undefined ){
        userController.findUser( req.session.user )
        .then( user => {
            res.send({success: true, user: { username: user.username, pfpFilename: user.pfpFilename } } );
        })
        .catch( err => {
            console.debug(err);
            res.send( { success: false, error: "No User found" } );
        });
    }else{
        res.send( { success: false, error: "No User found" } );
    }
});

router.get("/list", (req, res)=>{
    res.send(userController.listUsers());
});

// Add User route.
router.post("/signup", (req, res)=>{
    userController.addUser(req.body.username, req.body.password)
    .then( (user) => {
        return setSessionUser( req, user );
    })
    .then( ( user ) => {
        res.send({success: true, user: { username: user.username } } );
    })
    .catch( (err) => {
        if( err.userTaken ){
            res.send( { success: false, error: err.message } );
        } else {
            res.status(500).send({success:false, error: "Error while persisting data"})
        }
    })
});

router.post("/login", (req, res)=>{
    if( req.session.user !== undefined ){
        userController.findUser( req.session.user )
        .then( ( user ) => {
            res.send({success: true, user: { username: user.username, pfpFilename: user.pfpFilename } } );
        })
        .catch( ( err ) => {
            console.error( err );
            res.send({success:false, error: "Error with logging you in" });
        })
    }else{
        userController.loginUser(req.body.username, req.body.password)
        .then( (user) => {
            return setSessionUser( req, user );
        })
        .then( ( user ) => {
            res.send({success: true, user: { username: user.username, pfpFilename: user.pfpFilename } } );
        })
        .catch( (err) => {
            if( err.name === "WrongCredentialsError" ){
                res.send({ success: false, error: "Wrong or unknown credentials" });
            }else{
                res.status(500).send({success:false, error: "Error while persisting data" });
            }
        })
    }
});

router.post("/logout", (req, res)=>{
    if( req.session.user === undefined ){
        //Is not logged in
        res.send({success: false, error: "Not logged in!" });
    }else{
        req.session.destroy( ( errDes )=>{
            if( errDes ){
                res.status( 500 ).send({success:false, error: "Error while logging out of session"});
            } else {
                res.send({success: true, message: "Successfully logged out"});
            }
        });
    }
});

router.get("/boards", (req, res) => {
    if( req.session.user === undefined ){
        res.send( { success: false, error: "Not logged in!" } );
    } else {
        userController.getUserBoards( req.session.user )
        .then( ( boards ) => {
            res.send( { success: true, boards: boards } );
        })
        .catch( ( err ) => {
            res.send( { success: false, error: err, message: err.message } );
        });
    }
});

router.post("/boards/save", upload.fields( [ { name: "images" }, { name: "audio" } ] ), (req, res) => {
    if( req.session.user === undefined ){
        res.send( { success: false, error: "Not logged in!" } );
    } else {
        let board = JSON.parse( req.body.board );
        let imageFiles = [];
        let audioFiles = [];
        if( req.files["images"] ){
            imageFiles = req.files["images"];
        }
        if( req.files["audio"] ){
            audioFiles = req.files["audio"];
        }
        let filesCombined = imageFiles.concat( audioFiles );
        for( let file of filesCombined ){
            let indices = file.originalname.split(":");
            let cIndex = Number(indices[0]);
            let bEIndex = Number(indices[1]);
            let qIndex = Number(indices[2]);
            if( indices[2] === "answer" ){
                board.categories[cIndex].boardEntries[bEIndex].answer.filename = file.filename;
            } else {
                board.categories[cIndex].boardEntries[bEIndex].questions[qIndex].filename = file.filename
            }
        }
        return boardController.addBoard( board, req.session.user )
        .then( ( board ) => {
            return userController.addBoardToUser( board );
        })
        .then( ( board ) => {
            res.send( { success: true, board: board } );
        })
        .catch( ( err ) => {
            res.send( { success: false, error: err } );
        });
    }
});

router.get("/boards/:id", (req, res) => {
    if( req.session.user === undefined ){
        res.send( { success: false, error: "Not logged in!" } );
    } else {
        userController.findUser( req.session.user )
        .then( ( user ) => {
            let boardId;
            for( let userBoard of user.boards ){
                if( userBoard.toString() === req.params.id ){
                    boardId = userBoard;
                    break;
                }
            }
            if( boardId !== undefined ){
                return boardController.findBoard( boardId )
            } else {
                throw new Error("No board found with id " + req.params.id + " for user " + req.session.user );
            }
        })
        .then( ( board ) => {
            res.send( { success: true, board: board } );
        })
        .catch( ( err ) => {
            res.send( { success: false, error: err } );
        });
    }
});


router.get("/pfp/:filename", (req, res) => {
    console.log("Getting pfp: ", req.params.filename);
    let options = {
      root: 'public/uploads',
      dotfiles: 'deny',
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }
    res.sendFile( req.params.filename, options );
  });


router.post("/pfp", upload.single( "pfp" ), (req, res) => {
    if( req.session.user === undefined ){
        res.send( { success: false, error: "Not logged in!" } );
    } else {
        if( !req.file ){
            console.error( "No file attached" );
            throw new Error("No file attached to be saved" );
        }
        let imageFile = req.file;
        return userController.updateProfilePicture( req.session.user, imageFile.filename )
        .then( ( user ) => {
            res.send( { success: true, newProfilePicture: user.pfpFilename } );
        })
        .catch( ( err ) => {
            res.send( { success: false, error: err } );
        });
    }
});

router.delete("/pfp", (req, res) => {
    if( req.session.user === undefined ){
        res.send( { success: false, error: "Not logged in!" } );
    } else {
        return userController.updateProfilePicture( req.session.user, null )
        .then( ( _user ) => {
            res.send( { success: true, } );
        })
        .catch( ( err ) => {
            res.send( { success: false, error: err } );
        });
    }
});

module.exports = router;

function setSessionUser( req, user ){
    return new Promise( ( resolve, reject ) => {
        req.session.regenerate( ( errReg )=>{
            if( errReg ){
                reject();
            }else{
                req.session.user = user._id.toString();
                req.session.save( ( errSave )=>{
                    if( errSave ){
                        reject();
                    }else{
                        resolve( user );
                    }
                } );
            }
        });
    })
}
