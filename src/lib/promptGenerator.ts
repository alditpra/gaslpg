export type Perspektif = 'Umum' | 'Akademis' | 'Industri';
export type TargetAudiens = 'Pemula' | 'Intermediate' | 'Advanced';
export type ModelPembelajaran = 'Kasus' | 'Proyek' | 'Masalah' | 'Ceramah';
export type Panjang = '1000' | '1500' | '2000' | '2500';
export type Bahasa = 'Indonesia' | 'Mixed';
export type Sapaan = 'Inklusif' | 'Formal' | 'Netral';
export type Analogi = 'Tidak' | 'Sedikit' | 'Banyak';
export type GayaTulis = 'Modul' | 'Buku' | 'Presentasi';

export interface PromptParams {
    rpsContent: string;
    pertemuan: number;
    topik?: string;

    perspektif: Perspektif;
    modelPembelajaran: ModelPembelajaran;
    targetAudiens: TargetAudiens;
    panjang: Panjang;
    bahasa: Bahasa;
    sapaan: Sapaan;
    analogi: Analogi;
    gayaTulis: GayaTulis;
    sertakanLatihan: boolean;
    sertakanReferensi: boolean;
    isManualMode?: boolean;
    konteksKasus?: string;
}

const PERSPEKTIF_CONTEXT: Record<Perspektif, string> = {
    'Umum': 'Sudut pandang generalis. Fokus pada pemahaman konsep dasar yang bisa diterima semua kalangan tanpa latar belakang teknis yang dalam.',
    'Akademis': 'Sudut pandang teoritis dan ilmiah. Fokus pada validitas, metodologi, referensi jurnal, dan kerangka berpikir kritis yang ketat.',
    'Industri': 'Sudut pandang praktisi. Fokus pada best practice, efisiensi kerja, standar industri, dan relevansi pasar kerja saat ini.'
};

const MODEL_PEMBELAJARAN_CONTEXT: Record<ModelPembelajaran, string> = {
    'Kasus': 'Studi Kasus (Simulasi). Sajikan materi melalui bedah kasus simulasi [KONTEKS]. Ajak mahasiswa menganalisis situasi, masalah, dan solusi dari kasus tersebut.',
    'Proyek': 'Project Based Learning (PjBL). Orientasikan materi pada penyelesaian proyek atau penciptaan produk akhir. Fokus pada langkah-langkah praktis pengerjaan.',
    'Masalah': 'Problem Based Learning (PBL). Mulai dengan masalah pemicu (simulasi) [KONTEKS]. Ajak mahasiswa menelusuri konsep untuk memecahkan masalah tersebut.',
    'Ceramah': 'Konvensional (Expository). Jelaskan konsep secara berurutan, sistematis, dan deduktif. Fokus pada transfer pengetahuan yang jelas dan terstruktur.'
};

const SAPAAN_CONTEXT: Record<Sapaan, string> = {
    'Inklusif': 'Gunakan kata ganti "kita" untuk menciptakan suasana belajar yang inklusif dan partisipatif. Contoh: "Kita akan mempelajari...", "Mari kita bahas..."',
    'Formal': 'Gunakan kata ganti "Anda" untuk gaya penulisan formal seperti buku teks. Contoh: "Anda akan mempelajari...", "Setelah mempelajari materi ini, Anda diharapkan..."',
    'Netral': 'Gunakan kata ganti orang ketiga "mahasiswa" untuk gaya penulisan objektif dan netral. Contoh: "Mahasiswa akan mempelajari...", "Mahasiswa diharapkan mampu..."'
};

const ANALOGI_INSTRUCTION: Record<Analogi, string> = {
    'Tidak': 'JANGAN gunakan analogi sama sekali. Jelaskan konsep secara langsung tanpa perumpamaan.',
    'Sedikit': 'Gunakan 1-2 analogi sederhana hanya untuk konsep yang sangat abstrak atau sulit dipahami.',
    'Banyak': 'Gunakan analogi dan perumpamaan secara aktif untuk setiap konsep penting. Hubungkan dengan pengalaman sehari-hari mahasiswa.'
};

const TARGET_AUDIENS_CONTEXT: Record<TargetAudiens, string> = {
    'Pemula': 'Target: Mahasiswa Semester Awal / Awam. Masih belajar pemahaman dasar. Hindari jargon berlebihan tanpa penjelasan. Fokus pada pemahaman konsep dasar (Bloom C1-C2).',
    'Intermediate': 'Target: Mahasiswa Semester Tengah. Asumsikan pemahaman dasar sudah ada. Fokus pada penerapan dan analisis (Bloom C3-C4). Gunakan istilah teknis dengan wajar.',
    'Advanced': 'Target: Mahasiswa Tingkat Akhir / Pascasarjana. Diskusi tingkat tinggi yang menuntut evaluasi dan sintesis (Bloom C5-C6). Tantang pemikiran kritis.'
};

