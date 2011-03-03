/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * 1-check for login status, if logged in (including appear online). :
 *      a. check for user
 *      b. get a list of online friends, and populate it into the database with fields(id, name, fbuid, profile pic).
 *      c. every second send a request to check for upcomming messages, if there is a new message. get message and find from which user and fire it in notification.
 *      d. every 5 seconds check for online friends.
 * 2- if not logged check every 5 seconds for logged in status.(including appear online).
 * 3- sends a message to proxy to send it to a user.
 */

var fbchatBG=function(){
    var fbchatbg={
        friendsInterval:null,
        ChatInterval:null,
        popup:{},
        /**
         * sets the extension settings.
         */
        setExtensionSettings:function(){
            if(! window.localStorage.lang){
                window.localStorage.lang=fbchatbg.getNavigatorLang();
            }
            if(! window.localStorage.allowNotifications){
                window.localStorage.allowNotifications = true;
            }
            if(! window.localStorage.playSounds){
                window.localStorage.allowNotifications = true;
            }
        },
        getNavigatorLang:function(){
            var lang=window.navigator.language;
            if(lang.indexOf("ar")!= -1){
                return 'ar';
            }else if(lang.indexOf("en")!= -1){
                return 'en';
            }else{
                return 'en';
            }
        },
        /**
         * play new message sound
         */
        createAlert:function(){
            var audio=document.createElement("audio");
            audio.setAttribute("src", "sound/47_ti-na.mp3");
            document.body.appendChild(audio);
            audio.play();
            window.setTimeout(function(){
                $(audio).remove();
            }, 2000);
        },
        /**
         * changes the badge text when a new message received.
         */
        changeBadge:function(){
            if(! window.localStorage.unreadMSGS){
                window.localStorage.unreadMSGS=0;
            }
            var unread=parseInt(window.localStorage.unreadMSGS)+1;
            window.localStorage.unreadMSGS=unread;
            chrome.browserAction.setBadgeText({
                text:""+(unread)
            });
        },
        /**
         * get the latest chat messages.
         */
        receivingMessages:function(){
            //send to the proxy to check for messages.
            //if message is old discard it, else check for open popup if there is one send to it to show the new message.
            //else send to show a notification.
            var user=JSON.parse(window.localStorage.user);
            Proxy.getMessages(user.uid, function(msgs){
                if(! msgs){
                    return;
                }
                var messageDate=new Date();
                sendMessages=function(msg){
                    var sender_uid=(msg.from).substring(1,(msg.from).indexOf("@"));
                    fbchatdb.getFriendByUID(sender_uid, function(friend,msg){
                        if(friend.online=='false'){
                            fbchatdb.setOnline([friend]);
                        }
                        messageDate.setTime(msg.time);
                        //uid,msg,sender_name,sender_pic,msgdate,msgtime,dircolor
                        var message={
                            uid:sender_uid,
                            msg:msg.msg,
                            sender_name:friend.name,
                            sender_pic:friend.pic_square,
                            msgdate:date_util.getDayString(messageDate),
                            msgtime:date_util.getDateHours(messageDate),
                            dircolor:'white'

                        }
                        fbchatdb.inserChatMessage(message, function(){
                            fbchatbg.showMSG(sender_uid,message);
                        })
                    },msg);
                }
                if(! window.localStorage.lastMessage){
                    for(j=0;j<msgs.length;j++){
                        sendMessages(msgs[j]);
                        window.localStorage.lastMessage = msgs[msgs.length -1].time;
                    }
                }else{
                    for(j=0;j<msgs.length;j++){
                        if(window.localStorage.lastMessage < msgs[j].time){
                            sendMessages(msgs[j]);
                            window.localStorage.lastMessage = msgs[j].time;
                        }
                    }
                }
            }, function(){});
        },
        /**
         * run the interval check for online friends.
         */
        liveUpdates:function(){
            //checking for new online friends. every 3 min.
            fbchatbg.friendsInterval=window.setInterval("fbchatbg.updateFriendsStatus()", 1000 * 60 * 3);
            // checking for new chat messages, every 2 sec.
            fbchatbg.ChatInterval=window.setInterval("fbchatbg.receivingMessages()", 1000 * 1);
        },
        /**
         * updates friends status.
         */
        updateFriendsStatus:function(){
            console.log('updateing on:'+(new Date()).getMinutes())
            Proxy.getOnlineFriends(function(list){
                if(list.error){
                    fbchatbg.disconnect();
                    window.localStorage.connected=false;
                    //setting icon to offline
                    chrome.browserAction.setIcon({
                        path:'/views/icons/32x32_off.png'
                    });
                    console.log(list.error);
                    return;
                }
                fbchatdb.setOnline(list);
                window.localStorage.onlineFriends=fbchatpopup.populateFriendsList(list,true);
                window.localStorage.onlineFriendsCount=list.length;
                chrome.extension.getViews({
                    type:"popup"
                }).forEach(function(win){
                    win.fbchatpopup.updateOnlineFriendsFromBackGround(list);
                });
            },function(){});
        },
        /**
         * connect to go online on facebook.
         */
        connect:function(handler){
            var callbackParam={};
            Proxy.connect(function(usr){
                //saving user data.
                window.localStorage.user=JSON.stringify(usr);
                Proxy.getFriendsList(function(list){
                    if(list.error){
                        bchatbg.disconnect();
                        window.localStorage.connected=false;
                        //setting icon to offline
                        chrome.browserAction.setIcon({
                            path:'/views/icons/32x32_off.png'
                        });
                        console.log(list.error);
                        return;
                    }
                    fbchatdb.insertFriends(list, function(list){
                        //populate list of all friends and save it in the localStorage
                        callbackParam.friendlist=fbchatpopup.populateFriendsList(list);
                        window.localStorage.friendList=callbackParam.friendlist;
                    });
                    Proxy.getOnlineFriends(function(list){
                        if(list.error){
                            fbchatbg.disconnect();
                            window.localStorage.connected=false;
                            //setting icon to offline
                            chrome.browserAction.setIcon({
                                path:'/views/icons/32x32_off.png'
                            });
                            console.log(list.error);
                            return;
                        }
                        //___ set connected to be true
                        window.localStorage.connected=true;
                        //___update online friends.
                        fbchatdb.setOnline(list);
                        
                        //___ tern back the list to the popup,update list of friends, shows the container and hide the connect page.
                        callbackParam.onlineFriends=fbchatpopup.populateFriendsList(list,true);
                        window.localStorage.onlineFriends=callbackParam.onlineFriends;
                        window.localStorage.onlineFriendsCount=list.length;
                        //___ updating friends and start to recieve messages.
                        fbchatbg.liveUpdates();
                        //____update connect icon.
                        chrome.browserAction.setIcon({
                            path:'/views/icons/32x32.png'
                        });
                        try{
                            handler(callbackParam);
                        }catch(ex){
                            console.log(ex);
                            chrome.extension.getViews({
                                type:"popup"
                            }).forEach(function(win){
                                win.fbchatpopup.disposableFunctions.afterConnectingSuccess(callbackParam);
                            });
                        }
                    },function(){
                        //___ set connected to be false
                        window.localStorage.connected=false;
                    });
                },function(){
                    //___ set connected to be false
                    window.localStorage.connected=false;
                });
            },function(){
                //___ set connected to be false
                window.localStorage.connected=false;
            });
        },
        /**
         * send the uid to the popup to open the chat window.
         * @param uid sender id.
         * @param msg the message to show.
         */
        showMSG:function(uid,msg){
            //fire the nes message alert.
            if(window.localStorage.playSounds == 'true'){
                fbchatbg.createAlert();
            }
            //get instanse of popup page.
            var popup=chrome.extension.getViews({
                type:"popup"
            });
            //check if there is popup pages is open or not.
            if(popup.length != 0){
                //if there is popup page is open send to show new msg.
                popup.forEach(function(win){
                    win.fbchatpopup.updateConversation(uid,msg);
                });
            }else if(window.localStorage.allowNotifications == 'true'){
                //update the badge text.
                fbchatbg.changeBadge();
                //saving chat window as last message.
                if(! window.localStorage.activeChat){
                    window.localStorage.activeChat="[]";
                }
                fbchatdb.getFriendByUID(uid, function(friend){
                    var activeChat=JSON.parse(window.localStorage.activeChat);
                    if(util.inObjectArray(friend, activeChat,'uid') == -1){
                        activeChat.push(friend);
                        window.localStorage.activeChat=JSON.stringify(activeChat);
                    }
                    window.localStorage.chatwindow=friend.uid;
                });
                //show notification with new message.
                notifier.fireNotification("html", msg.sender_name, msg.msg, msg.sender_pic,msg.uid);
            }
        },
        /**
         * send a messages, and save it in the db.
         */
        sendMessage:function(message){
            Proxy.sendMessage(message.to, message.msg,function(resp){
                if(resp.error){
                    fbchatbg.disconnect();
                    window.localStorage.connected=false;
                    //setting icon to offline
                    chrome.browserAction.setIcon({
                        path:'/views/icons/32x32_off.png'
                    });
                    console.log(resp.error);
                    return;
                }
                var user=JSON.parse(window.localStorage.user);
                var msg={
                    uid:message.to,
                    msg:message.msg,
                    sender_name:user.name,
                    sender_pic:user.pic_square,
                    dircolor:'blue'
                }
                fbchatdb.inserChatMessage(msg,function(){});
            });
        },
        disconnect:function(){
            window.clearInterval(fbchatbg.friendsInterval);
            window.clearInterval(fbchatbg.ChatInterval);
            delete window.localStorage.chatwindow;
            delete window.localStorage.activeChat;
            Proxy.disconnect();
        }
    };

    //execute constructor.
    $(function(){
        chrome.browserAction.setIcon({
            path:'/views/icons/32x32_off.png'
        });
        window.localStorage.connected=false;
        if(! window.localStorage.logged){
            window.localStorage.logged=false;
        }
        fbchatbg.setExtensionSettings();
    });
    
    return fbchatbg;
}

