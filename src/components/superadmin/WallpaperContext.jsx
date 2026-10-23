import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export const DEFAULT_SUPERADMIN_WALLPAPERS = [
  {
    id: 'neon-obsidian',
    name: 'Obsidian Neon Pro',
    tag: 'Cyber Glass Reference',
    type: 'gradient',
    accentColor: '#3B82F6',
    css: 'radial-gradient(ellipse 700px 550px at 15% 15%, rgba(37, 99, 235, 0.18), transparent 70%), radial-gradient(ellipse 550px 750px at 100% 50%, rgba(249, 115, 22, 0.12), rgba(168, 85, 247, 0.08), transparent 70%), linear-gradient(180deg, #070A13 0%, #0A0F1D 50%, #060810 100%)',
    overlay: 'linear-gradient(180deg, rgba(7, 10, 19, 0.25) 0%, rgba(9, 14, 26, 0.45) 100%)',
    description: 'Qorong‘u neon shaffoflik va mayin ufq jilosi (Aaru dizayni)',
  },
  {
    id: 'cyber',
    name: 'Kiber Zanjir',
    tag: 'Emerald Cyber',
    type: 'image',
    url: '/backgrounds/bg_cyber.jpg',
    accentColor: '#3B82F6',
    overlay: 'linear-gradient(180deg, rgba(8, 11, 16, 0.55) 0%, rgba(11, 15, 23, 0.72) 100%)',
    description: 'Zamonaviy kiber arxitektura va yarim shaffof mikrosxemalar',
  },
  {
    id: 'aurora',
    name: 'Kosmik Qutb Yog‘dusi',
    tag: 'Cosmic Aurora',
    type: 'image',
    url: '/backgrounds/bg_aurora.jpg',
    accentColor: '#3B82F6',
    overlay: 'linear-gradient(180deg, rgba(8, 11, 16, 0.50) 0%, rgba(11, 15, 23, 0.68) 100%)',
    description: 'Chuqur fazoviy tunda sokin tebranuvchi binafsharang va feruza nur',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Velvet',
    tag: 'Amber Indigo Mesh',
    type: 'gradient',
    css: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37, 99, 235, 0.22), transparent 70%), radial-gradient(ellipse 70% 60% at 85% 100%, rgba(99, 102, 241, 0.20), transparent 70%), radial-gradient(circle at 10% 90%, rgba(236, 72, 153, 0.12), transparent 50%), linear-gradient(180deg, #080B11 0%, #0F141E 50%, #080B11 100%)',
    accentColor: '#3B82F6',
    description: 'To‘q velvet va nilufar rangli sokin gradient to‘lqinlari',
  },
  {
    id: 'nebula',
    name: 'Fazoviy Zumrad',
    tag: 'Sapphire & Emerald',
    type: 'gradient',
    css: 'radial-gradient(circle at 20% 25%, rgba(16, 185, 129, 0.18) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.20) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 70%), linear-gradient(135deg, #090C12 0%, #111724 50%, #070A0F 100%)',
    accentColor: '#3B82F6',
    description: 'Zumrad va sapfir nurli chuqur kosmik grafit tumanligi',
  },
];

