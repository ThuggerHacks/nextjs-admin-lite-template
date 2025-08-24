# Slides Setup for Login Page

## Overview
The login page now features a beautiful slideshow background that cycles through images every 5 seconds. Here's how to set it up:

## Required Folder Structure
```
public/
├── icon.png (already exists - used as logo)
└── slides/
    ├── slide1.jpg
    ├── slide2.jpg
    ├── slide3.jpg
    ├── slide4.jpg
    └── slide5.jpg
```

## Image Requirements
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1920x1080 or larger (16:9 aspect ratio)
- **File Size**: Keep under 2MB per image for optimal performance
- **Content**: Professional, business-related images that represent your platform

## Setup Steps

1. **Create the slides folder**:
   ```bash
   mkdir -p public/slides
   ```

2. **Add your images**:
   - Place 5 high-quality images in the `public/slides/` folder
   - Name them: `slide1.jpg`, `slide2.jpg`, `slide3.jpg`, `slide4.jpg`, `slide5.jpg`
   - Or update the `slides` array in `app/(auth)/login/page.tsx` to match your actual filenames

3. **Image Suggestions**:
   - Modern office spaces
   - Business meetings
   - Technology/computer screens
   - Professional team collaboration
   - Abstract business graphics

## Features
- **Automatic Slideshow**: Images change every 5 seconds
- **Smooth Transitions**: 1-second fade transitions between images
- **Interactive Indicators**: Click on dots to manually change slides
- **Responsive Design**: Images scale properly on all devices
- **Dark Overlay**: Ensures text readability over any background

## Customization
You can modify the slideshow behavior by editing these values in `app/(auth)/login/page.tsx`:
- **Slide Duration**: Change `5000` (5 seconds) in the `useEffect`
- **Transition Duration**: Modify `duration-1000` in the CSS classes
- **Number of Slides**: Add/remove items from the `slides` array

## Troubleshooting
- If images don't appear, check that the file paths are correct
- Ensure images are in the `public/slides/` folder
- Verify image file names match exactly (case-sensitive)
- Check browser console for any 404 errors

