import axios from "axios";

let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}

const API_URL = `${protocol}${hostname}/api`;

export default class UserService{

    signupUser(username, password){
        return axios.post(
            API_URL + "/user/signup",
            {
                username: username,
                password: password,
            },
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        )
    }

    loginUser(username, password){
        return axios.post(
            API_URL + "/user/login",
            {
                username: username,
                password: password,
            },
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        )
    }

    getUserFromSession(){
        return axios.get(
            API_URL + "/user",
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        )
    }

    logoutUser(){
        return axios.post(
            API_URL + "/user/logout",
            {},
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        )
    }
    
    getUserBoards(){
        return axios.get(
            API_URL + "/user/boards",
            {
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        )
    }
    
    saveUserBoard( boardFormData ){
        return axios.post(
            API_URL + "/user/boards/save",
            boardFormData,
            {
                withCredentials: true,
            }
        );
    }

    getBoardFromUser( boardId ){
        return axios.get(
            API_URL + "/user/boards/" + boardId,
            {   
                withCredentials: true,
                headers: {
                    "Content-Type":"application/json",
                }
            }
        );
    }

    saveNewProfilePicture( pfpFormData ){
        return axios.post(
            API_URL + "/user/pfp",
            pfpFormData,
            {
                withCredentials: true,
            }
        );
    }

    deleteProfilePicture( ){
        return axios.delete(
            API_URL + "/user/pfp",
            {
                withCredentials: true,
            }
        );
    }
}