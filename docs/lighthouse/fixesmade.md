
There are two html pages for the profile, because Chrome gave me different lighthouse results than Firefox (the homescreen was the same).

## next.config.ts

 - Removed unoptimized: true from the images config
 - Added formats: ["image/avif", "image/webp"] for image compression
 - Added security headers across all routes

## layout.tsx

 - Added <link rel="preconnect" href="https://image.tmdb.org"> and a dns-prefetch fallback
 - Added display: "swap" to both Geist font declarations

## MediaCard.tsx

 - Added a priority prop (defaults to false)
 - Passed it to the Next.js <Image> component — when true, this sets loading="eager", fetchpriority="high", and injects a <link rel="preload"> in the document head

## MediaGrid.tsx

 - Added a prioritizeFirst prop (defaults to false)
 - Passes priority={true} down to only the first card (index 0) in the grid

## page.tsx (homescreen)

 - Passes prioritizeFirst={true} to the movies grid only, so exactly one image on the page gets fetchpriority=high
