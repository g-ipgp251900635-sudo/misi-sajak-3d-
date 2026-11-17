import {
  AreaId,
  BadgeDef,
  BookItem,
  DengarkanQuestion,
  FragmentItem,
  GunungQuestion,
  IramaQuestion,
  NpcDialogueData,
} from '../types/game';

export interface AreaInfo {
  id: AreaId;
  order: number;
  name: string;
  subtitle: string;
  color: string;
  spawn: { x: number; z: number };
  center: { x: number; z: number };
  radius: number;
}

export const AREAS: Record<AreaId, AreaInfo> = {
  kampung: {
    id: 'kampung',
    order: 1,
    name: 'Kampung Puisi',
    subtitle: 'Pengenalan & Ciri-Ciri Sajak',
    color: '#10b981',
    spawn: { x: 0, z: 12 },
    center: { x: 0, z: 0 },
    radius: 34,
  },
  hutan: {
    id: 'hutan',
    order: 2,
    name: 'Hutan Makna',
    subtitle: 'Rangkap, Baris, Tema & Persoalan',
    color: '#059669',
    spawn: { x: 46, z: 2 },
    center: { x: 64, z: 0 },
    radius: 32,
  },
  tasik: {
    id: 'tasik',
    order: 3,
    name: 'Tasik Irama',
    subtitle: 'Intonasi, Tekanan & Jeda Deklamasi',
    color: '#0284c7',
    spawn: { x: 0, z: -48 },
    center: { x: 0, z: -68 },
    radius: 32,
  },
  gunung: {
    id: 'gunung',
    order: 4,
    name: 'Gunung Puisi',
    subtitle: 'Cabaran Puncak 10 Soalan',
    color: '#d97706',
    spawn: { x: -46, z: 0 },
    center: { x: -72, z: 0 },
    radius: 34,
  },
};

export interface SajakStanzaAnnotated {
  rangkap: number;
  tajukKecil: string;
  lines: {
    raw: string;
    annotated: string;
    intonasi: string;
    tekananKata: string;
    jedaTip: string;
  }[];
  maksud: string;
}