var fbchatbg=new fbchatBG();


/**
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callback Function The method to call when the request completes.
 */
function onRequest(request, sender, callback) {
    if(request.action=='getAuth'){
        window.setTimeout(function(){
            Proxy.Authenticate(0);
        }, 1000 * 5);
    }
    if(request.action == 'disconnect'){
        fbchatbg.disconnect();
    }
    if(request.action == 'logout'){
        window.clearInterval(fbchatbg.friendsInterval);
        window.clearInterval(fbchatbg.ChatInterval);
        for(i in window.localStorage){
            delete window.localStorage[i]
        }
        window.localStorage.logged=false;
        window.localStorage.connected=false;
        chrome.browserAction.setIcon({
            path:'/views/icons/32x32_off.png'
        });
        Proxy.disconnect();
    }
    if(request.action == 'connect'){
        fbchatbg.connect(callback);
    }
    if(request.action == 'sendmessage'){
        fbchatbg.sendMessage(request.message,callback);
    }
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

/**
 * create html for list of friends. got it from popup
 */
var fbchatpopup={};
fbchatpopup.populateFriendsList=function(list,online){
    var out="";
    for(o =0; o< list.length; o++){
        out+='<div id="user" class="user-container f">';
        out+='<div style="cursor:pointer;" onclick="fbchatpopup.openchatwindow('+list[o].uid+');" class="friend-image f">';
        out+='<img height="45" src="'+list[o].pic_square+'" width="46"/>';
        out+='<div class="friend-image-shadow"/>';
        out+='</div>';
        out+='<div style="cursor:pointer;"onclick="fbchatpopup.openchatwindow('+list[o].uid+');" class="user-name f">'+list[o].name+'</div>';
        out+='<div class="group f"></div>';
        if(online){
            out+='<div><img id="'+list[o].uid+'" style="cursor:pointer;" onclick="fbchatpopup.openchatwindow(this.id);" height="34" src="images/user-symbol.png" width="30"/></div>';
        }
        out+='</div>';
    }
    return out;
};

/*
 //run when the user changes his status from idle to active.
chrome.idle.onStateChanged.addListener(function(newState) {
    console.log("2ser "+newState+" on:"+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds());
});
// run every 1 min to check the user active or idle.
window.setInterval(function(){
    chrome.idle.queryState(15, function(stat){
        if(stat == 'idle'){
            //do something about idle state.
        }
        console.log("1user "+stat+" on:"+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds());
    });
},1000 * 60 )
*/

/**
 * adding Listener to window close to send to the proxy to disconnect from chat.
 */
chrome.windows.onRemoved.addListener(function(windowId) {
    chrome.windows.getAll({},function(windowlist){
        if(windowlist.length == 0){
            if(window.localStorage.connected == 'true'){
                Proxy.disconnect();
            }
        }
    });
});