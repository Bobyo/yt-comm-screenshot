function showLoader(message = "Taking screenshot...") {
  const loader = document.createElement("div");
  loader.className = "yt-comment-screenshot-loader";
  loader.textContent = message;
  document.body.appendChild(loader);
  return loader;
}

async function takeScreenshot(comment) {
  let loader;

  try {
    const allScreenshotBtns = document.querySelectorAll(
      ".yt-comment-screenshot-btn"
    );
    const translationButtons = comment.querySelectorAll(".translate-button");
    z;

    allScreenshotBtns.forEach((btn) => (btn.style.display = "none"));
    translationButtons.forEach((btn) => (btn.style.display = "none"));

    comment.scrollIntoView({ block: "center", behavior: "instant" });

    await new Promise((resolve) => setTimeout(resolve, 150));
    const rect = comment.getBoundingClientRect();

    const padding = 15;
    const paddedRect = {
      x: Math.max(0, rect.x - padding),
      y: Math.max(0, rect.y - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    const author =
      comment.querySelector("#author-text")?.textContent?.trim() || "unknown";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `youtube-comment-${author}-${timestamp}.png`;

    const response = await chrome.runtime.sendMessage({
      action: "takeScreenshot",
      rect: paddedRect,
      devicePixelRatio: window.devicePixelRatio,
      fileName: fileName,
    });

    allScreenshotBtns.forEach((btn) => (btn.style.display = ""));
    translationButtons.forEach((btn) => (btn.style.display = ""));

    loader = showLoader("Screenshot saved!");
    setTimeout(() => loader.remove(), 1000);

    if (!response.success) {
      throw new Error(response.error || "Screenshot failed");
    }
  } catch (error) {
    console.error("Screenshot failed:", error);

    // Show error loader
    if (!loader) {
      loader = showLoader("Screenshot failed");
      loader.style.background = "rgba(200, 0, 0, 0.8)";
    }
    setTimeout(() => loader.remove(), 2000);

    // Cleanup on error
    const allScreenshotBtns = document.querySelectorAll(
      ".yt-comment-screenshot-btn"
    );
    const translationButtons = comment.querySelectorAll(".translate-button");
    allScreenshotBtns.forEach((btn) => (btn.style.display = ""));
    translationButtons.forEach((btn) => (btn.style.display = ""));
  }
}

function addScreenshotButtons() {
  const actionButtons = document.querySelectorAll("ytd-comment-engagement-bar");

  actionButtons.forEach((container) => {
    if (container.querySelector(".yt-comment-screenshot-btn")) return;

    const screenshotBtn = document.createElement("button");
    screenshotBtn.className = "yt-comment-screenshot-btn";
    screenshotBtn.title = "Take screenshot of this comment";
    screenshotBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
        </svg>
      `;

    screenshotBtn.addEventListener("click", async function () {
      const comment = container.closest("ytd-comment-thread-renderer");
      if (!comment) return;
      await takeScreenshot(comment, screenshotBtn);
    });
    container.querySelector("#toolbar").appendChild(screenshotBtn);
  });
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      addScreenshotButtons();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

const darkModeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.attributeName === "dark" ||
      mutation.attributeName === "dark-theme"
    ) {
      const isDarkMode =
        document.querySelector("html")?.hasAttribute("dark") ||
        document.querySelector("html")?.getAttribute("dark-theme") === "true";
      document.documentElement.setAttribute(
        "dark-mode",
        isDarkMode ? "" : null
      );
    }
  });
});

darkModeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["dark", "dark-theme"],
});

addScreenshotButtons();