export const ORIGINAL_SAJAK = {
  title: 'Permata di Taman Ilmu',
  author: 'Karya Asli Misi Sajak 3D',
  tema: 'Kepentingan menuntut ilmu dan menghargai alam serta budi pekerti dalam kehidupan.',
  stanzas: [
    {
      rangkap: 1,
      tajukKecil: 'Pagi di Taman Ilmu',
      lines: [
        {
          raw: 'Di bawah rimbun pohonan ilmu,',
          annotated: 'Di bawah rimbun / pohonan **ILMU**,',
          intonasi: 'Sederhana dan lembut (membuka suasana)',
          tekananKata: 'ilmu',
          jedaTip: 'Henti sebentar (/) selepas perkataan "rimbun"',
        },
        {
          raw: 'embun pagi menyapa lembut pipi,',
          annotated: 'embun pagi / menyapa **LEMBUT** pipi,',
          intonasi: 'Alunan merdu dan tenang',
          tekananKata: 'lembut',
          jedaTip: 'Henti sebentar (/) selepas "embun pagi"',
        },
        {
          raw: 'aksara demi aksara ku susun rapi,',
          annotated: 'aksara demi aksara / ku susun **RAPI**,',
          intonasi: 'Menaik sedikit pada perkataan "rapi"',
          tekananKata: 'rapi',
          jedaTip: 'Henti sebentar (/) di tengah baris',
        },
        {
          raw: 'menjadi bekalan sepanjang hari.',
          annotated: 'menjadi bekalan / sepanjang **HARI** //',
          intonasi: 'Menurun lembut menandakan akhir rangkap',
          tekananKata: 'hari',
          jedaTip: 'Henti panjang (//) pada penghujung rangkap pertama',
        },
      ],
      maksud:
        'Penyajak memulakan hari dengan penuh semangat mencari ilmu pengetahuan yang disusun rapi sebagai bekalan hidup.',
    },
    {
      rangkap: 2,
      tajukKecil: 'Langkah Gigih',
      lines: [
        {
          raw: 'Walau jalan berliku mendaki bukit,',
          annotated: 'Walau jalan berliku / **MENDAKI** bukit,',
          intonasi: 'Tegas dan bertenaga menunjukkan kesungguhan',
          tekananKata: 'mendaki',
          jedaTip: 'Henti sebentar (/) selepas "berliku"',
        },
        {
          raw: 'penat dan lelah tidak ku kira,',
          annotated: 'penat dan lelah / **TIDAK** ku kira,',
          intonasi: 'Tegas dan yakin',
          tekananKata: 'tidak',
          jedaTip: 'Henti sebentar (/) selepas "penat dan lelah"',
        },
        {
          raw: 'kerana sabar membina tekad,',
          annotated: 'kerana **SABAR** / membina **TEKAD**,',
          intonasi: 'Menaik pada kata "tekad"',
          tekananKata: 'sabar, tekad',
          jedaTip: 'Henti sebentar (/) selepas "sabar"',
        },
        {
          raw: 'membuka pintu kejayaan.',
          annotated: 'membuka pintu **KEJAYAAN** //',
          intonasi: 'Mantap dan meyakinkan di akhir baris',
          tekananKata: 'kejayaan',
          jedaTip: 'Henti panjang (//) sebelum masuk rangkap ketiga',
        },
      ],
      maksud:
        'Walaupun usaha menuntut ilmu penuh cabaran, kesabaran dan keazaman yang kuat pasti membawa kejayaan.',
    },
    {
      rangkap: 3,
      tajukKecil: 'Harmoni Alam dan Budi',
      lines: [
        {
          raw: 'Dengarlah irama sungai mengalir,',
          annotated: '**DENGARLAH** / irama sungai mengalir,',
          intonasi: 'Nada menyeru yang lembut dan mengasyikkan',
          tekananKata: 'dengarlah',
          jedaTip: 'Henti sebentar (/) selepas seruan "Dengarlah"',
        },
        {
          raw: 'mengajar kita erti syukur,',
          annotated: 'mengajar kita / erti **SYUKUR**,',
          intonasi: 'Lembut dan penuh penghayatan',
          tekananKata: 'syukur',
          jedaTip: 'Henti sebentar (/) selepas "kita"',
        },
        {
          raw: 'menghormati guru serta ibu bapa,',
          annotated: 'menghormati **GURU** / serta ibu bapa,',
          intonasi: 'Hormat dan tulus',
          tekananKata: 'guru',
          jedaTip: 'Henti sebentar (/) selepas "guru"',
        },
        {
          raw: 'itulah permata budi pekerti.',
          annotated: 'itulah **PERMATA** / budi pekerti //',
          intonasi: 'Menurun tenang dengan penegasan pada "permata"',
          tekananKata: 'permata',
          jedaTip: 'Henti panjang (//) di hujung rangkap',
        },
      ],
      maksud:
        'Alam sekitar mendidik kita supaya bersyukur, manakala sikap menghormati guru dan ibu bapa merupakan nilai budi pekerti yang amat berharga.',
    },
    {
      rangkap: 4,
      tajukKecil: 'Harapan Generasi Muda',
      lines: [
        {
          raw: 'Wahai sahabat seiring langkah,',
          annotated: 'Wahai **SAHABAT** / seiring langkah,',
          intonasi: 'Nada mesra dan bersemangat menyeru rakan',
          tekananKata: 'sahabat',
          jedaTip: 'Henti sebentar (/) selepas "sahabat"',
        },
        {
          raw: 'mari kita semai benih usaha,',
          annotated: 'mari kita **SEMAI** / benih usaha,',
          intonasi: 'Menaik penuh harapan',
          tekananKata: 'semai',
          jedaTip: 'Henti sebentar (/) selepas "semai"',
        },
        {
          raw: 'agar mekar taman nusa tercinta,',
          annotated: 'agar **MEKAR** / taman nusa tercinta,',
          intonasi: 'Penuh kebanggaan dan semangat cintakan negara',
          tekananKata: 'mekar',
          jedaTip: 'Henti sebentar (/) selepas "mekar"',
        },
        {
          raw: 'bersinar bak bintang di angkasa.',
          annotated: 'bersinar bak **BINTANG** / di angkasa //',
          intonasi: 'Penutup yang lantang, jelas, dan memberi inspirasi',
          tekananKata: 'bintang',
          jedaTip: 'Henti panjang penuh penghayatan (//)',
        },
      ],
      maksud:
        'Penyajak mengajak rakan-rakan supaya tekun berusaha demi mengharumkan nama negara yang tercinta.',
    },
  ] as SajakStanzaAnnotated[],
};

