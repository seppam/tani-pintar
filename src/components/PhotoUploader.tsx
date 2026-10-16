import React, { useRef, useState, useCallback } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  FileText,
  Sparkles,
  X,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Language, SampleCrop } from '../types';
import { SAMPLE_CROPS } from '../data/sampleCrops';
import { translations } from '../i18n/translations';

interface SampleCardItemProps {
  sample: SampleCrop;
  language: Language;
  onSelect: (sample: SampleCrop) => void;
}

const SampleCardItem = React.memo(function SampleCardItem({
  sample,
  language,
  onSelect,
}: SampleCardItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(sample)}
      className="text-left bg-white hover:bg-emerald-50/50 p-2.5 rounded-xl border border-stone-200/90 hover:border-emerald-400 transition-colors shadow-xs group flex items-start gap-2.5 cursor-pointer"
    >
      <img
        src={sample.thumbnailUrl}
        alt={sample.cropType}
        className="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0 border border-stone-200 group-hover:scale-105 transition-transform"
      />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 truncate">
          {language === 'id' ? sample.cropNameId.split('(')[0] : sample.cropNameEn.split('(')[0]}
        </div>
        <div className="text-[11px] text-amber-700 font-medium truncate mt-0.5">
          {language === 'id' ? sample.issueId.split('(')[0] : sample.issueEn.split('(')[0]}
        </div>
        <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-1 truncate">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          {sample.location}
        </div>
      </div>
    </button>
  );
});

interface SampleCardsSectionProps {
  language: Language;
  onSelectSample: (sample: SampleCrop) => void;
}

const SampleCardsSection = React.memo(function SampleCardsSection({
  language,
  onSelectSample,
}: SampleCardsSectionProps) {
  const t = translations[language];

  return (
    <div className="bg-stone-100/90 rounded-2xl p-4 border border-stone-200 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            {t.demoHeader}
          </h3>
        </div>
        <span className="text-[11px] text-emerald-800 font-medium bg-emerald-100/80 px-2 py-0.5 rounded-full">
          {language === 'id' ? 'Siap Uji Langsung' : 'Ready to Test'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAMPLE_CROPS.map((sample) => (
          <SampleCardItem
            key={sample.id}
            sample={sample}
            language={language}
            onSelect={onSelectSample}
          />
        ))}
      </div>
    </div>
  );
});

interface PhotoUploaderProps {
  language: Language;
  onAnalyze: (payload: {
    imageBase64: string;
    mimeType: string;
    cropType: string;
    location: string;
    coordinates?: { lat: number; lon: number };
    farmerNote: string;
  }) => void;
  isLoading: boolean;
}

