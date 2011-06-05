/**
 * JQuery SpecialKeys plugin
 * You can use this plugin to determine if any special keys are 
 * pressed within any of you Javascript code.
 * 
 * @author Amjad Mohamed
 * @version 0.1.1
 * 
 */

(function($) {
	
	var specialKeys_pressed = {};
	var specialKeys_keyshort = {
		'ctrl': 17,
		'control': 17,
		'alt': 18,
		'shift': 16,
		'enter': 13,
		'return': 13
	};
	
	jQuery.specialKeys = function(key) {
		key = $.trim(key).toLowerCase();
		
		if (specialKeys_keyshort[key] != undefined) {
			return specialKeys_pressed[specialKeys_keyshort[key]];
		} else {
			return specialKeys_pressed[key];
		}
	};

	$(document).bind('keydown', function(e) {
		specialKeys_pressed[e.keyCode] = true;
	});

	$(document).bind('keyup', function(e) {
		delete specialKeys_pressed[e.keyCode];
	});
	
	$(document).bind('blur', function(e) {
		for (var i in specialKeys_pressed) {
			delete specialKeys_pressed[i];
		}
	});

})(jQuery);