export const NPC_DIALOGUES: Record<string, NpcDialogueData> = {
  cikgu_aminah: {
    id: 'cikgu_aminah',
    name: 'Cikgu Aminah',
    role: 'Guru Bahasa Melayu · Kampung Puisi',
    area: 'kampung',
    greeting: 'Selamat datang ke Kampung Puisi!',
    lines: [
      'Selamat datang ke Kampung Puisi! Saya Cikgu Aminah. Hari ini kamu akan mengembara ke empat buah alam untuk menguasai seni sajak Tahun 5.',
      'Tahukah kamu apa itu sajak? Sajak ialah puisi Melayu moden yang berbentuk bebas. Tidak seperti pantun atau syair, sajak tidak terikat pada bilangan baris, rangkap, atau rima akhir yang tetap.',
      'Misi pertama kamu mudah sahaja: terokai Kampung Puisi dan kumpulkan 3 Buku Sajak Bercahaya yang berada di sekitar balai ilmu dan taman kampung. Selepas selesai, seberangi jambatan ke timur menuju Hutan Makna!',
    ],
    actionLabel: 'Teruskan Misi Kampung Puisi',
  },
  penjaga_faris: {
    id: 'penjaga_faris',
    name: 'Cikgu Faris',
    role: 'Penjaga Rimba · Hutan Makna',
    area: 'hutan',
    greeting: 'Salam sejahtera, pengembara kata!',
    lines: [
      'Selamat tiba di Hutan Makna! Di sinilah tersimpannya rahsia struktur dan maksud sesuatu sajak.',
      'Setiap sajak terdiri daripada rangkap (kumpulan baris) dan baris (ayat atau ungkapan). Daripada rangkap tersebut, kita dapat mengenal pasti Tema (idea utama keseluruhan sajak) dan Persoalan (perkara penting yang menyokong tema).',
      'Cari 4 Serpihan Puisi daripada sajak asli "Permata di Taman Ilmu" yang tersembunyi di hutan ini. Baca setiap rangkap dan jawab soalannya untuk mengumpul syiling serta membuka laluan ke Tasik Irama!',
    ],
    actionLabel: 'Mula Mencari Serpihan Puisi',
  },
  puan_melati: {
    id: 'puan_melati',
    name: 'Puan Melati',
    role: 'Seniman Irama · Tasik Irama',
    area: 'tasik',
    greeting: 'Dengarlah alunan air tasik yang merdu...',
    lines: [
      'Selamat datang ke Tasik Irama! Membaca sajak tidak sama seperti membaca berita. Kita mendeklamasikan sajak dengan penuh penghayatan.',
      'Tiga teknik penting dalam deklamasi sajak ialah Intonasi (turun naik nada suara mengikut emosi), Tekanan (penegasan pada kata kunci penting), dan Jeda (hentian sejenak "/" atau hentian panjang "//").',
      'Mari masuk ke Astaka Irama bersama saya! Kamu boleh mendengar contoh deklamasi sajak dan menjawab 4 soalan teknik bacaan.',
    ],
    actionLabel: 'Buka Makmal Tasik Irama',
  },
  tok_pendeta: {
    id: 'tok_pendeta',
    name: 'Tok Pendeta Puisi',
    role: 'Sarjana Bahasa · Gunung Puisi',
    area: 'gunung',
    greeting: 'Tahniah kerana berjaya mendaki hingga ke puncak!',
    lines: [
      'Syabas, pengembara muda! Kamu telah pun mempelajari pengertian sajak di Kampung Puisi, memahami makna di Hutan Makna, dan menghayati irama di Tasik Irama.',
      'Kini tibalah masanya untuk Cabaran Puncak Gunung Puisi. Terdapat 10 soalan pilihan berganda yang akan menguji seluruh pemahaman kamu tentang sajak Tahun 5.',
      'Baca setiap soalan dengan teliti. Selepas setiap jawapan, kamu akan mendapat penerangan lengkap. Adakah kamu bersedia menawan puncak puisi?',
    ],
    actionLabel: 'Sahut Cabaran 10 Soalan!',
  },
  penjaga_sajak: {
    id: 'penjaga_sajak',
    name: 'Penjaga Sajak',
    role: 'Penjaga Pavilion Ajaib · Tasik Irama',
    area: 'tasik',
    greeting: 'Selamat datang ke Pavilion Ajaib Tasik Irama!',
    lines: [
      'Selamat datang, pengembara! Sebelum meneruskan perjalanan, kamu perlu mendengar dan menghayati sebuah sajak. Tonton video ini sehingga selesai untuk membuka cabaran seterusnya.',
      'Dalam Pavilion Ajaib ini, dengar setiap bait puisi dan penerangan teknik penyampaian dengan teliti. Apabila video tamat, butang "MULA CABARAN" akan terbuka untuk lima soalan interaktif!',
    ],
    actionLabel: 'Masuk Pavilion Video Sajak',
  },
};