const PhotoUploaderComponent: React.FC<PhotoUploaderProps> = ({
  language,
  onAnalyze,
  isLoading,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [cropType, setCropType] = useState<string>('');
  const [location, setLocation] = useState<string>('Subang, Jawa Barat');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | undefined>({
    lat: -6.57,
    lon: 107.76,
  });
  const [farmerNote, setFarmerNote] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const cropSuggestions = language === 'id' 
    ? ['Padi', 'Cabai Merah', 'Jagung', 'Tomat', 'Bawang Merah', 'Kedelai']
    : ['Rice', 'Chili Pepper', 'Maize / Corn', 'Tomato', 'Shallot', 'Soybean'];

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError(
        language === 'id' ? 'Berkas harus berupa gambar (JPG, PNG, WEBP)' : 'File must be an image (JPG, PNG, WEBP)'
      );
      return;
    }
    setValidationError(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const tryIpFallback = async (reason: string): Promise<boolean> => {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const region = data.city || data.region || (language === 'id' ? 'Lokasi Jaringan' : 'Network Location');
          const country = data.country || '';
          const name = `${region}${country ? ', ' + country : ''} (IP)`;
          setCoordinates({ lat, lon });
          setLocation(name);
          setLocationNotice(
            language === 'id'
              ? `GPS (${reason}) dialihkan ke lokasi jaringan: ${name}`
              : `GPS (${reason}) routed to network location: ${name}`
          );
          setIsLocating(false);
          return true;
        }
      }
    } catch (e) {
      console.warn('IP fallback geolocation error:', e);
    }
    return false;
  };

  const handleUseLocation = () => {
    setLocationNotice(null);
    setIsLocating(true);

    if (!navigator.geolocation) {
      void (async () => {
        const ok = await tryIpFallback(language === 'id' ? 'Browser tidak mendukung GPS' : 'Browser lacks GPS');
        if (!ok) {
          setLocation('Subang, Jawa Barat');
          setCoordinates({ lat: -6.57, lon: 107.76 });
          setLocationNotice(
            language === 'id'
              ? 'GPS tidak tersedia. Menggunakan lokasi default Subang, Jawa Barat.'
              : 'GPS not supported. Using default location Subang, West Java.'
          );
        }
        setIsLocating(false);
      })();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoordinates({ lat, lon });
        setLocation(`${lat.toFixed(4)}°, ${lon.toFixed(4)}° (GPS)`);
        setLocationNotice(
          language === 'id'
            ? `Berhasil mengunci koordinat GPS: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
            : `GPS lock acquired: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
        );
        setIsLocating(false);
      },
      async (err: GeolocationPositionError) => {
        const code = err ? err.code : 0;
        const msg = err ? err.message : '';
        const detailedReason = msg || (
          code === 1 ? 'Izin akses GPS ditolak' :
          code === 2 ? 'Sinyal lokasi tidak tersedia' :
          code === 3 ? 'Waktu pencarian GPS habis' :
          'Sensor GPS tidak merespons'
        );

        console.warn(`Geolocation error (Code ${code}):`, detailedReason);

        const ok = await tryIpFallback(detailedReason);
        if (!ok) {
          setLocation('Subang, Jawa Barat');
          setCoordinates({ lat: -6.57, lon: 107.76 });
          setLocationNotice(
            language === 'id'
              ? `GPS (${detailedReason}). Menggunakan lokasi default Subang, Jawa Barat.`
              : `GPS (${detailedReason}). Using default location Subang, West Java.`
          );
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSelectSample = useCallback((sample: SampleCrop) => {
    setImagePreview(sample.imageUrl);
    setMimeType('image/svg+xml');
    setCropType(language === 'id' ? sample.cropNameId : sample.cropNameEn);
    setLocation(sample.location);
    setCoordinates(sample.coordinates);
    setFarmerNote(language === 'id' ? sample.noteId : sample.noteEn);
    setValidationError(null);
    setLocationNotice(null);
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setValidationError(
        language === 'id'
          ? 'Silakan unggah foto tanaman atau pilih salah satu sampel di bawah.'
          : 'Please upload a plant photo or select one of the sample demos below.'
      );
      return;
    }

    setValidationError(null);
    onAnalyze({
      imageBase64: imagePreview,
      mimeType,
      cropType,
      location,
      coordinates,
      farmerNote,
    });
  };

  return (
    <div className="space-y-6">
      {/* 3 One-Click Sample Demos Banner - Memoized */}
      <SampleCardsSection
        language={language}
        onSelectSample={handleSelectSample}
      />

      {/* Main Upload & Context Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
            {t.uploadTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.uploadSubtitle}
          </p>
        </div>

        {/* Large Upload Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl transition-colors overflow-hidden ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/60'
              : imagePreview
              ? 'border-emerald-300 bg-stone-50'
              : 'border-stone-300 hover:border-emerald-400 bg-stone-50/70'
          }`}
        >
          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Selected crop preview"
                className="w-full max-h-72 object-contain bg-stone-900/5 mx-auto"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="bg-stone-900 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors shadow-md cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'id' ? 'Foto siap dianalisis' : 'Photo ready for diagnosis'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-stone-600 hover:text-emerald-700 font-medium underline cursor-pointer"
                >
                  {language === 'id' ? 'Ganti Foto' : 'Change Photo'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {t.dragOrClick}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t.uploadFormats}
                </p>
              </div>

              {/* Action Buttons: Camera and File Pick */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {t.takePhoto}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-stone-600" />
                  {t.browseFile}
                </button>
              </div>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Context Inputs: Crop, Location, Farmer Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Crop Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.cropLabel}
            </label>
            <input
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              placeholder={t.cropPlaceholder}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cropSuggestions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCropType(c)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    cropType.toLowerCase().includes(c.toLowerCase())
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  +{c}
                </button>
              ))}
            </div>
          </div>

          {/* Location with GPS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {t.locationLabel}
              </label>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
                {isLocating ? t.detectingLocation : t.useMyLocation}
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLocationNotice(null);
                }}
                placeholder={t.locationPlaceholder}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
              />
            </div>
            {locationNotice ? (
              <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>{locationNotice}</span>
              </p>
            ) : (
              <p className="text-[10px] text-stone-500 mt-1">
                {language === 'id'
                  ? 'Digunakan Context Agent untuk menarik data cuaca mikroklimat Open-Meteo.'
                  : 'Used by Context Agent to fetch Open-Meteo microclimate weather.'}
              </p>
            )}
          </div>
        </div>

        {/* Farmer Note */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            {t.farmerNoteLabel}
          </label>
          <textarea
            rows={2}
            value={farmerNote}
            onChange={(e) => setFarmerNote(e.target.value)}
            placeholder={t.farmerNotePlaceholder}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-50/50 resize-y"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-lime-600 hover:from-emerald-800 hover:to-lime-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{t.diagnosingButton}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-lime-300" />
              <span>{t.diagnoseButton}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export const PhotoUploader = React.memo(PhotoUploaderComponent);
