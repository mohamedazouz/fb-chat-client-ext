/**
 * static proxy configurations.
 */
var Proxy={
    /**
     * proxy base url.
     */
    baseURL:'http://196.221.73.41:8080/FBChatProxy',
    /**
     * first time login url.
     */
    loginURL:'/login/login.htm',
    /**
     * after first login check for session key and user id url.
     */
    checkAuthURL:'/login/getauthkey.htm',
    /**
     * connect and go online.
     */
    connectURL:'/connect/connect.htm',
    /**
     * disconnects from facebook and go offline.
     */
    disconnectURL:'/connect/disconnect.htm',
    /**
     * the json file of user recent chat url.
     */
    updateURL:'/chat/',
    /**
     * sending a chat message url, param:to( the reciever id), msg( the message),from (user id).
     */
    sendMessageURL:'/messaging/send.htm',
    /**
     * update the list of online users, param: uid(user id).
     */
    onlineUsersURL:'/messaging/onlinefriends.htm',
    /**
     * get a list of friends, param: uid(user id).
     */
    listOfUsersURL:'/messaging/friendlist.htm',
    /**
     * get the authentication token/session key, keep doing it for about 10 minuts every 10 seconds.
     */
    Authenticate:function(count){
        if(! count){
            count=0;
        }
        count=parseInt(count);
        $.ajax({
            url:Proxy.baseURL+Proxy.checkAuthURL,
            dataType:'json',
            success:function(res){
                if(! res.sessionkey && count < 60){
                    window.setTimeout("fbchatbg.Authenticate("+(count+1)+")", 1000 * 10);
                }else{
                    window.localStorage.sessionKey=res.sessionkey;
                    window.localStorage.logged=true;
                    fbchatbg.popup.logged=true;
                }
            },
            error:function(){
                if(count < 60){
                    window.setTimeout("fbchatbg.Authenticate("+(count+1)+")", 1000 * 10);
                }
            }
        });
    },
    /**
     * go online :).
     */
    connect:function(handler){
        if(! JSON.parse(window.localStorage.logged) || (! window.localStorage.sessionKey)){
            return;
        }
        console.log('connecting')
        $.ajax({
            url:Proxy.baseURL+Proxy.connectURL,
            dataType:'json',
            data:{
                "sessionkey":window.localStorage.sessionKey
            },
            type:'POST',
            success:function(){
                console.log('connected.');
                //TO DO: after login function
                handler();
            }
        })
    },
    /**
     * disconnect from facebook chat and go offline.
     */
    disconnect:function(){
        $.ajax({
            url:Proxy.baseURL+Proxy.disconnectURL,
            dataType:'json',
            success:function(){
                console.log('disconnecting');
            }
        });
    },
    /**
     * send a chat message.
     */
    sendMessage:function(to,msg){
        $.ajax({
            url:Proxy.baseURL+Proxy.sendMessageURL,
            data:{
                to:to,
                msg:msg
            },
            dataType:'json',
            success:function(){

            }
        })
    },
    /**
     * get a list of online friends
     */
    getOnlineFriends:function(handler){
        $.ajax({
            url:Proxy.baseURL+Proxy.onlineUsersURL,
            dataType:'json',
            success:function(list){
                handler(list);
            }
        });
    },
    /**
     *
     */
    getFriendsList:function(handler){
        $.ajax({
            url:Proxy.baseURL+Proxy.listOfUsersURL,
            dataType:'json',
            success:function(list){
                handler(list);
            }
        });
    }
}

