'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    Upload,
    FileText,
    ClipboardCopy,
    Check,
    BookOpen,
    Sparkles,
    AlertCircle,
    X,
    Info
} from 'lucide-react';
import { parseDocx } from '@/lib/docxParser';
import {
    generatePrompt,
    countWords,
    Jenjang,
    Gaya,
    Kedalaman,
    Panjang,
    Bahasa,
    Sapaan,
    Analogi,
    GayaTulis
} from '@/lib/promptGenerator';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type InputMode = 'upload' | 'paste';

// Tooltip component
function Tooltip({ text }: { text: string }) {
    return (
        <span className="group relative inline-flex ml-1">
            <Info className="w-4 h-4 text-slate-500 cursor-help" />
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg border border-slate-700">
                {text}
            </span>
        </span>
    );
}

export default function PromptGenerator() {
    // RPS Content State (persisted)
    const [rpsContent, setRpsContent] = useLocalStorage<string>('rps-content', '');

    // UI State
    const [inputMode, setInputMode] = useState<InputMode>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string>('');

    // Form State
    const [pertemuan, setPertemuan] = useState<number>(1);
    const [topik, setTopik] = useState<string>('');
    const [jenjang, setJenjang] = useState<Jenjang>('S1');
    const [gaya, setGaya] = useState<Gaya>('Praktis');
    const [kedalaman, setKedalaman] = useState<Kedalaman>('Menengah');
    const [panjang, setPanjang] = useState<Panjang>('1500');
    const [bahasa, setBahasa] = useState<Bahasa>('Mixed');
    const [sapaan, setSapaan] = useState<Sapaan>('Inklusif');
    const [analogi, setAnalogi] = useState<Analogi>('Tidak');
    const [gayaTulis, setGayaTulis] = useState<GayaTulis>('Modul');
    const [sertakanLatihan, setSertakanLatihan] = useState(false);
    const [sertakanReferensi, setSertakanReferensi] = useState(false);

    // Auto-scroll State
    const outputRef = useRef<HTMLPreElement>(null);
    const [lastAction, setLastAction] = useState<string>('');

    // Mapping params to search keywords
    const SEARCH_KEYS: Record<string, string> = {
        jenjang: '**Konteks Jenjang',
        gaya: '**Gaya Penyampaian:**',
        sapaan: '**Gaya Sapaan:**',
        analogi: '**Penggunaan Analogi:**',
        gayaTulis: '**Gaya Penulisan:**',
        kedalaman: '- **Level Materi**:',
        panjang: '- **Target Panjang**:',
        bahasa: '- **Bahasa**:',
        sertakanLatihan: 'Latihan/Soal:',
        sertakanReferensi: 'Daftar Referensi:'
    };

    // Helper to handle param changes
    const handleParamChange = (key: string, val: any, setter: (v: any) => void) => {
        setter(val);
        setLastAction(key);
    };

    // Helper for hover effects
    const handleParamHover = (key: string) => {
        setLastAction(key);
    };

    // File Upload Handler
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.docx')) {
            setError('Hanya file .docx yang didukung');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const text = await parseDocx(file);
            setRpsContent(text);
            setUploadedFileName(file.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membaca file');
        } finally {
            setIsUploading(false);
        }
    }, [setRpsContent]);

    // Clear RPS Content
    const handleClear = useCallback(() => {
        setRpsContent('');
        setUploadedFileName('');
        setError('');
    }, [setRpsContent]);

    // Generate Prompt (live)
    const generatedPrompt = useMemo(() => {
        if (!rpsContent.trim()) return '';

        return generatePrompt({
            rpsContent,
            pertemuan,
            topik: topik.trim() || undefined,
            jenjang,
            gaya,
            kedalaman,
            panjang,
            bahasa,
            sapaan,
            analogi,
            gayaTulis,
            sertakanLatihan,
            sertakanReferensi
        });
    }, [rpsContent, pertemuan, topik, jenjang, gaya, kedalaman, panjang, bahasa, sapaan, analogi, gayaTulis, sertakanLatihan, sertakanReferensi]);

    // Auto-scroll Effect
    // Auto-scroll Effect
    // Auto-scroll Effect
    useEffect(() => {
        if (!lastAction) return;

        // Small delay to allow DOM to update
        const timer = setTimeout(() => {
            const el = document.getElementById('highlight-target');
            const container = outputRef.current;

            if (el && container) {
                // Manual scroll calculation to prevent page scrolling
                const elTop = el.offsetTop;
                const elHeight = el.clientHeight;
                const containerHeight = container.clientHeight;

                // Calculate target scroll position (center the element)
                const targetScroll = elTop - (containerHeight / 2) + (elHeight / 2);

                container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [generatedPrompt, lastAction]);

    // Helper to render prompt with highlight
    const renderPromptWithHighlight = () => {
        if (!generatedPrompt) return null;
        if (!lastAction) return generatedPrompt;

        let keyword = SEARCH_KEYS[lastAction];

        // Dynamic keywords
        if (lastAction === 'sertakanLatihan') {
            keyword = sertakanLatihan ? '- Latihan/Soal:' : '- Jangan menyertakan soal';
        }
        if (lastAction === 'sertakanReferensi') {
            keyword = sertakanReferensi ? '### Daftar Referensi' : '### Anti-Hallucination:';
        }

        if (!keyword) return generatedPrompt;

        const index = generatedPrompt.indexOf(keyword);
        if (index === -1) return generatedPrompt;

        // Determine end index: highlight until newline
        let endIndex = generatedPrompt.indexOf('\n', index);
        if (endIndex === -1) endIndex = generatedPrompt.length;

        const before = generatedPrompt.substring(0, index);
        const match = generatedPrompt.substring(index, endIndex);
        const after = generatedPrompt.substring(endIndex);

        return (
            <>
                {before}
                <span
                    id="highlight-target"
                    className="bg-yellow-500/30 text-yellow-200 px-1 rounded transition-colors duration-1000 ease-out inline-block w-full -mx-1"
                >
                    {match}
                </span>
                {after}
            </>
        );
    };



    const wordCount = useMemo(() => countWords(generatedPrompt), [generatedPrompt]);

    // Copy to Clipboard
    const handleCopy = useCallback(async () => {
        if (!generatedPrompt) return;

        try {
            await navigator.clipboard.writeText(generatedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [generatedPrompt]);

    const isFormValid = rpsContent.trim().length > 0 && pertemuan > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl shadow-lg shadow-sky-500/25">
                            <span className="text-3xl">🤣</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                            GAS LPG
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Generative AI Support for Lecture Prompt Generation by alditpra
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Step 1: RPS Input */}
                        <section className="card">
                            <div className="card-header">
                                <span className="step-badge">1</span>
                                <h2 className="card-title">Input Konteks RPS</h2>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setInputMode('upload')}
                                    className={`tab-btn ${inputMode === 'upload' ? 'tab-btn-active' : ''}`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload File
                                </button>
                                <button
                                    onClick={() => setInputMode('paste')}
                                    className={`tab-btn ${inputMode === 'paste' ? 'tab-btn-active' : ''}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Paste Teks
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Upload Mode */}
                            {inputMode === 'upload' && (
                                <div className="space-y-4">
                                    <label className="upload-zone">
                                        <input
                                            type="file"
                                            accept=".docx"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
                                                <span className="text-slate-400">Memproses file...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-10 h-10 text-sky-400" />
                                                <span className="text-slate-300">Klik atau drag file .docx ke sini</span>
                                                <span className="text-sm text-slate-500">Maksimum 10MB</span>
                                            </div>
                                        )}
                                    </label>

                                    {uploadedFileName && (
                                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                            <div className="flex items-center gap-2 text-green-400">
                                                <Check className="w-5 h-5" />
                                                <span>{uploadedFileName}</span>
                                            </div>
                                            <button onClick={handleClear} className="text-slate-400 hover:text-red-400 transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Paste Mode */}
                            {inputMode === 'paste' && (
                                <div className="space-y-2">
                                    <textarea
                                        value={rpsContent}
                                        onChange={(e) => setRpsContent(e.target.value)}
                                        placeholder="Paste seluruh isi RPS di sini..."
                                        className="input-textarea min-h-[200px] resize-y"
                                    />
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>{rpsContent.length.toLocaleString()} karakter</span>
                                        {rpsContent && (
                                            <button onClick={handleClear} className="text-red-400 hover:text-red-300 transition-colors">
                                                Hapus semua
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* RPS Preview */}
                            {rpsContent && (
                                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Preview RPS:</h3>
                                    <p className="text-slate-300 text-sm line-clamp-4">
                                        {rpsContent.substring(0, 500)}...
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Step 2: Target Meeting */}
                        <section className="card">
                            <div className="card-header">
                                <span className="step-badge">2</span>
                                <h2 className="card-title">Target Pertemuan</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">
                                        Pertemuan Ke- <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={16}
                                        value={pertemuan}
                                        onChange={(e) => setPertemuan(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Topik/Sub-Bahasan <span className="text-slate-500">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={topik}
                                        onChange={(e) => setTopik(e.target.value)}
                                        placeholder="Kosongkan jika ingin AI mencari dari RPS"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Step 3: Parameters */}
                        <section className="card">
                            <div className="card-header">
                                <span className="step-badge">3</span>
                                <h2 className="card-title">Parameter Materi</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="input-label flex items-center">
                                        Jenjang
                                        <Tooltip text="Level pendidikan mahasiswa" />
                                    </label>
                                    <select
                                        value={jenjang}
                                        onChange={(e) => handleParamChange('jenjang', e.target.value as Jenjang, setJenjang)}
                                        onMouseEnter={() => handleParamHover('jenjang')}
                                        className="input-field"
                                    >
                                        <option value="D3">D3 - Praktis/Vokasi</option>
                                        <option value="S1">S1 - Teori + Praktik</option>
                                        <option value="S2">S2 - Analitis/Riset</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Gaya Penyampaian
                                        <Tooltip text="Teoretis: konsep & definisi. Praktis: aplikasi & how-to. Studi Kasus: analisis real-world." />
                                    </label>
                                    <select
                                        value={gaya}
                                        onChange={(e) => handleParamChange('gaya', e.target.value as Gaya, setGaya)}
                                        onMouseEnter={() => handleParamHover('gaya')}
                                        className="input-field"
                                    >
                                        <option value="Teoretis">Teoretis - Konsep & Definisi</option>
                                        <option value="Praktis">Praktis - Aplikasi & How-to</option>
                                        <option value="Studi Kasus">Studi Kasus - Analisis Real-world</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Level Materi
                                        <Tooltip text="Kedalaman pembahasan materi" />
                                    </label>
                                    <select
                                        value={kedalaman}
                                        onChange={(e) => handleParamChange('kedalaman', e.target.value as Kedalaman, setKedalaman)}
                                        onMouseEnter={() => handleParamHover('kedalaman')}
                                        className="input-field"
                                    >
                                        <option value="Dasar">Dasar - Pengenalan</option>
                                        <option value="Menengah">Menengah - Pemahaman</option>
                                        <option value="Lanjut">Lanjut - Pendalaman</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Gaya Sapaan
                                        <Tooltip text="Kata ganti yang digunakan untuk menyapa pembaca dalam materi" />
                                    </label>
                                    <select
                                        value={sapaan}
                                        onChange={(e) => handleParamChange('sapaan', e.target.value as Sapaan, setSapaan)}
                                        onMouseEnter={() => handleParamHover('sapaan')}
                                        className="input-field"
                                    >
                                        <option value="Inklusif">Inklusif - Kita</option>
                                        <option value="Formal">Formal - Anda</option>
                                        <option value="Netral">Netral - Mahasiswa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Penggunaan Analogi
                                        <Tooltip text="Apakah menggunakan perumpamaan/analogi untuk menjelaskan konsep" />
                                    </label>
                                    <select
                                        value={analogi}
                                        onChange={(e) => handleParamChange('analogi', e.target.value as Analogi, setAnalogi)}
                                        onMouseEnter={() => handleParamHover('analogi')}
                                        className="input-field"
                                    >
                                        <option value="Tidak">Jangan Pakai</option>
                                        <option value="Sedikit">Sedikit (1-2 analogi)</option>
                                        <option value="Banyak">Banyak (aktif)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Format Dokumen
                                        <Tooltip text="Bentuk output: Modul (instruksional), Buku (naratif), atau Slide (poin-poin)" />
                                    </label>
                                    <select
                                        value={gayaTulis}
                                        onChange={(e) => handleParamChange('gayaTulis', e.target.value as GayaTulis, setGayaTulis)}
                                        onMouseEnter={() => handleParamHover('gayaTulis')}
                                        className="input-field"
                                    >
                                        <option value="Modul">Modul Ajar</option>
                                        <option value="Buku">Buku Teks</option>
                                        <option value="Presentasi">Presentasi (Slide)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Panjang Dokumen
                                        <Tooltip text="Target jumlah kata output. Tapi tergantung Ai yang digunakan." />
                                    </label>
                                    <select
                                        value={panjang}
                                        onChange={(e) => handleParamChange('panjang', e.target.value as Panjang, setPanjang)}
                                        onMouseEnter={() => handleParamHover('panjang')}
                                        className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={gayaTulis === 'Presentasi'}
                                    >
                                        <option value="1000">{gayaTulis === 'Presentasi' ? 'Otomatis' : '~1000 kata'}</option>
                                        {gayaTulis !== 'Presentasi' && (
                                            <>
                                                <option value="1500">~1500 kata</option>
                                                <option value="2000">~2000 kata</option>
                                                <option value="2500">~2500 kata</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label flex items-center">
                                        Bahasa Output
                                        <Tooltip text="Indonesia: full bahasa Indonesia. Mixed: istilah teknis dalam English (italic)" />
                                    </label>
                                    <select
                                        value={bahasa}
                                        onChange={(e) => handleParamChange('bahasa', e.target.value as Bahasa, setBahasa)}
                                        onMouseEnter={() => handleParamHover('bahasa')}
                                        className="input-field"
                                    >
                                        <option value="Indonesia">Indonesia Penuh</option>
                                        <option value="Mixed">Mixed (Indo + English teknis)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Checkbox for Latihan */}
                            <div
                                className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-sky-500/50 transition-colors"
                                onMouseEnter={() => handleParamHover('sertakanLatihan')}
                            >
                                <input
                                    type="checkbox"
                                    id="sertakanLatihan"
                                    checked={sertakanLatihan}
                                    onChange={(e) => handleParamChange('sertakanLatihan', e.target.checked, setSertakanLatihan)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
                                />
                                <label htmlFor="sertakanLatihan" className="text-slate-300 cursor-pointer">
                                    Sertakan soal latihan di akhir materi (3-5 soal)
                                </label>
                            </div>

                            {/* Checkbox for Referensi with Warning */}
                            <div className="space-y-2">
                                <div
                                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-sky-500/50 transition-colors"
                                    onMouseEnter={() => handleParamHover('sertakanReferensi')}
                                >
                                    <input
                                        type="checkbox"
                                        id="sertakanReferensi"
                                        checked={sertakanReferensi}
                                        onChange={(e) => handleParamChange('sertakanReferensi', e.target.checked, setSertakanReferensi)}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
                                    />
                                    <label htmlFor="sertakanReferensi" className="text-slate-300 cursor-pointer">
                                        Sertakan 5-10 link referensi dengan keterangan singkat
                                    </label>
                                </div>
                                {sertakanReferensi && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong>Peringatan:</strong> AI mungkin menghasilkan URL yang tidak valid atau referensi fiktif.
                                            Selalu <u>verifikasi setiap link</u> sebelum digunakan dalam materi pembelajaran.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Output */}
                    <div className="lg:sticky lg:top-8">
                        {/* Step 4: Output */}
                        <section className="card h-full">
                            <div className="card-header">
                                <span className="step-badge">4</span>
                                <h2 className="card-title">Prompt Output</h2>
                                {generatedPrompt && (
                                    <div className="ml-auto flex items-center gap-4">
                                        <span className="text-sm text-slate-400">
                                            {wordCount.toLocaleString()} kata
                                        </span>
                                        <button
                                            onClick={handleCopy}
                                            disabled={!isFormValid}
                                            className="btn-primary"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Tersalin!
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardCopy className="w-4 h-4" />
                                                    Copy Prompt
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!isFormValid ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <Sparkles className="w-12 h-12 mb-3 opacity-50" />
                                    <p>Masukkan RPS untuk melihat preview prompt</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <pre ref={outputRef} className="output-area overflow-auto max-h-[80vh] whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                        {renderPromptWithHighlight()}
                                    </pre>
                                </div>
                            )}
                        </section>

                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-10 text-slate-500 text-sm">
                    <p>Copy prompt di atas dan paste ke ChatGPT, Claude, atau Gemini untuk generate Modul Ajar</p>
                </footer>
            </div>

        </div>
    );
}
