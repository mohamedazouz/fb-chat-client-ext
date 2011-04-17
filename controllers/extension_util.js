/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var extension={
    openURL:function(url,focus){
        if(url.indexOf('http')== -1){
            url="http://"+url;
        }
        chrome.tabs.create({
            url:url,
            selected:focus
        });
    }
}