export const KAMPUNG_BOOKS: BookItem[] = [
  {
    id: 'buku_1',
    title: 'Buku 1: Pengertian Sajak',
    subtitle: 'Apa itu Sajak?',
    area: 'kampung',
    x: -11,
    z: 4,
    summaryPoints: [
      'Sajak ialah sejenis puisi Melayu moden yang bebas bentuknya.',
      'Sajak tidak terikat kepada bilangan perkataan sebaris, bilangan baris serangkap, atau rima akhir tertentu seperti pantun dan syair.',
      'Penyajak bebas menyusun kata dan rangkap bagi menyampaikan perasaan, pengajaran, serta pemikiran dengan indah.',
    ],
    checkQuestion: {
      question: 'Apakah yang dimaksudkan dengan sajak?',
      options: [
        'Puisi moden yang berbentuk bebas dan tidak terikat dengan rima tetap',
        'Puisi tradisional empat kerat yang mesti mempunyai pembayang dan maksud',
        'Karangan berita yang ditulis dalam perenggan panjang tanpa rangkap',
      ],
      correctIndex: 0,
      explanation:
        'Betul! Sajak ialah puisi Melayu moden yang bersifat bebas dan tidak terikat dengan syarat ketat seperti pantun atau syair.',
    },
  },
  {
    id: 'buku_2',
    title: 'Buku 2: Ciri-Ciri Sajak',
    subtitle: 'Mengenali Struktur Sajak',
    area: 'kampung',
    x: 13,
    z: -4,
    summaryPoints: [
      'Mempunyai rangkap yang bebas (satu rangkap boleh mempunyai 2, 3, 4, atau lebih baris).',
      'Baris dalam sajak boleh pendek (1–2 patah kata) atau panjang mengikut kesesuaian irama.',
      'Menggunakan diksi (pemilihan kata) yang tepat, puitis, dan bermakna.',
      'Rima akhirnya bebas (tidak semestinya a-b-a-b seperti pantun).',
    ],
    checkQuestion: {
      question: 'Manakah antara berikut merupakan ciri-ciri sajak yang tepat?',
      options: [
        'Setiap rangkap wajib mempunyai tepat empat baris sahaja',
        'Bilangan baris dalam setiap rangkap adalah bebas dan rima akhirnya tidak terikat',
        'Dua baris pertama sentiasa berfungsi sebagai pembayang maksud',
      ],
      correctIndex: 1,
      explanation:
        'Tepat sekali! Sajak mempunyai bilangan baris dan rima akhir yang bebas mengikut kreativiti penyajak.',
    },
  },
  {
    id: 'buku_3',
    title: 'Buku 3: Penghayatan & Gaya Bahasa',
    subtitle: 'Cara Menghayati Sajak',
    area: 'kampung',
    x: -4,
    z: -14,
    summaryPoints: [
      'Untuk menghayati sajak, baca setiap baris berulang kali sambil membayangkan gambaran atau suasana yang dilukiskan.',
      'Kenal pasti kata-kata indah atau kiasan seperti "permata budi pekerti" atau "embun pagi menyapa lembut".',
      'Fahami perasaan penyajak sama ada gembira, sedih, bersyukur, atau bersemangat.',
    ],
    checkQuestion: {
      question: 'Bagaimanakah cara terbaik untuk menghayati sesuatu sajak?',
      options: [
        'Membaca dengan terlalu laju tanpa berhenti supaya cepat habis',
        'Membaca hanya baris terakhir setiap rangkap sahaja',
        'Memahami diksi, membayangkan suasana, dan merasai emosi yang disampaikan penyajak',
      ],
      correctIndex: 2,
      explanation:
        'Bagus! Penghayatan sajak memerlukan kita memahami maksud kata, membayangkan suasana, dan merasai emosi penyajak.',
    },
  },
];

