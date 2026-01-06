// Configuration
const CONFIG = {
    redirectUrl: "https://quotexapp.trade/impactarena",
    countdownDuration: 5000,
    updateInterval: 50,
    circleCircumference: 283
};

// DOM Elements
const elements = {
    timeDisplay: document.getElementById("timeDisplay"),
    progressFill: document.getElementById("progressFill"),
    progressPercent: document.getElementById("progressPercent"),
    countdownNum: document.getElementById("countdownNum"),
    downloadBtn: document.getElementById("downloadBtn"),
    circleProgress: document.getElementById("circleProgress")
};

// State Management
let state = {
    startTime: null,
    totalDuration: CONFIG.countdownDuration,
    animationFrameId: null,
    timeoutId: null,
    isRunning: true
};

// Add SVG gradient for circle progress
function initializeSVG() {
    const svg = document.querySelector('.circle-svg');
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");

    gradient.setAttribute("id", "circleGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#2ea043;stop-opacity:1");

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:#58a6ff;stop-opacity:1");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// Smooth animation update function
function updateProgress(timestamp) {
    if (!state.startTime) {
        state.startTime = timestamp;
    }

    const elapsed = timestamp - state.startTime;
    const remaining = Math.max(0, state.totalDuration - elapsed);
    const progress = Math.min(100, (elapsed / state.totalDuration) * 100);

    // Update countdown display
    const secondsLeft = Math.ceil(remaining / 1000);
    elements.timeDisplay.textContent = secondsLeft;
    elements.countdownNum.textContent = secondsLeft;

    // Update progress bar
    const smoothProgress = easeOutCubic(progress / 100) * 100;
    elements.progressFill.style.width = `${Math.max(5, smoothProgress)}%`;
    elements.progressPercent.textContent = `${Math.round(smoothProgress)}%`;

    // Update circular progress
    const circleOffset = CONFIG.circleCircumference - (smoothProgress / 100) * CONFIG.circleCircumference;
    elements.circleProgress.style.strokeDashoffset = circleOffset;

    // Continue animation if not finished
    if (remaining > 0 && state.isRunning) {
        state.animationFrameId = requestAnimationFrame(updateProgress);
    } else if (remaining <= 0) {
        completeProgress();
    }
}

// Easing function for smooth animation
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Complete progress animation
function completeProgress() {
    elements.progressFill.style.width = '100%';
    elements.progressPercent.textContent = '100%';
    elements.circleProgress.style.strokeDashoffset = 0;
    elements.timeDisplay.textContent = '0';
    elements.countdownNum.textContent = '0';
}

// Perform redirect to download URL
function performRedirect() {
    // Add a fade out effect before redirect
    document.querySelector('.download-card').style.transition = 'opacity 0.3s ease';
    document.querySelector('.download-card').style.opacity = '0.5';

    setTimeout(() => {
        window.location.href = CONFIG.redirectUrl;
    }, 300);
}

// Start countdown and animation
function startCountdown() {
    // Initialize SVG gradient
    initializeSVG();

    // Start smooth animation
    state.animationFrameId = requestAnimationFrame(updateProgress);

    // Set up timeout for automatic redirect
    state.timeoutId = setTimeout(performRedirect, CONFIG.countdownDuration);

    // Add button hover effect
    addButtonEffects();
}

// Stop countdown and clear timers
function stopCountdown() {
    state.isRunning = false;

    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }

    if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
    }
}

// Add interactive button effects
function addButtonEffects() {
    elements.downloadBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.02)';
    });

    elements.downloadBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    elements.downloadBtn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(-1px) scale(0.98)';
    });

    elements.downloadBtn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-3px) scale(1.02)';
    });
}

// Handle manual download button click
function handleDownloadClick(e) {
    e.preventDefault();

    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;

    const rect = elements.downloadBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    elements.downloadBtn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    // Stop countdown and redirect
    stopCountdown();
    performRedirect();
}

// Add ripple animation to CSS
function addRippleAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .primary-button {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// Add page visibility handling
function handleVisibilityChange() {
    if (document.hidden) {
        // Pause animations when tab is not visible
        state.isRunning = false;
    } else {
        // Resume animations when tab becomes visible
        if (state.timeoutId) {
            state.isRunning = true;
            state.animationFrameId = requestAnimationFrame(updateProgress);
        }
    }
}

// Initialize application
function initialize() {
    // Add ripple effect styles
    addRippleAnimation();

    // Attach event listeners
    elements.downloadBtn.addEventListener("click", handleDownloadClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start the countdown with a small delay for better UX
    setTimeout(startCountdown, 100);

    // Add keyboard shortcut (Enter key)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && state.isRunning) {
            handleDownloadClick(e);
        }
    });
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

// Prevent accidental page close during download preparation
window.addEventListener('beforeunload', function(e) {
    if (state.isRunning) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});