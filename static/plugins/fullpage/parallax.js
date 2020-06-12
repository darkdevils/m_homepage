/**
 * @author  : hahnzhu
 * @version : 0.2.2
 * @date    : 2014-09-28
 * @repository: https://github.com/hahnzhu/parallax.js
 */

if (typeof jQuery === 'undefined') { throw new Error('Parallax.js\'s script requires Zepto') }

!function($) {

//  'use strict';

    var startPos,
        endPos,
        stage,
        offset,
        direction,

        curPage,
        pageCount,
        pageWidth,
        pageHeight,

        $pages,
        $pageArr,
        $animateDom,

        options,

        touchDown = false,
        movePrevent = true;


    // ==============================

    $.fn.parallax = function(opts) {
        options = $.extend({}, $.fn.parallax.defaults, opts);

        return this.each(function() {
            $pages = $(this);
            $pageArr = $pages.find('.page');

            init();
        })
    }


    // ==============================

    $.fn.parallax.defaults = {

        direction: 'vertical',
        swipeAnim: 'default',
        drag: true,
        loading: false,
        indicator: false,
        arrow: false,
        onchange: function(){},
        orientationchange: function(){}
    };

    function init() {
    	if (options.loading) {
			$('.wrapper').append('<div class="parallax-loading"><i class="ui-loading ui-loading-white"></i></div>');
        } else {

            movePrevent = false;
        }

		curPage 	= 0;
		direction	= 'stay';
        pageCount   = $pageArr.length;
        pageWidth   = document.documentElement.clientWidth;
        pageHeight  = document.documentElement.clientHeight;
        $animateDom = $('[data-animation]');

        for (var i=0; i<pageCount; i++) {
            $($pageArr[i]).attr('data-id', i+1);
        }

        $pages.addClass(options.direction)
            	.addClass(options.swipeAnim);

        $pageArr.css({
            'width': pageWidth + 'px',
            'height': pageHeight + 'px'
        });

        options.direction === 'horizontal' ?
            $pages.css('width', pageWidth * $pageArr.length) :
            $pages.css('height', pageHeight * $pageArr.length);


        if (options.swipeAnim === 'cover') {
            $pages.css({
                'width': pageWidth,
                'height': pageHeight
            });
            $pageArr[0].style.display = 'block';
        }


		if (!options.loading) {
            $($pageArr[curPage]).addClass('current');
            options.onchange(curPage, $pageArr[curPage], direction);
            animShow();
        }

    }

    // ==============================

    function onStart(e) {

        if (movePrevent === true) {
            event.preventDefault();
            return false;
        }

        touchDown = true;

        options.direction === 'horizontal' ? startPos = e.pageX : startPos = e.pageY;

        if (options.swipeAnim === 'default') {
            $pages.addClass('drag');

            offset = $pages.css("-webkit-transform")
                        .replace("matrix(", "")
                        .replace(")", "")
                        .split(",");

            options.direction === 'horizontal' ?
                offset = parseInt(offset[4]) :
                offset = parseInt(offset[5]);
        }

        if ((options.swipeAnim === 'cover' && options.drag)) {
            $pageArr.addClass('drag');
        }

        stage = 1;
    }

    // ==============================

    function onMove(e) {

        if(movePrevent === true || touchDown === false){
          event.preventDefault();
            return false;
        }
        //event.preventDefault();
        options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;

        addDirecClass();

        if (options.drag && !isHeadOrTail()) {
            dragToMove();
        }
        stage = 2;
    }

    // ==============================

    function onEnd(e) {

        if (movePrevent === true || stage !== 2){
            // event.preventDefault();
            // return false;
        } else {
            touchDown = false;
            options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;


            if (options.swipeAnim === 'default' && !isHeadOrTail()) {
                $pages.removeClass('drag');

                if (Math.abs(endPos-startPos) <= 50) {
                    animatePage(curPage);
                    direction = 'stay';
                }
                else if (endPos >= startPos) {
                    animatePage(curPage-1);
                    direction = 'backward';
                }
                else if (endPos < startPos) {
                    animatePage(curPage+1);
                    direction = 'forward';
                }
            }



            else if (options.swipeAnim === 'cover' && !isHeadOrTail()){

                if (Math.abs(endPos-startPos) <= 50 && endPos >= startPos && options.drag) {
                    animatePage(curPage, 'keep-backward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) <= 50 && endPos < startPos && options.drag) {
                    animatePage(curPage, 'keep-forward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && options.drag) {
                    animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && options.drag) {
                    animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && !options.drag) {
                    animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && !options.drag) {
                    animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
            }


			if (options.indicator) {
                $($('.parallax-h-indicator ul li, .parallax-v-indicator ul li').removeClass('current').get(curPage)).addClass('current');
            }
            stage = 3;
        }

    }

    // ==============================

    function dragToMove() {

        if (options.swipeAnim === 'default') {

            var temp = offset + endPos - startPos;

            options.direction === 'horizontal' ?
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
        }



        else if (options.swipeAnim === 'cover') {

            var temp      =  endPos - startPos,
                $prevPage = $($pageArr[curPage-1]),
                $nextPage = $($pageArr[curPage+1]);

            $($pageArr).css({'z-index': 0});

            if (options.direction === 'horizontal' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(temp-pageWidth) +'px)'
                })
            }
            else if (options.direction === 'horizontal' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(pageWidth+temp) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (temp-pageHeight) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (pageHeight+temp) +'px)'
                })
            }
        }

    }


    // ==============================

    function animatePage(newPage, action) {

        curPage = newPage;

        if (options.swipeAnim === 'default') {

            var newOffset = 0;
            options.direction === 'horizontal' ?
                newOffset = newPage * (-pageWidth) :
                newOffset = newPage * (-pageHeight);

            options.direction === 'horizontal' ?
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

        }



        else if (options.swipeAnim === 'cover') {

            if (action === 'keep-backward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateX(-100%)'}) :
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateY(-100%)'})
            }
            else if (action === 'keep-forward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateX(100%)'}) :
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateY(100%)'})
            }
            else if (action === 'forward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage-1]).addClass('back'); // 纯粹为了在动画结束后隐藏，不涉及 CSS 中定义的动画
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'backward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage+1]).addClass('back');
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'forward' && !options.drag) {
                $pages.addClass('animate');
                $($pageArr[curPage-1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }
            else if (action === 'backward' && !options.drag) {
                $pages.addClass('animate');
                $($pageArr[curPage+1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }

        }

        movePrevent = true;
        setTimeout(function() {
            movePrevent = false;
        }, 300);
    }


    // ==============================

    function addDirecClass() {
        if(options.direction === 'horizontal'){
            if (endPos >= startPos) {
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        } else {
            if (endPos >= startPos) {
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        }
    }


    // ==============================

    function isHeadOrTail() {
        if (options.direction === 'horizontal') {
            if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
                return true;
            }
        } else if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
            return true;
        }
        return false;
    }


    // ==============================

    function animShow() {

        $animateDom.css({
        	'-webkit-animation': 'none',
        	'display': 'none'
        	});


        $('.current [data-animation]').each(function(index, element){
            var $element    = $(element),
                $animation  = $element.attr('data-animation'),
                $duration   = $element.attr('data-duration') || 500,
                $timfunc    = $element.attr('data-timing-function') || 'ease',
                $delay      = $element.attr('data-delay') ?  $element.attr('data-delay') : 0;


			if ($animation === 'followSlide') {

				if (options.direction === 'horizontal' && direction === 'forward') {
					$animation = 'followSlideToLeft';
				}
				else if (options.direction === 'horizontal' && direction === 'backward') {
					$animation = 'followSlideToRight';
				}
				else if (options.direction === 'vertical' && direction === 'forward') {
					$animation = 'followSlideToTop';
				}
				else if (options.direction === 'vertical' && direction === 'backward') {
					$animation = 'followSlideToBottom';
				}

			}

            $element.css({
//              '-webkit-animation': $animation +' '+ $duration + 'ms ' + $timfunc + ' '+ $delay + 'ms both',

				'display': 'block',

				'-webkit-animation-name': $animation,
				'-webkit-animation-duration': $duration + 'ms',
				'-webkit-animation-timing-function': 'ease',
				'-webkit-animation-timing-function': $timfunc,
				'-webkit-animation-delay': $delay + 'ms',
				'-webkit-animation-fill-mode': 'both'
            })
        });
    }

    // ==============================

    $(document)
        .on('touchstart', '.page', function(e) {
            onStart(e.changedTouches[0]);
        })
        .on('touchmove', '.page', function(e) {
            onMove(e.changedTouches[0]);
        })
        .on('touchend', '.page', function(e) {
            onEnd(e.changedTouches[0]);
        })
        .on('webkitAnimationEnd webkitTransitionEnd', '.pages', function() {

			if (direction !== 'stay') {
				setTimeout(function() {
	                $(".back").hide().removeClass("back");
	                $(".front").show().removeClass("front");
	                $pages.removeClass('forward backward animate');
	            }, 10);

	            $($pageArr.removeClass('current').get(curPage)).addClass('current');
	            options.onchange(curPage, $pageArr[curPage], direction);
	            animShow();
			}

        });


	$('.page *').on('webkitAnimationEnd', function() {
        event.stopPropagation();
    })


    // ==============================

    $(window).on("load", function() {

        if (options.loading) {
            $(".parallax-loading").remove();
            movePrevent = false;
            $($pageArr[curPage]).addClass('current');
            options.onchange(curPage, $pageArr[curPage], direction);
            animShow();
        }

        if (options.indicator) {
            movePrevent = false;

			var temp = options.direction === 'horizontal' ? 'parallax-h-indicator' : 'parallax-v-indicator';

            $('.wrapper').append('<div class='+temp+'></div>');
            var lists = '<ul>';
            for (var i=1; i<=pageCount; i++) {
                if (i===1) {
                    lists += '<li class="current"></li>'
                } else {
                    lists += '<li></li>'
                }
            }
            lists += '</ul>';
            $('.'+temp).append(lists);
        }

        if (options.arrow) {
            $pageArr.append('<span class="parallax-arrow"></span>');
            $($pageArr[pageCount-1]).find('.parallax-arrow').remove();
        }
    });

    // ==============================

    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function(e) {
    	if (window.orientation === 180 || window.orientation === 0) {
			options.orientationchange('portrait');
		}
		if (window.orientation === 90 || window.orientation === -90 ){
			options.orientationchange('landscape')
		}

    }, false);


}(jQuery)