export const HUTAN_FRAGMENTS: FragmentItem[] = [
  {
    id: 'serpihan_1',
    title: 'Serpihan 1: Struktur Rangkap & Baris',
    rangkapNumber: 1,
    stanzaLines: ORIGINAL_SAJAK.stanzas[0].lines.map((l) => l.raw),
    area: 'hutan',
    x: 52,
    z: -12,
    focusConcept: 'Rangkap dan Baris',
    question:
      'Berdasarkan Serpihan Rangkap 1 di atas, berapakah bilangan baris dalam rangkap ini dan apakah maksud ungkapan "aksara demi aksara ku susun rapi"?',
    options: [
      '4 baris; bermaksud penyajak tekun menyusun dan mempelajari ilmu pengetahuan',
      '2 baris; bermaksud penyajak sedang tidur di bawah pokok',
      '4 baris; bermaksud penyajak membuang buku ke dalam sungai',
    ],
    correctIndex: 0,
    explanation:
      'Syabas! Rangkap ini mempunyai 4 baris. "Aksara" bermaksud huruf atau tulisan; menyusun aksara melambangkan usaha tekun menuntut ilmu.',
  },
  {
    id: 'serpihan_2',
    title: 'Serpihan 2: Persoalan Kesungguhan',
    rangkapNumber: 2,
    stanzaLines: ORIGINAL_SAJAK.stanzas[1].lines.map((l) => l.raw),
    area: 'hutan',
    x: 72,
    z: -10,
    focusConcept: 'Persoalan dalam Sajak',
    question:
      'Apakah persoalan utama yang terpancar dalam Rangkap 2 sajak "Permata di Taman Ilmu"?',
    options: [
      'Persoalan sikap malas apabila menghadapi kesukaran',
      'Persoalan kegigihan dan kesabaran dalam menempuh cabaran demi kejayaan',
      'Persoalan cara mendaki gunung menggunakan tali',
    ],
    correctIndex: 1,
    explanation:
      'Tepat! Ungkapan "penat dan lelah tidak ku kira" serta "sabar membina tekad" menggambarkan persoalan kegigihan untuk berjaya.',
  },
  {
    id: 'serpihan_3',
    title: 'Serpihan 3: Maksud Rangkap & Nilai',
    rangkapNumber: 3,
    stanzaLines: ORIGINAL_SAJAK.stanzas[2].lines.map((l) => l.raw),
    area: 'hutan',
    x: 74,
    z: 12,
    focusConcept: 'Maksud Rangkap',
    question: 'Apakah maksud Rangkap 3 ini dengan tepat?',
    options: [
      'Kita perlu menangkap ikan di sungai bersama guru',
      'Kita hendaklah bersyukur melihat keindahan alam serta menghormati guru dan ibu bapa sebagai budi pekerti mulia',
      'Sungai yang mengalir berbunyi sangat bising pada waktu malam',
    ],
    correctIndex: 1,
    explanation:
      'Benar sekali! Rangkap ini menekankan rasa syukur terhadap alam dan kepentingan budi pekerti mulia dengan menghormati guru serta ibu bapa.',
  },
  {
    id: 'serpihan_4',
    title: 'Serpihan 4: Tema Keseluruhan Sajak',
    rangkapNumber: 4,
    stanzaLines: ORIGINAL_SAJAK.stanzas[3].lines.map((l) => l.raw),
    area: 'hutan',
    x: 54,
    z: 14,
    focusConcept: 'Tema Sajak',
    question:
      'Setelah membaca kesemua empat rangkap "Permata di Taman Ilmu", apakah TEMA keseluruhan sajak ini?',
    options: [
      'Kisah pengembara yang sesat di dalam hutan tebal',
      'Kesungguhan menuntut ilmu, mengamalkan budi pekerti, dan berusaha demi kejayaan nusa',
      'Pertandingan melukis pemandangan taman pada waktu petang',
    ],
    correctIndex: 1,
    explanation:
      'Cemerlang! Tema ialah gagasan utama keseluruhan sajak—dalam sajak ini, temanya ialah kesungguhan menuntut ilmu dan berbudi pekerti demi kejayaan.',
  },
];

export const IRAMA_QUESTIONS: IramaQuestion[] = [
  {
    id: 'irama_1',
    concept: 'Intonasi (Nada Suara)',
    excerpt: 'Wahai sahabat seiring langkah, / mari kita semai benih usaha,',
    question:
      'Bagaimanakah intonasi yang paling sesuai ketika mendeklamasikan baris seruan di atas?',
    options: [
      'Nada suara yang mendatar, perlahan, dan berbisik seperti orang mengantuk',
      'Nada suara yang bersemangat, mesra, dan sedikit menaik untuk menyeru rakan',
      'Nada suara yang marah dan menjerit sekuat hati',
    ],
    correctIndex: 1,
    explanation:
      'Tepat! Kata seruan "Wahai sahabat" dan ajakan "mari kita semai" sesuai diucapkan dengan intonasi mesra dan bersemangat.',
  },
  {
    id: 'irama_2',
    concept: 'Tekanan Suara',
    excerpt: 'penat dan lelah / TIDAK ku kira,',
    question:
      'Mengapakah perkataan "tidak" dan "tekad" perlu diberikan tekanan suara semasa mendeklamasikan Rangkap 2?',
    options: [
      'Supaya pendengar terasa kelakar apabila mendengar bunyinya',
      'Untuk menegaskan maksud ketabahan dan semangat juang yang tinggi',
      'Kerana perkataan itu terletak di awal perenggan cerita',
    ],
    correctIndex: 1,
    explanation:
      'Betul! Tekanan diberikan pada kata kunci penting untuk menegaskan maksud dan emosi dalam baris sajak.',
  },
  {
    id: 'irama_3',
    concept: 'Jeda (Hentian)',
    excerpt: 'Di bawah rimbun / pohonan ilmu, //',
    question:
      'Apakah fungsi tanda jeda ( / ) dan ( // ) semasa mendeklamasikan sesuatu sajak?',
    options: [
      'Tanda ( / ) ialah hentian sebentar di tengah baris, manakala ( // ) ialah hentian lebih lama di akhir baris atau rangkap',
      'Tanda ( / ) bermaksud pembaca perlu melompat, manakala ( // ) bermaksud tamat permainan',
      'Kedua-dua tanda bermaksud pembaca tidak boleh bernafas langsung',
    ],
    correctIndex: 0,
    explanation:
      'Syabas! Jeda pendek ( / ) membantu mengambil nafas sejenak dan memisahkan frasa supaya maksud jelas, manakala ( // ) ialah hentian lebih panjang.',
  },
  {
    id: 'irama_4',
    concept: 'Penghayatan & Mimik Muka',
    excerpt: 'itulah permata / budi pekerti //',
    question:
      'Apakah gaya persembahan yang paling sesuai ketika mendeklamasikan sajak di hadapan kelas?',
    options: [
      'Membaca sambil menundukkan kepala memandang lantai tanpa suara yang jelas',
      'Berdiri tegak, suara lantang dan jelas, mimik muka seiring emosi, serta gerak tangan yang sopan',
      'Berlari mengelilingi kelas sambil membaca dengan terlalu pantas',
    ],
    correctIndex: 1,
    explanation:
      'Cemerlang! Deklamasi yang baik menggabungkan sebutan jelas, intonasi, jeda, mimik muka yang sesuai, dan gaya yang sopan.',
  },
];

