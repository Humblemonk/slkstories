/*
 * EmailJS Contact Form Handler
 * SLKStories - Stephanie Kirsche Author Website
 * Handles contact form submission via EmailJS service
 */

(function($) {
    'use strict';

    // EmailJS Configuration
    const CONFIG = {
        publicKey: "Kgj2hkLozHYv4c04I",
        serviceID: "service_slkstories", 
        templateID: "template_suloq1k"
    };

    // DOM Elements
    const ELEMENTS = {
        form: null,
        submitBtn: null,
        messageDiv: null
    };

    // Initialize EmailJS and set up form handler
    function init() {
        // Initialize EmailJS with public key
        if (typeof emailjs !== 'undefined') {
            emailjs.init(CONFIG.publicKey);
        } else {
            console.error('EmailJS library not loaded');
            return;
        }

        // Cache DOM elements
        ELEMENTS.form = document.getElementById('contact-form');
        ELEMENTS.submitBtn = document.getElementById('submit-btn');
        ELEMENTS.messageDiv = document.getElementById('form-message');

        // Verify required elements exist
        if (!ELEMENTS.form || !ELEMENTS.submitBtn || !ELEMENTS.messageDiv) {
            console.error('Required form elements not found');
            return;
        }

        // Attach form submission handler
        ELEMENTS.form.addEventListener('submit', handleFormSubmission);
    }

    // Handle form submission
    function handleFormSubmission(event) {
        event.preventDefault();

        // Show loading state
        setLoadingState(true);
        showMessage("Sending message...", "loading");

        // Send email using EmailJS
        emailjs.sendForm(CONFIG.serviceID, CONFIG.templateID, ELEMENTS.form)
            .then(handleSuccess)
            .catch(handleError)
            .finally(() => setLoadingState(false));
    }

    // Handle successful form submission
    function handleSuccess(response) {
        console.log('EmailJS SUCCESS:', response.status, response.text);
        showMessage(
            "Message sent successfully! I'll get back to you soon.",
            "success"
        );
        ELEMENTS.form.reset();
    }

    // Handle form submission error
    function handleError(error) {
        console.error('EmailJS ERROR:', error);
        showMessage(
            "Failed to send message. Please try again or email me directly at steph.kirsche07@gmail.com",
            "error"
        );
    }

    // Set loading state for submit button
    function setLoadingState(isLoading) {
        if (isLoading) {
            ELEMENTS.submitBtn.classList.add('disabled');
            ELEMENTS.submitBtn.value = 'Sending...';
            ELEMENTS.submitBtn.disabled = true;
        } else {
            ELEMENTS.submitBtn.classList.remove('disabled');
            ELEMENTS.submitBtn.value = 'Send Message';
            ELEMENTS.submitBtn.disabled = false;
        }
    }

    // Display messages to user
    function showMessage(text, type) {
        ELEMENTS.messageDiv.textContent = text;
        ELEMENTS.messageDiv.className = 'form-message ' + type;
        ELEMENTS.messageDiv.style.display = 'block';

        // Auto-hide success/error messages after 5 seconds
        if (type !== 'loading') {
            setTimeout(() => {
                ELEMENTS.messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Initialize when DOM is ready
    $(document).ready(init);

    // Also initialize if EmailJS loads after this script
    if (typeof emailjs === 'undefined') {
        // Try again after a short delay in case EmailJS is still loading
        setTimeout(() => {
            if (typeof emailjs !== 'undefined' && !ELEMENTS.form) {
                init();
            }
        }, 100);
    }

})(jQuery);
