/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * 1- check for login status, if logged in, check in session for online friends. if not logged in, shows log in icon with url to webserver application that sends to authinticate and login to facebook, in background page a running script asks for authintication.
 * 2- shows a list of online friends and shows the last chats.
 */
var background=chrome.extension.getBackgroundPage();
var proxy=background.Proxy;
var fbchatPOPUP = function(){
    var fbchatpopup = {
        friendsInterval:null,
        /**
         * create html for list of friends.
         */
        populateFriendsList:function(list,online){
            var out="";
            for(o =0; o< list.length; o++){
                out+='<div class="user-container f">';
                out+='<div class="friend-image f">';
                out+='<img height="45" src="'+list[o].pic+'" width="46"/>';
                out+='<div class="friend-image-shadow"/>';
                out+='</div>';
                out+='<div class="user-name f">'+list[o].name+'</div>';
                out+='<div class="group f"></div>';
                if(online){
                    out+='<div><img id="'+list[o].fbuid+'" style="cursor:pointer; height="34" src="images/user-symbol.png" width="30"/></div>';
                }
                out+='</div>';
            }
            return out;
        },
        /**
         * fired when clicking on connect.
         */
        connect:function(){
            //___loading dots #loadindots
            $("#loadindots").Loadingdotdotdot({
                "speed": 400,
                "maxDots": 4
            });

            background.Proxy.connect(function(){
                background.Proxy.getFriendsList(function(list){
                    background.fbchatdb.insertFriends(list, function(list){
                        //populate list of all friends and save it in the localStorage
                        var friendList=fbchatpopup.populateFriendsList(list);
                        $("#friend-list").html(friendList);
                        window.localStorage.friendList=friendList;
                        console.log('friend list populated');
                    });
                    background.Proxy.getOnlineFriends(function(list){
                        //___update online friends.
                        background.fbchatdb.setOnline(list);
                        //____ running the intervals
                        fbchatpopup.runIntervals();
                        //______update list of friends, shows the container and hide the connect page.
                        var staticfriendlist=fbchatpopup.populateFriendsList(list,true);
                        window.localStorage.onlineFriends=staticfriendlist;
                        $("#online-friends").html(staticfriendlist);
                        $('#notconnected').fadeOut();
                        $("#container").fadeIn('fast');
                        //background.fbchatbg.popup.container=$("#container").html();
                        //___send to background to keep updating friends and start to recieve messages.
                        chrome.extension.sendRequest({
                            'action':'friendsLiveUpdate'
                        });
                        //____update connect icon.
                        chrome.browserAction.setIcon({
                            path:'icons/32x32.png'
                        });
                    });
                });
            });
        },
        /**
         * update online friends popup
         */
        updatetOnlineFriends:function(){
            console.log('updating frinds:'+(new Date()).getMinutes())
            var staticlist=null;
            background.fbchatdb.getOnlineFriends(function(list){
                staticlist=fbchatpopup.populateFriendsList(list,true);
                window.localStorage.onlineFriends=staticlist;
                fbchatpopup.setOnlineFriendsList(staticlist);
            });
        },
        /**
         * setting the online friends from the localStorage or from paramters
         */
        setOnlineFriendsList:function(staticlist){
            if(staticlist != null && staticlist != ""){
                $("#online-friends").html(staticlist);
            }else{
                $("#online-friends").html(window.localStorage.onlineFriends);
            }
            
        },
        /**
         * disconnecting from chat.
         */
        disconnect:function(){
            console.log('disconnecting');
            $('#container').hide();
            $("#notconnected").fadeIn('fast');
            //disconnecting from server
            chrome.extension.sendRequest({
                'action':'disconnect'
            });
            window.localStorage.connected=false;
            //setting icon to offline
            chrome.browserAction.setIcon({
                path:'icons/32x32_off.png'
            });
        },
        /**
         * log out
         */
        logout:function(){
            console.log('logging out');
            for(i in window.localStorage){
                delete window.localStorage[i]
            }
            window.localStorage.logged=false;
            window.localStorage.connected=false;
            chrome.browserAction.setIcon({
                path:'icons/32x32_off.png'
            });
            window.close();
        },
        /**
         * setting the onclick actions
         */
        setClickEventActions:function(){
            $("#connect").click(function(){
                fbchatpopup.connect();
            });
            //disconnect and logout actions
            $('#disconnect').click(function(){
                console.log('disconnecting');
                fbchatpopup.disconnect();
            });
            $('#logout').click(function(){
                console.log('logging out');
                fbchatpopup.logout();
            });
        },
        updateConversations:function(list){
        },
        updateConversation:function(msg){
        },
        /**
         * running the intervals while popup is on.
         */
        runIntervals:function(){
            fbchatpopup.friendsInterval=window.setInterval("fbchatpopup.updatetOnlineFriends();", 1000 * 60 * 2);
        }
    };
    $(function(){
        //______check if user is logged to application on facebook or not. if not user will  be redirected to facebook to authenticate application.
        if(! JSON.parse(window.localStorage.logged)){
            background.extension.openURL(proxy.baseURL+proxy.loginURL, true);
            chrome.extension.sendRequest({
                'action':'getAuth'
            });
            window.close();
        }

        //_____check if user is connected or not, if not shows you are not connected.
        if(! JSON.parse(window.localStorage.connected)){
            $('#container').hide();
            $("#notconnected").fadeIn('fast');
        }else{
            fbchatpopup.runIntervals();
            //___ setting the online friends list
            fbchatpopup.setOnlineFriendsList();
            //___update friends list from sessionStroge
            $("#friend-list").html(window.localStorage.friendList);
            //___update chat windows.
            $("#conversation-container").html("");
            //___update open chat box name
            $("#chat-buddy-name").html("");
            $("#chat-buddy-img").hide();

        }
        
        fbchatpopup.setClickEventActions();

    });
    return fbchatpopup;
}

var fbchatpopup=new fbchatPOPUP();