export const GUNUNG_QUESTIONS: GunungQuestion[] = [
  {
    id: 1,
    topic: 'Definisi Sajak',
    question: 'Apakah definisi sajak yang paling tepat dalam Bahasa Melayu?',
    options: [
      'Puisi Melayu moden yang berbentuk bebas dan tidak terikat dengan peraturan pantun atau syair',
      'Puisi tradisional yang wajib mempunyai rima akhir a-a-a-a sahaja',
      'Teks ucapan rasmi yang dibaca di perhimpunan sekolah',
      'Cerita rakyat yang hanya disampaikan secara lisan tanpa rangkap',
    ],
    correctIndex: 0,
    explanation:
      'Sajak ialah puisi Melayu moden yang bebas bentuknya untuk meluahkan pemikiran dan perasaan.',
  },
  {
    id: 2,
    topic: 'Ciri-Ciri Sajak',
    question: 'Antara berikut, pernyataan manakah yang BENAR tentang ciri-ciri sajak?',
    options: [
      'Setiap baris mesti mengandungi tepat lapan suku kata',
      'Bilangan baris dalam setiap rangkap adalah bebas mengikut kesesuaian penyajak',
      'Dua baris awal setiap rangkap ialah pembayang',
      'Rima akhir sajak mesti seragam dari awal hingga akhir',
    ],
    correctIndex: 1,
    explanation:
      'Sajak tidak terikat pada bilangan baris atau suku kata tertentu; penyajak bebas menentukan bentuk rangkap.',
  },
  {
    id: 3,
    topic: 'Rangkap & Baris',
    question:
      'Jika sesebuah sajak mempunyai tiga kumpulan ayat yang dipisahkan dengan jarak baris, setiap kumpulan itu dipanggil apa?',
    options: ['Baris', 'Rangkap', 'Intonasi', 'Rima'],
    correctIndex: 1,
    explanation:
      'Rangkap ialah kumpulan beberapa baris dalam sajak (sama seperti perenggan dalam prosa), manakala satu deretan kata ialah baris.',
  },
  {
    id: 4,
    topic: 'Tema Sajak',
    question: 'Apakah maksud TEMA dalam kajian sesuatu sajak?',
    options: [
      'Hentian suara ketika membaca baris puisi',
      'Idea atau persoalan pokok yang mendasari keseluruhan sajak',
      'Bilangan patah perkataan dalam baris terakhir',
      'Nama pengarang yang menulis sajak tersebut',
    ],
    correctIndex: 1,
    explanation:
      'Tema ialah gagasan atau idea utama yang menjadi teras keseluruhan sesuatu sajak.',
  },
  {
    id: 5,
    topic: 'Persoalan Sajak',
    question: 'Bagaimanakah persoalan berbeza daripada tema dalam sajak?',
    options: [
      'Persoalan ialah isu atau perkara sampingan yang membantu mengembangkan tema utama',
      'Persoalan hanya terdapat pada tajuk sajak sahaja',
      'Persoalan bermaksud soalan kuiz di hujung buku teks',
      'Tiada perbezaan antara persoalan dan jeda',
    ],
    correctIndex: 0,
    explanation:
      'Sesebuah sajak hanya mempunyai satu tema utama, tetapi boleh mempunyai beberapa persoalan yang menyokong tema itu.',
  },
  {
    id: 6,
    topic: 'Maksud Rangkap',
    question:
      'Dalam sajak "Permata di Taman Ilmu", apakah yang dikiaskan oleh frasa "permata budi pekerti"?',
    options: [
      'Batu permata mahal yang dijumpai di dalam gua',
      'Akhlak mulia seperti rasa syukur serta hormat kepada guru dan ibu bapa yang amat bernilai',
      'Hadiah cincin emas untuk pemenang sukan',
      'Pasir berkilau di tepi sungai',
    ],
    correctIndex: 1,
    explanation:
      'Budi pekerti mulia diibaratkan sebagai permata kerana nilainya yang tinggi dalam membentuk peribadi terpuji.',
  },
  {
    id: 7,
    topic: 'Intonasi',
    question:
      'Apabila mendeklamasikan baris sajak yang menggambarkan semangat cintakan tanah air, intonasi apakah yang sesuai digunakan?',
    options: [
      'Lantang, tegas, dan penuh semangat',
      'Perlahan dan sayu seperti berduka',
      'Mendatar tanpa sebarang perubahan nada',
      'Teragak-agak dan tersekat-sekat',
    ],
    correctIndex: 0,
    explanation:
      'Intonasi perlu selaras dengan emosi sajak—tema semangat memerlukan nada yang lantang dan bertenaga.',
  },
  {
    id: 8,
    topic: 'Tekanan',
    question: 'Mengapakah penekanan suara pada perkataan tertentu penting semasa berdeklamasi?',
    options: [
      'Untuk menonjolkan kata kunci yang membawa maksud dan emosi utama baris tersebut',
      'Supaya pembaca cepat kehabisan nafas',
      'Untuk menukar sajak menjadi sebuah lagu pop',
      'Supaya pendengar tidak dapat memahami cerita sajak',
    ],
    correctIndex: 0,
    explanation:
      'Tekanan membantu menumpukan perhatian pendengar kepada kata-kata penting yang membawa mesej sajak.',
  },
  {
    id: 9,
    topic: 'Jeda',
    question:
      'Perhatikan baris ini: "Dengarlah / irama sungai mengalir,". Apakah tujuan tanda ( / ) selepas kata "Dengarlah"?',
    options: [
      'Menandakan pembaca harus berhenti sebentar untuk memberi kesan seruan yang jelas',
      'Menandakan perkataan itu tidak perlu dibaca',
      'Menandakan sajak sudah tamat',
      'Menandakan pembaca mesti bertepuk tangan',
    ],
    correctIndex: 0,
    explanation:
      'Tanda jeda ( / ) menandakan hentian sejenak bagi menyerlahkan emosi seruan dan kejelasan makna.',
  },
  {
    id: 10,
    topic: 'Penghayatan Sajak',
    question:
      'Pilih amalan yang paling lengkap untuk menghargai dan menghayati seni sajak Bahasa Melayu.',
    options: [
      'Membaca dengan sebutan baku yang jelas, mengawal jeda dan intonasi, serta memahami pengajaran di sebalik kata',
      'Menghafal tajuk sajak tanpa membaca rangkapnya',
      'Membaca secepat mungkin tanpa mempedulikan maksud',
      'Mengubah semua rangkap sajak menjadi senarai nombor',
    ],
    correctIndex: 0,
    explanation:
      'Penghayatan yang menyeluruh melibatkan pemahaman makna, kepekaan terhadap keindahan bahasa, dan penyampaian suara yang berkesan.',
  },
];

