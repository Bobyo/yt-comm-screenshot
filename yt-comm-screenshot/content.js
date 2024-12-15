function showLoader(message = "Taking screenshot...") {
  const loader = document.createElement("div");
  loader.className = "yt-comment-screenshot-loader";
  loader.textContent = message;
  document.body.appendChild(loader);
  return loader;
}

async function takeScreenshot(comment, screenshotBtn) {
  const loader = showLoader();

  try {
    const allScreenshotBtns = document.querySelectorAll(
      ".yt-comment-screenshot-btn"
    );
    const translationButtons = comment.querySelectorAll(".translate-button");

    allScreenshotBtns.forEach((btn) => (btn.style.display = "none"));
    translationButtons.forEach((btn) => (btn.style.display = "none"));

    const images = comment.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const isDarkMode =
      document.querySelector("html")?.hasAttribute("dark") ||
      document.querySelector("html")?.getAttribute("dark-theme") === "true";

    const canvas = await html2canvas(comment, {
      backgroundColor: isDarkMode ? "#0f0f0f" : "#ffffff",
      scale: 2,
      logging: false,
      willReadFrequently: true,
      allowTaint: true,
      useCORS: true,
      ignoreElements: (element) => {
        if (
          element.tagName.toLowerCase() === "script" ||
          element.tagName.toLowerCase() === "iframe"
        ) {
          return true;
        }

        if (element.classList.contains("translate-button")) {
          return true;
        }
        return false;
      },
      onclone: (clonedDoc) => {
        const scripts = clonedDoc.getElementsByTagName("script");
        while (scripts[0]) {
          scripts[0].parentNode.removeChild(scripts[0]);
        }

        if (isDarkMode) {
          clonedDoc.documentElement.setAttribute("dark-mode", "");
          const textElements = clonedDoc.querySelectorAll("*");
          textElements.forEach((el) => {
            const color = window.getComputedStyle(el).color;
            if (color === "rgb(0, 0, 0)") {
              el.style.color = "#ffffff";
            }
          });
        }

        const translationBtns = clonedDoc.querySelectorAll(".translate-button");
        translationBtns.forEach((btn) => btn.remove());

        const svgIcons = clonedDoc.querySelectorAll("svg");
        svgIcons.forEach((svg) => {
          const parent = svg.closest("ytd-toggle-button-renderer");
          if (parent) {
            svg.style.fill = isDarkMode ? "#aaa" : "#666";
          }
        });

        const elements = clonedDoc.querySelectorAll("*");
        elements.forEach((el) => {
          el.removeAttribute("onclick");
          el.removeAttribute("onload");
          el.removeAttribute("onerror");

          if (el.hasAttribute("data-no-script")) {
            el.removeAttribute("data-no-script");
          }
        });
      },
      removeContainer: true,
      imageTimeout: 0,
      foreignObjectRendering: false,
    });

    allScreenshotBtns.forEach((btn) => (btn.style.display = ""));
    translationButtons.forEach((btn) => (btn.style.display = ""));

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const author =
      comment.querySelector("#author-text")?.textContent?.trim() || "unknown";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `youtube-comment-${author}-${timestamp}.png`;

    // Download image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    loader.textContent = "Screenshot saved!";
    setTimeout(() => {
      loader.remove();
    }, 1000);
  } catch (error) {
    console.error("Screenshot failed:", error);

    loader.textContent = "Screenshot failed";
    loader.style.background = "rgba(200, 0, 0, 0.8)";

    setTimeout(() => {
      loader.remove();
    }, 2000);
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
