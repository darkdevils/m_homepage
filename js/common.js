
function showcase() {
    var $showcase = $('#wrap .showcase'),
        $showcaseArea = $('.showcase-wrap'),
        $sections = $('.section'),
        $document = $('#document'),
        $window = $(window),

        $sectionsBody = $sections.find('.section-body'),
        $oImgs = $('.o-img'),
        $imgs = $oImgs.find('>img'),
        $controlBtn = $('.control > button'),
        $controlBtnNext = $('.control > button.next'),
        $controlBtnPrev = $('.control > button.prev'),
        $paging = $('.paging'),
        $pagingArea = $paging.find('.current-area'),
        $movedObject = $('.scroll-text, .control-btn, .paging'),

        Touchs = {x: 0, y: 0, t: 0},
        TouchMoves = {x: 0, y: 0, t: 0, prevY: 0},

        Lens = $sections.length,
        MaxLens = $sections.length - 1
        ViewportHeight = 0,
        FooterHeight = $('#footer').height(),
        TouchsLastMax = 0,
        TouchHeight = 0,

        Interval = null,

        curIndex = 0,

        timeout = null,
        keydownId = null,
        wheelMove = true,
        topMoved = 150,
        clickIndex = 0,
        mouseStart = 0,
        aniSpeed = 1000,
        startIdx = 0,

        MouseMoving = undefined,
        TouchMoving = undefined,

        WheelAnimations = undefined,
        TouchAnimations = false,

        // wheel Event variable
        scrollings = [],
        canScroll = true,
        prevTime = +new Date();

    var
        // initialize
        init = function () {
            loadSet();
            addEvent();
        },
        // 이벤트 추가
        addEvent = function () {
            $(window).on('resize.showcase', resize);
            $(window).on('scroll.showcase', scroll);

            $.browser.mobile = ($.browser.ios || $.browser.android);
            if ($.browser.mobile) {
                $document.on({
                    touchstart: mobileEvent.touchstart,
                    touchmove: mobileEvent.touchmove,
                    touchend: mobileEvent.touchend
                }).data({y: 0});
                $('html, body').css({
                    height: '100%',
                    overflow: 'hidden'
                });
                $sections.removeClass('on');
                $controlBtn.on('click', function () {
                    var moveUpDown = ($(this).hasClass('next')) ? 1 : -1;
                    mobileEvent.clickMove(moveUpDown);
                });
            }
        },

        // 리사이즈 함수
        resize = function (e) {
            var v = e.viewport.v;

            //전역변수
            ViewportHeight = e.viewport.height;
            FooterHeight = $('footer').height();

            $showcase.css({height: ViewportHeight * $imgs.length});
            $showcaseArea.css({height: ViewportHeight});

            // 화면에 맞춰서 리사이즈
            $oImgs.each(function () {
                var imageSize = {
                    width: $(this).find('img').data('naturalWidth')[v],
                    height: $(this).find('img').data('naturalHeight')[v]
                };
                fill(this, e.viewport.width, ViewportHeight, imageSize.width, imageSize.height);
            });

        },
        loadSet = function () {
            $sections.removeClass('active').eq(curIndex).addClass('active first-section');
            $sections.each(function (i) {
                $(this).css({
                    'opacity': 1,
                    'visibility': 'visible',
                    'background': 'transparent',
                    'z-index': 10 - i
                });
            });

            var $loadTitle = $('.first-section .title .subtitle, .first-section .title h2');
            var titleShow = setTimeout(function () {
                TweenMax.staggerFromTo($('.first-section .title .subtitle, .first-section .title h2'), .88, {
                    marginLeft: '-10%',
                    opacity: 0
                }, {marginLeft: '0', opacity: 1}, 0.14);
                TweenMax.staggerFromTo($('.first-section .title .mores'), .88, {
                    marginLeft: '-10%',
                    opacity: 0
                }, {marginLeft: '0', opacity: 0.7}, 0.14);
            }, 1000);

            $paging.find('.total').text($sections.length);
            $paging.find('.current-area').append('<ul class="current"></ul>');

            for (var i = 0; i <= MaxLens; i++) {
                $paging.find('ul').append('<li>' + (i + 1) + '</li>');
            }
            $controlBtn.filter('.prev').addClass('none');


            $('#footer .btn-top').on('click', function (e) {
                e.preventDefault();
                curIndex = 0;
                mobileEvent.moveMotion(1, 0);
                TouchMoves.y = 0;
                TouchAnimations = false;
                $document.data('y', TouchMoves.y);
                $controlBtnNext.removeClass('none');
            });
        },
        buttonRemove = function (i) {
            if (i == 0) {
                $controlBtnPrev.addClass('none');
            } else if (i >= Lens) {
                $controlBtnNext.addClass('none');
            } else {
                $controlBtn.removeClass('none');
            }
            ;
        },

        mobileEvent = {
            touchstart: function (e) {
                TouchMoving = undefined;
                TouchsLastMax = ViewportHeight * MaxLens;
                TouchHeight = ViewportHeight + 50;
                startIdx = (TouchMoves.y >= TouchsLastMax + FooterHeight) ? Lens : Math.floor(TouchMoves.y / ViewportHeight);

                Touchs = {
                    x: (e.touches[0].pageX),
                    y: (e.touches[0].pageY),
                    t: +new Date()
                }

                $sections.find('.title').css('transition', 'none');
                $sections.find('.mask').css('transition', 'none');
            },
            touchmove: function (e) {
                if ($('body').hasClass('gnb-open')) {
                    TouchAnimations = true;
                } else {
                    TouchAnimations = false;
                }
                if (TouchAnimations) return false;
                var dataY = $document.data('y');
                TouchMoves = {
                    x: (e.touches[0].pageX) - Touchs.x,
                    y: (e.touches[0].pageY) - Touchs.y + dataY,
                    t: +new Date() - Touchs.t,
                    prevY: TouchMoves.y
                }

                if (TouchMoving === undefined) {
                    TouchMoving = !!(Math.abs(TouchMoves.x) < Math.abs(TouchMoves.y));
                }

                if (TouchMoving) {
                    TouchMoves.y = Math.min(Math.max(-TouchMoves.y, 0), (ViewportHeight * Lens) + FooterHeight);

                    var idx = Math.floor(TouchMoves.y / ViewportHeight);
                    idx = (idx - startIdx >= 2) ? idx - 1 : (idx - startIdx < -1) ? idx + 1 : idx;
                    if (idx - startIdx < -1) $sections.eq(idx).css('top', '0');
                    mobileEvent.sectionMove(idx);
                }

                if (!$(e.target).closest('a, button') || !$(e.target).is('a, button')) {
                    e.preventDefault();
                }
            },
            sectionMove: function (idx) {
                if (!TouchAnimations) {
                    var index = Math.max(Math.min(idx, MaxLens), 0),
                        lastMaxY = (ViewportHeight * Lens) + FooterHeight,
                        value,
                        lastValue;

                    for (var i = MaxLens - 1; i >= 0; i--) {
                        value = (i < index) ? -ViewportHeight : (i == index) ? -(TouchMoves.y % ViewportHeight) : 0;

                        $sections[i].style.top = value + 'px';
                        mobileEvent.textMove(value, i);
                    }

                    if (index == MaxLens) {
                        if (TouchMoves.y > TouchMoves.prevY) {
                            lastValue = (TouchMoves.y > TouchsLastMax + FooterHeight) ? FooterHeight : TouchMoves.y % ViewportHeight;
                        } else {
                            lastValue = (TouchMoves.y <= ViewportHeight * MaxLens) ? 0 : (TouchMoves.y < TouchsLastMax + FooterHeight) ? TouchMoves.y % ViewportHeight : FooterHeight;
                        }
                        $sections[MaxLens].style.top = -lastValue + 'px';
                        $movedObject.css({'margin-bottom': lastValue})
                    } else {
                        $sections[MaxLens].style.top = '0px';
                    }
                }

            },
            touchend: function (e) {
                var deltaY = Math.round(Math.abs($document.data('y') + TouchMoves.y));
                var idx = (TouchMoves.y >= TouchsLastMax + FooterHeight) ? Lens : Math.floor(TouchMoves.y / ViewportHeight);
                var moveUpDown = (TouchMoves.prevY < TouchMoves.y) ? 1 : 0;
                var oneSectionMove = (TouchMoves.prevY < TouchMoves.y) ? -1 : 1;
                var endAnimated;

                idx += moveUpDown;

                if (deltaY > 5) {
                    idx = (Math.abs(idx - startIdx) >= 2) ? idx += oneSectionMove : idx;

                    $sections.stop().find('.title').css({
                        'transform': 'translate(0,0)',
                        '-ms-transform': 'translate(0,0)',
                        'opacity': '1',
                        'transition': 'all 0.4s'
                    });
                    $sections.stop().find('.mask').css({
                        'opacity': '0.11',
                        'transition': 'opacity 0.4s'
                    });

                    mobileEvent.moveMotion(moveUpDown, idx);
                    endAnimated = setTimeout(function () {
                        clearTimeout(endAnimated);
                        TouchAnimations = false;
                        TouchMoving = undefined;
                    }, 400);
                }
                $document.data('y', -TouchMoves.y);

            },
            moveMotion: function (moveUpDown, idx) {
                TouchAnimations = true;
                var $pagingCurrent = $paging.find('.current');
                var index = Math.max(Math.min(idx, Lens), 0);
                var pagingMoveData = (index > MaxLens) ? pagingMoveData = $pagingArea.height() * MaxLens : pagingMoveData = $pagingArea.height() * index;
                var nextIndex = index + 1;
                if (nextIndex >= Lens) nextIndex = Lens;

                $sections.removeClass('active').eq(idx).addClass('active');

                var $currentSection = $('section.active'),
                    $currentSectionVideo = $currentSection.find('video');
                if ($currentSectionVideo.length) {
                    $currentSectionVideo[0].currentTime = 0;
                    $currentSectionVideo[0].play();
                }

                $pagingCurrent.stop(1).animate({
                    'margin-top': -pagingMoveData + 'px'
                }, 600, 'dfy');

                buttonRemove(idx);

                if (moveUpDown <= 0) {
                    $sections.eq(nextIndex).stop().find('.title').css({
                        'transform': 'translate(0, 150px)',
                        '-ms-transform': 'translate(0, 150px)',
                        'opacity': '0',
                        'transition': 'all 0.4s'
                    });
                    $sections.eq(nextIndex).stop().find('.mask').css({
                        'opacity': '1',
                        'transition': 'opacity 0.4s'
                    });
                } else {
                    $sections.eq(index).stop().find('.title').css({
                        'transform': 'translate(0,0)',
                        '-ms-transform': 'translate(0,0)',
                        'opacity': '1',
                        'transition': 'all 0.4s'
                    });
                    $sections.eq(index).stop().find('.mask').css({
                        'opacity': '0.11',
                        'transition': 'opacity 0.4s'
                    });
                }

                $sections.each(function (i) {
                    if (i < index) {
                        $(this).stop(1).animate({top: -TouchHeight}, 400, function () {
                            if ($(this).find('video').length) {
                                $(this).find('video')[0].pause();
                                $(this).find('video')[0].currentTime = 0;
                            }
                        });
                    } else {
                        $movedObject.stop(1).animate({'margin-bottom': 0}, 400);
                        $(this).stop(1).animate({top: 0});
                    }

                });

                if (index == Lens) {
                    $sections.each(function (i) {
                        if (i != MaxLens) {
                            $(this).stop(1);
                            this.style.top = -TouchHeight * 2 + 'px';
                        }
                    });
                    $sections.eq(MaxLens).stop(1).animate({top: -FooterHeight}, 400);
                    $movedObject.stop(1).animate({'margin-bottom': FooterHeight}, 400);

                    TouchMoves.y = (MaxLens * ViewportHeight) + FooterHeight;
                } else {
                    TouchMoves.y = idx * ViewportHeight;
                }

            },
            textMove: function (val, idx) {
                var per = .3,
                    winHeight = $window.height(),
                    sectionHeight = winHeight - (winHeight * per),
                    dataNum = Math.abs(val / sectionHeight),
                    opacityNum = Math.min(1, dataNum),
                    topNum = Math.floor(dataNum * topMoved) - topMoved;
                topNum = Math.min(0, topNum);
                topNum = 0 || topNum;
                $sections.eq(idx + 1).find('.title').css({
                    'transform': 'translate(0,' + -topNum + 'px)',
                    '-ms-transform': 'translate(0,' + -topNum + 'px)',
                    'opacity': opacityNum
                });

                var fillOpacity = -(opacityNum - 1);
                fillOpacity = Math.max(0.11, fillOpacity);
                $sections.eq(idx + 1).find('.mask').css('opacity', fillOpacity);

            },
            clickMove: function (moveUpDown) {
                var idx = (TouchMoves.y >= TouchsLastMax + FooterHeight) ? Lens : Math.floor(TouchMoves.y / ViewportHeight);

                idx += moveUpDown;
                var index = Math.max(Math.min(idx, Lens), 0);

                TouchAnimations = true;
                mobileEvent.moveMotion(moveUpDown, index);
                clearInterval(Interval);
                Interval = setTimeout(function () {
                    TouchAnimations = false;
                }, 400);
                $document.data('y', -TouchMoves.y);
            }
        }

    init();
}
$(showcase);
