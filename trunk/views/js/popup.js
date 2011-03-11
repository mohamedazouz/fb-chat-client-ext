/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function() {
    // online friends slider
    $('#online-users').click(function() {
        $('.activeFriendsList').removeClass('activeFriendsList');
        $('#online-top-menu-container').slideToggle('slow');
        $(this).toggleClass('activeOnlineFriends');
        $('#friendlist-top-menu-container').slideUp('slow');
        $('#settings-top-menu-container').slideUp('slow');
    });
    $('#online-friends-arrow , #online-friends-top-menu-footer').click(function() {
        $('#online-top-menu-container').slideUp('slow');
        $('.activeOnlineFriends').removeClass('activeOnlineFriends');
    });
    //friend list slider
    $('#friends-list').click(function(){
        $('.activeOnlineFriends').removeClass('activeOnlineFriends');
        $('#friendlist-top-menu-container').slideToggle('slow');
        $(this).toggleClass("activeFriendsList");
        $('#online-top-menu-container').slideUp('slow');
        $('#settings-top-menu-container').slideUp('slow');
    });
    $('#friendlist-friends-arrow , #friendlist-friends-top-menu-footer').click(function() {
        $('#friendlist-top-menu-container').slideUp('slow');
        $('.activeFriendsList').removeClass('activeFriendsList');
    });
    //settings slider
    $('#settings').click(function(){
        $('#settings-top-menu-container').slideToggle('slow');
        $('#online-top-menu-container').slideUp('slow');
        $('#friendlist-top-menu-container').slideUp('slow');
        $('.activeOnlineFriends').removeClass('activeOnlineFriends');
        $('.activeFriendsList').removeClass('activeFriendsList');
    });
    $('#settings-arrow , #settings-top-menu-footer').click(function() {
        $('.activeOnlineFriends').removeClass('activeOnlineFriends');
        $('.activeFriendsList').removeClass('activeFriendsList');
        $('#settings-top-menu-container').slideUp('slow');
    });
    //typeing area.
    $('.typing-box').mouseover(function(){
        if(this.value == (fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue']/*'type your message here'*/){
            this.value='';
        }
    }).mouseout(function(){
        if(this.value == ''){
            //use i18n later for message
            this.value=(fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue']/*'type your message here'*/;
            $(this).css('color','gray');
        }
    }).keydown(function(){
        if(this.value == (fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue']/*'type your message here'*/){
            this.value='';
        }else{
            $(this).css('color','#B5C0D8');
        }
    });
    //icons actions
    $('.icons').click(function(){
        $('.emoticons-container').toggle();
    });
    $('body').click(function(event){
        if( !$(event.target.parentNode).hasClass('emoticons') &&
            !$(event.target.parentNode).hasClass('emoticons-middle') &&
            !$(event.target.parentNode).hasClass('emoticons-container') &&
            !$(event.target.parentNode).hasClass('icons') &&
            !$(event.target).hasClass('emoticons') &&
            !$(event.target).hasClass('emoticons-middle') &&
            !$(event.target).hasClass('emoticons-container') &&
            !$(event.target).hasClass('icons') ){

            $('.emoticons-container').hide();
        }
    });
    $('.emoticons').click(function(){
        if($("#chat-text-box").attr('disabled')=="true"){
            return;
        }
        if($("#chat-text-box").attr('value')==(fbchatlocals[window.localStorage.lang])['DefautlTextAreaValue']/*'type your message here'*/){
            $("#chat-text-box").attr('value',$(this).attr('value'));
        }else{
            $("#chat-text-box").attr('value', $("#chat-text-box").attr('value')+$(this).attr('value'));
        }

    });
    //friends Filter
    window.setTimeout(function(){
        $("input#friendsFilter").quicksearch("div#friend-list div.user-container");
        $("input#onlineFilter").quicksearch("div#online-top-menu-container div.user-container");
        $("#clearonline , #clearfriends").click(function(){
            $("input#friendsFilter ,input#onlineFilter").val("");
            $("input#friendsFilter ,input#onlineFilter").trigger("keyup");
        })
    }, 1200)

    // users slider
    var currentPosition = 0;
    var slideWidth = 50;
    var slides = $('.slide');
    var numberOfSlides = slides.length;

    // Remove scrollbar in JS
    $('#slidesContainer').css('overflow', 'hidden');

    // Wrap all .slides with #slideInner div
    slides
    .wrapAll('<div id="slideInner"></div>')
    // Float left to display horizontally, readjust .slides width
    .css({
        'float' : 'left',
        'width' : slideWidth
    });
    // Set #slideInner width equal to total width of all slides
    $('#slideInner').css('width', slideWidth * numberOfSlides);

    // Insert controls in the DOM
    $('#slideshow')
    .prepend('<span class="control" id="leftControl">Clicking moves left</span>')
    .append('<span class="control" id="rightControl">Clicking moves right</span>');

    // Hide left arrow control on first load
    manageControls(currentPosition);

    // Create event listeners for .controls clicks
    $('.control')
    .bind('click', function(){
        // Determine new position
        currentPosition = ($(this).attr('id')=='rightControl') ? currentPosition+1 : currentPosition-1;

        // Hide / show controls
        manageControls(currentPosition);
        // Move slideInner using margin-left
        $('#slideInner').animate({
            'marginLeft' : slideWidth*(-currentPosition)
        });
    });

    // manageControls: Hides and Shows controls depending on currentPosition
    function manageControls(position){
        // Hide left arrow if position is first slide
        if(position==0){
            $('#leftControl').hide()
        } else{
            $('#leftControl').show()
        }
        // Hide right arrow if position is last slide
        if(position==numberOfSlides-6){
            $('#rightControl').hide()
        } else{
            $('#rightControl').show()
        }
    }
});
