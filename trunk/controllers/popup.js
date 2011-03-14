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
            appendToSlider:function(slide){
                if(! slide){
                    $('#slideInner').css('width', (50 *  $('.slide').length)+100);
                    return;
                }
                var slideInner=document.getElementById("slideInner");
                if(slideInner){
                    $(slideInner).append(slide);
                }else{
                    $("#slidesContainer").append(slide);
                    $('.slide').wrapAll('<div id="slideInner"></div>');
                }
                $('.slide').css({
                    'float' : 'left',
                    'width' : 50
                });
                $("#slideInner").css('width', (50 *  $('.slide').length)+100);
                $("#slideshow").show();
            },
            setLocals:function(){
                var lang=window.localStorage.lang;
                if(lang == 'ar'){
                    var link=document.createElement("link");
                    link.setAttribute("href", "css/rtl.css");
                    link.setAttribute("rel", "stylesheet");
                    link.setAttribute("type", "text/css");
                    $('head').append(link);
                    $("#offline-notify").children('*').each(function(){
                        $(this).css("float", 'right');
                    });
                }
                $("*").each(function(){
                    var local=$(this).attr("local");
                    if(local != null && local != undefined){
                        try{
                            $(this).text((fbchatlocals[lang])[local]);
                        }catch(e){
                            console.log(e);
                        }
                        
                    }
                });
                $("#onlineFilter").attr('placeholder',fbchatlocals[lang].friendsonchat);
                $("#friendsFilter").attr('placeholder',fbchatlocals[lang].searchfriens);
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
         * @ignore
         */
        updatetOnlineFriends:function(){
            console.log('updating frinds:'+(new Date()).getMinutes())
            var staticlist=null;
            background.fbchatdb.getOnlineFriends(function(list){
                if(list.error){
                    fbchatpopup.disconnect();
                    console.log(list.error);
                    return;
                }
                staticlist=fbchatpopup.populateFriendsList(list,true);
                window.localStorage.onlineFriendsCount=list.length;
                window.localStorage.onlineFriends=staticlist;
                fbchatpopup.setOnlineFriendsList(staticlist);
                if(window.localStorage.chatwindow){
                    fbchatpopup.openchatwindow(window.localStorage.chatwindow);
                }
            },function(){});
        },
        /**
         * update the online friends when the background send to update it.
         * the background will call this method when the server responds with the online friend list.
         */
        updateOnlineFriendsFromBackGround:function(list){
            var staticlist=fbchatpopup.populateFriendsList(list,true);
            window.localStorage.onlineFriendsCount=list.length;
            window.localStorage.onlineFriends=staticlist;
            fbchatpopup.setOnlineFriendsList(staticlist);
        },
        /**
         * setting the online friends from the localStorage or from paramters
         */
        setOnlineFriendsList:function(staticlist){
            if(staticlist != null && staticlist != ""){
                $("#online-friends").html(staticlist);
            }else{
                window.setTimeout(function(){
                    $("#online-friends").html(window.localStorage.onlineFriends);
                }, 1000 );
            }
            if(window.localStorage.onlineFriendsCount){
                if($('#onlineFriends').text().indexOf("(") == -1){
                    $("#onlineFriends").text($('#onlineFriends').text()+' ('+window.localStorage.onlineFriendsCount+')');
                }else{
                    $("#onlineFriends").text($('#onlineFriends').text().substr(0, $('#onlineFriends').text().indexOf("(")-1)+' ('+window.localStorage.onlineFriendsCount+')');
                }
            }
        },
        /**
         * check if the active chat is online
         */
        checkActiveChatStatus:function(){

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
            $('#about').click(function(){
                $('#settings-top-menu-container').slideUp('slow');
                $('#conversation-container').noticeMsg($('#noticeMessage').html(),{
                    dur: 0,
                    fade: 1000
                })
            });
            $("#options").click(function(){
                fbchatpopup.openURL(chrome.extension.getURL('views/options.html'), true);
            });
        },
        /**
         * update the conversation in case a new message has been received.
         */
        updateConversation:function(uid,msg){
            //check for opened chat windows, if there is open, notifiy by adding star on it.
            if(uid==window.localStorage.chatwindow){
                $("#focusButton").before(fbchatpopup.populateChatWindow(msg.msg, msg.dircolor, msg.sender_pic,msg.sender_name));
                $("#focusButton").focus();
                window.setTimeout(function(){
                    $("#chat-text-box").focus();
                },100);
            }else{
                //don't open the new window just highlight the friend icon.
                var elem = document.getElementById("friend-"+uid);
                if(elem){
                    $("#friend-"+uid).append('<div class="notification"></div>');
                }else{
                    fbchatpopup.openchatwindow(uid);
                }
            }
        },
        /**
         * makes html for the online chat friends
         */
        addToChatFriends:function(friend){
            var out='<div class="slide">';
            out+='<div id="friend-'+friend.uid+'" onclick="fbchatpopup.openchatwindow(\''+friend.uid+'\')" class="slider-image f current">';
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
            if($('#chat-text-box').attr('value')== (fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue'] /*'type your message here'*/){
                return;
            }
            var message ={
                msg:$('#chat-text-box').attr('value'),
                to:window.localStorage.chatwindow
            }
            $('#chat-text-box').attr('value','');
            //clearing the enter effict.
            $("#sendMessage").focus();
            window.setTimeout(function(){
                $("#chat-text-box").focus();
            }, 100);
            //updating conversation.
            var me=JSON.parse(window.localStorage.user);
            var out=fbchatpopup.populateChatWindow(message.msg, 'blue', me.pic_square, me.name);
            $("#focusButton").before(out);
            $("#focusButton").focus();
            window.setTimeout(function(){
                $("#chat-text-box").focus();
            },100);
            window.scroll(0,150);
            //send message via background.
            chrome.extension.sendRequest({
                'action':'sendmessage',
                'message':message
            });
        },
        /**
         * generate the html for the chat window.
         */
        populateChatWindow:function(msg,color,senderpic,sindername){
            msg=""+msg;
            var urlinmsg=background.util.getURL(msg);
            if(urlinmsg != null){
                msg=msg.replace(urlinmsg, "<a style='cursor: pointer;' onclick='fbchatpopup.openURL(\""+urlinmsg+"\");'>"+urlinmsg+"</a>");
                anim[11].value=":/ ";
            }
            for( z= 0; z< anim.length;z++){
                msg=background.util.replaceAll(msg, anim[z].value, '<img src="'+anim[z].img+'" width="16" height="16"/>');
            }
            anim[11].value=":/";
            msg=background.util.replaceAll(msg, "\n", "<br>");
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
            //removing notification image.
            $('#friend-'+uid).children(".notification").remove();
            //adding chat to the activechat in localStorage.
            if(! window.localStorage.activeChat){
                window.localStorage.activeChat="[]";
            }
            //collapsing the online friends.
            $('.top-menu-container').slideUp('slow');
            $('.activeOnlineFriends').removeClass('activeOnlineFriends');
            $('.activeFriendsList').removeClass('activeFriendsList');
            //___update chat windows.
            $("#conversation-container").Loadingdotdotdot({
                "speed": 400,
                "maxDots": 4,
                "message":"loading"
            });
            // opening a new chat tab.
            background.fbchatdb.getFriendByUID(uid, function(friend){
                if(friend.online == 'true'){
                    //setting online icon and enapling the text area.
                    $("#chat-buddy-img").attr('src','images/status_color.png');
                    $("#chat-text-box").attr('disabled',false);
                    $("#offline-notify").hide();
                    $("#conversation-container").css('height','376px');

                }else{
                    //setting offline user, disaple text area. writing use is offline.
                    $("#chat-buddy-img").attr('src','images/status_offline_color.png');
                    $("#offline-notify").show();
                    $("#conversation-container").css('height','360px');
                }

                //unbind any previous click actions.
                $("#sendMessage").unbind("click");
                $("#chat-text-box").unbind("keypress");
                //bind new click actions.
                $("#sendMessage").bind("click",function(){
                    fbchatpopup.sendMessage();
                });
                $("#chat-text-box").bind("keypress",function(e){
                    if(e.keyCode == 13 && ! $.specialKeys('shift')){
                        fbchatpopup.sendMessage();
                    }
                });
                $("#chat-text-box").attr('value',(fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue']/*'type your message here'*/);
                $("#chat-text-box").css('color','gray');
                //checking the chat in active chat.
                var activeChat=JSON.parse(window.localStorage.activeChat);
                if(background.util.inObjectArray(friend, activeChat,'uid') == -1){
                    activeChat.push(friend);
                    window.localStorage.activeChat=JSON.stringify(activeChat);
                    //appending the frined icon to the slider of chat friends.
                    fbchatpopup.disposableFunctions.appendToSlider(fbchatpopup.addToChatFriends(friend));
                    
                }
                //adding active class to active chat window icon.
                $(".active").removeClass("active");
                $("#friend-"+uid).addClass("active");
                //save the current chat window friend id.
                window.localStorage.chatwindow=friend.uid;
                
                background.fbchatdb.getTodayChatByUID(uid, function(chat){
                    $("#conversation-container").Loadingdotdotdot("stop");
                    var chatContainer="";
                    for(i=0; i< chat.length; i++){
                        chatContainer+=fbchatpopup.populateChatWindow(chat[i].msg, chat[i].dircolor, chat[i].sender_pic,chat[i].sender_name);
                    }
                    $("#conversation-container").html(chatContainer);
                    $("#conversation-container").append('<button class="focusButton" id="focusButton"></button>');
                    $("#focusButton").focus();
                    window.setTimeout(function(){
                        $("#chat-text-box").focus();
                    },100);
                });
                
                //___update open chat box name
                $("#chat-buddy-name").html(friend.name);
                //for offline
                $("#chat-buddy-name2").html(friend.name.substring(0, friend.name.indexOf(" ")));
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
                $("#offline-notify").hide();
                $("#conversation-container").css('height','376px');
                //___update open chat box name
                $("#chat-buddy-name").html("");
                $("#chat-buddy-img").hide();
                $("#closeChat").hide();
                delete window.localStorage.chatwindow;
            }else{
                fbchatpopup.openchatwindow(activeChat[activeChat.length -1].uid);
            }
            $("#friend-"+uid).parent().remove();
            fbchatpopup.disposableFunctions.appendToSlider();
        },
        /**
         * running the intervals while popup is on.
         */
        runIntervals:function(){
        //fbchatpopup.updatetOnlineFriends();
        //fbchatpopup.friendsInterval=window.setInterval("fbchatpopup.updatetOnlineFriends();", 1000 * 60 * 2);
        },
        /**
         * open a new tab with the given url.
         */
        openURL:function(url,focas){
            background.extension.openURL(url, focas);
        }
    };
    $(function(){
        //setting locals
        fbchatpopup.disposableFunctions.setLocals();
        //______check if user is logged to application on facebook or not. if not user will  be redirected to facebook to authenticate application.
        if(window.localStorage.logged == 'false'){
            background.extension.openURL(proxy.baseURL+proxy.loginURL, true);
            chrome.extension.sendRequest({
                'action':'getAuth'
            });
            window.localStorage.logged = 'logging';
            window.close();
        }else if(window.localStorage.logged == 'logging'){
            $('#container').hide();
            $("#logging").fadeIn('fast');
            window.setTimeout(function(){
                window.location.reload();
            }, 1000 * 5);
            return;
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
            //clearing the badge text.
            window.localStorage.unreadMSGS=0;
            chrome.browserAction.setBadgeText({
                text:""
            });
            //closing any opened notifications.
            chrome.extension.getViews({
                type:"notification"
            }).forEach(function(win){
                win.close();
            });
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
                    //                    $("#slideInner").append(fbchatpopup.addToChatFriends(activeChat[j]));
                    fbchatpopup.disposableFunctions.appendToSlider(fbchatpopup.addToChatFriends(activeChat[j]));
                }
                $("#slideshow").show();
            }else{
                $('#online-users').trigger("click");
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