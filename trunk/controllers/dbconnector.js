/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var fbchatDB=function(){
    var fbchatdb={
        db:this.db,
        setup:function(){
            fbchatdb.db=openDatabase('fbchat', '1.0', 'facebook chat extension database',  5*1024*1024);
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("create table if not exists " +
                    "friends(id integer primary key asc, name string, pic_square string,"+
                    "uid integer,online boolean);",
                    [],
                    function() {
                        console.log("friends on.");
                    },
                    fbchatdb.onError);
                tx.executeSql("create table if not exists " +
                    "chat_history(id integer primary key asc, uid integer,  msg string, "+
                    "sender_name string, sender_pic string, msgtime string, msgdate string, dircolor string);",
                    [],
                    function() {
                        console.log("chat on.");
                    },
                    fbchatdb.onError);
                tx.executeSql("DELETE FROM friends;",
                    [],
                    function(){
                        console.log("cleare friends");
                    },fbchatdb.onError);
            });
        },
        /**
         * insert friends into db
         */
        insertFriends:function(list,handler){
            fbchatdb.db.transaction(function(tx) {
                for(i=0; i< list.length; i++){
                    tx.executeSql("INSERT into friends (uid,name,pic_square,online) VALUES (?,?,?,?);",
                        [list[i].uid,list[i].name,list[i].pic_square,false],
                        handler(list),
                        fbchatdb.onError);
                }
            });
        },
        /**
         * update list of online friends.
         */
        setOnline:function(list){
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("update friends set online=? ;",
                    [false],
                    function(){
                        for(i=0; i< list.length; i++){
                            tx.executeSql("update friends set online=? where uid = ?;",
                                [true,list[i].uid],
                                null,
                                fbchatdb.onError);
                        }
                    },
                    fbchatdb.onError);
            });
        },
        /**
         * get a list of online friends.
         */
        getOnlineFriends:function(handler){
            var onlineFriends=[];
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM friends where online=? ;",
                    [true],
                    function(tx,results) {
                        for (i = 0; i < results.rows.length; i++) {
                            onlineFriends.push(util.clone(results.rows.item(i)));
                        }
                        handler(onlineFriends);
                    });
            },
            fbchatdb.onError);
        },
        /**
         * get a friend item with unique facebook id.
         */
        getFriendByUID:function(uid,handler,msg){
            var friends=[];
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM friends where uid=? ;",
                    [uid],
                    function(tx,results) {
                        for (i = 0; i < results.rows.length; i++) {
                            friends.push(util.clone(results.rows.item(i)));
                        }
                        handler(friends.length == 0 ? null : friends[0] ,msg);
                    });
            },
            fbchatdb.onError);
        },
        /**
         * get Chat messages history by uid.
         * @param uid friend uid.
         * @param handler after success function
         */
        getChatByUID:function(uid,handler){
            var chat=[];
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM chat_history where uid=? ;",
                    [uid],
                    function(tx,results) {
                        for (i = 0; i < results.rows.length; i++) {
                            chat.push(util.clone(results.rows.item(i)));
                        }
                        handler(chat);
                    });
            },
            fbchatdb.onError);
        },
        /**
         * get Chat messages history by uid.
         * @param uid friend uid.
         * @param max max chat messages.
         * @param handler after success function
         */
        getMaxChatByUID:function(uid,max,handler){
            var chat=[];
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM chat_history WHERE uid=? ORDER BY msgdate DESC, msgtime DESC LIMIT ?;",
                    [uid,max],
                    function(tx,results) {
                        for (i = 0; i < results.rows.length; i++) {
                            chat.push(util.clone(results.rows.item(i)));
                        }
                        handler(chat);
                    });
            },
            fbchatdb.onError);
        },
        /**
         * get Chat messages history by uid.
         * @param uid friend uid.
         * @param handler after success function
         */
        getTodayChatByUID:function(uid,handler){
            var chat=[];
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM chat_history where uid=? AND msgdate =?",
                    [uid,date_util.today()],
                    function(tx,results) {
                        for (i = 0; i < results.rows.length; i++) {
                            chat.push(util.clone(results.rows.item(i)));
                        }
                        handler(chat);
                    });
            },
            fbchatdb.onError);
        },
        /**
         * save a message to the chat history.
         */
        inserChatMessage:function(message,handler){
            fbchatdb.db.transaction(function(tx) {
                tx.executeSql("INSERT into chat_history (uid,msg,sender_name,sender_pic,msgdate,msgtime,dircolor) VALUES (?,?,?,?,?,?,?);",
                    [message.uid,message.msg,message.sender_name,message.sender_pic,message.msgdate?message.msgdate:date_util.today(),message.msgtime?message.msgtime:date_util.now(),message.dircolor],
                    handler(),
                    fbchatdb.onError);
            });
        },
        /**
         * fbchat error function.
         */
        onError: function(tx,error) {
            console.log("Error occurred: ", error);
        }
    }
    $(function(){
        fbchatdb.setup();
    });
    return fbchatdb;
}

var fbchatdb=new fbchatDB();
