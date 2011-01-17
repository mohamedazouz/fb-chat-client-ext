/**
 * static proxy configurations.
 */
var Proxy={
    /**
     * the json file of user recent chat url.
     */
    updateURL:'',
    /**
     * first time login url.
     */
    loginURL:'',
    /**
     * after first login check for session key and user id url.
     */
    checkAuthURL:'',
    /**
     * sending a chat message url, param:to( the reciever id), msg( the message),from (user id).
     */
    sendMessageURL:'',
    /**
     * update the list of online users, param: uid(user id).
     */
    onlineUsersURL:'',
    /**
     * get a list of friends, param: uid(user id).
     */
    listOfUsersURL:'',
    userId:''
}

/**
 *
 */
var Liveupdate=function(){
    /**
     * returned opject
     */
    var liveupdate={
        updateChat:function(){
            
        }
    };

    //the constructor call.

    return liveupdate;
}
window.sessionStorage.connected="true";