export const DENGARKAN_QUESTIONS: DengarkanQuestion[] = [
  {
    id: 1,
    topic: 'Cita-Cita dalam Sajak',
    question:
      'Berdasarkan sajak yang diperdengarkan dalam video, apakah cita-cita mulia yang ingin dicapai oleh penyajak?',
    options: [
      'Menjadi guru yang mencurah ilmu dan mendidik generasi bangsa',
      'Menjadi juruterbang yang menerbangkan kapal ke angkasa',
      'Menjadi pelaut yang belayar mengelilingi lautan',
      'Menjadi pelukis pemandangan di tepi pantai',
    ],
    correctIndex: 0,
    explanation:
      'Tepat! Dalam sajak tersebut disebut: "Menjadi guru mencurah ilmu, mendidik generasi bangsaku."',
  },
  {
    id: 2,
    topic: 'Nilai & Keyakinan Terhadap Ilmu',
    question:
      'Mengapakah penyajak tetap bersemangat juang walaupun berdepan dengan pelbagai cabaran?',
    options: [
      'Kerana penyajak percaya bahawa ilmu merupakan nadi kemajuan negara',
      'Kerana penyajak mahu bercuti panjang selepas peperiksaan',
      'Kerana penyajak tidak suka membaca buku pada waktu petang',
      'Kerana penyajak ingin mencari harta karun di dalam hutan',
    ],
    correctIndex: 0,
    explanation:
      'Betul sekali! Sajak menyatakan: "Walau cabaran datang melanda, semangat juang tidak ku reda. Kerana ku percaya, ilmu nadi kemajuan negara."',
  },
  {
    id: 3,
    topic: 'Maksud Baris Sajak',
    question:
      'Apakah maksud baris awal sajak "Ingin ku terbang setinggi awan, mengejar impian di hadapan"?',
    options: [
      'Mempunyai cita-cita yang tinggi dan tekad untuk mencapai impian masa hadapan',
      'Mahu menaiki kapal terbang untuk bercuti ke luar negara',
      'Gemar memerhati awan yang bergerak pada waktu petang',
      'Ingin melarikan diri daripada tugasan sekolah harian',
    ],
    correctIndex: 0,
    explanation:
      'Syabas! Ungkapan "terbang setinggi awan" ialah kiasan bagi impian yang tinggi serta kesungguhan mengejar masa hadapan.',
  },
  {
    id: 4,
    topic: 'Nilai Murni & Pengajaran',
    question:
      'Antara berikut, nilai murni manakah yang paling jelas terpancar dalam keseluruhan sajak ini?',
    options: [
      'Keazaman yang tinggi, ketabahan menghadapi cabaran, dan semangat berbakti melalui ilmu',
      'Sikap mudah berputus asa apabila kerja sekolah menjadi sukar',
      'Mengutamakan hiburan berbanding usaha menuntut ilmu pengetahuan',
      'Berasa takut untuk mencuba perkara baharu di sekolah',
    ],
    correctIndex: 0,
    explanation:
      'Cemerlang! Penyajak menunjukkan keazaman tinggi untuk menjadi guru, tabah menghadapi cabaran, dan yakin ilmu membangunkan negara.',
  },
  {
    id: 5,
    topic: 'Penghayatan & Cara Deklamasi',
    question:
      'Bagaimanakah penyampaian suara yang dapat kamu dengar ketika sajak ini dideklamasikan dalam video?',
    options: [
      'Sebutan perkataan yang jelas dengan hentian jeda yang teratur di akhir baris serta nada penuh keazaman',
      'Bacaan yang terlalu laju tanpa sebarang hentian atau jeda',
      'Suara berbisik yang tidak dapat didengar maksud katanya',
      'Menyanyi dengan irama rancak sambil ketawa',
    ],
    correctIndex: 0,
    explanation:
      'Tepat! Penyampai mendeklamasikan sajak dengan sebutan yang jelas, berhenti sejenak pada jeda setiap baris, dan menggunakan nada penuh keazaman.',
  },
];

