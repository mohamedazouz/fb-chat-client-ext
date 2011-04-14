/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var extension={
    openURL:function(url,focus){
        chrome.tabs.create({
            url:url,
            selected:focus
        });
    }
}

