(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function initBurgerMenu() {
        if (window.__app.burgerInitialized) return;
        window.__app.burgerInitialized = true;

        var toggle = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var body = document.body;
        var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        if (!toggle || !collapse) return;

        function closeMenu() {
            collapse.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('u-no-scroll');
        }

        function openMenu() {
            collapse.classList.add('show');
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('u-no-scroll');
        }

        toggle.addEventListener('click', function() {
            if (collapse.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collapse.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (collapse.classList.contains('show') && 
                !collapse.contains(e.target) && 
                !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', closeMenu);
        }

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 768) {
                closeMenu();
            }
        }, 250));
    }

    function initSmoothScroll() {
        if (window.__app.smoothScrollInitialized) return;
        window.__app.smoothScrollInitialized = true;

        var isHomepage = location.pathname === '/' || 
                        location.pathname === '/index.html' || 
                        location.pathname.endsWith('/index.html');

        function getHeaderHeight() {
            var header = document.querySelector('header');
            return header ? header.offsetHeight : 80;
        }

        if (!isHomepage) {
            var sectionLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#!"])');
            for (var i = 0; i < sectionLinks.length; i++) {
                var href = sectionLinks[i].getAttribute('href');
                sectionLinks[i].setAttribute('href', '/' + href);
            }
        }

        document.addEventListener('click', function(e) {
            var anchor = e.target.closest('a[href^="#"]:not([href="#"]):not([href="#!"])');
            if (!anchor) return;

            var href = anchor.getAttribute('href');
            var targetId = href.substring(1);
            var target = document.getElementById(targetId);

            if (target) {
                e.preventDefault();
                var headerHeight = getHeaderHeight();
                var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    function initScrollSpy() {
        if (window.__app.scrollSpyInitialized) return;
        window.__app.scrollSpyInitialized = true;

        var sections = document.querySelectorAll('[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        function updateActiveLink() {
            var scrollPos = window.pageYOffset + 100;

            sections.forEach(function(section) {
                var sectionTop = section.offsetTop;
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(updateActiveLink, 100));
        updateActiveLink();
    }

    function initActiveMenu() {
        if (window.__app.activeMenuInitialized) return;
        window.__app.activeMenuInitialized = true;

        var currentPath = location.pathname;
        var navLinks = document.querySelectorAll('.nav-link:not([href^="#"])');

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var href = link.getAttribute('href');
            
            link.removeAttribute('aria-current');
            link.classList.remove('active');

            if (href === currentPath || 
                (currentPath === '/' && href === '/index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        }
    }

    function initScrollAnimations() {
        if (window.__app.scrollAnimInitialized) return;
        window.__app.scrollAnimInitialized = true;

        var elements = document.querySelectorAll('.card, .hero-section, .accordion-item, img:not([data-critical])');
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        });
    }

    function initRippleEffect() {
        if (window.__app.rippleInitialized) return;
        window.__app.rippleInitialized = true;

        var buttons = document.querySelectorAll('.btn, .c-button, .nav-link, a.btn');

        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.className = 'ripple-effect';

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });

        var style = document.createElement('style');
        style.textContent = '.ripple-effect{position:absolute;border-radius:50%;background:rgba(255,255,255,0.5);transform:scale(0);animation:ripple-animation 0.6s ease-out;}@keyframes ripple-animation{to{transform:scale(4);opacity:0;}}';
        document.head.appendChild(style);
    }

    function initCountUp() {
        if (window.__app.countUpInitialized) return;
        window.__app.countUpInitialized = true;

        var counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        function animateCounter(element) {
            var target = parseInt(element.getAttribute('data-count'));
            var duration = 2000;
            var start = 0;
            var increment = target / (duration / 16);
            var current = start;

            function updateCounter() {
                current += increment;
                if (current < target) {
                    element.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            }

            updateCounter();
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function initScrollToTop() {
        if (window.__app.scrollTopInitialized) return;
        window.__app.scrollTopInitialized = true;

        var button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', 'Nach oben scrollen');
        button.innerHTML = '↑';
        document.body.appendChild(button);

        var style = document.createElement('style');
        style.textContent = '.scroll-to-top{position:fixed;bottom:24px;right:24px;width:48px;height:48px;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));color:white;border:none;border-radius:50%;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease;box-shadow:var(--shadow-md);z-index:1000;}.scroll-to-top.visible{opacity:1;visibility:visible;}.scroll-to-top:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);}';
        document.head.appendChild(style);

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 300) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        }, 100));

        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initFormValidation() {
        if (window.__app.formsInitialized) return;
        window.__app.formsInitialized = true;

        var forms = document.querySelectorAll('.needs-validation');
        
        var notificationContainer = document.createElement('div');
        notificationContainer.className = 'position-fixed top-0 end-0 p-3';
        notificationContainer.style.zIndex = '1070';
        document.body.appendChild(notificationContainer);

        window.__app.notify = function(message, type) {
            type = type || 'info';
            var toast = document.createElement('div');
            toast.className = 'alert alert-' + type + ' alert-dismissible fade show';
            toast.style.minWidth = '300px';
            toast.style.boxShadow = 'var(--shadow-lg)';
            toast.innerHTML = escapeHTML(message) + '<button type="button" class="btn-close" aria-label="Schließen"></button>';
            
            notificationContainer.appendChild(toast);
            
            setTimeout(function() {
                toast.style.opacity = '1';
            }, 10);

            toast.querySelector('.btn-close').addEventListener('click', function() {
                toast.style.opacity = '0';
                setTimeout(function() {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            });
            
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(function() {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }
            }, 5000);
        };

        var validationRules = {
            name: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Name muss 2-50 Zeichen enthalten und darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten'
            },
            firstName: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Vorname muss 2-50 Zeichen enthalten und darf nur Buchstaben enthalten'
            },
            lastName: {
                pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
                message: 'Nachname muss 2-50 Zeichen enthalten und darf nur Buchstaben enthalten'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
            },
            phone: {
                pattern: /^[\d\s+\-()]{10,20}$/,
                message: 'Telefonnummer muss 10-20 Zeichen enthalten und darf nur Zahlen, Leerzeichen, +, -, (, ) enthalten'
            },
            message: {
                minLength: 10,
                message: 'Nachricht muss mindestens 10 Zeichen enthalten'
            }
        };

        function validateField(field) {
            var fieldName = field.name || field.id;
            var value = field.value.trim();
            var isValid = true;
            var errorMessage = '';

            var invalidFeedback = field.parentElement.querySelector('.invalid-feedback');
            if (!invalidFeedback) {
                invalidFeedback = document.createElement('div');
                invalidFeedback.className = 'invalid-feedback';
                field.parentElement.appendChild(invalidFeedback);
            }

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Dieses Feld ist erforderlich';
            } else if (value) {
                var rule = validationRules[fieldName];
                if (rule) {
                    if (rule.pattern && !rule.pattern.test(value)) {
                        isValid = false;
                        errorMessage = rule.message;
                    } else if (rule.minLength && value.length < rule.minLength) {
                        isValid = false;
                        errorMessage = rule.message;
                    }
                }
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                errorMessage = 'Sie müssen dieser Option zustimmen';
            }

            if (isValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                invalidFeedback.style.display = 'none';
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                invalidFeedback.textContent = errorMessage;
                invalidFeedback.style.display = 'block';
            }

            return isValid;
        }

        forms.forEach(function(form) {
            var honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.position = 'absolute';
            honeypot.style.left = '-9999px';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.appendChild(honeypot);

            var fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(function(field) {
                if (field.name !== 'website') {
                    field.addEventListener('blur', function() {
                        validateField(this);
                    });

                    field.addEventListener('input', debounce(function() {
                        if (this.classList.contains('is-invalid')) {
                            validateField(this);
                        }
                    }, 300));
                }
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (honeypot.value) {
                    return false;
                }

                var isFormValid = true;
                var firstInvalidField = null;

                fields.forEach(function(field) {
                    if (field.name !== 'website') {
                        var isValid = validateField(field);
                        if (!isValid) {
                            isFormValid = false;
                            if (!firstInvalidField) {
                                firstInvalidField = field;
                            }
                        }
                    }
                });

                if (!isFormValid) {
                    if (firstInvalidField) {
                        firstInvalidField.focus();
                        var rect = firstInvalidField.getBoundingClientRect();
                        var headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 80;
                        window.scrollTo({
                            top: window.pageYOffset + rect.top - headerHeight - 20,
                            behavior: 'smooth'
                        });
                    }
                    window.__app.notify('Bitte korrigieren Sie die markierten Fehler', 'danger');
                    return;
                }

                var submitBtn = form.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.innerHTML : '';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
                }

                setTimeout(function() {
                    window.__app.notify('Ihre Nachricht wurde erfolgreich gesendet!', 'success');
                    
                    setTimeout(function() {
                        window.location.href = 'thank_you.html';
                    }, 1500);
                }, 1000);
            });
        });
    }

    function initAccordion() {
        if (window.__app.accordionInitialized) return;
        window.__app.accordionInitialized = true;

        var accordionButtons = document.querySelectorAll('.accordion-button');

        accordionButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var targetId = this.getAttribute('data-bs-target');
                var target = document.querySelector(targetId);
                var isExpanded = this.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    target.classList.remove('show');
                    this.classList.add('collapsed');
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    var parent = this.closest('.accordion');
                    if (parent) {
                        var openItems = parent.querySelectorAll('.accordion-collapse.show');
                        openItems.forEach(function(item) {
                            item.classList.remove('show');
                            var btn = parent.querySelector('[data-bs-target="#' + item.id + '"]');
                            if (btn) {
                                btn.classList.add('collapsed');
                                btn.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }

                    target.classList.add('show');
                    this.classList.remove('collapsed');
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    function initCardAnimations() {
        if (window.__app.cardAnimInitialized) return;
        window.__app.cardAnimInitialized = true;

        var cards = document.querySelectorAll('.card');

        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = 'var(--shadow-lg)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = 'var(--shadow-sm)';
            });
        });
    }

    function initPrivacyModal() {
        if (window.__app.privacyModalInitialized) return;
        window.__app.privacyModalInitialized = true;

        var privacyLinks = document.querySelectorAll('a[href="privacy.html"], a[href="/privacy.html"]');
        
        privacyLinks.forEach(function(link) {
            if (link.closest('.form-check')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.open(this.href, '_blank', 'width=800,height=600');
                });
            }
        });
    }

    function initLazyLoading() {
        if (window.__app.lazyLoadInitialized) return;
        window.__app.lazyLoadInitialized = true;

        var images = document.querySelectorAll('img:not([loading])');
        var videos = document.querySelectorAll('video:not([loading])');

        images.forEach(function(img) {
            if (!img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }
        });

        videos.forEach(function(video) {
            video.setAttribute('loading', 'lazy');
        });
    }

    function initHeaderScroll() {
        if (window.__app.headerScrollInitialized) return;
        window.__app.headerScrollInitialized = true;

        var header = document.querySelector('header');
        if (!header) return;

        var lastScroll = 0;

        window.addEventListener('scroll', throttle(function() {
            var currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = 'var(--shadow-md)';
            } else {
                header.style.boxShadow = 'var(--shadow-sm)';
            }

            lastScroll = currentScroll;
        }, 100));
    }

    window.__app.init = function() {
        initBurgerMenu();
        initSmoothScroll();
        initScrollSpy();
        initActiveMenu();
        initScrollAnimations();
        initRippleEffect();
        initCountUp();
        initScrollToTop();
        initFormValidation();
        initAccordion();
        initCardAnimations();
        initPrivacyModal();
        initLazyLoading();
        initHeaderScroll();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();