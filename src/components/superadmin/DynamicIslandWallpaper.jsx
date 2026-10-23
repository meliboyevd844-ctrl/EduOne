import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Layers,
  Clock,
  Check,
  Disc3,
  SlidersHorizontal,
  Wallpaper,
  Layout,
  PanelLeft,
  RefreshCw,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';
import { useWallpaper } from './WallpaperContext';
import { useLanguage } from '../../context/LanguageContext';

export function DynamicIslandWallpaper() {
  const {
    wallpapers,
    sidebarWallpapers,
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
  } = useWallpaper();

  const { t } = useLanguage();
  const islandRef = useRef(null);
  const fileInputRef = useRef(null);

  // Upload custom wallpaper state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (islandRef.current && !islandRef.current.contains(event.target)) {
        setIsIslandOpen(false);
        setIsUploadOpen(false);
      }
    }
    if (isIslandOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isIslandOpen, setIsIslandOpen]);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("Faqat rasm fayllari (JPG, PNG, WEBP) qabul qilinadi!");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Rasm hajmi 8MB dan kichik bo'lishi kerak!");
      return;
    }

    setUploadError('');
    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewDataUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomWallpaper = () => {
    const finalUrl = previewDataUrl || customUrl.trim();
    if (!finalUrl) {
      setUploadError("Iltimos, kompyuterdan rasm tanlang yoki rasm havolasini kiriting!");
      return;
    }

    addCustomWallpaper({
      name: customName.trim() || 'Mening Fonim',
      url: finalUrl,
      accentColor: '#3B82F6',
    });

    // Reset form
    setCustomName('');
    setCustomUrl('');
    setPreviewDataUrl('');
    setUploadError('');
    setIsUploadOpen(false);
  };

  // Elapsed time for scrubber
  const elapsed = 300 - secondsLeft;
  const elapsedMinutes = Math.floor(elapsed / 60);
  const elapsedSeconds = elapsed % 60;
  const formattedElapsed = `${elapsedMinutes}:${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds}`;

  // Active display items based on selected tab
  const displayWallpaper = activeTab === 'sidebar' ? currentSidebarWallpaper : currentWallpaper;
  const displayList = activeTab === 'sidebar' ? sidebarWallpapers : wallpapers;
  const displayIndex = activeTab === 'sidebar' ? sidebarIndex : currentIndex;

  const handleSelectPreset = (idx) => {
    if (activeTab === 'sidebar') {
      if (isSyncWithMain) {
        setWallpaper(idx);
      } else {
        setSidebarOnlyWallpaper(idx);
      }
    } else {
      setWallpaper(idx);
    }
  };

  return (
    <div className="relative" ref={islandRef}>
      {/* =========================================================================
          COLLAPSED DYNAMIC ISLAND PILL TRIGGER (In Header next to Yangi Tashkilot)
          ========================================================================= */}
      <button
        onClick={() => setIsIslandOpen(!isIslandOpen)}
        className="group relative flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-full text-white text-xs transition-all duration-300 select-none active:scale-95"
        style={{
          background: 'linear-gradient(180deg, #05070B 0%, #0E121A 100%)',
          border: isIslandOpen ? '1px solid rgba(229, 161, 43, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isIslandOpen
            ? '0 0 20px rgba(229, 161, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
        title={t('wallpaper_dynamic_island')}
        aria-label="Orqa fon Dynamic Island"
      >
        {/* Left: Glowing Accent Dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500"
          style={{
            backgroundColor: displayWallpaper.accentColor,
            boxShadow: `0 0 8px ${displayWallpaper.accentColor}`,
          }}
        />

        {/* Wallpaper Icon */}
        <Wallpaper className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform duration-300" />

        {/* Dynamic Island Title & Animated Equalizer Waves */}
        <div className="hidden md:flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-[11px] text-white/90 truncate max-w-[120px] group-hover:text-amber-300 transition-colors">
            {displayWallpaper.name}
          </span>

          {/* Equalizer Waveform Bars */}
          {!isPaused && (
            <div className="flex items-end gap-0.5 h-2.5 shrink-0 px-0.5">
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce [animation-duration:800ms] h-full" />
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce [animation-duration:1100ms] [animation-delay:200ms] h-3/4" />
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce [animation-duration:900ms] [animation-delay:400ms] h-1/2" />
            </div>
          )}
        </div>

        {/* Countdown Badge */}
        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-white/10 text-white/70 bg-white/5 shrink-0">
          {formattedTime}
        </span>
      </button>

      {/* =========================================================================
          EXPANDED DYNAMIC ISLAND (Apple iPhone Style Floating Island Modal)
          ========================================================================= */}
      {isIslandOpen && (
        <div
          className="absolute right-0 top-11 z-50 w-[340px] sm:w-[440px] p-4 text-white rounded-[28px] animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-250 ease-out select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(6, 8, 12, 0.98) 0%, rgba(13, 17, 24, 0.97) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.15) inset',
          }}
        >
          {/* Island Notch Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            {/* Notch Camera Simulator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black ring-2 ring-white/10 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-blue-500/80" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-white/90">
                  Dynamic Island
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  {t('wallpaper_every_5m')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsIslandOpen(false)}
              className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title={t('close')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dual Zone Control Tabs: Main Screen vs Sidebar */}
          <div className="mt-3 flex items-center justify-between gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('main');
                  setIsUploadOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'main'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>{t('wallpaper_main')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('sidebar');
                  setIsUploadOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'sidebar'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span>{t('wallpaper_sidebar')}</span>
              </button>
            </div>

            {/* Sync Toggle */}
            <button
              onClick={toggleSync}
              className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1 border transition-all ${
                isSyncWithMain
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              }`}
              title={
                isSyncWithMain
                  ? 'Sinxronizatsiya faol: Ikkala fon bir vaqtda moslashib almashadi'
                  : 'Sinxronizatsiya o‘chiq: Fonlar mustaqil boshqariladi'
              }
            >
              <RefreshCw className={`w-3 h-3 ${isSyncWithMain ? 'animate-spin [animation-duration:4s]' : ''}`} />
              <span className="hidden sm:inline">{t('wallpaper_sync')}</span>
            </button>
          </div>

          {/* Now Active Wallpaper Player Display */}
          <div className="mt-3.5 flex items-center gap-3.5">
            {/* Preview Artwork Card */}
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border border-white/20 relative shadow-xl"
              style={{
                boxShadow: `0 8px 24px -4px ${displayWallpaper.accentColor}40`,
              }}
            >
              {displayWallpaper.type === 'image' ? (
                <img
                  src={displayWallpaper.url}
                  alt={displayWallpaper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: displayWallpaper.css }}
                />
              )}
              {/* Overlay Glass Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Info & Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: displayWallpaper.accentColor }}
                />
                <h4 className="text-sm font-bold text-white truncate tracking-tight">
                  {displayWallpaper.name}
                </h4>
              </div>

              <p className="text-[11px] text-white/50 truncate">
                {displayWallpaper.description}
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 font-mono">
                  {activeTab === 'sidebar' ? 'Sidebar' : 'Main'} • {displayWallpaper.tag}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  {isPaused ? t('wallpaper_paused') : t('wallpaper_auto')}
                </span>
              </div>
            </div>
          </div>

          {/* Scrubber Progress Bar (5-minute timeline) */}
          <div className="mt-3.5 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1">
              <span>{formattedElapsed}</span>
              <span className="text-white/60">05:00</span>
            </div>

            {/* Track & Filled Scrubber */}
            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${displayWallpaper.accentColor} 0%, #FFFFFF 100%)`,
                  boxShadow: `0 0 10px ${displayWallpaper.accentColor}`,
                }}
              />
            </div>
          </div>

          {/* Media Player Controls */}
          <div className="mt-3.5 flex items-center justify-center gap-4">
            {/* Prev Wallpaper */}
            <button
              onClick={prevWallpaper}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Oldingi fon"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
                border: '1px solid rgba(96, 165, 250, 0.35)',
              }}
              title={isPaused ? 'Avtomatik almashishni boshlash' : 'Vaqtinchalik to‘xtatib turish'}
            >
              {isPaused ? (
                <Play className="w-4 h-4 ml-0.5 text-white" />
              ) : (
                <Pause className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Next Wallpaper */}
            <button
              onClick={nextWallpaper}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Keyingi fon"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* =====================================================================
              CUSTOM WALLPAPER UPLOAD FORM (TOGGLEABLE)
              ===================================================================== */}
          {isUploadOpen ? (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-amber-400/30 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  {t('wallpaper_upload_title')}
                </span>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {uploadError && (
                <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg">
                  {uploadError}
                </p>
              )}

              {/* Wallpaper Name */}
              <div>
                <label className="block text-[11px] text-white/70 mb-1">
                  {t('wallpaper_name_label')}
                </label>
                <input
                  type="text"
                  placeholder="Mening Shaxsiy Fonim"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* File Upload from PC */}
              <div>
                <label className="block text-[11px] text-white/70 mb-1">
                  {t('wallpaper_file_label')}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-white/25 hover:border-amber-400 bg-black/30 hover:bg-black/50 text-xs text-white/80 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Kompyuterdan rasm tanlash...</span>
                </button>
              </div>

              {/* Or Direct Image URL */}
              <div>
                <label className="block text-[11px] text-white/70 mb-1">
                  {t('wallpaper_url_label')}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      if (e.target.value) setPreviewDataUrl(e.target.value);
                    }}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {previewDataUrl && (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-amber-400/50 shadow-md">
                  <img
                    src={previewDataUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                    Oldindan ko‘rish
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomWallpaper}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all"
                >
                  {t('wallpaper_save_btn')}
                </button>
              </div>
            </div>
          ) : null}

          {/* Wallpaper Thumbnails Gallery Carousel */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-white/70 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-amber-400" />
                {activeTab === 'sidebar' ? 'Sidebar' : 'Maydon'} ({displayList.length} ta)
              </span>

              {/* Add Custom Wallpaper Button */}
              <button
                onClick={() => setIsUploadOpen(!isUploadOpen)}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 px-2 py-0.5 rounded-lg transition-all"
                title="O‘zingiz yoqtirgan rasmni kompyuterdan yuklash"
              >
                <Plus className="w-3 h-3" />
                <span>{t('wallpaper_add_btn')}</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto pr-0.5 custom-scrollbar">
              {displayList.map((wp, idx) => {
                const isSelected = idx === displayIndex;
                return (
                  <div key={wp.id} className="relative group/thumb">
                    <button
                      onClick={() => handleSelectPreset(idx)}
                      className={`w-full rounded-xl overflow-hidden aspect-video transition-all duration-200 border block ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-md'
                          : 'border-white/10 hover:border-white/40 opacity-70 hover:opacity-100'
                      }`}
                      title={`${wp.name} (${wp.tag})`}
                    >
                      {wp.type === 'image' ? (
                        <img
                          src={wp.url}
                          alt={wp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: wp.css }} />
                      )}

                      {/* Active Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-amber-400 drop-shadow" />
                        </div>
                      )}
                    </button>

                    {/* Delete Custom Wallpaper Button */}
                    {wp.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomWallpaper(wp.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 hover:scale-110 transition-all z-20 shadow"
                        title="O‘chirish"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
