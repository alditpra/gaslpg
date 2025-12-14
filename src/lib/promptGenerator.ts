export type Jenjang = 'D3' | 'S1' | 'S2';
export type Gaya = 'Teoretis' | 'Praktis' | 'Studi Kasus';
export type Kedalaman = 'Dasar' | 'Menengah' | 'Lanjut';
export type Panjang = '1000' | '1500' | '2000' | '2500';
export type Bahasa = 'Indonesia' | 'Mixed';
export type Sapaan = 'Inklusif' | 'Formal' | 'Netral';
export type Analogi = 'Tidak' | 'Sedikit' | 'Banyak';
export type GayaTulis = 'Modul' | 'Buku' | 'Presentasi';

export interface PromptParams {
    rpsContent: string;
    pertemuan: number;
    topik?: string;
    jenjang: Jenjang;
    gaya: Gaya;
    kedalaman: Kedalaman;
    panjang: Panjang;
    bahasa: Bahasa;
    sapaan: Sapaan;
    analogi: Analogi;
    gayaTulis: GayaTulis;
    sertakanLatihan: boolean;
    sertakanReferensi: boolean;
    isManualMode?: boolean;
}

const JENJANG_CONTEXT: Record<Jenjang, string> = {
    'D3': 'Fokus pada aspek praktis dan aplikatif. Gunakan bahasa yang sederhana dan langsung. Berikan contoh konkret dari dunia kerja.',
    'S1': 'Keseimbangan antara teori dan praktik. Gunakan bahasa akademis namun tetap accessible. Sertakan landasan konseptual sebelum aplikasi.',
    'S2': 'Pendekatan analitis dan kritis. Gunakan referensi jurnal jika relevan. Dorong diskusi mendalam dan pemikiran reflektif.'
};

