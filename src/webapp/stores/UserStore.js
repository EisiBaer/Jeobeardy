import { defineStore } from "pinia";
import UserService from "@/services/UserService";

const uService = new UserService();

export const useUserStore = defineStore('user', {
  state: ()=>{
    return {
      loggedIn: false,
      username: "",
      admin: false,
      pfpFilename: null,
      initialUserPromise: new Promise( (resolve, reject ) => {
        uService.getUserFromSession()
        .then( res => {
          if( res.data.success ){
            resolve( res.data.user );
          } else {
            reject( false );
          }
        })
        .catch( err => {
          console.debug(err);
          reject( err );
        })
      }),
      userService: uService,
    }
  },
  actions: {
    login( username, password ) {
      return this.userService.loginUser(username, password);
    },
    signup( username, password ) {
      return this.userService.signupUser(username, password);
    },
    logout(){
      if( this.loggedIn ){
        return this.userService.logoutUser();
      } else {
        return Promise.reject("Not logged in");
      }
    },
    setUser( user ){
      this.loggedIn = true;
      this.username = user.username;
      this.pfpFilename = user.pfpFilename;
    },
    resetInitialUserDataPromise(){
      this.initialUserPromise = new Promise( (resolve, reject ) => {
        this.userService.getUserFromSession()
        .then( res => {
          if( res.data.success ){
            resolve( res.data.user );
          } else {
            reject( false );
          }
        })
        .catch( err => {
          console.debug(err);
          reject( err );
        });
      });
    },
    saveProfilePicture( imageData ){
      return new Promise( ( resolve, reject ) => {
        let formData = new FormData();
        formData.append( "pfp", imageData );
        this.userService.saveNewProfilePicture( formData )
        .then( ( response ) => {
          this.pfpFilename = response.data.newProfilePicture;
          resolve();
        })
        .catch( ( error ) => {
          console.error( error );
          reject();
        });
      });
    },
    deleteProfilePicture(){
      return new Promise( ( resolve, reject ) => {
        this.userService.deleteProfilePicture()
        .then( ( response ) => {
          if( response.data.success ){
            this.pfpFilename = null;
            resolve();
          } else {
            console.warn( "Profile picture could not be deleted" );
            reject();
          }
        })
        .catch( ( error ) => {
          console.error( error );
          reject();
        });
      });
    },
  },
})