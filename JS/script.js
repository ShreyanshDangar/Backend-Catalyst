document.addEventListener('DOMContentLoaded', function() {
    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var settingsBtn = document.querySelector('.settings-btn');
    var settingsPanel = document.querySelector('.settings-panel');
    var bookmarkBtn = document.querySelector('.bookmark-btn');
    var scrollProgress = document.querySelector('.scroll-progress');
    var sections = document.querySelectorAll('.day-section');
    var bookmarkData = JSON.parse(localStorage.getItem('bookmarkData')) || null;
    var currentTheme = localStorage.getItem('theme') || 'sand';
    var currentFont = localStorage.getItem('font') || 'merriweather';
    var currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    document.body.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-font', currentFont);
    document.documentElement.style.fontSize = (currentFontSize / 100) * 16 + 'px';
    var navPill = document.querySelector('.nav-pill');
    var navLinks = document.querySelector('.nav-links');
    var navIdleTimeout = null;
    var navScrollTimeout = null;

    function setNavIdle() {
        if (navPill) {
            navPill.classList.add('idle');
            navPill.classList.remove('scrolling');
        }
    }

    function setNavActive() {
        if (navPill) {
            navPill.classList.remove('idle');
            navPill.classList.add('scrolling');
            clearTimeout(navIdleTimeout);
            navIdleTimeout = setTimeout(setNavIdle, 2000);
        }
    }

    if (navLinks) {
        navLinks.addEventListener('scroll', function() {
            setNavActive();
            clearTimeout(navScrollTimeout);
            navScrollTimeout = setTimeout(function() {
                navPill.classList.remove('scrolling');
            }, 150);
        }, {
            passive: true
        });

        navLinks.addEventListener('touchstart', setNavActive, {
            passive: true
        });
        navLinks.addEventListener('touchmove', setNavActive, {
            passive: true
        });
        navLinks.addEventListener('touchend', function() {
            clearTimeout(navIdleTimeout);
            navIdleTimeout = setTimeout(setNavIdle, 2000);
        }, {
            passive: true
        });
        navLinks.addEventListener('mouseenter', function() {
            if (navPill) navPill.classList.remove('idle');
        });

        navLinks.addEventListener('mouseleave', function() {
            clearTimeout(navIdleTimeout);
            navIdleTimeout = setTimeout(setNavIdle, 1500);
        });

        setTimeout(setNavIdle, 3000);
    }

    function scrollActiveNavIntoView() {
        var activeLink = document.querySelector('.nav-links a.active');
        if (activeLink && navLinks && window.innerWidth <= 1024 && window.innerWidth > 768) {
            var linkRect = activeLink.getBoundingClientRect();
            var containerRect = navLinks.getBoundingClientRect();
            var scrollLeft = navLinks.scrollLeft;
            var linkCenter = linkRect.left - containerRect.left + scrollLeft + linkRect.width / 2;
            var containerCenter = containerRect.width / 2;
            navLinks.scrollTo({
                left: linkCenter - containerCenter,
                behavior: 'smooth'
            });
        }
    }

    setTimeout(scrollActiveNavIntoView, 500);

    window.addEventListener('resize', function() {
        clearTimeout(navIdleTimeout);
        setTimeout(scrollActiveNavIntoView, 300);
    });

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            if (settingsPanel) settingsPanel.classList.remove('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', function() {
            settingsPanel.classList.toggle('active');
            settingsBtn.classList.toggle('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    document.addEventListener('click', function(e) {
        if (settingsPanel && settingsPanel.classList.contains('active')) {
            if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPanel.classList.remove('active');
                settingsBtn.classList.remove('active');
            }
        }
    });
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    document.querySelectorAll('.theme-opt').forEach(function(b) {
        b.classList.remove('active');
    });
    document.querySelectorAll('.theme-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var theme = this.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            document.querySelectorAll('.theme-opt').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
        if (btn.getAttribute('data-theme') === currentTheme) btn.classList.add('active');
    });
    document.querySelectorAll('.font-opt').forEach(function(b) {
        b.classList.remove('active');
    });
    document.querySelectorAll('.font-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var font = this.getAttribute('data-font');
            document.body.setAttribute('data-font', font);
            localStorage.setItem('font', font);
            document.querySelectorAll('.font-opt').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
        if (btn.getAttribute('data-font') === currentFont) btn.classList.add('active');
    });
    var lastScrollTop = 0;
    var scrollTicking = false;

    function updateScrollProgress() {
        var scrollTop = window.pageYOffset;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPercent = (scrollTop / docHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = Math.min(100, Math.max(0, scrollPercent)) + '%';
        }
        scrollTicking = false;
    }

    function requestScrollUpdate() {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollProgress);
            scrollTicking = true;
        }
    }

    function updateActiveNav() {
        var scrollPos = window.pageYOffset + 100;
        sections.forEach(function(section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) link.classList.add('active');
                });
            }
        });
    }
    window.addEventListener('scroll', function() {
        requestScrollUpdate();
        updateActiveNav();
        showBookmark();
    }, {
        passive: true
    });
    updateScrollProgress();
    updateActiveNav();

    function initMCQ() {
        document.querySelectorAll('.question').forEach(function(question) {
            var correctIndex = parseInt(question.dataset.correct);
            var options = question.querySelectorAll('.option');
            var feedbackCorrect = question.querySelector('.feedback.correct');
            var feedbackIncorrect = question.querySelector('.feedback.incorrect');
            var answered = false;
            options.forEach(function(option, index) {
                option.addEventListener('click', function() {
                    if (answered) return;
                    answered = true;
                    options.forEach(function(opt) {
                        opt.classList.add('answered');
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                    if (index === correctIndex) {
                        option.classList.add('correct');
                        if (feedbackCorrect) feedbackCorrect.classList.add('show');
                    } else {
                        option.classList.add('incorrect');
                        options[correctIndex].classList.add('correct');
                        if (feedbackIncorrect) feedbackIncorrect.classList.add('show');
                    }
                });
            });
        });
    }
    initMCQ();

    function initCopyButtons() {
        document.querySelectorAll('.code-block').forEach(function(block) {
            var copyBtn = block.querySelector('.copy-btn');
            var code = block.querySelector('code');
            if (copyBtn && code) {
                copyBtn.addEventListener('click', function() {
                    var text = code.textContent;
                    navigator.clipboard.writeText(text).then(function() {
                        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied';
                        copyBtn.classList.add('copied');
                        setTimeout(function() {
                            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });
            }
        });
    }
    initCopyButtons();
    var bookmarkIndicator = null;
    var bookmarkToast = null;

    function createBookmarkIndicator() {
        if (!bookmarkIndicator) {
            bookmarkIndicator = document.createElement('div');
            bookmarkIndicator.className = 'bookmark-indicator';
            bookmarkIndicator.style.display = 'none';
            document.body.appendChild(bookmarkIndicator);
            var isDragging = false;
            var startY = 0;
            var startTop = 0;
            bookmarkIndicator.addEventListener('mousedown', function(e) {
                isDragging = true;
                startY = e.clientY;
                startTop = parseInt(bookmarkIndicator.style.top) || 0;
                bookmarkIndicator.classList.add('dragging');
                e.preventDefault();
            });
            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                var deltaY = e.clientY - startY;
                var newTop = Math.max(64, Math.min(startTop + deltaY, window.innerHeight - 50));
                bookmarkIndicator.style.top = newTop + 'px';
            });
            document.addEventListener('mouseup', function() {
                if (!isDragging) return;
                isDragging = false;
                bookmarkIndicator.classList.remove('dragging');
                saveBookmark();
            });
            bookmarkIndicator.addEventListener('touchstart', function(e) {
                isDragging = true;
                startY = e.touches[0].clientY;
                startTop = parseInt(bookmarkIndicator.style.top) || 0;
                bookmarkIndicator.classList.add('dragging');
            }, {
                passive: true
            });
            document.addEventListener('touchmove', function(e) {
                if (!isDragging) return;
                var deltaY = e.touches[0].clientY - startY;
                var newTop = Math.max(64, Math.min(startTop + deltaY, window.innerHeight - 50));
                bookmarkIndicator.style.top = newTop + 'px';
            }, {
                passive: true
            });
            document.addEventListener('touchend', function() {
                if (!isDragging) return;
                isDragging = false;
                bookmarkIndicator.classList.remove('dragging');
                saveBookmark();
            });
        }
    }

    function createBookmarkToast() {
        if (!bookmarkToast) {
            bookmarkToast = document.createElement('div');
            bookmarkToast.className = 'bookmark-toast';
            document.body.appendChild(bookmarkToast);
        }
    }

    function showToast(message, icon) {
        createBookmarkToast();
        bookmarkToast.innerHTML = icon + '<span>' + message + '</span>';
        bookmarkToast.classList.add('show');
        setTimeout(function() {
            bookmarkToast.classList.remove('show');
        }, 2500);
    }

    function saveBookmark() {
        var scrollTop = window.pageYOffset;
        var indicatorTop = parseInt(bookmarkIndicator.style.top) || window.innerHeight / 2;
        var position = scrollTop + indicatorTop - 64;
        var page = window.location.pathname.split('/').pop() || 'index.html';
        bookmarkData = {
            page: page,
            position: position
        };
        localStorage.setItem('bookmarkData', JSON.stringify(bookmarkData));
        updateBookmarkUI();
        showToast('Bookmark saved', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>');
    }

    function getPageName(page) {
        var names = {
            'index.html': 'Home',
            'day1.html': 'Day 1',
            'day2.html': 'Day 2',
            'day3.html': 'Day 3',
            'day4.html': 'Day 4',
            'day5.html': 'Day 5',
            'day6.html': 'Day 6',
            'day7.html': 'Day 7',
            'day8.html': 'Day 8',
            'day9.html': 'Day 9',
            'day10.html': 'Day 10'
        };
        return names[page] || page;
    }

    function showBookmark() {
        if (bookmarkData && bookmarkIndicator) {
            var currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (bookmarkData.page === currentPage) {
                var scrollTop = window.pageYOffset;
                var indicatorTop = bookmarkData.position - scrollTop + 64;
                if (indicatorTop >= 64 && indicatorTop <= window.innerHeight - 20) {
                    bookmarkIndicator.style.top = indicatorTop + 'px';
                    bookmarkIndicator.style.display = 'block';
                } else {
                    bookmarkIndicator.style.display = 'none';
                }
            } else {
                bookmarkIndicator.style.display = 'none';
            }
        }
    }

    function updateBookmarkUI() {
        var status = document.querySelector('.bookmark-status');
        var gotoBtn = document.querySelector('.goto-bookmark');
        var removeBtn = document.querySelector('.remove-bookmark');
        if (bookmarkData) {
            if (status) {
                status.textContent = 'Bookmark on ' + getPageName(bookmarkData.page);
                status.classList.add('has-bookmark');
            }
            if (gotoBtn) gotoBtn.disabled = false;
            if (removeBtn) removeBtn.disabled = false;
            if (bookmarkBtn) bookmarkBtn.classList.add('has-bookmark');
        } else {
            if (status) {
                status.textContent = 'No bookmark set';
                status.classList.remove('has-bookmark');
            }
            if (gotoBtn) gotoBtn.disabled = true;
            if (removeBtn) removeBtn.disabled = true;
            if (bookmarkBtn) bookmarkBtn.classList.remove('has-bookmark');
        }
    }

    function setBookmark() {
        createBookmarkIndicator();
        var scrollTop = window.pageYOffset;
        var viewportCenter = window.innerHeight / 2;
        bookmarkIndicator.style.top = viewportCenter + 'px';
        bookmarkIndicator.style.display = 'block';
        saveBookmark();
    }

    function goToBookmark() {
        if (bookmarkData) {
            var currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (bookmarkData.page === currentPage) {
                window.scrollTo({
                    top: bookmarkData.position,
                    behavior: 'smooth'
                });
            } else {
                window.location.href = bookmarkData.page + '#bookmark=' + bookmarkData.position;
            }
        }
    }

    function removeBookmark() {
        bookmarkData = null;
        localStorage.removeItem('bookmarkData');
        if (bookmarkIndicator) bookmarkIndicator.style.display = 'none';
        updateBookmarkUI();
        showToast('Bookmark removed', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>');
    }
    var setBookmarkBtn = document.querySelector('.set-bookmark');
    var gotoBookmarkBtn = document.querySelector('.goto-bookmark');
    var removeBookmarkBtn = document.querySelector('.remove-bookmark');
    if (setBookmarkBtn) setBookmarkBtn.addEventListener('click', setBookmark);
    if (gotoBookmarkBtn) gotoBookmarkBtn.addEventListener('click', goToBookmark);
    if (removeBookmarkBtn) removeBookmarkBtn.addEventListener('click', removeBookmark);
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            if (bookmarkData) {
                goToBookmark();
            } else {
                setBookmark();
            }
        });
    }
    updateBookmarkUI();
    if (bookmarkData) {
        createBookmarkIndicator();
        showBookmark();
    }
    var hash = window.location.hash;
    if (hash && hash.includes('bookmark=')) {
        var pos = parseInt(hash.split('=')[1]);
        if (!isNaN(pos)) {
            setTimeout(function() {
                window.scrollTo({
                    top: pos,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var headerOffset = 80;
                    var elementPosition = target.getBoundingClientRect().top;
                    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    function smoothScrollTo(targetY, duration) {
        var startY = window.pageYOffset;
        var difference = targetY - startY;
        var startTime = null;

        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            var progress = Math.min((currentTime - startTime) / duration, 1);
            var easeProgress = progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            window.scrollTo(0, startY + difference * easeProgress);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var pageLoader = document.querySelector('.page-loader');
    document.querySelectorAll('.page-nav a:not(.disabled), .nav-links a, .mobile-menu a, .day-card, .home-btn').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href && !href.startsWith('#') && (href.endsWith('.html') || href.includes('index'))) {
                e.preventDefault();
                if (pageLoader) {
                    pageLoader.classList.add('active');
                }
                var container = document.querySelector('.container');
                if (container) {
                    container.style.opacity = '0';
                    container.style.transform = 'translateY(-10px)';
                    container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                }
                setTimeout(function() {
                    window.location.href = href;
                }, 350);
            }
        });
    });
    var observerOptions = {
        threshold: 0.01,
        rootMargin: '50px 0px 50px 0px'
    };
    var elementsToAnimate = document.querySelectorAll('.day-section, .concept-box, .analogy, .important, .mcq-section, .project-box, .day-card');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.setAttribute('data-animated', 'true');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    elementsToAnimate.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    setTimeout(function() {
        elementsToAnimate.forEach(function(el) {
            if (el.getAttribute('data-animated') !== 'true') {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }, 1000);
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {});
    }
    document.querySelectorAll('img').forEach(function(img) {
        img.loading = 'lazy';
    });
    var fontSizeDisplay = document.getElementById('font-size-display');
    var fontIncrease = document.getElementById('font-increase');
    var fontDecrease = document.getElementById('font-decrease');

    function updateFontSize(size) {
        currentFontSize = Math.max(80, Math.min(140, size));
        document.documentElement.style.fontSize = (currentFontSize / 100) * 16 + 'px';
        localStorage.setItem('fontSize', currentFontSize);
        if (fontSizeDisplay) fontSizeDisplay.textContent = currentFontSize + '%';
        if (fontDecrease) fontDecrease.disabled = currentFontSize <= 80;
        if (fontIncrease) fontIncrease.disabled = currentFontSize >= 140;
    }
    if (fontSizeDisplay) fontSizeDisplay.textContent = currentFontSize + '%';
    if (fontDecrease) {
        fontDecrease.disabled = currentFontSize <= 80;
        fontDecrease.addEventListener('click', function() {
            updateFontSize(currentFontSize - 10);
        });
    }
    if (fontIncrease) {
        fontIncrease.disabled = currentFontSize >= 140;
        fontIncrease.addEventListener('click', function() {
            updateFontSize(currentFontSize + 10);
        });
    }
    var container = document.querySelector('.container');
    if (container) {
        container.classList.add('page-transition');
    }

    function addRipple(element, e) {
        var rect = element.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.style.cssText = 'position:absolute;border-radius:50%;background:var(--accent-soft);transform:scale(0);animation:rippleEffect 0.5s ease-out forwards;pointer-events:none;';
        var size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = ripple.style.height = size + 'px';
        var x = (e.clientX || e.touches[0].clientX) - rect.left - size / 2;
        var y = (e.clientY || e.touches[0].clientY) - rect.top - size / 2;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(function() {
            ripple.remove();
        }, 500);
    }
    var style = document.createElement('style');
    style.textContent = '@keyframes rippleEffect{to{transform:scale(1);opacity:0;}}';
    document.head.appendChild(style);
    document.querySelectorAll('.page-nav a:not(.disabled), .bookmark-actions button, .settings-opt, .nav-btn').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            addRipple(this, e);
        }, {
            passive: true
        });
    });
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            var c = document.querySelector('.container');
            if (c) {
                c.style.opacity = '1';
                c.style.transform = 'translateY(0)';
            }
            if (pageLoader) {
                pageLoader.classList.remove('active');
            }
        }
    });
    window.addEventListener('load', function() {
        if (pageLoader) {
            setTimeout(function() {
                pageLoader.classList.remove('active');
            }, 100);
        }
    });
});