const GAYATULIS_INSTRUCTION: Record<GayaTulis, string> = {
    'Modul': 'Gaya MODUL AJAR: Gunakan gaya naratif akademis dan ensiklopedis. Sajikan penjelasan yang komprehensif dengan alur logis dan sistematis. Gunakan bahasa formal dengan diksi yang ringan dan mudah dipahami. Elaborasi konsep secara mendalam seperti buku referensi akademik, namun sajikan dalam bentuk poin-poin terstruktur (bullet points), termasuk bagian pendahuluan',
    'Buku': 'Gaya BUKU TEKS: Naratif akademis dan ensiklopedis. Penjelasan komprehensif dengan alur logis. Bahasa formal dengan elaborasi mendalam seperti buku referensi.',
    'Presentasi': 'Gaya PRESENTASI: Format slide/bullet-points. Ringkas, padat, dan visual. Fokus pada poin-poin kunci dan hierarki informasi yang jelas untuk ditampilkan di layar.'
};

const PROPORSI_MAP: Record<Panjang, string> = {
    '1000': `- Pendahuluan: ~50 kata
- Tujuan Pembelajaran: ~50 kata
- Uraian Materi: ~680 kata
- Contoh/Studi Kasus: ~170 kata
- Ringkasan: ~50 kata`,
    '1500': `- Pendahuluan: ~50 kata
- Tujuan Pembelajaran: ~100 kata
- Uraian Materi: ~1000 kata
- Contoh/Studi Kasus: ~250 kata
- Ringkasan: ~100 kata`,
    '2000': `- Pendahuluan: ~50 kata
- Tujuan Pembelajaran: ~100 kata
- Uraian Materi: ~1400 kata
- Contoh/Studi Kasus: ~350 kata
- Ringkasan: ~100 kata`,
    '2500': `- Pendahuluan: ~50 kata
- Tujuan Pembelajaran: ~150 kata
- Uraian Materi: ~1750 kata
- Contoh/Studi Kasus: ~400 kata
- Ringkasan: ~150 kata`
};

