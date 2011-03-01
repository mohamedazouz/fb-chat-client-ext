/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var background=chrome.extension.getBackgroundPage();
var fbchatOptions=function(){
    var fbchatoptions={
        createFriendList:function(list){
            var out="";
            for(var i in list){
                out+='<li style="cursor:pointer;" id="'+list[i].uid+'">';
                out+=list[i].name;
                out+='</li>';
            }
            return out;
        },
        createChatHistory:function(histroy){
            var out='';
            for(var i in histroy){
                out+='<li>';
                out+=histroy[i].sender_name;
                out+=' said: ';
                out+=histroy[i].msg;
                out+=', on: ';
                out+=histroy[i].msgdate;
                out+=":";
                out+=histroy[i].msgtime;
                out+='</li>';
            }
            return out;
        },
        domEvents:function(){
            $("#clearhsitory").click(function(){
                background.fbchatdb.clearChat(this.value,function(){
                    $("#clearhsitory").hide();
                    $("#chatHistroy").html('');
                });
            });
            $("#lang").change(function(){
                window.localStorage.lang=this.value;
            });
            $('#lang-'+window.localStorage.lang).attr('selected', 'true');
        },
        loadFriendsChatHistory:function(){
            background.fbchatdb.getAllFriends(function(list){
                $("#friends").html(fbchatoptions.createFriendList(list));
                $("ul#friends li").click(function(){
                    $("#clearhsitory").attr('value',this.id);
                    background.fbchatdb.getChatByUID(this.id, function(chat){
                        if(chat.length ==0){
                            $("#chatHistroy").html('no chat histroy for this user');
                            return;
                        }
                        $("#chatHistroy").html(fbchatoptions.createChatHistory(chat));
                        $("#clearhsitory").show();
                    });
                })
            });
        }
    };
    $(function(){
        if(window.localStorage.connected =='false'){
            $("body").html('<br><center><h3>you have to connect first and reload the page</h3></center>');
            return;
        }
        fbchatoptions.loadFriendsChatHistory();
        fbchatoptions.domEvents();
    });
    return fbchatoptions;
}
var fbchatoptions=new fbchatOptions();