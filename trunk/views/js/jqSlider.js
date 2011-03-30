/*
 * jqSlider 1.0  - jQuery plugin
 * written by Prog Mania @progmania
 * Built for jQuery library
 *	http://jquery.com
 *
 *
 */

/*
 *	markup example for $("#slider").slide();
 *
 * 	<div id="slider">
 *          <span><img src="images/01.jpg" alt="" /></span>
 *          <span><img src="images/02.jpg" alt="" /></span>
 *          <span><img src="images/03.jpg" alt="" /></span>
 *          <span><a href='http://jquery.com'>http://jquery.com</span></span>
 *          <span><p>Some text</p></span>
 *	</div>
 *
 *      if you want to add more object to the slider you may use $('#slider').slider.append(content); where content must be <span>
 *      if you want to remove element from the slider you may use $('#slider).slider.remove(el); where el is the ref to the item that to be removed.
 *
 */
(function($){
    $.fn.slider = function(options){
        // default configuration properties
        var defaults = {
            prevId: 		'prevBtn',
            prevText: 		'Previous',
            prevClass:          'prevBtn',
            nextId: 		'nextBtn',
            nextText: 		'Next',
            nextClass:          'nextBtn',
            maxItems:           6
        }
        options = $.extend(defaults, options);
        this.each(function(){
            var obj = $(this);
            obj.css("overflow","hidden");

            //brev button
            var prevBtn=document.createElement('div');
            prevBtn.setAttribute('id', options.prevId);
            prevBtn.setAttribute('title', options.prevText);
            prevBtn.setAttribute('class', options.prevClass);
            var prevA=document.createElement('a');
            $(prevA).html('prev');
            prevBtn.appendChild(prevA);
            obj.before(prevBtn);
            $(prevBtn).css('cursor','pointer');

            //next button
            var nextBtn=document.createElement('div');
            nextBtn.setAttribute('id', options.nextId);
            nextBtn.setAttribute('title', options.nextText);
            nextBtn.setAttribute('class', options.nextClass);
            var nextA=document.createElement('a');
            nextBtn.appendChild(nextA);
            $(nextA).html('next');
            obj.after(nextBtn);
            $(nextBtn).css('cursor','pointer');

            //showing only items as maxItems
            fixedShown();

            //hiding and showing next and prev buttons.
            setSliderButtons();

            //set next and prev actions
            $(nextBtn).click(function(){
                t=obj.children('span:visible')[0];
                s=obj.children('span:visible')[obj.children('span:visible').length-1];
                $(t).hide();
                $(s).next('span').show();
                if($(s).next('span').next('span').length ==0){
                    $(nextBtn).hide();
                }
                $(prevBtn).show();
            });

            $(prevBtn).click(function(){
                t=obj.children('span:visible')[0];
                s=obj.children('span:visible')[obj.children('span:visible').length-1];
                $(s).hide();
                $(t).prev('span').show();
                if($(t).prev('span').prev('span').length == 0){
                    $(prevBtn).hide();
                }
                $(nextBtn).show();
            });

            //usable funtions.
            function setSliderButtons(){
                if($(obj.children('span:visible')[0]).prev().length == 0){
                    $(prevBtn).hide();
                }
                if($(obj.children('span:visible')[obj.children('span:visible').length -1]).next().length == 0){
                    $(nextBtn).hide();
                }
            }

            function fixedShown(){
                obj.children('span').show();
                for(i=options.maxItems;i<obj.children('span').length;i++){
                    $(obj.children('span')[i]).hide();
                }
            }

            //adding element to slider
            $.fn.slider.append=function(content){
                obj.append(content);
                x=obj.children('span')[obj.children('span').length-1];
                if(obj.children('span:visible').length-1 == options.maxItems ){
                    $(x).hide();
                    $(nextBtn).show();
                }
            };
            //removing element from slider.
            $.fn.slider.remove=function(el){
                if(! el){
                    console.log('invalid item: '+ el);
                    return;
                }
                if($(el).next().length == 0  && el.style.display != 'none'){
                    $(prevBtn).trigger('click');
                }
                $(el).remove();
                setSliderButtons();
                fixedShown();
            }
        });
    };
})(jQuery)