export function generatePrompt(params: PromptParams): string {
    const { rpsContent, pertemuan, topik, perspektif, modelPembelajaran, targetAudiens, panjang, bahasa, sapaan, analogi, gayaTulis, sertakanLatihan, sertakanReferensi, konteksKasus } = params;

    const parts: string[] = [];

    // Dynamic Context for Case/PBL
    let modelContext = MODEL_PEMBELAJARAN_CONTEXT[modelPembelajaran];
    if (modelPembelajaran === 'Kasus' || modelPembelajaran === 'Masalah') {
        const defaultContext = 'level startup atau umkm bidang agribisnis atau peternakan atau rumah makan atau pendidikan';
        const usedContext = konteksKasus?.trim() || defaultContext;
        modelContext = modelContext.replace('[KONTEKS]', usedContext);
    }

    parts.push(`## ROLE & PERSONA
Bertindaklah sebagai dosen perguruan tinggi Indonesia yang berpengalaman dalam menyusun materi pembelajaran. Gunakan bahasa formal, akademis, namun mudah dipahami oleh mahasiswa.

## 6 POIN PENTING
**Perspektif Penjelasan:** ${PERSPEKTIF_CONTEXT[perspektif]}
**Target Audiens:** ${TARGET_AUDIENS_CONTEXT[targetAudiens]}
**Model Pembelajaran:** ${modelContext}
**Gaya Sapaan:** ${SAPAAN_CONTEXT[sapaan]}
**Penggunaan Analogi:** ${ANALOGI_INSTRUCTION[analogi]}
**Gaya Penulisan:** ${GAYATULIS_INSTRUCTION[gayaTulis]} 
`);


    // 2. KONTEKS & TUGAS
    if (params.isManualMode) {
        // Mode Manual: Topik menjadi konteks utama
        parts.push(`## TOPIK / OUTLINE MATERI (INPUT MANUAL)
Berikut adalah topik atau outline materi yang harus dikembangkan menjadi dokumen pembelajaran lengkap:

--- MULAI TOPIK ---
${rpsContent}
--- AKHIR TOPIK ---`);

        parts.push(`## TUGAS UTAMA
Buatlah DOKUMEN MATERI PEMBELAJARAN berdasarkan topik/outline di atas. Kembangkan setiap poin menjadi materi yang daging dan komprehensif.`);

    } else {
        // Mode RPS: Konteks RPS + Pertemuan
        parts.push(`## KONTEKS RPS (DATA UTAMA)
Berikut adalah Rencana Pembelajaran Semester (RPS) lengkap untuk mata kuliah ini sebagai konteks utama:

--- AWAL RPS ---
${rpsContent}
--- AKHIR RPS ---`);

        let tugasUtama = `## TUGAS UTAMA
Buatlah DOKUMEN MATERI PEMBELAJARAN (Modul Ajar) hanya untuk **PERTEMUAN KE-${pertemuan}**.`;

        if (topik && topik.trim()) {
            tugasUtama += `\nDengan fokus bahasan: **${topik.trim()}**`;
        } else {
            tugasUtama += `\nCari dan identifikasi topik pembelajaran untuk pertemuan ke-${pertemuan} dari RPS yang diberikan.`;
        }
        parts.push(tugasUtama);
    }

    // 4. PARAMETER USER
    const bahasaInstruction = bahasa === 'Mixed'
        ? 'Bahasa Indonesia dengan istilah teknis dalam Bahasa Inggris (italic)'
        : 'Bahasa Indonesia sepenuhnya';

    const panjangInstruction = gayaTulis === 'Presentasi'
        ? 'Dinamis (Sesuai kebutuhan materi slide)'
        : `**Sekitar ${panjang} kata** (WAJIB tidak bertele-tele)`;

    parts.push(`## 5 PARAMETER PEMBELAJARAN
- **Sudut Pandang**: ${perspektif}
- **Pendekatan**: ${modelPembelajaran}
- **Level Audiens**: ${targetAudiens}
- **Target Panjang**: ${panjangInstruction}
- **Bahasa**: ${bahasaInstruction}`);

    // 5. AUTORULES (HARDCODED)
    let struktur = '';

    if (gayaTulis === 'Presentasi') {
        struktur = `- Slide Judul
- Slide Tujuan Pembelajaran
- Slide Apersepsi/Pendahuluan
- Slide Inti Materi (pecah menjadi 7-13 slide)
- Slide Studi Kasus/Contoh
- Slide Ringkasan & Kesimpulan`;
    } else {
        struktur = PROPORSI_MAP[panjang] + '\n\n**Perhatian**: Pecah setiap poin ulasan materi menjadi penjelasan mendalam dalam bentuk bullet points yang terstruktur. Pastikan elaborasi tetap komprehensif.';
    }

    if (sertakanLatihan) {
        struktur += `\n- ${gayaTulis === 'Presentasi' ? 'Slide ' : ''}Latihan/Soal: ${gayaTulis === 'Presentasi' ? '1 Slide' : '~100-150 kata (3-5 soal)'}`;
    }
    if (sertakanReferensi) {
        struktur += `\n- ${gayaTulis === 'Presentasi' ? 'Slide ' : ''}Daftar Referensi: 5-10 link URL`;
    }

    const outputFormat = gayaTulis === 'Presentasi'
        ? '- Output berupa OUTLINE PRESENTASI (Slide-by-Slide)\n- Gunakan bullet points, hindari paragraf panjang'
        : '- Output berupa teks naratif terstruktur (BUKAN slide/PPT)';

    const objectiveRule = '\n### WAJIB: Sertakan "Tujuan Pembelajaran" di bagian paling awal materi.';
    let autorules = `## ATURAN WAJIB (AUTO-RULES)

${sertakanReferensi ? '**LANGKAH PERTAMA (WAJIB):** Sebelum menulis satu katapun, LAKUKAN PENCARIAN dan PEMBACAAN mendalam terhadap minimal 5-10 referensi kredibel yang relevan. Gunakan informasi dari referensi ini sebagai fondasi materi.\n' : ''}
${objectiveRule}

### Struktur Dokumen (dengan Proporsi):
${struktur}

### Format Output:
- Gunakan format **Markdown** dengan heading yang jelas (# ## ###)
${outputFormat}
- Selaraskan dengan Capaian Pembelajaran Mata Kuliah (CPMK) yang ada di RPS`;

    if (bahasa === 'Mixed') {
        autorules += `\n- Istilah teknis ditulis dalam Bahasa Inggris dengan format *italic*`;
    }

    autorules += `

### Anti-Hallucination:
- JANGAN menyebutkan nama buku/referensi yang tidak tercantum di RPS
- JANGAN membuat kutipan atau sitasi fiktif

### Larangan:
- Hindari kreatifitas yang tidak sesuai apa yang saya minta`;

    if (!sertakanLatihan) {
        autorules += `\n- Jangan menyertakan soal latihan/kuis`;
    }

    if (sertakanReferensi) {
        autorules += `

### Daftar Referensi (WAJIB jika diminta):
Di akhir dokumen, sertakan bagian **Daftar Referensi** dengan format:
- 5-10 link URL lengkap yang relevan dengan materi
- Tulis URL secara utuh (contoh: "https://jurnal.id/artikel-123")
- Prioritaskan sumber: jurnal ilmiah, repositori institusi, situs .edu/.ac.id, Wikipedia
- Format Referensi: https://url-lengkap-beserta-halaman.com/ (Agar URL terlihat jelas)

**PERINGATAN**: Pastikan URL yang diberikan adalah URL yang BENAR dan EXIST. Verifikasi sebelum menyertakan.`;
    }

    autorules += `
    
### Review Materi (WAJIB):
Di bagian paling akhir, tawarkan opsi kepada pengguna untuk mengetik **"Ya"** agar Anda (AI) mereview ulang dan merevisi materi tersebut untuk memastikan kesesuaian dengan prompt awal.`;

    parts.push(autorules);

    return parts.join('\n\n');
}

export function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}


