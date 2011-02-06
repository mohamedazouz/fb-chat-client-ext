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
            fbchatbg.updateFriendsInterval=window.setInterval("fbchatbg.updateFriendsStatus()", 1000 * 60 * 3);
        },
        updateFriendsStatus:function(){
            Proxy.getOnlineFriends(function(list){
                fbchatdb.setOnline(list);
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

    //        fbchatbg.getFriendsList(function(list){
    //            fbchatdb.insertFriends(list, function(){});
    //        });
        
        
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
    if(request.action == 'friendsLiveUpdate'){
        fbchatbg.liveUpdateOnlineFriends();
    }
    if(request.action == 'disconnect'){
        window.clearInterval(fbchatbg.updateFriendsInterval);
        Proxy.disconnect();
    }
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);
