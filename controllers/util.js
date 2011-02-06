/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var util={
    /**
     * clone object.
     * @return the new cloned object
     * @param object the object to be cloned.
     */
    clone:function (object) { // shallow clone
        var clone = {};
        for (var key in object) {
            clone[key] = object[key];
        }
        return clone;
    },
    /**
     * cut text with respect to word completion.
     * @param text the text to be cutted.
     * @param length aproximatly length to cut text after, not exactly the length of the new text.
     * @param suffix the suffix text after cutted text.
     * @return the new cutted text
     */
    cutText:function(text,length,suffix){
        if(! suffix){
            suffix = '';
        }
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( length) != " "){
                length++;
            }else{
                i=20;
            }
        }
        return text.substring(0, length) + " " + suffix;
    },
    /**
     * get alist of checked elements value in the page.
     * @return an array of checked elements values.
     */
    selectedRows:function(){
        var checked=[];
        $(':checkbox').each(function(){
            if(this.checked){
                checked.push(this.value);
            }
        });
        return checked;
    },
    /**
     * revers a string.
     * @param str the string to be reversed.
     * @return the reversed string.
     * @example var x=reverseString('abcd');
     *          console.log(x);//this prints dcba
     *          
     */
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
    /**
     * replaces all match strings in the given string.
     * @param str original string.
     * @param match the match string.
     * @param replace the string to replace with.
     * @return the new string.
     * @deprecated original 1.2 js lib str.replace(/regix/g,replac) see the example.
     * @example replaceAll('abcdefghiabc', "ab", "x");
     *          //you can use javascript replace with regix
     *          var str='abcdefghiabc';
     *          var replace=str.replace(/abc/g,'x');
     *          console.log(replace);//prints xdefghix
     *
     */
    replaceAll:function(str,match,replace){
        var retstr=str;
        while(retstr.indexOf(match) != -1){
            retstr=retstr.replace(match, replace);
        }
        return retstr;
    },
    /**
     * From JQuery 1.4.4
     * Copyright 2010, John Resig
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     */
    extend:function(){
        var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = jQuery.extend( deep, clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }
}
//console.log(util.replaceAll('abcdefghiabc', "abc", "x"));
//console.log('abcdefghiabc'.replace(/abc/g, "x"));