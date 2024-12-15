# YouTube Comment Screenshot

A simple Chrome extension that allows you to take screenshots of YouTube comments with a single click.

## Features

- Take screenshots of individual YouTube comments
- Supports both light and dark mode
- Non-intrusive camera button next to each comment
- Instant feedback notifications
- Automatic file naming with commenter's name and timestamp

## Installation

1. Download the extension from the Chrome Web Store (once published)

For manual installation (developer mode):

1. Download/unzip the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Go to any YouTube video with comments
2. Find a comment you want to capture
3. Click the camera icon next to the comment
4. The screenshot will be automatically saved to your downloads folder

## Files

- `manifest.json` - Extension configuration
- `background.js` - Handles screenshot capture
- `content.js` - Manages UI and user interactions
- `styles.css` - Extension styling
- Icons in 48px and 128px sizes

## Permissions

- `activeTab` - To capture the current tab
- `downloads` - To save screenshots
- `scripting` - For screenshot functionality
- `tabs` - For tab manipulation

## License

Creative Commons Attribution-NonCommercial (CC BY-NC)