const GAYA_CONTEXT: Record<Gaya, string> = {
    'Teoretis': 'Fokus pada konsep, definisi, dan landasan teori secara mendalam.',
    'Praktis': 'Fokus pada aplikasi nyata, contoh konkret, dan panduan how-to.',
    'Studi Kasus': 'Analisis kasus real-world secara mendalam dengan pembahasan komprehensif.'
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

const KEDALAMAN_CONTEXT: Record<Kedalaman, string> = {
    'Dasar': 'Taksonomi Bloom C1-C2 (Mengingat & Memahami). Fokus pada definisi istilah, penjelasan konsep dasar, identifikasi ciri-ciri, dan pemahaman prinsip utama secara luas.',
    'Menengah': 'Taksonomi Bloom C3-C4 (Menerapkan & Menganalisis). Fokus pada penerapan konsep dalam situasi nyata, analisis komponen-komponen, studi kasus sederhana, dan pemecahan masalah prosedural.',
    'Lanjut': 'Taksonomi Bloom C5-C6 (Mengevaluasi & Mencipta). Fokus pada evaluasi kritis terhadap teori, perbandingan pendekatan, sintesis ide dari berbagai sumber, dan perancangan strategi atau solusi baru.'
};

const GAYATULIS_INSTRUCTION: Record<GayaTulis, string> = {
    'Modul': 'Gaya MODUL AJAR: Instruksional dan learning-oriented. Sertakan tujuan pembelajaran di awal, penjelasan step-by-step, dan cek pemahaman. Format modular dengan bagian-bagian yang jelas.',
    'Buku': 'Gaya BUKU TEKS: Naratif akademis dan ensiklopedis. Penjelasan komprehensif dengan alur logis. Bahasa formal dengan elaborasi mendalam seperti buku referensi.',
    'Presentasi': 'Gaya PRESENTASI: Format slide/bullet-points. Ringkas, padat, dan visual. Fokus pada poin-poin kunci dan hierarki informasi yang jelas untuk ditampilkan di layar.'
};

const PROPORSI_MAP: Record<Panjang, string> = {
    '1000': `- Pendahuluan: ~100 kata
- Tujuan Pembelajaran: ~50 kata
- Uraian Materi: ~650 kata
- Contoh/Studi Kasus: ~150 kata
- Ringkasan: ~50 kata`,
    '1500': `- Pendahuluan: ~150 kata
- Tujuan Pembelajaran: ~100 kata
- Uraian Materi: ~950 kata
- Contoh/Studi Kasus: ~200 kata
- Ringkasan: ~100 kata`,
    '2000': `- Pendahuluan: ~200 kata
- Tujuan Pembelajaran: ~100 kata
- Uraian Materi: ~1300 kata
- Contoh/Studi Kasus: ~300 kata
- Ringkasan: ~100 kata`,
    '2500': `- Pendahuluan: ~250 kata
- Tujuan Pembelajaran: ~150 kata
- Uraian Materi: ~1600 kata
- Contoh/Studi Kasus: ~350 kata
- Ringkasan: ~150 kata`
};

export function generatePrompt(params: PromptParams): string {
    const { rpsContent, pertemuan, topik, jenjang, gaya, kedalaman, panjang, bahasa, sapaan, analogi, gayaTulis, sertakanLatihan, sertakanReferensi } = params;

    const parts: string[] = [];

    // 1. ROLE & PERSONA
    parts.push(`## ROLE & PERSONA
Bertindaklah sebagai dosen perguruan tinggi Indonesia yang berpengalaman dalam menyusun materi pembelajaran. Gunakan bahasa formal, akademis, namun mudah dipahami oleh mahasiswa.

**Konteks Jenjang ${jenjang}:** ${JENJANG_CONTEXT[jenjang]}
**Gaya Penyampaian:** ${GAYA_CONTEXT[gaya]}
**Gaya Sapaan:** ${SAPAAN_CONTEXT[sapaan]}
**Penggunaan Analogi:** ${ANALOGI_INSTRUCTION[analogi]}
**Gaya Penulisan:** ${GAYATULIS_INSTRUCTION[gayaTulis]}`);

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
        : `**MINIMAL ${panjang} kata** (JANGAN kurang, elaborasi sedetail mungkin)`;

    parts.push(`## PARAMETER PEMBELAJARAN
- **Jenjang Pendidikan**: ${jenjang}
- **Gaya Penyampaian**: ${gaya}
- **Level Materi**: ${KEDALAMAN_CONTEXT[kedalaman]}
- **Target Panjang**: ${panjangInstruction}
- **Bahasa**: ${bahasaInstruction}`);

    // 5. AUTORULES (HARDCODED)
    let struktur = '';

    if (gayaTulis === 'Presentasi') {
        struktur = `- Slide Judul
- Slide Tujuan Pembelajaran
- Slide Apersepsi/Pendahuluan
- Slide Inti Materi (pecah menjadi 5-10 slide)
- Slide Studi Kasus/Contoh
- Slide Ringkasan & Kesimpulan`;
    } else {
        struktur = PROPORSI_MAP[panjang] + '\n\n**Perhatian**: Pecah setiap poin ulasan materi menjadi paragraf yang mendalam. Jangan hanya membuat listing poin.';
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

    let autorules = `## ATURAN WAJIB (AUTO-RULES)

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
- Jika informasi tidak tersedia di RPS, tulis **[perlu dilengkapi oleh dosen]**

### Larangan:
- Hindari bahasa marketing/promosi`;

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
- Format Markdown: \`[Judul Referensi]: https://url-lengkap.com/path/to/resource\` (Agar URL terlihat jelas)

**PERINGATAN**: Pastikan URL yang diberikan adalah URL yang BENAR dan EXIST. Verifikasi sebelum menyertakan.`;
    }

    autorules += `
    
### Output Continuity (PENTING):
Mengingat target panjang dokumen yang tinggi, jika respons terhenti karena batasan token:
1. Jangan memotong kalimat di tengah kata.
2. Tulis secara eksplisit di baris terakhir: **"[Materi belum selesai. Ketik 'Lanjutkan' untuk meneruskan ke bagian berikutnya...]"**`;

    parts.push(autorules);

    return parts.join('\n\n');
}

export function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}


