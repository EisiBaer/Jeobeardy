import { defineStore } from "pinia";
import UserService from "@/services/UserService";

const uService = new UserService();

export const useUserStore = defineStore('user', {
  state: ()=>{
    return {
      loggedIn: false,
      username: "",
      admin: false,
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
    }
  },
})