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
var POPUPConnectHandler=function(ob){
    //populate list of all friends and save it in the localStorage
    $("#friend-list").html(ob.friendlist);

    //____ running the intervals
    fbchatpopup.runIntervals();

    $("#online-friends").html(ob.onlineFriends);
    $('#notconnected').fadeOut();
    $("#container").fadeIn('fast');
}
var fbchatPOPUP = function(){
    var fbchatpopup = {
        disposableFunctions:{
            afterConnectingSuccess:function(ob){
                //stoping the loader.
                $("#loadindots").Loadingdotdotdot("stop");
                $("#loadingdiv").hide();

                //populate list of all friends and save it in the localStorage
                $("#friend-list").html(ob.friendlist);

                //____ running the intervals
                fbchatpopup.runIntervals();

                $("#online-friends").html(ob.onlineFriends);
                $('#notconnected').fadeOut();
                $("#container").fadeIn('fast');
                //___update chat windows.
                $("#conversation-container").html("");
                //___update open chat box name
                $("#chat-buddy-name").html("");
                $("#chat-buddy-img").hide();
            },
            fixSlider:function(){
                // Wrap all .slides with #slideInner div
                $('.slide')
                .wrapAll('<div id="slideInner"></div>')
                // Float left to display horizontally, readjust .slides width
                .css({
                    'float' : 'left',
                    'width' : 50
                });
                // Set #slideInner width equal to total width of all slides
                $('#slideInner').css('width', 50 *  $('.slide').length);
            }
        },
        friendsInterval:null,
        /**
         * create html for list of friends.
         */
        populateFriendsList:function(list,online){
            var out=background.fbchatpopup.populateFriendsList(list, online);
            return out;
        },
        /**
         * fired when clicking on connect.
         */
        connect:function(){
            window.localStorage.connected = 'connecting';
            //___loading dots #loadindots
            $("#notconnected").hide();
            $("#loadingdiv").show();
            $("#loadindots").Loadingdotdotdot({
                "speed": 400,
                "maxDots": 4
            });
            chrome.extension.sendRequest({
                'action':'connect'
            },fbchatpopup.disposableFunctions.afterConnectingSuccess);
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
            },function(){});
        },
        /**
         * setting the online friends from the localStorage or from paramters
         */
        setOnlineFriendsList:function(staticlist){
            if(staticlist != null && staticlist != ""){
                $("#online-friends").html(staticlist);
            }else{
                window.setTimeout('$("#online-friends").html(window.localStorage.onlineFriends);', 1000 );
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
            //send to background to log out
            chrome.extension.sendRequest({
                'action':'logout'
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
            $('#closeChat').click(function(){
                fbchatpopup.closeChatWindow($(this).attr('value'));
            });
        //            $("#sendMessage").click(function(){
        //                //fbchatpopup.sendMessage();
        //            });
            
        },
        /**
         * update the conversation in case a new message has been received.
         */
        updateConversation:function(uid){
            //check for opened chat windows, if there is open, notifiy by adding star on it.
            fbchatpopup.openchatwindow(uid);
        },
        /**
         * makes html for the online chat friends
         */
        addToChatFriends:function(friend){
            var out='<div class="slide">';
            out+='<div onclick="fbchatpopup.openchatwindow(\''+friend.uid+'\')" class="slider-image f current">';
            out+='<img width="50" height="50" alt="'+friend.name+'" src="'+friend.pic_square+'" >';
            out+='<div class="talker-image-shadow"></div>';
            out+='</div>';
            out+='</div>';
            return out;
        },
        /**
         * send a message from popup.
         */
        sendMessage:function(){
            if($('#chat-text-box').attr('value')== 'type your message here'){
                console.log('not sinding')
                return;
            }
            var message ={
                msg:$('#chat-text-box').attr('value'),
                to:window.localStorage.chatwindow
            }
            //            console.log("sending:"+JSON.stringify(message));
            chrome.extension.sendRequest({
                'action':'sendmessage',
                'message':message
            },function(user){
                var out=fbchatpopup.populateChatWindow(message.msg, 'blue', user.pic_square, user.name);
                $("#conversation-container").append(out);
                $('#chat-text-box').attr('value','');
                window.scroll(0,150);
            });
        },
        /**
         * generate the html for the chat window.
         */
        populateChatWindow:function(msg,color,senderpic,sindername){
            for( z= 0; z< anim.length;z++){
                msg=background.util.replaceAll(msg, anim[z].value, '<img src="'+anim[z].img+'" width="16" height="16"/>');
            }
            var out="";
            if(color== 'blue'){
                out+='<div class="conversation f me">';
                out+='<div class="chatbox f-r b-chatbox">';
                out+='<div class="b-chatbox-top f"></div>';
                out+='<div class="b-chatbox-middle f">';
                out+=msg;
                out+='</div>';
                out+='<div class="b-chatbox-bottom f"></div>';
                out+='<div class="b-chatbox-arrow"></div>';
            }else{
                out+='<div class="conversation f other">';
                out+='<div class="chatbox f w-chatbox">';
                out+='<div class="w-chatbox-top f"></div>';
                out+='<div class="w-chatbox-middle f">';
                out+=msg;
                out+='</div>';
                out+='<div class="w-chatbox-bottom f"></div>';
                out+='<div class="w-chatbox-arrow"></div>';
            }
            out+='</div>';
            out+='<div class="talker-image f">';
            out+='<img src="'+senderpic+'" width="50" height="50" alt="'+sindername+'" />';
            out+='<div class="talker-image-shadow"></div>';
            out+='</div>';
            out+='</div>';
            return out;
        },
        /**
         * opening a chat window with the friend of the uid.
         */
        openchatwindow:function(uid){
            //adding chat to the activechat in localStorage.
            if(! window.localStorage.activeChat){
                window.localStorage.activeChat="[]";
            }
            //collapsing the online friends.
            $('#online-top-menu-container').slideUp('slow');

            //___update chat windows.
            $("#conversation-container").Loadingdotdotdot({
                "speed": 400,
                "maxDots": 4,
                "message":"loading"
            });
            // opening a new chat tab.
            background.fbchatdb.getFriendByUID(uid, function(friend){
                if(friend.online == 'true'){
                    $("#chat-buddy-img").attr('src','images/status_color.png');
                    $("#chat-text-box").attr('disabled',false);

                    //unbind any previous click actions.
                    $("#sendMessage").unbind("click");
                    $("#chat-text-box").unbind("keypress");
                    //bind new click actions.
                    $("#sendMessage").bind("click",function(){
                        fbchatpopup.sendMessage();
                    });
                    $("#chat-text-box").bind("keypress",function(e){
                        if(e.keyCode == 13){
                            fbchatpopup.sendMessage();
                        }
                    });
                    $("#chat-text-box").attr('value','type your message here');
                    $("#chat-text-box").css('color','gray');
                }else{
                    $("#chat-buddy-img").attr('src','images/status_offline_color.png');
                    $("#chat-text-box").attr('disabled',true);
                    $("#chat-text-box").attr('value',friend.name +' went offline');
                    $("#chat-text-box").css('color','#B5C0D8');
                    $("#sendMessage").unbind("click");
                    $("#chat-text-box").unbind("keypress");
                }
                //checking the chat in active chat.
                var activeChat=JSON.parse(window.localStorage.activeChat);
                if(background.util.inObjectArray(friend, activeChat,'uid') == -1){
                    activeChat.push(friend);
                    window.localStorage.activeChat=JSON.stringify(activeChat);
                    //appending the frined icon to the slider of chat friends.
                    $("#slidesContainer").append(fbchatpopup.addToChatFriends(friend));
                    fbchatpopup.disposableFunctions.fixSlider();
                    $("#slideshow, .user-pointer").show();
                }
                window.localStorage.chatwindow=friend.uid;
                
                background.fbchatdb.getTodayChatByUID(uid, function(chat){
                    $("#conversation-container").Loadingdotdotdot("stop");
                    var chatContainer="";
                    for(i=0; i< chat.length; i++){
                        chatContainer+=fbchatpopup.populateChatWindow(chat[i].msg, chat[i].dircolor, chat[i].sender_pic,chat[i].sender_name);
                    }
                    $("#conversation-container").html(chatContainer);
                });
                
                //___update open chat box name
                $("#chat-buddy-name").html(friend.name);
                $("#chat-buddy-name").attr('value',friend.uid);
                $("#chat-buddy-img").show();
                $("#closeChat").show();
                $("#closeChat").attr('value',friend.uid);
            });
        },
        /**
         * close a chat window.
         */
        closeChatWindow:function(uid){
            //check if the chat windows is containing only one chat window, so closes it and clear the chat budy. else open tha last chat.
            var activeChat=JSON.parse(window.localStorage.activeChat);
            for(i=0;i < activeChat.length; i++){
                if(activeChat[i].uid == uid){
                    activeChat.splice(i, 1);
                    i=activeChat.length;
                }
            }
            window.localStorage.activeChat=JSON.stringify(activeChat);
            if(activeChat.length == 0){
                //clear the chat conversation.
                $("#conversation-container").html("");
                //___update open chat box name
                $("#chat-buddy-name").html("");
                $("#chat-buddy-img").hide();
                $("#closeChat").hide();
                delete window.localStorage.chatwindow;
            }else{
                fbchatpopup.openchatwindow(activeChat[activeChat.length -1].uid);
            }
            //removing the icon from down chat slider.
            var chatSlider="";
            for(i = 0;i<activeChat.length; i++){
                chatSlider+=fbchatpopup.addToChatFriends(activeChat[i]);
            }
            $("#slidesContainer").html(chatSlider);
            fbchatpopup.disposableFunctions.fixSlider();
            if(activeChat.length ==0){
                $("#slideshow, .user-pointer").hide();
            }
        },
        /**
         * running the intervals while popup is on.
         */
        runIntervals:function(){
            fbchatpopup.updatetOnlineFriends();
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
        if(window.localStorage.connected == 'false'){
            delete window.localStorage.chatwindow;
            window.localStorage.activeChat = "[]";
            $('#container').hide();
            $("#notconnected").fadeIn('fast');
        }else if(window.localStorage.connected == 'connecting'){
            //___loading dots #loadindots
            $('#container').hide();
            $("#loadingdiv").fadeIn();
            $("#loadindots").Loadingdotdotdot({
                "speed": 400,
                "maxDots": 4
            });
        }else{
            fbchatpopup.runIntervals();
            //___ setting the online friends list
            fbchatpopup.setOnlineFriendsList();
            //___update friends list from localStorage
            window.setTimeout('$("#friend-list").html(window.localStorage.friendList);', 1000 );

            //here open last chat messages.
            if(window.localStorage.chatwindow){
                fbchatpopup.openchatwindow(window.localStorage.chatwindow);
                // check for other chat to apppend to the slider.
                var activeChat=JSON.parse(window.localStorage.activeChat);
                for(j=0; j < activeChat.length; j++){
                    $("#slidesContainer").append(fbchatpopup.addToChatFriends(activeChat[j]));
                }
                $("#slideshow, .user-pointer").show();
                fbchatpopup.disposableFunctions.fixSlider();
            }else{
                $("#conversation-container").html("");
                $("#chat-buddy-name").html("");
                $("#chat-buddy-img").hide();
                $("#closeChat").hide();
            }
        }
        
        fbchatpopup.setClickEventActions();

    });
    return fbchatpopup;
}

var fbchatpopup=new fbchatPOPUP();