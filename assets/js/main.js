/**
 * CFT Care School - Main JavaScript Module
 * Handles core functionality including modals, navigation, and form interactions
 */

(function() {
    'use strict';

    // DOM ready state check
    const ready = (callback) => {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    // Modal management system
    const ModalManager = {
        currentModal: null,
        previousFocus: null,

        open(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.warn(`Modal with ID "${modalId}" not found`);
                return;
            }

            // Store current focus for restoration
            this.previousFocus = document.activeElement;

            // Show modal
            modal.classList.add('modal-backdrop--open');
            modal.setAttribute('aria-hidden', 'false');
            this.currentModal = modal;

            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Prevent background scroll
            document.body.style.overflow = 'hidden';

            // Add escape key listener
            document.addEventListener('keydown', this.handleKeydown);
        },

        close(modal = null) {
            const modalToClose = modal || this.currentModal;
            if (!modalToClose) return;

            modalToClose.classList.remove('modal-backdrop--open');
            modalToClose.setAttribute('aria-hidden', 'true');
            
            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
                this.previousFocus = null;
            }

            // Re-enable background scroll
            document.body.style.overflow = '';

            // Remove escape key listener
            document.removeEventListener('keydown', this.handleKeydown);

            this.currentModal = null;
        },

        handleKeydown(event) {
            if (event.key === 'Escape' && ModalManager.currentModal) {
                ModalManager.close();
            }

            // Trap focus within modal
            if (event.key === 'Tab' && ModalManager.currentModal) {
                const focusableElements = ModalManager.currentModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        event.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        event.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        }
    };

    // Form validation utilities
    const FormValidator = {
        validate(form) {
            const errors = [];
            const inputs = form.querySelectorAll('[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    errors.push({
                        field: input.name || input.id,
                        message: this.getErrorMessage(input)
                    });
                    this.showFieldError(input, this.getErrorMessage(input));
                } else {
                    this.clearFieldError(input);
                    
                    // Additional validation based on input type
                    if (input.type === 'email' && !this.isValidEmail(input.value)) {
                        errors.push({
                            field: input.name || input.id,
                            message: '請輸入有效的Email格式'
                        });
                        this.showFieldError(input, '請輸入有效的Email格式');
                    }
                    
                    if (input.type === 'tel' && !this.isValidPhone(input.value)) {
                        errors.push({
                            field: input.name || input.id,
                            message: '請輸入有效的手機號碼格式'
                        });
                        this.showFieldError(input, '請輸入有效的手機號碼格式');
                    }
                }
            });
            
            return errors.length === 0;
        },

        getErrorMessage(input) {
            const label = input.closest('.field')?.querySelector('label')?.textContent?.replace('*', '').trim();
            return `${label || '此欄位'}為必填項目`;
        },

        showFieldError(input, message) {
            this.clearFieldError(input);
            input.classList.add('field-error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field__error';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');
            
            input.parentNode.appendChild(errorDiv);
        },

        clearFieldError(input) {
            input.classList.remove('field-error');
            const errorDiv = input.parentNode.querySelector('.field__error');
            if (errorDiv) {
                errorDiv.remove();
            }
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        isValidPhone(phone) {
            const phoneRegex = /^09\d{8}$/;
            return phoneRegex.test(phone);
        }
    };

    // Navigation utilities
    const Navigation = {
        init() {
            this.setActiveMenuItem();
            this.initMobileMenu();
        },

        setActiveMenuItem() {
            const currentPath = window.location.pathname;
            const menuItems = document.querySelectorAll('.header__menu-item');
            
            menuItems.forEach(item => {
                item.classList.remove('header__menu-item--active');
                if (item.getAttribute('href') && currentPath.includes(item.getAttribute('href'))) {
                    item.classList.add('header__menu-item--active');
                    item.setAttribute('aria-current', 'page');
                }
            });
        },

        initMobileMenu() {
            // Mobile menu toggle functionality would be implemented here
            // For now, we're using a simple responsive design without hamburger menu
        }
    };

    // Notification system
    const NotificationManager = {
        show(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.setAttribute('role', 'alert');
            notification.innerHTML = `
                <div class="notification__content">
                    <span class="notification__message">${message}</span>
                    <button class="notification__close" aria-label="關閉通知">✕</button>
                </div>
            `;

            // Add to DOM
            const container = this.getContainer();
            container.appendChild(notification);

            // Auto-remove after duration
            setTimeout(() => {
                this.remove(notification);
            }, duration);

            // Manual close
            notification.querySelector('.notification__close').addEventListener('click', () => {
                this.remove(notification);
            });

            return notification;
        },

        remove(notification) {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        },

        getContainer() {
            let container = document.getElementById('notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'notification-container';
                container.className = 'notification-container';
                document.body.appendChild(container);
            }
            return container;
        }
    };

    // Initialize everything when DOM is ready
    ready(() => {
        // Initialize navigation
        Navigation.init();

        // Modal event listeners
        document.addEventListener('click', (event) => {
            const openTarget = event.target.getAttribute('data-open');
            const closeTarget = event.target.hasAttribute('data-close');

            if (openTarget) {
                event.preventDefault();
                ModalManager.open(openTarget);
            }

            if (closeTarget || event.target.classList.contains('modal-backdrop')) {
                event.preventDefault();
                const modal = event.target.closest('.modal-backdrop');
                ModalManager.close(modal);
            }
        });

        // Form submission handling
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (!form.matches('form')) return;

            event.preventDefault();

            // Validate form
            if (!FormValidator.validate(form)) {
                NotificationManager.show('請檢查表單中的錯誤項目', 'error');
                return;
            }

            // Simulate form submission
            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> 處理中...';

            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                // Close modal if form is in modal
                const modal = form.closest('.modal-backdrop');
                if (modal) {
                    ModalManager.close(modal);
                }
                
                NotificationManager.show('操作成功完成', 'success');
            }, 1500);
        });

        // Smooth scrolling for anchor links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;

            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        // Input enhancement
        document.querySelectorAll('input, textarea').forEach(input => {
            // Clear error styling on input
            input.addEventListener('input', () => {
                FormValidator.clearFieldError(input);
            });

            // Auto-formatting for phone numbers
            if (input.type === 'tel') {
                input.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) {
                        value = value.substring(0, 10);
                    }
                    e.target.value = value;
                });
            }
        });

        // Table enhancements
        document.querySelectorAll('table').forEach(table => {
            // Add responsive wrapper if not already present
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });

        console.log('CFT Care School application initialized successfully');
    });

    // Expose utilities globally for use in individual pages
    window.CFT = {
        ModalManager,
        FormValidator,
        Navigation,
        NotificationManager
    };

})();