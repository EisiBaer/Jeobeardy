
const bcrypt = require("bcryptjs");

let users = [];

exports.listUsers = (req, res) => {
    return users;
};

exports.findUser = (username) => {
    return new Promise( (resolve, reject) =>{
        let user = users.find( x => x.username === username );
        if( user !== undefined ){
            resolve( user );
        }else{
            reject( "Not Found " );
        }
    });
};

exports.addUser = (username, password) => {
    return new Promise( (resolve, reject) => {
        if( users.some( x => x.username === username ) ){
            reject({
                userTaken: true,
                message: "Username Already Taken",
            });
        } else {
            bcrypt.hash(password, 13).then( hash => {
                let newUser = {
                    username: username,
                    password: hash,
                }
                users.push(newUser);
                resolve(newUser);
            })
            .catch( err => {
                reject(err);
            })
        }
    });
};

exports.loginUser = (username, password) => {
    return new Promise( (resolve, reject) => {
        let retUser;
        this.findUser(username).then( user => {
            retUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then( res => {
            if(res){
                resolve(retUser);
            }else{
                reject( "Wrong Credentials" );
            }
        })
        .catch( err =>{
            reject( "Wrong Credentials" );
        })
    });
};
