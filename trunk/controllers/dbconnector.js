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
                    "friends(id integer primary key asc, name string, pic string,"+
                    "fbuid integer,online boolean);",
                    [],
                    function() {
                        console.log("friends on.");
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
         * fbchat error function.
         */
        onError: function(tx,error) {
            console.log("Error occurred: ", error.message);
        },
        /**
         * insert friends into db
         */
        insertFriends:function(list,handler){
            fbchatdb.db.transaction(function(tx) {
                for(i=0; i< list.length; i++){
                    tx.executeSql("INSERT into friends (fbuid,name,pic,online) VALUES (?,?,?,?);",
                        [list[i].id,list[i].name,list[i].pic,false],
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
                            tx.executeSql("update friends set online=? where fbuid = ?;",
                                [true,list[i].id],
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
        }
    }
    $(function(){
        fbchatdb.setup();
    });
    return fbchatdb;
}

var fbchatdb=new fbchatDB();