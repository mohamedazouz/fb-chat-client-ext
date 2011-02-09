/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var date_util={
    today:function(){
        //format yy/mm/dd
        var date=new Date();
        var todaystring=date.getFullYear()+'/'+((date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1))+'/'+(date.getDate()>9?date.getDate():'0'+date.getDate());
        return todaystring;
    },
    dayInWeek:function(dateString){
        //format yy/mm/dd
        var weekDays=['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dateComponents=dateString.split("/");
        var date=new Date(dateComponents[0],(parseInt(dateComponents[1])-1),dateComponents[2]);
        return(weekDays[date.getDay()]);
    },
    tomorrow:function(){
        //format yy/mm/dd
        var date=new Date();
        var todaystring=date.getFullYear()+'/'+((date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1))+'/'+((date.getDate()+1)>9?(date.getDate()+1):'0'+(date.getDate()+1));
        return todaystring;
    },
    nextDay:function(date){
        date.setTime(date.getTime()+86400000);
        return date;
    },
    nextWeek:function(date){
        date.setTime(date.getTime()+604800000);
        return date;
    },
    nextMonth:function(date){
        var nextMonth=null;
        if (date.getMonth() == 11) {
            nextMonth = new Date(date.getFullYear() + 1, 0, date.getDate());
        } else {
            nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        }
        return nextMonth;
    },
    nextYear:function(date){
        return new Date(date.getFullYear()+1, date.getMonth(), date.getDate());
    },
    dateString:function(date){
        //format yy/mm/dd
        var todaystring=date.getFullYear()+'/'+((date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1))+'/'+(date.getDate()>9?date.getDate():'0'+date.getDate());
        return todaystring;
    },
    Date:function(dateString){
        //formate yy/mm/dd
        var dates=dateString.split("/");
        var date =new Date(dates[0],dates[1]-1,dates[2]);
        return date;
    },
    now:function(){
        var date=new Date();
        var now=(date.getHours()%12 > 9 ? date.getHours()%12 : '0'+(date.getHours()%12))+':'+(date.getMinutes()>9?date.getMinutes():'0'+(date.getMinutes()))+' '+(date.getHours() > 12?'pm':'am');
        return now;
    },
    cutText:function(text,lenght){
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( lenght) != " "){
                lenght++;
            }else{
                i=20;
            }
        }
        return text.substring(0, lenght)+" ...";
    },
    selectedRows:function(){
        var checked=[];
        $(':checkbox').each(function(){
            if(this.checked){
                checked.push(this.value);
            }
        });
        return checked;
    },
    reverseString:function(str){
        var i=str.length;
        i=i-1;
        var revstr=""
        for (var x = i; x >=0; x--)
        {
            revstr+=str.charAt(x);
        }
        return revstr;
    },
    replaceAll:function(str,match,replace){
        var i=str.length;
        i=i-1;
        var revstr=""
        for (var x = i; x >=0; x--)
        {
            revstr+=(str.charAt(x)==match?replace:str.charAt(x));
        }
        return revstr;
    },
    icalrfc2445Date:function(date,sep){
        var dates=date.split(sep);
        var icaldate="";
        for(var i=0;i<dates.length;i++){
            icaldate+=dates[i];
        }
        return icaldate;
    }
}