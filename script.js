// ==UserScript==
// @name         Router UI - Sleek Password Toasts (Error + Warning)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Sleek dark-mode toast for incorrect or missing password
// @match        http://192.168.0.1/login.html*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Inject Material Icons
  const iconLink = document.createElement("link");
  iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
  iconLink.rel = "stylesheet";
  document.head.appendChild(iconLink);

  // Inject CSS with :root variables
  const style = document.createElement("style");
  style.textContent = `
        :root {
          --color-bg: #0f1116;
          --color-surface: #1a1d23;
          --color-surface-alt: #21252d;
          --color-border: #2a2f38;
          --color-text-primary: #ffffff;
          --color-text-secondary: #c3c8d1;
          --color-text-muted: #9097a2;
          --color-accent: #2d82f7;
          --color-accent-hover: #3b91ff;
          --color-success: #3ac372;
          --color-error: #f04343;
          --color-warning: #f0c543;
          --color-input-bg: #181c22;
          --color-input-border: #2a2f38;
          --color-sidebar-bg: #14161c;
          --color-icon: #a0a7b4;
          --color-divider: #2d3138;
          --font-size-base: 14px;
          --font-size-heading: 16px;
          --font-size-small: 12px;
          --border-radius-size: 10px;
        }

        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 9999;
        }

        .toast {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          min-width: 260px;
          max-width: 320px;
          border-radius: var(--border-radius-size);
          box-shadow: 0 6px 18px rgba(0,0,0,0.45);
          animation: slideIn 0.35s ease forwards;
          color: var(--color-text-primary);
          position: relative;
          overflow: hidden;
        }

        .toast-error {
          background: linear-gradient(135deg, rgba(240, 67, 67, 0.15), rgba(240, 67, 67, 0) 60%), var(--color-surface-alt);
        }
        .toast-warning {
          background: linear-gradient(135deg, rgba(240, 197, 67, 0.15), rgba(240, 197, 67, 0) 60%), var(--color-surface-alt);
        }

        .toast.hide {
          animation: slideOut 0.35s ease forwards;
        }

        .toast-error .material-icons {
          color: var(--color-error);
        }
        .toast-warning .material-icons {
          color: var(--color-warning);
        }

        .toast .material-icons {
          margin-right: 10px;
          font-size: 20px;
        }

        .toast-text {
          flex: 1;
        }

        .toast-title {
          font-size: var(--font-size-heading);
          font-weight: 600;
          margin-bottom: 3px;
        }

        .toast-sub {
          font-size: var(--font-size-small);
          color: var(--color-text-secondary);
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
        }
        .toast-error .toast-progress {
          background: linear-gradient(to right, var(--color-error), #ff6b6b);
        }
        .toast-warning .toast-progress {
          background: linear-gradient(to right, var(--color-warning), #ffe17a);
        }

        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
    `;
  document.head.appendChild(style);

  // Create toast container
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);

  function showToast(type, title, subtext) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "error" ? "close" : "warning";
    toast.innerHTML = `
            <span class="material-icons">${icon}</span>
            <div class="toast-text">
                <div class="toast-title">${title}</div>
                <div class="toast-sub">${subtext}</div>
            </div>
            <div class="toast-progress" style="animation: progressBar 5s linear forwards;"></div>
        `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 350);
    }, 5000);
  }

  // Check by URL param for incorrect password
  if (window.location.search.includes("?1")) {
    showToast("error", "Incorrect Password", "Please try again.");
  } else {
    // Wait for #errMsg to exist, then observe it
    const waitForErrMsg = new MutationObserver(() => {
      const errMsgEl = document.querySelector("#errMsg");
      if (errMsgEl) {
        waitForErrMsg.disconnect();

        const observer = new MutationObserver(() => {
          const text = errMsgEl.textContent.trim().toLowerCase();
          if (text.includes("password error")) {
            showToast("error", "Incorrect Password", "Please try again.");
          } else if (text.includes("please specify a login password")) {
            showToast(
              "warning",
              "No Password Entered",
              "Please specify a login password."
            );
          }
        });
        observer.observe(errMsgEl, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    });
    waitForErrMsg.observe(document.body, { childList: true, subtree: true });
  }
})();