export const BADGES: BadgeDef[] = [
  {
    id: 'badge_kampung',
    title: 'Peneroka Kampung Puisi',
    description: 'Berjaya mengumpulkan kesemua 3 Buku Sajak Bercahaya di Kampung Puisi.',
    color: '#10b981',
    iconName: 'book',
  },
  {
    id: 'badge_hutan',
    title: 'Pemburu Makna',
    description: 'Menyelesaikan 4 Serpihan Puisi di Hutan Makna dengan cemerlang.',
    color: '#059669',
    iconName: 'trees',
  },
  {
    id: 'badge_dengarkan',
    title: 'Pendengar Setia Sajak',
    description: 'Menonton video sajak di Pavilion Ajaib Tasik Irama dan menyempurnakan 5 soalannya.',
    color: '#0d9488',
    iconName: 'headphones',
  },
  {
    id: 'badge_tasik',
    title: 'Ahli Irama Tasik',
    description: 'Menguasai latihan intonasi, tekanan, dan jeda di Tasik Irama.',
    color: '#0284c7',
    iconName: 'waves',
  },
  {
    id: 'badge_gunung',
    title: 'Penawan Gunung Puisi',
    description: 'Menyempurnakan Cabaran Puncak 10 Soalan di Gunung Puisi.',
    color: '#d97706',
    iconName: 'mountain',
  },
  {
    id: 'badge_permata',
    title: 'Pengumpul Permata',
    description: 'Mengumpul sekurang-kurangnya 8 Permata Puisi yang bersinar di dunia 3D.',
    color: '#7c3aed',
    iconName: 'gem',
  },
  {
    id: 'badge_juara',
    title: 'Juara Sajak Tahun 5',
    description: 'Menamatkan pengembaraan di kesemua 4 kawasan Dunia Puisi!',
    color: '#e11d48',
    iconName: 'crown',
  },
];

export const POETRY_GEMS: { id: string; area: AreaId; x: number; z: number }[] = [
  { id: 'gem_1', area: 'kampung', x: -16, z: 16 },
  { id: 'gem_2', area: 'kampung', x: 15, z: 14 },
  { id: 'gem_3', area: 'kampung', x: 24, z: 0 }, // near East bridge
  { id: 'gem_4', area: 'kampung', x: -23, z: 0 }, // near West bridge
  { id: 'gem_5', area: 'hutan', x: 42, z: -8 },
  { id: 'gem_6', area: 'hutan', x: 64, z: -20 },
  { id: 'gem_7', area: 'hutan', x: 80, z: 0 },
  { id: 'gem_8', area: 'hutan', x: 65, z: 22 },
  { id: 'gem_9', area: 'tasik', x: 0, z: -30 }, // North bridge
  { id: 'gem_10', area: 'tasik', x: -18, z: -56 },
  { id: 'gem_11', area: 'tasik', x: 18, z: -56 },
  { id: 'gem_12', area: 'tasik', x: 0, z: -86 },
  { id: 'gem_13', area: 'gunung', x: -42, z: -10 },
  { id: 'gem_14', area: 'gunung', x: -56, z: 12 },
  { id: 'gem_15', area: 'gunung', x: -72, z: -14 },
  { id: 'gem_16', area: 'gunung', x: -72, z: 14 },
];
