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
         * get the latest chat messages.
         */
        checkForChat:function(){

        },
        liveUpdateOnlineFriends:function(){
            fbchatbg.friendsInterval=window.setInterval("fbchatbg.updateFriendsStatus()", 1000 * 60 * 3);
        },
        updateFriendsStatus:function(){
            console.log('updateing on:'+(new Date()).getMinutes())
            Proxy.getOnlineFriends(function(list){
                fbchatdb.setOnline(list);
            });
        },
        connect:function(handler){
            var callbackParam={};
            Proxy.connect(function(){
                Proxy.getFriendsList(function(list){
                    fbchatdb.insertFriends(list, function(list){
                        //populate list of all friends and save it in the localStorage
                        callbackParam.friendlist=fbchatpopup.populateFriendsList(list);
                        window.localStorage.friendList=callbackParam.friendlist;
                    });
                    Proxy.getOnlineFriends(function(list){
                        //___ set connected to be true
                        window.localStorage.connected=true;
                        //___update online friends.
                        fbchatdb.setOnline(list);
                        
                        //___ tern back the list to the popup,update list of friends, shows the container and hide the connect page.
                        callbackParam.onlineFriends=fbchatpopup.populateFriendsList(list,true);
                        window.localStorage.onlineFriends=callbackParam.onlineFriends;
                        
                        //___ updating friends and start to recieve messages.
                        fbchatbg.liveUpdateOnlineFriends();
                        //____update connect icon.
                        chrome.browserAction.setIcon({
                            path:'/views/icons/32x32.png'
                        });
                        try{
                            handler(callbackParam);
                        }catch(ex){
                            console.log(ex);
                            chrome.extension.getViews({type:"popup"}).forEach(function(win){
                                win.fbchatpopup.disposableFunctions.afterConnectingSuccess(callbackParam);
                            });
                        }
                    });
                });
            });
        },
        sendMessage:function(message){
            Proxy.sendMessage(message.to, message.msg,function(){
                var msg={
                    uid:message.to,
                    msg:message.msg,
                    sender_name:message.sendername,
                    sender_pic:message.senderpic,
                    dircolor:'blue'
                }
                fbchatdb.inserChatMessage(msg,function(){});
            });
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

        if(! JSON.parse(window.localStorage.connected)){
            fbchatbg.popup.container=$("#notconnected").html();
        }

        fbchatbg.popup.logged=JSON.parse(window.localStorage.logged);
        
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
        window.setTimeout("Proxy.Authenticate(0);", 1000 * 30);
    }
    if(request.action == 'disconnect'){
        window.clearInterval(fbchatbg.friendsInterval);
        Proxy.disconnect();
    }
    if(request.action == 'connect'){
        fbchatbg.connect(callback);
    }
    if(request.action == 'sendmessage'){
        fbchatbg.sendMessage(request.message);
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
        out+='<div class="user-container f">';
        out+='<div class="friend-image f">';
        out+='<img height="45" src="'+list[o].pic_square+'" width="46"/>';
        out+='<div class="friend-image-shadow"/>';
        out+='</div>';
        out+='<div class="user-name f">'+list[o].name+'</div>';
        out+='<div class="group f"></div>';
        if(online){
            out+='<div><img id="'+list[o].uid+'" style="cursor:pointer;" onclick="fbchatpopup.openchatwindow(this.id);" height="34" src="images/user-symbol.png" width="30"/></div>';
        }
        out+='</div>';
    }
    return out;
};