export const DEFAULT_SIDEBAR_WALLPAPERS = [
  {
    id: 'sidebar-neon',
    name: 'Neon Obsidian Lenta',
    tag: 'Electric Blue Rail',
    accentColor: '#3B82F6',
    type: 'gradient',
    css: 'radial-gradient(ellipse 160% 80% at 0% 20%, rgba(37, 99, 235, 0.25), transparent 70%), linear-gradient(180deg, #070A12 0%, #0B101D 50%, #060810 100%)',
    overlay: 'linear-gradient(180deg, rgba(7, 10, 18, 0.30) 0%, rgba(10, 15, 27, 0.45) 100%)',
    description: 'Yon menyu uchun chuqur obsidian va neon moviy jilo',
  },
  {
    id: 'sidebar-cyber',
    name: 'Kiber Mikrosxema',
    tag: 'Emerald Vertical Circuit',
    accentColor: '#10B981',
    type: 'image',
    url: '/backgrounds/bg_cyber.jpg',
    overlay: 'linear-gradient(180deg, rgba(8, 11, 16, 0.40) 0%, rgba(10, 16, 22, 0.45) 50%, rgba(8, 11, 16, 0.55) 100%)',
    css: 'radial-gradient(ellipse 140% 70% at 20% 60%, rgba(16, 185, 129, 0.35), transparent 70%), linear-gradient(180deg, #06090E 0%, #0E171E 50%, #06090E 100%)',
    description: 'Yon menyu bo‘ylab tushuvchi zumrad rangli kiber arxitektura',
  },
  {
    id: 'sidebar-aurora',
    name: 'Kosmik Binafsha Shafaq',
    tag: 'Violet Cosmic Stream',
    accentColor: '#8B5CF6',
    type: 'image',
    url: '/backgrounds/bg_aurora.jpg',
    overlay: 'linear-gradient(180deg, rgba(8, 11, 16, 0.38) 0%, rgba(14, 13, 26, 0.45) 50%, rgba(8, 11, 16, 0.55) 100%)',
    css: 'radial-gradient(ellipse 160% 80% at 0% 30%, rgba(139, 92, 246, 0.35), transparent 70%), linear-gradient(180deg, #090912 0%, #131122 50%, #080810 100%)',
    description: 'Yon menyu ortida sokin nurlanuvchi qutb shafag‘i va yulduzlar',
  },
  {
    id: 'sidebar-obsidian',
    name: 'Obsidian Velvet Lenta',
    tag: 'Amber Velvet Ribbon',
    accentColor: '#F59E0B',
    type: 'gradient',
    css: 'radial-gradient(ellipse 120% 90% at 0% 50%, rgba(245, 158, 11, 0.35), transparent 70%), radial-gradient(circle at 100% 20%, rgba(99, 102, 241, 0.28), transparent 60%), linear-gradient(180deg, #090B11 0%, #121722 50%, #07090F 100%)',
    overlay: 'linear-gradient(180deg, rgba(9, 11, 17, 0.50) 0%, rgba(9, 11, 17, 0.65) 100%)',
    description: 'To‘q velvet obsidian va mayin qahrabo jilosi',
  },
  {
    id: 'sidebar-nebula',
    name: 'Zumrad Sapfir Tumanlik',
    tag: 'Cyan & Sapphire Depth',
    accentColor: '#06B6D4',
    type: 'gradient',
    css: 'radial-gradient(ellipse 130% 80% at 0% 70%, rgba(6, 182, 212, 0.35), transparent 70%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.30), transparent 60%), linear-gradient(180deg, #070A0F 0%, #0F1620 50%, #06080D 100%)',
    overlay: 'linear-gradient(180deg, rgba(7, 10, 15, 0.50) 0%, rgba(7, 10, 15, 0.65) 100%)',
    description: 'Moviy va zumrad rangli tumanlikning vertikal qatlami',
  },
];

export const ROTATION_INTERVAL_SECONDS = 300; // 5 daqiqa

const WallpaperContext = createContext(null);

