# Adding Your Logo

## Steps to add your logo:

1. **Copy your logo file** to the `/public` directory
2. **Name it** `logo.png` (or `logo.svg`, `logo.jpg`, etc.)
3. **The system will automatically handle fallbacks** if the logo isn't found

## Supported formats:
- PNG (recommended)
- SVG (scalable)
- JPG/JPEG
- WebP

## Current setup:
- Logo container: 48x48px (12x12 in Tailwind)
- Logo size: 32x32px (8x8 in Tailwind)
- **Smart fallback**: Automatically shows chat icon if logo not found
- Location: Top-left corner of the header
- **Client-side error handling**: Graceful fallback without server errors

## To change the logo file name:
Edit line 25-29 in `/src/app/page.tsx`:
```tsx
<Logo 
  src="/logo.png"  // Change this to your file name
  alt="Social Capital Coach Logo" 
  className="w-8 h-8 object-contain"
/>
```

## Logo requirements:
- Square aspect ratio works best
- Transparent background recommended
- High contrast for visibility on gradient background
- File size under 100KB for fast loading

## How it works:
- Uses a custom `Logo` component with error handling
- Automatically falls back to a chat icon if logo fails to load
- No server-side errors if logo is missing
- Smooth user experience with proper fallbacks
