import React from 'react';
import { useWallpaper } from './WallpaperContext';

export function SuperAdminBackground() {
  const { wallpapers, currentIndex } = useWallpaper();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {wallpapers.map((wp, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={wp.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            {wp.type === 'image' ? (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
                style={{
                  backgroundImage: `url(${wp.url})`,
                }}
              >
                {/* Subtle dark gradient overlay for optimal readability of UI */}
                <div
                  className="w-full h-full"
                  style={{
                    background: wp.overlay,
                    backdropFilter: 'brightness(0.9) contrast(1.05)',
                  }}
                />
              </div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: wp.css,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Ambient glowing atmosphere matching the reference image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 650px 850px at 100% 48%, rgba(249, 115, 22, 0.14) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 75%),
            radial-gradient(ellipse 700px 500px at 20% 10%, rgba(37, 99, 235, 0.16) 0%, transparent 65%),
            radial-gradient(circle at 50% 50%, transparent 55%, rgba(4, 6, 10, 0.75) 100%)
          `,
        }}
      />
    </div>
  );
}
