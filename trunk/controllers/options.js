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
        }
    };
    $(function(){
        if(window.localStorage.connected =='false'){
            $("friends").html('u have to connect first');
        }else{
            background.fbchatdb.getAllFriends(function(list){
                $("#friends").html(fbchatoptions.createFriendList(list));
                $("ul#friends li").click(function(){
                    $("#clearhsitory").attr('value',this.id);
                    background.fbchatdb.getChatByUID(this.id, function(chat){
                        $("#chatHistroy").html(fbchatoptions.createChatHistory(chat));
                    });
                })
            });
        }
        $("#clearhsitory").click(function(){
            background.fbchatdb.clearChat(this.value,function(){});
        });
    });
    return fbchatoptions;
}
var fbchatoptions=new fbchatOptions();