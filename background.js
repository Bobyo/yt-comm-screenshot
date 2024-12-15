// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "takeScreenshot") {
    captureAndCrop(
      request.rect,
      sender.tab.id,
      request.devicePixelRatio,
      request.fileName
    )
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function captureAndCrop(rect, tabId, devicePixelRatio, fileName) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png",
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(
      rect.width * devicePixelRatio,
      rect.height * devicePixelRatio
    );
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageBitmap,
      rect.x * devicePixelRatio,
      rect.y * devicePixelRatio,
      rect.width * devicePixelRatio,
      rect.height * devicePixelRatio,
      0,
      0,
      rect.width * devicePixelRatio,
      rect.height * devicePixelRatio
    );

    const croppedBlob = await canvas.convertToBlob({ type: "image/png" });

    const reader = new FileReader();
    const dataURLPromise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(croppedBlob);
    const croppedDataUrl = await dataURLPromise;

    await chrome.downloads.download({
      url: croppedDataUrl,
      filename: fileName,
      saveAs: false,
    });

    imageBitmap.close();
  } catch (error) {
    console.error("Screenshot error:", error);
    throw error;
  }
}
