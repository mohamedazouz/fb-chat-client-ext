/**
 * static proxy configurations.
 */
var Proxy={
    /**
     * proxy base url.
     */
    baseURL:'http://fbchat.activedd.com',
    //    baseURL:'http://41.178.64.38:8080/FBChatProxy',
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
    messagesURL:'/chat/',
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
        if(count == 59){
            window.localStorage.logged=false;
            return;
        }
        try{
            $.ajax({
                url:Proxy.baseURL+Proxy.checkAuthURL,
                dataType:'json',
                success:function(res){
                    if((! res || ! res.sessionkey) && count < 60){
                        window.setTimeout(function(){
                            Proxy.Authenticate(count+1);
                        }, 1000 * 2);
                    }else{
                        window.localStorage.sessionKey=res.sessionkey;
                        window.localStorage.logged=true;
                        fbchatbg.popup.logged=true;
                        fbchatbg.setExtensionSettings();
                    }
                },
                error:function(){
                    if(count < 60){
                        window.setTimeout(function(){
                            Proxy.Authenticate(count+1);
                        }, 1000 * 2);
                    }
                }
            });
        }catch (e){
            window.setTimeout(function(){
                Proxy.Authenticate(count+1);
            }, 1000 * 2);
        }
        
    },
    /**
     * go online :).
     */
    connect:function(handler,failer){
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
            success:function(usr){
                //TO DO: after login function
                handler(usr);
            },
            error:function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown)
                failer();
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
    sendMessage:function(to,msg,handler){
        $.ajax({
            url:Proxy.baseURL+Proxy.sendMessageURL,
            data:{
                to:to,
                msg:msg
            },
            dataType:'json',
            type:'POST',
            success:handler
        })
    },
    /**
     * get a list of online friends
     */
    getOnlineFriends:function(handler,failer){
        $.ajax({
            url:Proxy.baseURL+Proxy.onlineUsersURL,
            dataType:'json',
            success:function(list){
                handler(list);
            },
            error:function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown)
                failer();
            }
        });
    },
    /**
     *
     */
    getFriendsList:function(handler,failer){
        $.ajax({
            url:Proxy.baseURL+Proxy.listOfUsersURL,
            dataType:'json',
            success:function(list){
                handler(list);
            },
            error:function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown)
                failer();
            }
        });
    },
    getMessages:function(uid,handler,failer){
        try{
            $.ajax({
                url:Proxy.baseURL+Proxy.messagesURL+uid+'.json',
                dataType:'json',
                cache:'false',
                ifModified:'true',
                statusCode:{
                    200:function(msgs){
                        console.log("200");
                        console.log(JSON.stringify(msgs));
                    },
                    304:function(){
                        console.log('304');
                    }
                },
                complete:function(jqXHR, textStatus){
                    if(jqXHR.status == 200){
                        var msgs=JSON.parse(jqXHR.response);
                        handler(msgs);
                    }
                }
            });
        }catch(e){
            console.log(e);
            failer();
        }
    }
}