export function WallpaperProvider({ children }) {
  // Custom user-uploaded wallpapers
  const [customWallpapers, setCustomWallpapers] = useState(() => {
    try {
      const saved = localStorage.getItem('eduone_sa_custom_wallpapers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wallpapers = [...DEFAULT_SUPERADMIN_WALLPAPERS, ...customWallpapers];
  const sidebarWallpapers = [...DEFAULT_SIDEBAR_WALLPAPERS, ...customWallpapers];

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('eduone_sa_wallpaper_idx');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch {}
    return 0;
  });

  const [sidebarIndex, setSidebarIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('eduone_sa_sidebar_idx');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch {}
    return 0;
  });

  const [isSyncWithMain, setIsSyncWithMain] = useState(() => {
    try {
      const saved = localStorage.getItem('eduone_sa_sync_wallpapers');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'sidebar'

  const [secondsLeft, setSecondsLeft] = useState(() => {
    try {
      const lastTime = localStorage.getItem('eduone_sa_wallpaper_timestamp');
      if (lastTime) {
        const elapsed = Math.floor((Date.now() - parseInt(lastTime, 10)) / 1000);
        if (elapsed >= 0 && elapsed < ROTATION_INTERVAL_SECONDS) {
          return ROTATION_INTERVAL_SECONDS - elapsed;
        }
      }
    } catch {}
    return ROTATION_INTERVAL_SECONDS;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isIslandOpen, setIsIslandOpen] = useState(false);
  const timerRef = useRef(null);

  const setWallpaper = (newIndex) => {
    const safeIdx = (newIndex + wallpapers.length) % wallpapers.length;
    setCurrentIndex(safeIdx);
    if (isSyncWithMain) {
      setSidebarIndex(safeIdx % sidebarWallpapers.length);
      try {
        localStorage.setItem('eduone_sa_sidebar_idx', (safeIdx % sidebarWallpapers.length).toString());
      } catch {}
    }
    setSecondsLeft(ROTATION_INTERVAL_SECONDS);
    try {
      localStorage.setItem('eduone_sa_wallpaper_idx', safeIdx.toString());
      localStorage.setItem('eduone_sa_wallpaper_timestamp', Date.now().toString());
    } catch {}
  };

  const setSidebarOnlyWallpaper = (newIndex) => {
    const safeIdx = (newIndex + sidebarWallpapers.length) % sidebarWallpapers.length;
    setSidebarIndex(safeIdx);
    try {
      localStorage.setItem('eduone_sa_sidebar_idx', safeIdx.toString());
    } catch {}
  };

  const addCustomWallpaper = (wallpaperData) => {
    const newWallpaper = {
      id: `custom-${Date.now()}`,
      name: wallpaperData.name || 'Mening Yangi Fonim',
      tag: 'Maxsus Rasm',
      type: 'image',
      url: wallpaperData.url,
      accentColor: wallpaperData.accentColor || '#3B82F6',
      overlay: 'linear-gradient(180deg, rgba(8, 11, 16, 0.45) 0%, rgba(12, 16, 24, 0.55) 50%, rgba(8, 11, 16, 0.65) 100%)',
      description: 'Foydalanuvchi tomonidan yuklangan shaxsiy orqa fon',
      isCustom: true,
    };

    const updated = [...customWallpapers, newWallpaper];
    setCustomWallpapers(updated);
    try {
      localStorage.setItem('eduone_sa_custom_wallpapers', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error while saving custom wallpaper:', e);
    }

    // Set as active wallpaper immediately
    const newIndex = DEFAULT_SUPERADMIN_WALLPAPERS.length + updated.length - 1;
    setWallpaper(newIndex);
  };

  const removeCustomWallpaper = (id) => {
    const updated = customWallpapers.filter((w) => w.id !== id);
    setCustomWallpapers(updated);
    try {
      localStorage.setItem('eduone_sa_custom_wallpapers', JSON.stringify(updated));
    } catch {}
    setWallpaper(0);
  };

  const toggleSync = () => {
    setIsSyncWithMain((prev) => {
      const next = !prev;
      if (next) {
        setSidebarIndex(currentIndex % sidebarWallpapers.length);
        try {
          localStorage.setItem('eduone_sa_sidebar_idx', (currentIndex % sidebarWallpapers.length).toString());
        } catch {}
      }
      try {
        localStorage.setItem('eduone_sa_sync_wallpapers', next.toString());
      } catch {}
      return next;
    });
  };

  const nextWallpaper = () => {
    if (activeTab === 'sidebar' && !isSyncWithMain) {
      setSidebarOnlyWallpaper(sidebarIndex + 1);
    } else {
      setWallpaper(currentIndex + 1);
    }
  };

  const prevWallpaper = () => {
    if (activeTab === 'sidebar' && !isSyncWithMain) {
      setSidebarOnlyWallpaper(sidebarIndex - 1);
    } else {
      setWallpaper(currentIndex - 1);
    }
  };

  // 1s timer loop
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCurrentIndex((cur) => {
            const nextIdx = (cur + 1) % wallpapers.length;
            if (isSyncWithMain) {
              setSidebarIndex(nextIdx % sidebarWallpapers.length);
              try {
                localStorage.setItem('eduone_sa_sidebar_idx', (nextIdx % sidebarWallpapers.length).toString());
              } catch {}
            }
            try {
              localStorage.setItem('eduone_sa_wallpaper_idx', nextIdx.toString());
              localStorage.setItem('eduone_sa_wallpaper_timestamp', Date.now().toString());
            } catch {}
            return nextIdx;
          });
          return ROTATION_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPaused, isSyncWithMain, wallpapers.length, sidebarWallpapers.length]);

  const currentWallpaper = wallpapers[currentIndex] || wallpapers[0];
  const currentSidebarWallpaper = sidebarWallpapers[sidebarIndex] || sidebarWallpapers[0];

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const elapsedSeconds = ROTATION_INTERVAL_SECONDS - secondsLeft;
  const progressPercent = (elapsedSeconds / ROTATION_INTERVAL_SECONDS) * 100;

  return (
    <WallpaperContext.Provider
      value={{
        wallpapers,
        sidebarWallpapers,
        customWallpapers,
        currentIndex,
        sidebarIndex,
        currentWallpaper,
        currentSidebarWallpaper,
        isSyncWithMain,
        toggleSync,
        activeTab,
        setActiveTab,
        secondsLeft,
        formattedTime,
        progressPercent,
        isPaused,
        setIsPaused,
        isIslandOpen,
        setIsIslandOpen,
        setWallpaper,
        setSidebarOnlyWallpaper,
        addCustomWallpaper,
        removeCustomWallpaper,
        nextWallpaper,
        prevWallpaper,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const ctx = useContext(WallpaperContext);
  if (!ctx) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return ctx;
}
