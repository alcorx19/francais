import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen, Sparkles, CheckSquare, Volume2, Play, Pause,
  ZoomIn as SearchPlus, ZoomOut as SearchMinus, Trash2, Upload,
  FileText, Type, Globe, Pencil, Eraser, MousePointer,
  ChevronLeft, ChevronRight, Download, Save, VolumeX, Menu, CheckCircle
} from 'lucide-react';

import { ActiveTool, SoundMarker, DrawingStroke, DrawingText, TranslationTooltip } from './types';
import { UNIT_PAGES, PAGE_CORRECTIONS, getPageContent } from './data';
import LoginOverlay from './components/LoginOverlay';
import LoadingScreen from './components/LoadingScreen';
import CorrectionPanel from './components/CorrectionPanel';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import InteractiveTextbookPage from './components/InteractiveTextbookPage';

// Pre-defined built-in audio tracks containing French texts to speech synthesize or loop
const BUILT_IN_TRACKS = [
  { id: 'track_salute', name: 'Dialogue: Les Salutations (Thomas & Jean)', text: "Bonjour! Je m'appelle Jean. J'ai vingt-cinq ans et je suis étudiant de langues à Paris. Enchanté, Thomas!" },
  { id: 'track_ville', name: 'Description: Ma Ville de Strasbourg', text: "J'habite dans une très jolie ville qui s'appelle Strasbourg. C'est une ville historique située à l'est de la France, à côté de l'Allemagne." },
  { id: 'track_famille', name: 'Présentation: Ma Famille Chaleureuse', text: "Ma famille est assez grande et nous sommes très soudés. Mon père s'appelle Pierre, il est docteur. Ma mère s'appelle Marie, elle est enseignante." },
  { id: 'track_restaurant', name: 'Dialogue au Bistrot: Commander un café', text: "Qu'est-ce que vous désirez? Je voudrais un croissant chaud et un café au lait, s'il vous plaît. Et une quiche lorraine." },
  { id: 'track_voyage', name: 'Conseils Voyage: La Côte d\'Azur', text: "Pour beaucoup de voyageurs, un voyage idéal consists to pass time on the beaches..." }
];

const LOCAL_DICTIONARY: Record<string, string> = {
  // Greetings & Basics
  "bonjour": "Merhaba, İyi günler!",
  "salut": "Selam, Merhaba!",
  "merci": "Teşekkür ederim",
  "revoir": "Hoşça kal, güle güle",
  "au revoir": "Güle güle, hoşça kal",
  "bientot": "Yakında, yakında görüşmek üzere",
  "bientôt": "Yakında, yakında görüşmek üzere",
  "enchanté": "Memnun oldum (eril)",
  "enchante": "Memnun oldum",
  "enchantée": "Memnun oldum (dişil)",
  "bienvenue": "Hoş geldiniz",
  "comment": "Nasıl",
  "allez-vous": "Nasılsınız?",
  "ça": "Bu, şu, o",
  "ca": "Bu, şu, o",
  "va": "Gidiyor, iyi gidiyor (gitmek fiili)",
  "s'il vous plaît": "Lütfen (saygılı/çoğul)",
  "s'il te plaît": "Lütfen (samimi)",
  "de rien": "Bir şey değil, rica ederim",

  // Days of the Week
  "lundi": "Pazartesi",
  "mardi": "Salı",
  "mercredi": "Çarşamba",
  "jeudi": "Perşembe",
  "vendredi": "Cuma",
  "samedi": "Cumartesi",
  "dimanche": "Pazar",

  // Months of the Year
  "janvier": "Ocak",
  "février": "Şubat",
  "fevrier": "Şubat",
  "mars": "Mart",
  "avril": "Nisan",
  "mai": "Mayıs",
  "juin": "Haziran",
  "juillet": "Temmuz",
  "août": "Ağustos",
  "aout": "Ağustos",
  "septembre": "Eylül",
  "octobre": "Ekim",
  "novembre": "Kasım",
  "décembre": "Aralık",
  "decembre": "Aralık",

  // Numbers (0 - 100)
  "zero": "Sıfır",
  "zéro": "Sıfır",
  "un": "Bir (eril)",
  "une": "Bir (dişil)",
  "deux": "İki",
  "trois": "Üç",
  "quatre": "Dört",
  "cinq": "Beş",
  "six": "Altı",
  "sept": "Yedi",
  "huit": "Sekiz",
  "neuf": "Dokuz",
  "dix": "On",
  "onze": "On bir",
  "douze": "On iki",
  "treize": "On üç",
  "quatorze": "On dört",
  "quinze": "On beş",
  "seize": "On altı",
  "vingt": "Yirmi",
  "trente": "Otuz",
  "quarante": "Kırk",
  "cinquante": "Elli",
  "soixante": "Altmış",
  "soixante-dix": "Yetmiş",
  "quatre-vingts": "Seksen",
  "quatre-vingt": "Seksen",
  "quatre-vingt-dix": "Doksan",
  "cent": "Yüz",

  // Personal Pronouns & Basic Verbs
  "je": "Ben",
  "j'ai": "Var, sahibim (sahip olmak fiili)",
  "jai": "Var, sahibim (sahip olmak fiili)",
  "tu": "Sen",
  "il": "O (erkek)",
  "elle": "O (kadın)",
  "nous": "Biz, bize, bizi",
  "vous": "Siz, size, sizi",
  "ils": "Onlar (eril/karışık)",
  "elles": "Onlar (dişil)",
  "suis": "yim/yum (olmak yardımcı fiili)",
  "est": "-dir, -dır, dır (olmak fiili) / Doğu",
  "êtes": "siniz/sunuz",
  "sommes": "iz/uz (olmak fiili biz)",
  "sont": "dirler/dırlar (olmak fiili onlar)",
  "as": "sahipsin (sahip olmak fiili sen)",
  "a": "sahip (sahip olmak fiili o) / -e, -a (bulunma)",
  "à": "-de, -da, -e, -a (yönelme/bulunma)",
  "avez": "sahipsiniz",
  "ont": "sahipler",
  "habite": "yaşıyor, ikamet ediyor",
  "j'habite": "yaşıyorum, ikamet ediyorum",
  "jhabite": "yaşıyorum, ikamet ediyorum",
  "habitons": "yaşıyoruz",
  "habitez": "yaşıyorsunuz",
  "habitent": "yaşıyorlar",
  "aime": "seviyor, sever",
  "j'aime": "seviyorum",
  "jaime": "seviyorum",
  "aimons": "seviyoruz",
  "adore": "çok seviyor, bayılıyor",
  "j'adore": "çok seviyorum, bayılıyorum",
  "jadore": "çok seviyorum, bayılıyorum",
  "déteste": "nefret ediyor",
  "deteste": "nefret ediyor",
  "étudie": "öğrenim görüyor, ders çalışıyor",
  "etudie": "öğrenim görüyor",
  "travailler": "çalışmak",
  "travaille": "çalışıyor",
  "travaillons": "çalışıyoruz",
  "travaillez": "çalışıyorsunuz",
  "travaillent": "çalışıyorlar",
  "voyager": "seyahat etmek",
  "apprendre": "öğrenmek",
  "maîtriser": "hakim olmak, ustalaşmak",
  "maitriser": "hakim olmak, ustalaşmak",
  "saluer": "selamlamak",
  "présenter": "sunmak, tanıştırmak, tanıtmak",
  "presenter": "sunmak, tanıştırmak, tanıtmak",
  "écoutez": "dinleyin, dinleyiniz",
  "ecoutez": "dinleyin, dinleyiniz",
  "choisissez": "seçiniz, seçin",
  "compléter": "tamamlamak, bütünlemek",
  "completer": "tamamlamak, bütünlemek",
  "traverser": "karşıya geçmek, enine katetmek",
  "acheter": "satın almak",
  "préparer": "hazırlamak",
  "preparer": "hazırlamak",
  "commander": "sipariş etmek",
  "proposer": "sunmak, teklif etmek",
  "proposons": "sunuyoruz, teklif ediyoruz",
  "flâner": "avare gezmek, dolaşmak",
  "flaner": "avare gezmek, dolaşmak",
  "goûter": "tadına bakmak, tatmak",
  "gouter": "tadına bakmak, tatmak",
  "réserver": "ayırtmak, rezerve etmek",
  "réservez": "ayırtın, rezerve edin",
  "reservez": "ayırtın, rezerve edin",
  "oublier": "unutmak",

  // Family Members (La Famille)
  "famille": "Aile, hane halkı",
  "père": "Baba",
  "pere": "Baba",
  "mère": "Anne",
  "mere": "Anne",
  "parents": "Anne baba, ebeveyn",
  "frère": "Erkek kardeş, ağabey",
  "frere": "Erkek kardeş, ağabey",
  "sœur": "Kız kardeş, abla",
  "soeur": "Kız kardeş, abla",
  "cadet": "Yaşça küçük erkek kardeş, evlat",
  "cadette": "Yaşça küçük kız kardeş, evlat",
  "aîné": "Yaşça en büyük erkek kardeş, evlat",
  "aine": "Yaşça en büyük erkek kardeş, evlat",
  "fils": "Oğul, erkek evlat",
  "fille": "Kız, kız evlat, kız child, kız çocuk",
  "grand-mère": "Büyükanne, nine",
  "grand-mere": "Büyükanne, nine",
  "grand-père": "Büyükbaba, dede",
  "grand-pere": "Büyükbaba, dede",
  "grands-parents": "Büyükanne ve büyükbaba, büyüklere verilen genel ad",
  "petits-enfants": "Torunlar",
  "petite-fille": "Kız torun",
  "petit-fils": "Erkek torun",
  "mari": "Koca, eş",
  "femme": "Kadın, eş",
  "oncle": "Amca, dayı",
  "tante": "Teyze, hala",
  "cousin": "Erkek kuzen",
  "cousine": "Kız kuzen",
  "nièce": "Kız yeğen",
  "niece": "Kız yeğen",
  "neveu": "Erkek yeğen",
  "petit ami": "Erkek arkadaş, sevgili",
  "petite amie": "Kız arkadaş, sevgili",
  "mariage": "Evlilik, düğün",
  "célibataire": "Bekar",
  "celibataire": "Bekar",
  "marié": "Evli (eril)",
  "mariée": "Evli (dişil)",

  // Countries & Nationalities
  "france": "Fransa",
  "français": "Fransız, Fransızca (eril)",
  "francais": "Fransız, Fransızca",
  "française": "Fransız, Fransızca (dişil)",
  "francaise": "Fransız, Fransızca (dişil)",
  "turquie": "Türkiye",
  "turc": "Türk, Türkçe",
  "turque": "Türk, Türkçe (dişil)",
  "allemagne": "Almanya",
  "d'allemagne": "Almanya'dan, Almanya'nın",
  "allemand": "Alman, Almanca (eril)",
  "allemande": "Alman, Almanca (dişil)",
  "espagne": "İspanya",
  "espagnol": "İspanyol, İspanyolca (eril)",
  "espagnole": "İspanyol, İspanyolca (dişil)",
  "italie": "İtalya",
  "italien": "İtalyan, İtalyanca (eril)",
  "italienne": "İtalyan, İtalyanca (dişil)",
  "belgique": "Belçika",
  "belge": "Belçikalı",
  "suisse": "İsviçreli, İsviçre",
  "grèce": "Yunanistan",
  "grec": "Yunan, Yunanca",
  "grecque": "Yunan, Yunanca (dişil)",
  "japon": "Japonya",
  "japonais": "Japon, Japonca (eril)",
  "japonaise": "Japon, Japonca (dişil)",
  "angleterre": "İngiltere",
  "anglais": "İngiliz, İngilizce (eril)",
  "anglaise": "İngiliz, İngilizce (dişil)",
  "sénégal": "Senegal",
  "sénégalais": "Senegalli (eril)",
  "sénégalaise": "Senegalli (dişil)",
  "maroc": "Fas",
  "marocain": "Faslı (eril)",
  "marocaine": "Faslı (dişil)",
  "vietnam": "Vietnam",
  "inde": "Hindistan",
  "l'inde": "Hindistan",
  "états-unis": "Amerika Birleşik Devletleri",
  "etats-unis": "Amerika Birleşik Devletleri",
  "canadien": "Kanadalı (eril)",
  "canadienne": "Kanadalı (dişil)",

  // Professions (Les Professions)
  "profession": "Meslek, iş",
  "docteur": "Doktor, hekim",
  "médecin": "Doktor, tıp doktoru",
  "medecin": "Doktor, tıp doktoru",
  "professeur": "Öğretmen, profesör",
  "professeure": "Bayan öğretmen",
  "enseignant": "Öğretmen, eğitmen (eril)",
  "enseignante": "Bayan öğretmen",
  "étudiant": "Öğrenci (eril)",
  "etudiant": "Öğrenci",
  "étudiante": "Öğrenci (dişil)",
  "etudiante": "Öğrenci (dişil)",
  "coiffeur": "Kuaför, berber (eril)",
  "coiffeuse": "Bayan kuaför",
  "infirmier": "Erkek hemşire",
  "infirmière": "Hemşire (dişil)",
  "infirmiere": "Hemşire (dişil)",
  "acteur": "Aktör, erkek oyuncu",
  "actrice": "Aktris, kadın oyuncu",
  "fleuriste": "Çiçekçi",
  "informaticien": "Bilişimci, bilgisayar mühendisi (eril)",
  "informaticienne": "Bilişimci, bilgisayar mühendisi (dişil)",

  // Food, Drinks & Restaurant (La Nourriture et le Restaurant)
  "nourriture": "Yiyecek, besin, gıda",
  "bistrot": "Küçük Fransız restoranı, bistro",
  "bistro": "Bistro, küçük samimi restoran",
  "restaurant": "Restoran, lokanta",
  "bœuf": "Sığır/dana eti",
  "boeuf": "Sığır/dana eti",
  "bourguignon": "Bourgogne usulü şaraplı dana yahnisi",
  "soup": "Çorba",
  "soupe": "Çorba",
  "oignon": "Soğan",
  "al'oignon": "Soğanlı",
  "quiche": "Kiş, tuzlu tart",
  "lorraine": "Lorraine bölgesi usulü",
  "pain": "Ekmek",
  "croustillant": "Çıtır çıtır, gevrek",
  "plat": "Yemek, ana yemek, tabak",
  "plats": "Yemekler, tabaklar",
  "principal": "Ana, temel",
  "croissants": "Kruvasanlar",
  "croissant": "Kruvasan",
  "boulangerie": "Ekmek fırını, unlu mamuller dükkanı",
  "manger": "Yemek yemek",
  "eau": "Su",
  "café": "Kahve, kafe",
  "cafe": "Kahve, kafe",
  "thé": "Çay",
  "the": "Çay",
  "vin": "Şarap",
  "rouge": "Kırmızı",
  "carotte": "Havuç",
  "carottes": "Havuçlar",
  "pommes": "Elmalar",
  "pomme": "Elma",
  "tarte": "Tart, turta",
  "dîners": "Akşam yemekleri",
  "dîner": "Akşam yemeği",
  "déjeuner": "Öğle yemeği",
  "petit-déjeuner": "Kahvaltı",
  "repas": "Yemek, öğün",
  "fruits": "Meyveler",
  "légumes": "Sebzeler",
  "legumes": "Sebzeler",
  "fraîches": "Taze (çoğul, dişil)",
  "fraîche": "Taze (dişil)",
  "frais": "Taze, serin",
  "délicieuse": "Lezzetli (dişil)",
  "délicieux": "Lezzetli (eril)",

  // Traveling & Holidays (Les Voyages et Vacances)
  "voyage": "Seyahat",
  "voyages": "Seyahatler",
  "vacances": "Tatil, izin dönemi",
  "randonnée": "Doğa yürüyüşü, binek yürüyüşü",
  "randonnee": "Doğa yürüyüşü",
  "plage": "Plaj, kumsal",
  "plages": "Plajlar",
  "la mer": "Deniz",
  "mer": "Deniz",
  "hôtel": "Otel",
  "hotel": "Otel",
  "train": "Tren",
  "avion": "Uçak",
  "passeport": "Pasaport",
  "valise": "Valiz, bavul, çanta",
  "billet": "Bilet",
  "billets": "Biletler",
  "soleil": "Güneş",
  "ensoleillé": "Güneşli (eril)",
  "ensoleillée": "Güneşli (dişil)",
  "ensoleillees": "Güneşli (çoğul, dişil)",
  "ensoleillées": "Güneşli (çoğul, dişil)",
  "promenade": "Yürüyüş, kordon boyu gezinti",
  "célèbre": "Ünlü, meşhur",
  "celebre": "Ünlü, meşhur",
  "musée": "Müze",
  "musées": "Müzeler",
  "musees": "Müzeler",
  "carte": "Harita, menü, kart",
  "bagage": "Bagaj, yük",
  "ticket": "Bilet, bilet koçanı",

  // City & Places (La Ville et Lieux)
  "ville": "Şehir, kent",
  "natale": "Doğulan şehir/ülke, ana vatanı",
  "jolie": "Güzel, şirin (dişil)",
  "joli": "Güzel, şirin (eril)",
  "grand": "Büyük (eril)",
  "grande": "Büyük (dişil)",
  "calme": "Sakin, sessiz, huzurlu",
  "bibliothèque": "Kütüphane",
  "bibliotheque": "Kütüphane",
  "cathédrale": "Katedral, büyük kilise",
  "cathedrale": "Katedral",
  "gothique": "Gotik (sanat tarzı)",
  "médiévale": "Ortaçağ, ortaçağa ait (dişil)",
  "medievale": "Ortaçağ, ortaçağa ait",
  "médiéval": "Ortaçağ, ortaçağa ait (eril)",
  "centre": "Merkez, orta nokta",
  "quartier": "Mahalle, semt, bölge",
  "pont": "Köprü",
  "rue": "Sokak, cadde",
  "maison": "Ev, konut",
  "appartement": "Apartman dairesi, daire",
  "bâtiment": "Bina, inşaat",
  "frontière": "Sınır",
  "frontiere": "Sınır",
  "l'est": "Doğu, doğu yönü",
  "ouest": "Batı",
  "l'ouest": "Batı, batı yönü",
  "nord": "Kuzey",
  "sud": "Güney",

  // Miscellaneous Words from Textbook
  "ans": "Yaş, yıl (ömür)",
  "et": "Ve",
  "de": "-in, -ın, -den, -dan, dair",
  "langues": "Diller, lisanlar",
  "mélodieuse": "Melodili, ahenkli, hoş tınılı",
  "melodieuse": "Melodili, ahenkli, hoş tınılı",
  "pour": "İçin, amacıyla",
  "commencer": "Başlamak",
  "nos": "Bizim (çoğul isimlerle)",
  "amis": "Arkadaşlar, dostlar",
  "collèges": "Meslektaşlar, iş arkadaşları",
  "collegues": "Meslektaşlar, iş arkadaşları",
  "l'enregistrement": "Kayıt, ses kaydı",
  "lenregistrement": "Kayıt, ses kaydı",
  "audio": "Ses, işitsel, audio",
  "placé": "Yerleştirilmiş, konulmuş",
  "place": "Yer, alan / yerleştirilmiş",
  "par": "Tarafından, vasıtasıyla",
  "votre": "Sizin (tekil veya saygı ifadesi)",
  "prononciation": "Telaffuz, söyleniş",
  "exacte": "Kesin, tam, doğru",
  "du": "-in, -ın, -den (eril)",
  "mot": "Kelime, sözcük",
  "phrase": "Cümle, ibare",
  "pronom": "Zamir, adıl",
  "sujet": "Özne, konu, tema",
  "correct": "Doğru, düzgün",
  "salutation": "Selamlama",
  "salutations": "Selamlama, selamlaşmalar",
  "appelez-vous": "Adlandırıyorsunuz kendinizi",
  "ravi": "Çok sevinmiş, memnun olmuş",
  "voir": "Görmek, ziyaret etmek",
  "les": "-ler, -lar (çoğul belirli ön ek)",
  "le": "Belirli ön ek (eril isimler için)",
  "la": "Belirli ön ek (dişil isimler için)",
  "l'": "Belirli ön ek (sesli/sessiz h ile başlayan isimler)",
  "unite": "Ünite, bölüm, birim",
  "unité": "Ünite, bölüm, birim",
  "leçon": "Ders, eğitim aşaması",
  "lecon": "Ders, eğitim aşaması",
  "exercices": "Egzersizler, alıştırmalar",
  "exercice": "Egzersiz, alıştırma",
  "luxe": "Lüks, şatafat",
  "ordre": "Düzen, nizam",
  "beauté": "Güzellik",
  "beaute": "Güzellik",
  "douceur": "Yumuşaklık, tatlılık, hoşluk",
  "loisir": "Boş zaman, eğlence, keyif",
  "loisirs": "Hobiler, boş zaman aktiviteleri",
  "larousse": "Larousse (ünlü Fransız sözlüğü)",
  "notre": "Bizim",
  "clé": "Anahtar, ipucu",
  "cle": "Anahtar, ipucu",
  "volupté": "Seyirlik haz, derin zevk",
  "volupte": "Seyirlik haz, derin zevk"
};

const LOCAL_FRENCH_DICTIONARY: Record<string, string> = {
  // Greetings & Basics
  "bonjour": "Formule de salutation familière ou polie employée durant la journée pour entamer un échange.",
  "salut": "Salutation amicale employée de manière informelle pour dire bonjour ou au revoir.",
  "bienvenue": "Formule d’accueil polie adressée chaleureusement à quelqu’un de nouvellement arrivé.",
  "salutations": "Action de saluer chaleureusement, marques et formules classiques d’estime ou de civilité.",
  "salutation": "Action d'exprimer des égards ou de saluer respectueusement quelqu’un.",
  "formelles": "Qui respecte formellement les coutumes établies et les processus d'usage officiel.",
  "formel": "Qui respecte les règles établies, les coutumes ou les formes requises officiellement.",
  "informelles": "Qui se passe sans cérémonie formelle, de manière relaxée et informelle.",
  "informel": "Qui s'accomplit en dehors des règles strictes de l'étiquette formelle ou officielle.",
  "etudiant": "Personne inscrite dans un cursus d'études supérieures au sein d'une faculté ou université.",
  "étudiant": "Personne inscrite dans un cursus d'études supérieures au sein d'une faculté ou université.",
  "etudiante": "Jeune femme ou fille engagée dans la poursuite d'études académiques supérieures.",
  "étudiante": "Jeune femme ou fille engagée dans la poursuite d'études académiques supérieures.",
  "apprendre": "Assimiler de nouvelles connaissances théoriques ou acquérir un savoir-faire technique.",
  "maitriser": "Posséder parfaitement les principes et les compétences de mise en œuvre d'une science ou langue.",
  "maîtriser": "Posséder parfaitement les principes et les compétences de mise en œuvre d'une science ou langue.",
  "prononciation": "Action mécanique de former et d'émettre correctement les sons syntaxiques d'une langue.",
  "enchante": "Formule polie exprimant la joie ressentie à l'instant de rencontrer une personne.",
  "enchanté": "Formule polie exprimant la joie ressentie à l'instant de rencontrer une personne.",
  "comment": "Exprime l'interrogation portant sur le moyen employé, la cause ou l'état général.",
  "allez-vous": "Interrogation polie adressée à un interlocuteur pour s'enquérir de son état d'être ou de sa santé.",
  "melodieuse": "Doté d'une musicalité délicate et d'un enchaînement de modulations agréables.",
  "mélodieuse": "Doté d'une musicalité délicate et d'un enchaînement de modulations agréables.",
  "langue": "Système structuré de codes acoustiques et sémiotiques propre à un groupe culturel humain.",
  "belle": "Qui plaît admirablement aux facultés esthétiques des sens ou à la finesse intellectuelle.",
  "voyager": "Effectuer des déplacements programmés ou touristiques dans des contrées nouvelles.",
  "saison": "Division trimestrielle de l’année civile liée aux variations physiques du climat planétaire.",
  "ete": "Saison de l’année comprise entre le printemps et l’automne, caractérisée par la chaleur.",
  "été": "Saison de l’année comprise entre le printemps et l’automne, caractérisée par la chaleur.",
  "enregistrement": "Écriture codée de vibrations sonores sur un support technologique réutilisable.",
  "audio": "Qui concerne la transmission ou la reproduction du son audible par l'oreille humaine.",
  "enseignant": "Pédagogue professionnel transmettant des savoirs programmés au bénéfice d'élèves.",
  "exacte": "Strictement conforme à la vérité des faits, exempte de distorsions objectives.",
  "phrase": "Suite syntaxique ordonnée de termes porteurs d'un sens intellectuel structuré et achevé.",
  "classe": "Unité administrative d'enseignement réunissant des élèves de même degré scolaire.",
  "grammaire": "Ensemble formalisé des structures régulant l'orthographe et la syntaxe d'une langue.",
  "adjectif": "Élément du discours complétant un substantif pour en préciser les qualités descriptives.",
  "nationalite": "Rattachement géopolitique reliant juridiquement un ressortissant à un État souverain.",
  "nationalité": "Rattachement géopolitique reliant juridiquement un ressortissant à un État souverain.",
  "lecon": "Unité didactique dispensée par un enseignant pour l’assimilation d'une matière par les élèves.",
  "leçon": "Unité didactique dispensée par un enseignant pour l’assimilation d'une matière par les élèves.",
  "famille": "Structure sociale de base regroupant des personnes unies par des liens d'alliance ou de sang.",
  "profession": "Métier social habituel pratiqué en échange d'une rémunération financière d'activité.",
  "quartier": "Zone urbaine ou de vie délimitée d'un centre urbain ou d'une municipalité.",
  "calme": "Tranquillité, sensation de détente, ou absence notable de bruit ou d'agitation perturbatrice.",
  "loisirs": "Occupations agréables et personnelles pratiquées de manière détendue hors du travail.",
  "cinema": "Art industriel de mise en images narratives animées projetées sur écrans publics.",
  "cinéma": "Art industriel de mise en images narratives animées projetées sur écrans publics.",
  "musique": "Organisation rythmique et harmonique de spectres acoustiques plaisants pour la perception.",
  "sport": "Exercice physique de motricité réglementée s'exécutant à titre personnel ou collectif.",
  "universite": "Institution habilitée d'enseignement de haut niveau de savoirs et de recherche.",
  "université": "Institution habilitée d'enseignement de haut niveau de savoirs et de recherche.",
  "alphabet": "Tableau ordonné des caractères de base servant à transcrire graphiquement une langue.",
  "presenter": "Faire connaître formellement quelqu'un ou Énoncer ses propres traits identitaires.",
  "présenter": "Faire connaître formellement quelqu'un ou Énoncer ses propres traits identitaires.",
  "adore": "Éprouver pour quelqu'un ou un objet de passion un sentiment d’amour extrême.",
  "adorer": "Éprouver pour quelqu'un ou un objet de passion un sentiment d’amour extrême.",
  "appelle": "Désigner ou nommer d'une façon sémantique propre.",
  "revoir": "Rencontre ultérieure après séparation (notamment « au revoir » pour marquer un départ pacifique).",
  "bientot": "Se produisant après un espace de temps restreint ou condensé.",
  "bientôt": "Se produisant après un espace de temps restreint ou condensé.",
  "merci": "Interjection usuelle exprimant formellement l’appréciation reconnaissante du locuteur.",
  "nous": "Sujet ou objet de première personne collective englobant la personne qui énonce.",
  "vous": "Sujet ou objet poli de seconde personne s'adresse à des pairs ou une autorité.",
  "mappelle": "S'appeler d'une certaine manière ou se prénommer dans l'affirmation identitaire.",
  "m'appelle": "S'appeler d'une certaine manière ou se prénommer dans l'affirmation identitaire.",
  "j'ai": "Posséder ou détenir une qualité, un âge ou une caractéristique matérielle.",
  "j'adore": "Énoncé démontrant un amour incommensurable ou une passion pour une occupation.",
  "l'enregistrement": "Action de capter ou de graver de manière audiovisuelle un document.",
  "d'été": "Qui est en relation directe ou temporelle avec la plus chaude saison estivale.",
  "un": "Nombre exprimant l’individualité numérique, ou article indéfini au genre masculin.",
  "une": "Article indéfini singulier placé conventionnellement devant des substantifs féminins.",
  "des": "Article indéfini traduisant la pluralité numérique non spécifiée d'objects.",
  "d'allemagne": "Indique une provenance physique, une relation à la nation de culture germanique.",
  "allemagne": "Grand pays fédéré d'Europe centrale réputé pour sa puissance technologique.",
  "frontiere": "Ligne de séparation formelle et surveillée isolant juridiquement deux États nations.",
  "frontière": "Ligne de séparation formelle et surveillée isolant juridiquement deux États nations.",
  "c'est": "Verbe d'affirmation servant de présentateur démonstratif (« cela est »).",
  "située": "Localisé dans l'espace physique, géocentré par rapport à un ensemble régional.",
  "dans": "Exprime l'inclusion physique d'un sujet ou corps au sein d'une enceinte délimitée.",
  "j'habite": "Définit le domicile personnel, l'endroit d'établissement résidentiel constant du locuteur.",
  "paris": "Capitale et pôle démographique de la France, centre de renommée mondiale pour l'art.",
  "strasbourg": "Métropole alsacienne de l'est de la France, siégeant diverses administrations européennes.",
  "bibliothèque": "Établissement rassemblant des ouvrages de lecture mis à disposition des usagers.",
  "magnifique": "Doté de qualités supérieures suscitant un ravissement ou une admiration rare.",
  "cathédrale": "Édifice chrétien central abritant la chaire de direction spirituelle locale.",
  "gothique": "Mouvement artistique d'époque médiévale réputé pour la hauteur de ses voûtes en croisée.",
  "médiévale": "Caractéristique directe ou historique relative à l'époque florissante du Moyen Âge.",

  // Days & Months
  "lundi": "Premier jour de la semaine civile, succédant au dimanche.",
  "mardi": "Deuxième jour de la semaine civile, situé entre le lundi et le mercredi.",
  "mercredi": "Troisième jour de la semaine de travail, marquant le milieu de la semaine civile.",
  "jeudi": "Quatrième jour ouvrable de la semaine, précédant le vendredi.",
  "vendredi": "Cinquième jour de la semaine civile, souvent le dernier jour ouvrable standard.",
  "samedi": "Sixième jour de la semaine civile, premier jour de l'habituel week-end.",
  "dimanche": "Septième jour de la semaine, jour traditionnellement consacré au repos ou au culte.",
  "janvier": "Premier mois de l'année civile dans le calendrier grégorien.",
  "février": "Deuxième mois de l'année civile, le plus court avec 28 ou 29 jours.",
  "fevrier": "Deuxième mois de l'année civile, le plus court avec 28 ou 29 jours.",
  "mars": "Troisième mois de l'année civile, marquant traditionnellement l'arrivée du printemps.",
  "avril": "Quatrième mois de l'année civile grégorienne.",
  "mai": "Cinquième mois de l’année civile, célèbre pour ses beaux jours printaniers.",
  "juin": "Sixième mois de l'année civile, marquant le début de la saison d'été.",
  "juillet": "Septième mois de l'année civile, période de vacances estivales très populaire.",
  "août": "Huitième mois de l'année civile, caractérisé par des températures élevées en été.",
  "aout": "Huitième mois de l'année civile, caractérisé par des températures élevées en été.",
  "septembre": "Neuvième mois de l'année, marquant la rentrée scolaire et le début de l'automne.",
  "octobre": "Dixième mois de l'année civile dans le calendrier moderne.",
  "novembre": "Onzième mois de l'année civile, approchant de la fin de l'année.",
  "décembre": "Douzième et dernier mois de l'année, période des fêtes et de l'hiver.",
  "decembre": "Douzième et dernier mois de l'année, période des fêtes et de l'hiver.",

  // Numbers Definition
  "zéro": "Chiffre ou valeur représentant l'absence de quantité, l'élément nul.",
  "deux": "Nombre entier suivant immédiatement le chiffre un.",
  "trois": "Nombre désignant la somme de deux plus un.",
  "quatre": "Chiffre représentant la quantité de deux fois deux.",
  "cinq": "Chiffre se trouvant à mi-chemin de dix, succédant à quatre.",
  "six": "Nombre entier équivalant à la moitié de douze.",
  "sept": "Le nombre qui suit six et précède huit.",
  "huit": "Nombre symbolisant deux fois quatre.",
  "neuf": "Chiffre représentant un de moins que dix.",
  "dix": "La base du système de calcul arithmétique décimal.",
  "vingt": "Quantité correspondant à deux dizaines complètes.",
  "trente": "Nombre entier équivalent à trois dizaines.",
  "quarante": "Nombre égal à quatre fois dix.",
  "cinquante": "La moitié exacte du nombre cent.",
  "soixante": "Nombre entier égal à six dizaines.",
  "cent": "Valeur représentant dix dizaines, la base de pourcentage.",

  // Relations & Family
  "parents": "Père et mère d'une personne, responsables légaux d'une fratrie.",
  "mari": "Homme uni légalement à sa conjointe par les liens sacrés du mariage.",
  "femme": "Personne de sexe féminin ou épouse unie à un conjoint.",
  "oncle": "Frère du père ou de la mère, oncle familial.",
  "tante": "Sœur du père ou de la mère, tante de famille.",
  "cousin": "Enfant né de l'oncle ou de la tante biologique d'une personne.",
  "cousine": "Fille née de l'oncle ou de la tante biologique d'une personne.",
  "mariage": "Union légitime et officielle de deux époux célébrée publiquement.",
  "célibataire": "Adulte vivant seul, n'étant pas engagé dans les liens du mariage.",
  "celibataire": "Adulte vivant seul, n'étant pas engagé dans les liens du mariage.",
  "marié": "Homme ayant officiellement épousé sa partenaire de vie.",
  "mariée": "Femme ayant officiellement épousé son partenaire de vie.",

  // Professions
  "médecin": "Professionnel de santé titulaire d'un doctorat, soignant les malades.",
  "medecin": "Professionnel de santé habilité à diagnostiquer et soigner les pathologies.",
  "professeur": "Enseignant dispensant des connaissances académiques instruisant des élèves.",
  "coiffeur": "Professionnel de la mode ajustant, coupant ou coiffant la chevelure.",
  "coiffeuse": "Artiste visuelle et technique de la coiffure pour dames.",
  "infirmier": "Personnel spécialisé prodiguant des soins prescrits par les médecins.",
  "infirmière": "Professionnelle du corps médical dédiée à l'accompagnement des patients.",
  "infirmiere": "Professionnelle du corps médical dédiée à l'accompagnement des patients.",
  "acteur": "Artiste interprétant un rôle dramatique sur scène ou face à une caméra.",
  "actrice": "Femme exerçant le métier de comédienne dans une œuvre théâtrale.",
  "fleuriste": "Artisan commercial assemblant et vendant des bouquets floraux.",

  // Food & Travel
  "restaurant": "Établissement commercial proposant des repas cuisinés payants aux clients.",
  "bœuf": "Viande de bétail bovine hautement appréciée en gastronomie française.",
  "boeuf": "Viande bovine cuisinée de diverses manières traditionnelles.",
  "bourguignon": "Spécialité culinaire mijotée à base de viande bovine et de vin de Bourgogne.",
  "quiche": "Tarte salée garnie d'un appareil à crème et d'ingrédients variés.",
  "pain": "Aliment de base fabriqué par cuisson d'une pâte de farine fermentée.",
  "manger": "Ingérer des substances solides pour s'alimenter et se nourrir.",
  "eau": "Liquide transparent, inodore et essentiel à toute forme de vie terrestre.",
  "café": "Boisson chaude stimulante préparée à partir de graines du caféier torréfiées.",
  "thé": "Infusion aromatique préparée à l'aide de feuilles séchées du théier.",
  "the": "Infusion préparée avec de l’eau bouillante et des feuilles séchées.",
  "randonnée": "Longue promenade de marche pédestre effectuée dans la nature ou en montagne.",
  "randonnee": "Longue promenade de marche sportive dans de grands espaces naturels.",
  "hôtel": "Établissement offrant un hébergement temporaire payant à des voyageurs.",
  "hotel": "Établissement d'accueil résidentiel pour courts séjours de voyageurs.",
  "avion": "Appareil de transport aérien motorisé doté d'ailes rigides porteuses.",
  "bagage": "Ensemble d'effets personnels emballés dans des malles pour un déplacement."
};

function getLocalFrenchDefinition(word: string): string | null {
  const rawClean = word.toLowerCase().trim().replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "");
  if (!rawClean) return null;

  // 1. Try exact match first (e.g., l'enregistrement, d'été)
  if (LOCAL_FRENCH_DICTIONARY[rawClean]) return LOCAL_FRENCH_DICTIONARY[rawClean];

  // 2. Try normalized exact match (strip accents)
  const normalizedRaw = rawClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (LOCAL_FRENCH_DICTIONARY[normalizedRaw]) return LOCAL_FRENCH_DICTIONARY[normalizedRaw];

  // 3. Try splitting elisions (e.g. l'enregistrement -> enregistrement)
  let clean = rawClean;
  const elisionMatch = clean.match(/^[ldmstncj]['’](.+)$/) || clean.match(/^qu['’](.+)$/);
  if (elisionMatch && elisionMatch[1]) {
    clean = elisionMatch[1].replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "").trim();
    if (LOCAL_FRENCH_DICTIONARY[clean]) return LOCAL_FRENCH_DICTIONARY[clean];
    const normalizedClean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (LOCAL_FRENCH_DICTIONARY[normalizedClean]) return LOCAL_FRENCH_DICTIONARY[normalizedClean];
  }

  // 4. Plurar singular handling
  if (clean.endsWith("s") && clean.length > 2) {
    const singular = clean.slice(0, -1);
    if (LOCAL_FRENCH_DICTIONARY[singular]) return LOCAL_FRENCH_DICTIONARY[singular];
    const normalizedSingular = singular.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (LOCAL_FRENCH_DICTIONARY[normalizedSingular]) return LOCAL_FRENCH_DICTIONARY[normalizedSingular];
  }
  return null;
}

function getLocalTranslation(word: string): string | null {
  const clean = word.toLowerCase().trim().replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "");
  if (!clean) return null;

  if (LOCAL_DICTIONARY[clean]) return LOCAL_DICTIONARY[clean];
  
  const normalized = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents
  if (LOCAL_DICTIONARY[normalized]) return LOCAL_DICTIONARY[normalized];

  // Try splitting elisions (e.g. l'enregistrement -> enregistrement / kayıt)
  const elisionMatch = clean.match(/^[ldmstncj]['’](.+)$/) || clean.match(/^qu['’](.+)$/);
  if (elisionMatch && elisionMatch[1]) {
    const coreWord = elisionMatch[1].replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ]+$/g, "").trim();
    if (LOCAL_DICTIONARY[coreWord]) return LOCAL_DICTIONARY[coreWord];
    const normalizedCore = coreWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (LOCAL_DICTIONARY[normalizedCore]) return LOCAL_DICTIONARY[normalizedCore];
  }

  return null;
}

export default function App() {
  // System State
  const [userId, setUserId] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);

  // Document State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null); // Real PDF.js document if loaded
  const [currentPageNum, setCurrentPageNum] = useState<number>(12); // Default is page 12 (Unité 1)
  const [totalPageCount, setTotalPageCount] = useState<number>(65);

  // View state
  const [scale, setScale] = useState<number>(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [exeModalOpen, setExeModalOpen] = useState(false);

  // Drawing Tools State
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [activeColor, setActiveColor] = useState<string>('#3b82f6'); // blue
  const [activeWidth, setActiveWidth] = useState<number>(4);

  // Persistent user layers loaded from LocalStorage
  const [soundMarkers, setSoundMarkers] = useState<SoundMarker[]>([]);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [drawingTexts, setDrawingTexts] = useState<DrawingText[]>([]);

  // Selected track for Placing Sound trigger mode
  const [uploadedAudios, setUploadedAudios] = useState<{ id: string; name: string; url: string; size?: number }[]>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<{ id: string; name: string; text?: string; url?: string }>(BUILT_IN_TRACKS[0]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Translation Tooltip Overlay state
  const [translation, setTranslation] = useState<TranslationTooltip | null>(null);
  const [showTurkish, setShowTurkish] = useState<boolean>(false);

  // Global Audio Engine State
  const [playingMarker, setPlayingMarker] = useState<SoundMarker | null>(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(10); // standard fallback
  const [audioVolume, setAudioVolume] = useState<number>(0.8);

  const [maxPageVisited, setMaxPageVisited] = useState<number>(() => {
    const saved = localStorage.getItem('max_page_visited');
    return saved ? parseInt(saved, 10) : 12;
  });

  const [savedVocabulary, setSavedVocabulary] = useState<{ id: string; word: string; translation: string; frenchDefinition?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('savedVocabulary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [myWordsOpen, setMyWordsOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dark_mode_active') === 'true';
  });

  // Track maxPageVisited dynamically when page changes
  useEffect(() => {
    const saved = localStorage.getItem('max_page_visited');
    const curVal = saved ? parseInt(saved, 10) : 12;
    if (currentPageNum > curVal) {
      localStorage.setItem('max_page_visited', currentPageNum.toString());
      setMaxPageVisited(currentPageNum);
    } else if (currentPageNum > maxPageVisited) {
      localStorage.setItem('max_page_visited', currentPageNum.toString());
      setMaxPageVisited(currentPageNum);
    }
  }, [currentPageNum]);

  // Sync savedVocabulary to localStorage under 'savedVocabulary'
  useEffect(() => {
    localStorage.setItem('savedVocabulary', JSON.stringify(savedVocabulary));
  }, [savedVocabulary]);

  // Handle document class toggling for dark mode
  useEffect(() => {
    localStorage.setItem('dark_mode_active', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const audioTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Synthesizer Backup Voice for playing active sound markers
  const synthSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 1. Load data on init
  useEffect(() => {
    const savedId = localStorage.getItem('lesson_user_id');
    if (savedId) {
      setUserId(savedId);
      triggerAppInit();
    }
  }, []);

  // Sync current user states based on localStorage
  useEffect(() => {
    if (!userId) return;
    const key = `user_data_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const decoded = JSON.parse(saved);
        if (decoded.soundMarkers) setSoundMarkers(decoded.soundMarkers);
        if (decoded.drawingStrokes) setDrawingStrokes(decoded.drawingStrokes);
        if (decoded.drawingTexts) setDrawingTexts(decoded.drawingTexts);
      } catch (err) {
        console.error("Failed to decode user saved dataset:", err);
      }
    }
  }, [userId]);

  // Persist State Helper
  const saveUserData = (newMarkers = soundMarkers, newStrokes = drawingStrokes, newTexts = drawingTexts) => {
    if (!userId) return;
    const key = `user_data_${userId}`;
    const payload = {
      soundMarkers: newMarkers,
      drawingStrokes: newStrokes,
      drawingTexts: newTexts
    };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  // Close translation tooltip when user clicks anywhere outside, scrolls, or resizes
  useEffect(() => {
    const dismissTooltip = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.closest('.translate-word') ||
        target?.closest('#translation-tooltip-bubble')
      ) {
        return;
      }
      setTranslation(null);
    };

    const handleScrollOrResize = () => {
      setTranslation(null);
    };

    window.addEventListener('mousedown', dismissTooltip);
    window.addEventListener('scroll', handleScrollOrResize, true); // capture scrolls inside containers
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('mousedown', dismissTooltip);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  // Sound Engine loops using Web Speech Synthesis or real Audio file playback!
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    setPlayingMarker(null);
    setAudioIsPlaying(false);
    setAudioCurrentTime(0);
  };

  const playSoundMarker = (marker: SoundMarker) => {
    stopAudio();

    setPlayingMarker(marker);
    setAudioIsPlaying(true);
    setAudioCurrentTime(0);

    // Is it a custom uploaded audio file (blob / dataurl)?
    const isRealFile = marker.audioSrc && (marker.audioSrc.startsWith('blob:') || marker.audioSrc.startsWith('data:') || marker.audioSrc.startsWith('http'));
    
    if (isRealFile) {
      const audio = new Audio(marker.audioSrc);
      currentAudioRef.current = audio;
      audio.volume = audioVolume;
      
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 10);
      };

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        stopAudio();
      };

      audio.onerror = () => {
        console.error("Custom audio layout playback failed:", marker.audioSrc);
        fallbackToSpeechSynthesis();
      };

      audio.play().catch(err => {
        console.error("Custom audio play error:", err);
        fallbackToSpeechSynthesis();
      });
      return;
    }

    fallbackToSpeechSynthesis();

    function fallbackToSpeechSynthesis() {
      // Determine pronouncing text based on page content to give realistic French feedback!
      const matchedBuiltIn = BUILT_IN_TRACKS.find(t => t.id === marker.audioSrc);
      const textToSpeak = matchedBuiltIn?.text || getPageContent(marker.pageNumber).texts[0] || "Bonjour! Bienvenue à l'apprentissage du français.";

      // Track speech duration roughly
      const wordsCount = textToSpeak.split(" ").length;
      const approximateDuration = Math.max(5, wordsCount * 0.45); // seconds
      setAudioDuration(approximateDuration);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fr-FR';
        utterance.volume = audioVolume;
        utterance.rate = 0.85; // slightly slower for language learners!

        utterance.onend = () => {
          stopAudio();
        };

        utterance.onerror = () => {
          stopAudio();
        };

        synthSpeechRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        // Start tick timer for visual bottom player
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 0.5;
          setAudioCurrentTime(prev => {
            if (prev >= approximateDuration) {
              clearInterval(interval);
              return approximateDuration;
            }
            return elapsed;
          });
        }, 500);
        
        audioTimerRef.current = interval as unknown as number;
      } else {
        // Speech Synth fallback mock countdown
        let current = 0;
        const timer = setInterval(() => {
          current += 1;
          setAudioCurrentTime(current);
          if (current >= 10) {
            clearInterval(timer);
            stopAudio();
          }
        }, 1000);
        audioTimerRef.current = timer as unknown as number;
      }
    }
  };

  const handleSeek = (percent: number) => {
    const targetTime = percent * audioDuration;
    setAudioCurrentTime(targetTime);
    
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = targetTime;
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setAudioIsPlaying(false);
      }
    }
  };

  const handleAudioPlayPause = () => {
    if (audioIsPlaying) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      } else if (window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      setAudioIsPlaying(false);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.play().catch(() => {});
      } else if (window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
      setAudioIsPlaying(true);
    }
  };

  // Login handler
  const handleLoginSuccess = (validId: string) => {
    setUserId(validId);
    localStorage.setItem('lesson_user_id', validId);
    triggerAppInit();
  };

  const triggerAppInit = () => {
    setLoadingBook(true);
    setAppReady(true);
    // Simulate initial workbook pages indexing setup
    setTimeout(() => {
      setLoadingBook(false);
    }, 1500);
  };

  const handleLogOut = () => {
    stopAudio();
    localStorage.removeItem('lesson_user_id');
    setUserId(null);
    setAppReady(false);
    setPdfFile(null);
    setPdfDocument(null);
    setSoundMarkers([]);
    setDrawingStrokes([]);
    setDrawingTexts([]);
  };

  // Zoom implementation (CSS scale transforms)
  const handleZoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.15));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.15));
  };

  const handleZoomReset = () => {
    setScale(1.0);
  };

  // Jump to specific Unit
  const handleJumpToUnit = (page: number) => {
    setCurrentPageNum(page);
    setTranslation(null);
  };

  // PDF.js dynamic local file loader
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingBook(true);
    setPdfFile(file);
    setPdfDocument(null);

    const fileReader = new FileReader();
    fileReader.onload = function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const pdfjs = (window as any).pdfjsLib;
      
      if (!pdfjs) {
        alert("PDF.js kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyiniz.");
        setLoadingBook(false);
        return;
      }

      pdfjs.getDocument({ data: typedarray }).promise.then((pdf: any) => {
        setPdfDocument(pdf);
        setTotalPageCount(pdf.numPages);
        setCurrentPageNum(1); // Start from first page of uploaded PDF
        setLoadingBook(false);
      }).catch((err: any) => {
        console.error("Error loaded PDF:", err);
        alert("Geçerli bir PDF dosyası seçtiğinizden emin olunuz.");
        setLoadingBook(false);
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Drawing hooks to forward state
  const handleAddStroke = (newStroke: DrawingStroke) => {
    const updated = [...drawingStrokes, newStroke];
    setDrawingStrokes(updated);
    saveUserData(soundMarkers, updated, drawingTexts);
  };

  const handleClearDrawing = () => {
    const updatedStrokes = drawingStrokes.filter(s => s.pageNumber !== currentPageNum);
    const updatedTexts = drawingTexts.filter(t => t.pageNumber !== currentPageNum);
    setDrawingStrokes(updatedStrokes);
    setDrawingTexts(updatedTexts);
    saveUserData(soundMarkers, updatedStrokes, updatedTexts);
  };

  const handleAddText = (newText: DrawingText) => {
    const exists = drawingTexts.some(t => t.id === newText.id);
    const updated = exists
      ? drawingTexts.map(t => t.id === newText.id ? newText : t)
      : [...drawingTexts, newText];
    setDrawingTexts(updated);
    saveUserData(soundMarkers, drawingStrokes, updated);
  };

  const handleRemoveText = (id: string) => {
    const updated = drawingTexts.filter(t => t.id !== id);
    setDrawingTexts(updated);
    saveUserData(soundMarkers, drawingStrokes, updated);
  };

  // Robust French-to-French definition fetcher using local dictionary & completely open Wikimedia/Wiktionary APIs
  const fetchFrenchDefinition = async (word: string): Promise<string | null> => {
    // 0. Try local dictionary lookup first for maximum reliability and zero network delay
    const localDef = getLocalFrenchDefinition(word);
    if (localDef) {
      console.log("Local French definition match for:", word, "=>", localDef);
      return localDef;
    }

    // Isolate clean word with apostrophe strip for online lookups
    let cleanWord = word.trim().toLowerCase();
    
    // Split elisions (e.g. l'enregistrement -> enregistrement)
    const elisionMatch = cleanWord.match(/^[ldmstncj]['’](.+)$/) || cleanWord.match(/^qu['’](.+)$/);
    if (elisionMatch && elisionMatch[1]) {
      cleanWord = elisionMatch[1];
    }
    
    // Replace punctuation except internal hyphens
    cleanWord = cleanWord.replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ\-]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ\-]+$/g, "").trim();
    if (!cleanWord) return null;

    // Form variants for the standard Wiktionary lookup (Wiktionary page titles are case-sensitive)
    const capitalizedWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    const variants = [cleanWord, capitalizedWord];
    
    // Add singular option if ends with "s"
    if (cleanWord.endsWith('s') && cleanWord.length > 2) {
      const singular = cleanWord.slice(0, -1);
      variants.push(singular);
      variants.push(singular.charAt(0).toUpperCase() + singular.slice(1));
    }

    // Helper to strip HTML tags from Wiktionary definition fields
    const stripHtml = (htmlStr: string): string => {
      return htmlStr.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    };

    // Try variants sequentially across different high-availability API endpoints
    for (const term of variants) {
      // Layer 1: Wiktionary REST API page definition (most accurate, open endpoint with CORS)
      // Note: Triggers CORS preflight request, if rejected or not supported, falls back instantly
      try {
        const targetUrl = `https://fr.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}`;
        const response = await fetch(targetUrl, {
          headers: {
            'Accept': 'application/json; charset=utf-8; profile="https://www.mediawiki.org/wiki/Specs/definition/0.8.0"'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            // Wiktionary maps languages to arrays of lexical items. French definition of word is usually under 'fr'
            const langEntries = data.fr || data[Object.keys(data)[0]];
            if (Array.isArray(langEntries) && langEntries.length > 0) {
              const defs: string[] = [];
              for (const entry of langEntries) {
                if (Array.isArray(entry.definitions)) {
                  for (const d of entry.definitions) {
                    if (d && d.definition) {
                      const cleanDef = stripHtml(d.definition);
                      if (cleanDef) {
                        defs.push(cleanDef);
                      }
                    }
                  }
                }
              }
              if (defs.length > 0) {
                // Return consolidated short list of descriptions
                return defs
                  .slice(0, 3)
                  .map((d, index) => `${index + 1}. ${d}`)
                  .join(" ");
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Wiktionary page definition failed or CORS preflight blocked for: ${term}`, err);
      }

      // Layer 2: Wiktionary REST API page summary (excellent alternative, does NOT trigger preflight, zero headers)
      try {
        const targetUrl = `https://fr.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
        const response = await fetch(targetUrl);
        if (response.ok) {
          const data = await response.json();
          if (data && data.extract) {
            return data.extract.trim();
          }
        }
      } catch (err) {
        console.warn(`Wiktionary page summary failed for: ${term}`, err);
      }

      // Layer 3: Wikipedia REST API page summary fallback (excellent for proper nouns, places, and major concepts)
      try {
        const targetUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
        const response = await fetch(targetUrl);
        if (response.ok) {
          const data = await response.json();
          if (data && data.extract) {
            return data.extract.trim();
          }
        }
      } catch (err) {
        console.warn(`Wikipedia page summary failed for: ${term}`, err);
      }
    }

    // Layer 4: Fallback: Wiktionary Search API list snippets if direct match is missing
    try {
      const fallbackUrl = `https://fr.wiktionary.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanWord)}&format=json&origin=*`;
      const response = await fetch(fallbackUrl);
      if (response.ok) {
        const data = await response.json();
        const results = data.query?.search;
        if (Array.isArray(results) && results.length > 0) {
          const firstResult = results[0];
          if (firstResult && firstResult.snippet) {
            const cleanSnippet = stripHtml(firstResult.snippet);
            if (cleanSnippet) {
              return `${cleanSnippet}...`;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Wiktionary Action Search API failed:", err);
    }

    return null;
  };

  // MyMemory Translation & Wiktionary French Definition integration
  const handleTranslateWord = async (word: string, x: number, y: number) => {
    const cleanWord = word.trim();
    if (!cleanWord) return;

    // Reset Swedish/Turkish visibility state
    setShowTurkish(false);

    // Check if single word or multi-word selection
    const isSingleWord = !cleanWord.includes(" ") && cleanWord.length > 0;

    // Initial state: Show "Yükleniyor..." while we fetch
    let initialTranslation = "Yükleniyor...";
    const localMatch = getLocalTranslation(cleanWord);
    if (localMatch) {
      initialTranslation = localMatch;
    }

    setTranslation({
      word: cleanWord,
      translation: initialTranslation,
      frenchDefinition: undefined,
      loadingFrench: isSingleWord, // Only load French definition if single word
      x,
      y
    });

    // Fetch MyMemory translation & French Definition concurrently
    const translationPromise = (async () => {
      if (localMatch) return localMatch;
      try {
        const contactEmail = "fatihsuhademirtas@gmail.com";
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=fr|tr&de=${encodeURIComponent(contactEmail)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data?.responseData?.translatedText || "Çeviri bulunamadı.";
      } catch (err) {
        console.error("MyMemory Translation error:", err);
        return "Bağlantı hatası oluştu.";
      }
    })();

    const frenchDefinitionPromise = (async () => {
      if (!isSingleWord) return null;
      try {
        return await fetchFrenchDefinition(cleanWord);
      } catch (err) {
        console.error("French definition fetch error:", err);
        return null;
      }
    })();

    // Run both queries concurrently
    const [translationResult, frenchResult] = await Promise.all([
      translationPromise,
      frenchDefinitionPromise
    ]);

    // Update state with final outcomes
    setTranslation({
      word: cleanWord,
      translation: translationResult,
      frenchDefinition: frenchResult || undefined,
      loadingFrench: false,
      x,
      y
    });
  };

  // Placed marker handlers
  const handleAddSoundMarker = (marker: SoundMarker) => {
    // Inject selected track names (supports url for uploaded audio tracks)
    const enriched: SoundMarker = {
      ...marker,
      audioSrc: selectedAudioTrack.url || selectedAudioTrack.id,
      audioName: selectedAudioTrack.name
    };
    const updated = [...soundMarkers, enriched];
    setSoundMarkers(updated);
    saveUserData(updated, drawingStrokes, drawingTexts);

    // Auto-advance to the next sound track in the list
    const allTracks = [...BUILT_IN_TRACKS, ...uploadedAudios];
    const currentIndex = allTracks.findIndex(t => t.id === selectedAudioTrack.id);
    if (currentIndex > -1 && allTracks.length > 1) {
      const nextIndex = (currentIndex + 1) % allTracks.length;
      setSelectedAudioTrack(allTracks[nextIndex]);
    }
  };

  const handleUploadAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const newTracks: { id: string; name: string; url: string; size?: number }[] = [];

    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const track = {
        id: 'user_track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for display elegance
        url,
        size: file.size
      };
      newTracks.push(track);
    });

    if (newTracks.length > 0) {
      setUploadedAudios(prev => [...prev, ...newTracks]);
      // Auto-select the first newly uploaded sound so they can place it on the screen immediately
      setSelectedAudioTrack({
        id: newTracks[0].id,
        name: newTracks[0].name,
        url: newTracks[0].url
      });
    }
  };

  const handleRemoveSoundMarker = (id: string) => {
    const updated = soundMarkers.filter(m => m.id !== id);
    setSoundMarkers(updated);
    if (playingMarker?.id === id) {
      stopAudio();
    }
    saveUserData(updated, drawingStrokes, drawingTexts);
  };

  // Export to JSON file
  const handleExportStateJson = () => {
    const payload = {
      client: "Plateforme de Cours PDF Interactive",
      user: userId,
      savedAt: new Date().toISOString(),
      soundMarkers,
      drawingStrokes,
      drawingTexts
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const token = document.createElement('a');
    token.href = url;
    token.download = `plateforme-cours-sauvegarde-${userId}.json`;
    document.body.appendChild(token);
    token.click();
    document.body.removeChild(token);
    URL.revokeObjectURL(url);
  };

  // Generate completely standalone offline-friendly French learning center HTML
  const handleDownloadOfflineHtml = () => {
    // Escaping helper
    const safeStr = (obj: any) => JSON.stringify(obj).replace(/<\/script>/g, '<\\/script>');

    const rawHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fransızca İnteraktif Ders Kitabı (Çevrimdışı Masaüstü)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500;750&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    #interactive-page-container {
      width: 800px;
      height: 1100px;
      position: relative;
      background-color: white;
      color: #1e293b;
      margin: 20px auto;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      border-radius: 8px;
      overflow: hidden;
      user-select: none;
    }
  </style>
</head>
<body class="flex flex-col min-h-screen">
  <header class="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Fransızca Masaüstü Çevrimdışı Portatif Kitap (.EXE Hazır)
        </span>
        <span class="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">Offline Sürüm</span>
      </div>
      
      <div class="flex items-center space-x-3">
        <button onclick="changePage(-1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded transition">◀ Önceki</button>
        <span id="page-indicator" class="font-mono text-sm font-bold bg-slate-950 px-3 py-1 rounded border border-slate-800">Sayfa: 12</span>
        <button onclick="changePage(1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded transition">Sonraki ▶</button>
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
    <!-- Left column: navigation -->
    <div class="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 h-fit space-y-4">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Üniteler</h3>
      <div class="space-y-1.5" id="units-list"></div>
      
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mt-6">Sözlük & Ses Modu</h3>
      <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
        <p>👉 Kitaptaki herhangi bir kelimenin üstüne tıklayarak anında Türkçe çevirisini açabilirsiniz (çevrimdışı sözlük aktiftir!).</p>
        <p>👉 Mavi ses yuvarlaklarına tıklayarak kelimelerin veya paragrafların Fransızca ses telaffuzunu dinleyebilirsiniz (Web Sentezliyici ile sıfır veri tüketimi).</p>
      </div>
    </div>

    <!-- Right column: Interactive textbook page display -->
    <div class="flex-1 flex justify-center items-start">
      <div id="interactive-page-container">
        <!-- Textbook Background page details are rendered here dynamically -->
        <div id="textbook-view" class="w-full h-full p-16 flex flex-col justify-between"></div>
        
        <!-- Canvas drawings render overlay (strokes are redrawn here) -->
        <canvas id="canv-draw" width="800" height="1100" class="absolute inset-0 pointer-events-none"></canvas>
        <canvas id="canv-hili" width="800" height="1100" class="absolute inset-0 pointer-events-none opacity-45"></canvas>
        
        <!-- Texts & markers overlays -->
        <div id="overlay-layer" class="absolute inset-0 pointer-events-none select-text"></div>
      </div>
    </div>
  </main>

  <div id="tooltip-bubble" class="fixed hidden bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl z-50 max-w-xs transition-opacity duration-200"></div>

  <footer class="bg-slate-950 p-4 text-center text-xs text-slate-600 border-t border-slate-900 mt-8">
    <span>© Fransızca İnteraktif Ders Platformu - Tüm hakları saklıdır. Bu dosya tamamen bağımsız ve çevrimdışı çalışmak üzere derlenmiştir.</span>
  </footer>

  <script>
    const STORAGE_KEY = 'offline_lesson_annotations';
    
    // Loaded embedded initial states
    let soundMarkers = ${safeStr(soundMarkers)};
    let drawingStrokes = ${safeStr(drawingStrokes)};
    let drawingTexts = ${safeStr(drawingTexts)};
    const LOCAL_DICT = ${safeStr(LOCAL_DICTIONARY)};

    const PAGES_DATA = {
      12: {
        unitTitle: "Unité 1: Les Salutations",
        title: "Se présenter en français",
        texts: [
          "Bonjour! Je m'appelle Jean. J'ai vingt-cinq ans et je suis étudiant de langues à Paris. J'adore voyager à travers la France pendant la saison d'été.",
          "La langue française est très belle et mélodieuse. Pour commencer à apprendre, nous devons maîtriser les salutations formelles et informelles pour saluer nos amis et collègues.",
          "Écoutez l'enregistrement audio placé par votre enseignant pour écouter la prononciation exacte du mot 'Enchanté' et de la phrase 'Comment allez-vous?'."
        ],
        exercises: [
          {
            instruction: "Exercice 1: Lisez le texte ci-dessus et associez la question à la bonne réponse.",
            questions: [
              "1. Comment ça va? -> Ça va bien, merci !",
              "2. Comment tu t'appelles? -> Je m'appelle Jean.",
              "3. Tu es d'où? -> Je suis de Paris."
            ]
          }
        ],
        interactiveTips: "Sözlük modu açık! Kelimelerin üstüne tıklayarak Türkçe karşılıklarına bakın."
      },
      24: {
        unitTitle: "Unité 2: La Ville et Ma Maison",
        title: "Décrire sa ville natale",
        texts: [
          "J'habite dans une très jolie ville qui s'appelle Strasbourg. C'est une ville historique située à l'est de la France, juste à côté de la frontière de l'Allemagne.",
          "Au centre de notre communauté, il y a une grande bibliothèque calme, une magnifique cathédrale gothique médiévale, et plusieurs petits cafés traditionnels.",
          "Tous les matins, les gens aiment traverser le pont historique pour acheter des croissants chauds à la boulangerie locale."
        ],
        exercises: [
          {
            instruction: "Exercice 1: Dans ma ville, d'après le texte, où les gens vont-ils pour étudier?",
            questions: [
              "- Les gens vont à la grand-rue, au cinéma, ou à la bibliothèque?",
              "- Qu'est-ce qu'ils achètent à la boulangerie locale?"
            ]
          }
        ],
        interactiveTips: "Fransızca okumayı geliştirmek için ses butonlarına tıklayın."
      },
      36: {
        unitTitle: "Unité 3: Ma Famille",
        title: "Ma Famille et Nos Traditions",
        texts: [
          "Ma famille est assez grande et nous sommes très soudés. Mon père s'appelle Pierre, il est docteur. Ma mère s'appelle Marie, elle est enseignante de musique classique.",
          "J'ai une sœur cadette qui s'appelle Sophie et un frère aîné s'appelant Lucas. Pendant le week-end, nous aimons préparer des dîners spéciaux ensemble.",
          "Ce soir, Lucas apporte une tarte aux pommes préparée par notre grand-mère chaleureuse."
        ],
        exercises: [
          {
            instruction: "Exercice 1: Complétez les phrases avec l'adjectif possessif correct.",
            questions: [
              "1. C'est mon père (mon/ma/mes).",
              "2. Voilà sa mère (son/sa/ses).",
              "3. Ce sont leurs enfants (leur/leurs)."
            ]
          }
        ],
        interactiveTips: "Ses oynatıcısına tıklayarak aile üyelerinin seslerini dinleyin."
      },
      48: {
        unitTitle: "Unité 4: Au Restaurant",
        title: "Commander de la nourriture au bistrot",
        texts: [
          "Bienvenue au Bistro de Paris! Nous vous proposons les meilleures spécialités françaises dans une ambiance décontractée.",
          "Pour commencer, vous devriez choisir une délicieuse quiche lorraine ou une soupe à l'oignon parisienne accompagnée de pain chaud croustillant.",
          "Notre plat principal traditionnel est le bœuf bourguignon mijoté lentement avec des carottes fraîches et du vin rouge raffiné."
        ],
        exercises: [
          {
            instruction: "Exercice 1: Complétez le dialogue de commande au restaurant.",
            questions: [
              "- Serveur: Qu'est-ce que vous désirez?",
              "- Client: Je voudrais un croissant et un café au lait, s'il vous plaît.",
              "- Client: Et comme entrée, je prendrai une quiche lorraine."
            ]
          }
        ],
        interactiveTips: "Kelimeleri Türkçe'ye çevirerek yiyecek isimlerini öğrenin."
      },
      60: {
        unitTitle: "Unité 5: Les Voyages",
        title: "Planifier des Vacances de Rêve",
        texts: [
          "Pour beaucoup de voyageurs, un voyage idéal consiste à passer du temps sur les plages ensoleillées de la Côte d'Azur, à faire de la randonnée en haute montagne ou à explorer de magnifiques villages médiévaux.",
          "À Nice, vous pouvez flâner le long de la célèbre Promenade des Anglais, visiter des musées d'art moderne comme le Musée Matisse et goûter la cuisine niçoise riche d'olives, de basilic et de tomates parfumées.",
          "Préparez bien votre valise, réservez des billets de train à l'avance et n'oubliez surtout pas votre passeport!"
        ],
        exercises: [
          {
            instruction: "Exercice 2: Répondez par Vrai ou Faux en fonction du texte instructif.",
            questions: [
              "- Nice se trouve au nord de la France. (Vrai / Faux)",
              "- Il est recommandé d'avoir un passeport için seyahat etmek. (Vrai / Faux)",
              "- Le Musée Matisse se situe sur la Côte d'Azur. (Vrai / Faux)"
            ]
          }
        ],
        interactiveTips: "Tatil ipuçları için kelimeleri inceleyin."
      }
    };

    let currentPage = 12;

    const UNITS = [
      { name: "Unité 1: Les Salutations", page: 12 },
      { name: "Unité 2: La Ville ", page: 24 },
      { name: "Unité 3: Ma Famille", page: 36 },
      { name: "Unité 4: Au Restaurant", page: 48 },
      { name: "Unité 5: Les Voyages", page: 60 }
    ];

    function init() {
      // Load local changes if user draws on the standalone version
      const localLoaded = localStorage.getItem(STORAGE_KEY);
      if (localLoaded) {
        try {
          const parsed = JSON.parse(localLoaded);
          if (parsed.soundMarkers) soundMarkers = parsed.soundMarkers;
          if (parsed.drawingStrokes) drawingStrokes = parsed.drawingStrokes;
          if (parsed.drawingTexts) drawingTexts = parsed.drawingTexts;
        } catch(e) {}
      }

      renderUnits();
      renderPage();
      
      // Close tooltip on document move
      document.addEventListener('click', (e) => {
        const bubble = document.getElementById('tooltip-bubble');
        if (!e.target.closest('.word-span') && !e.target.closest('#tooltip-bubble')) {
          bubble.classList.add('hidden');
        }
      });
    }

    function renderUnits() {
      const container = document.getElementById('units-list');
      container.innerHTML = '';
      UNITS.forEach(u => {
        const btn = document.createElement('button');
        btn.innerHTML = "<span class=\"truncate\">" + u.name + "</span> <span class=\"text-[9px] bg-slate-805 px-1.5 py-0.5 rounded font-mono\">P." + u.page + "</span>";
        btn.className = "w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between border transition cursor-pointer " +
          (currentPage === u.page ? "bg-blue-900/50 border-blue-800 text-blue-300 font-bold shadow-md" : "bg-slate-950 border-transparent text-slate-400 hover:bg-slate-800");
        btn.onclick = () => {
          currentPage = u.page;
          renderPage();
          renderUnits();
        };
        container.appendChild(btn);
      });
    }

    function changePage(delta) {
      const pages = [12, 24, 36, 48, 60];
      let currentIdx = pages.indexOf(currentPage);
      if (currentIdx === -1) currentIdx = 0;
      let targetIdx = currentIdx + delta;
      if (targetIdx >= 0 && targetIdx < pages.length) {
        currentPage = pages[targetIdx];
        renderPage();
        renderUnits();
      }
    }

    function renderPage() {
      document.getElementById('page-indicator').textContent = 'Sayfa: ' + currentPage;
      const data = PAGES_DATA[currentPage] || {
        unitTitle: "Ek Sayfa",
        title: "İnteraktif Sayfa " + currentPage,
        texts: ["Bu sayfa tamamen portatiftir."],
        exercises: [],
        interactiveTips: ""
      };

      const view = document.getElementById('textbook-view');
      
      // Build internal text with clickable words
      let textsHtml = '';
      data.texts.forEach(para => {
        const words = para.split(" ");
        let wordSpans = words.map(w => {
          const clean = w.trim().replace(/^[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ\-]+|[^a-zA-Z0-9àâäéèêëîïôöùûüçœŒ\-]+$/g, "").toLowerCase();
          return "<span class=\"word-span cursor-help hover:bg-yellow-250 hover:text-slate-950 rounded px-1.5 py-0.5 transition font-medium\" onclick=\"translateWord(event, '" + clean + "', '" + w + "')\">" + w + "</span>";
        }).join(" ");
        textsHtml += "<p class=\"indent-6 text-justify text-slate-750 leading-relaxed font-serif text-[17px] mb-4\">" + wordSpans + "</p>";
      });

      let exercisesHtml = '';
      data.exercises.forEach((ex, exIdx) => {
        let qLines = ex.questions.map(q => "<li class=\"mb-1.5\">" + q + "</li>").join("");
        exercisesHtml += "<div class=\"bg-slate-50 p-4.5 rounded-xl border border-slate-200 mt-4 mb-3\">" +
          "<h4 class=\"font-sans font-bold text-xs text-blue-600 mb-2 uppercase flex items-center space-x-2\">" +
            "<span class=\"bg-blue-50 text-blue-600 font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-blue-100\">" + (exIdx + 1) + "</span>" +
            "<span>" + ex.instruction + "</span>" +
          "</h4>" +
          "<ul class=\"list-disc pl-5 text-xs text-slate-650 font-mono leading-normal\">" + qLines + "</ul>" +
        "</div>";
      });

      view.innerHTML = "<div class=\"flex-1 flex flex-col justify-between h-full\">" +
          "<div>" +
            "<div class=\"text-[10px] text-slate-400 font-mono tracking-widest font-semibold mb-3\">DÉPARTEMENT DE FRANÇAIS</div>" +
            "<header class=\"mb-6\">" +
              "<span class=\"font-sans font-bold text-xs text-blue-600 uppercase tracking-widest mb-1.5 block\">" + data.unitTitle + "</span>" +
              "<h1 class=\"font-serif italic text-2xl md:text-3xl text-slate-800 mb-2 font-normal\">" + data.title + "</h1>" +
              "<div class=\"h-0.5 w-16 bg-blue-600\"></div>" +
            "</header>" +
            "<div class=\"space-y-4\">" + textsHtml + "</div>" +
            "<div class=\"border-t my-6 border-slate-100\"></div>" +
            "<div>" + exercisesHtml + "</div>" +
          "</div>" +
          "<div class=\"border-t pt-4 flex justify-between items-center text-slate-400 text-xs mt-4\">" +
            "<div class=\"flex items-center space-x-1\">" +
              "<span>✨ " + data.interactiveTips + "</span>" +
            "</div>" +
            "<div class=\"font-sans font-bold text-xl text-slate-400 italic\">Page " + currentPage + "</div>" +
          "</div>" +
        "</div>";

      drawCanvas();
      renderHtmlOverlays();
    }

    function drawCanvas() {
      const canv = document.getElementById('canv-draw');
      const hili = document.getElementById('canv-hili');
      const ctxDraw = canv.getContext('2d');
      const ctxHili = hili.getContext('2d');
      
      ctxDraw.clearRect(0,0, 800, 1100);
      ctxHili.clearRect(0,0, 800, 1100);

      drawingStrokes.forEach(stroke => {
        if (stroke.pageNumber !== currentPage) return;
        const ctx = stroke.tool === 'highlighter' ? ctxHili : ctxDraw;
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        if (stroke.tool === 'highlighter') {
          ctx.globalAlpha = 0.4;
        } else {
          ctx.globalAlpha = 1.0;
        }
        
        if (stroke.points.length > 0) {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i<stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      });
    }

    function renderHtmlOverlays() {
      const overlay = document.getElementById('overlay-layer');
      overlay.innerHTML = '';

      drawingTexts.forEach(t => {
        if (t.pageNumber !== currentPage) return;
        const div = document.createElement('div');
        div.className = "absolute text-xs bg-white/90 border border-slate-200/50 p-1.5 shadow-sm rounded pointer-events-auto font-sans font-semibold";
        div.style.left = t.x + '%';
        div.style.top = t.y + '%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.color = t.color;
        div.style.fontSize = t.fontSize + 'px';
        div.textContent = t.text;
        overlay.appendChild(div);
      });

      soundMarkers.forEach(m => {
        if (m.pageNumber !== currentPage) return;
        const div = document.createElement('div');
        div.className = "absolute pointer-events-auto";
        div.style.left = m.x + '%';
        div.style.top = m.y + '%';
        div.style.transform = 'translate(-50%, -50%)';
        
        const btn = document.createElement('button');
        btn.className = "w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 shadow-md border border-blue-400 hover:scale-105 transition cursor-pointer";
        btn.innerHTML = "<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z\"></path></svg>";
        btn.onclick = (e) => {
          e.stopPropagation();
          speakFrenchFromMarker(m);
        };
        div.appendChild(btn);
        overlay.appendChild(div);
      });
    }

    function translateWord(e, cleanWord, origWord) {
      e.stopPropagation();
      const bubble = document.getElementById('tooltip-bubble');
      
      const clean = cleanWord.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents
      const TurkishText = LOCAL_DICT[cleanWord] || LOCAL_DICT[clean] || "Bu kelime için çeviri bulunamadı. (Çevrimdışı)";
      
      const rect = e.target.getBoundingClientRect();
      const x = rect.left + window.scrollX;
      const y = rect.top + window.scrollY;

      bubble.style.left = x + 'px';
      bubble.style.top = (y - 120) + 'px';
      
      bubble.innerHTML = "<div class=\"flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2\">" +
          "<span class=\"font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold\">Lokal Sözlük (Çevrimdışı Sürüm)</span>" +
        "</div>" +
        "<div class=\"font-serif italic font-bold text-base text-blue-300\">" + origWord + "</div>" +
        "<p class=\"font-sans font-medium text-slate-200 text-[13px] mt-1 capitalize\">" + TurkishText + "</p>";
      
      bubble.classList.remove('hidden');
    }

    function speakFrenchFromMarker(m) {
      if (!window.speechSynthesis) {
        alert("Tarayıcınız ses sentezlemeyi desteklemiyor!");
        return;
      }
      window.speechSynthesis.cancel();
      
      const data = PAGES_DATA[m.pageNumber];
      const text = data ? data.texts[0] : "Bonjour !";
      
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      utter.rate = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.includes('fr-'));
      if (frVoice) utter.voice = frVoice;
      
      window.speechSynthesis.speak(utter);
    }

    window.onload = init;
  </script>
</body>
</html>`;

    const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fransizca_Interaktif_Ders_Masaustu.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import layout JSON dataset file
  const handleImportStateJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.soundMarkers || parsed.drawingStrokes || parsed.drawingTexts) {
          if (parsed.soundMarkers) setSoundMarkers(parsed.soundMarkers);
          if (parsed.drawingStrokes) setDrawingStrokes(parsed.drawingStrokes);
          if (parsed.drawingTexts) setDrawingTexts(parsed.drawingTexts);
          
          saveUserData(parsed.soundMarkers || [], parsed.drawingStrokes || [], parsed.drawingTexts || []);
          alert("Çalışma başarıyla içe aktarıldı ve uygulandı!");
        } else {
          alert("Geçersiz dosya şeması.");
        }
      } catch (err) {
        alert("JSON dosyası ayrıştırılamadı.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="app-root-wrapper" className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* 1. LOGIN OVERLAY BLOCK */}
      <LoginOverlay onLoginSuccess={handleLoginSuccess} />

      {/* 2. DYNAMIC SLOW LOADING SCREEN */}
      <LoadingScreen isLoading={loadingBook} />

      {/* Core app layout when authenticated */}
      {appReady && userId && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* TOP BAR / NAVIGATION TOOLBAR */}
          <nav id="app-top-navbar" className={`h-16 shrink-0 px-4 md:px-6 flex items-center justify-between z-30 relative shadow-sm border-b transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Paneli Aç/Kapat"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span className={`font-display font-bold text-lg tracking-tight hidden sm:inline-block ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Plateforme de Cours PDF
                </span>
                <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {userId}
                </span>
              </div>
            </div>

            {/* Quick paging indicators & jumping */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                disabled={currentPageNum === 1}
                className={`p-2 disabled:opacity-30 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Önceki Sayfa"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="1"
                  max={totalPageCount}
                  value={currentPageNum}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= totalPageCount) {
                      setCurrentPageNum(val);
                    }
                  }}
                  className={`w-12 text-center p-1 rounded-md font-mono text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-100' : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                />
                <span className="text-slate-400 text-xs font-semibold">/ {totalPageCount}</span>
              </div>

              <button
                onClick={() => setCurrentPageNum(Math.min(totalPageCount, currentPageNum + 1))}
                disabled={currentPageNum === totalPageCount}
                className={`p-2 disabled:opacity-30 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Sonraki Sayfa"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Extra Zoom & Correction actions */}
            <div className="flex items-center space-x-2">
              {/* Zoom Buttons with percentage layout */}
              <div className={`hidden md:flex items-center p-1 rounded-xl transition ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100 hover:bg-slate-200/50'}`}>
                <button
                  onClick={handleZoomOut}
                  className={`p-1.5 rounded-lg shadow-sm transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-white text-slate-600'}`}
                  title="Küçült"
                >
                  <SearchMinus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className={`px-2 font-mono text-xs font-bold transition ${isDarkMode ? 'text-slate-300 hover:text-blue-405' : 'text-slate-500 hover:text-blue-600'}`}
                  title="Sıfırla"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className={`p-1.5 rounded-lg shadow-sm transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-white text-slate-600'}`}
                  title="Büyüt"
                >
                  <SearchPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Mes Mots notebook button */}
              <button
                onClick={() => setMyWordsOpen(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer border ${
                  isDarkMode
                    ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-800/60 text-amber-200'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                }`}
              >
                <span>⭐</span>
                <span>Mes Mots ({savedVocabulary.length})</span>
              </button>

              <button
                onClick={() => setCorrectionOpen(!correctionOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  correctionOpen 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Voir la correction (👀)</span>
              </button>

              {/* Theme Toggle switch */}
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className={`p-2 rounded-lg transition duration-150 cursor-pointer text-base leading-none flex items-center justify-center ${
                  isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
                title={isDarkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
              >
                <span>{isDarkMode ? '☀️' : '🌙'}</span>
              </button>

              <button
                onClick={handleLogOut}
                className={`p-2 text-xs font-semibold uppercase rounded-lg transition ${
                  isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Oturumu Sonlandır"
              >
                Exit
              </button>
            </div>
          </nav>

          {/* INNER APPLICATION BOARD VIEW */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* LEFT CONTROL PANEL - SIDEBAR */}
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.div
                  id="app-sidebar"
                  className={`w-72 flex flex-col h-full z-10 shrink-0 border-r transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 288, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    
                    {/* Choose PDF and dynamic fallback textbooks */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                        DERS MATERYALİ (PDF)
                      </span>
                      
                      {pdfFile ? (
                        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-start space-x-2">
                          <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="truncate flex-1">
                            <p className="text-xs font-semibold text-blue-900 truncate">{pdfFile.name}</p>
                            <span className="text-[10px] text-blue-500 font-medium">Özel PDF Yüklendi</span>
                          </div>
                          <button
                            onClick={() => {
                              setPdfFile(null);
                              setPdfDocument(null);
                              setTotalPageCount(65);
                              setCurrentPageNum(12);
                            }}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded transition"
                            title="Hazır kitaba dön"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-500 font-medium">Hazır Fransızca Kitabı Aktif</p>
                          <span className="text-[9px] text-slate-400 block mt-1">Sayısal Çizimler Ve Çeviriler Kullanılabilir</span>
                        </div>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-medium text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Kendi PDF Dosyanı Yükle</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </div>

                    {/* INTERACTIVE STUDY TOOL PANEL */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                        ÇALIŞMA ARAÇLARI (TOOLS)
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Cursor SELECT */}
                        <button
                          onClick={() => {
                            setActiveTool('select');
                            stopAudio();
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'select'
                              ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <MousePointer className="w-5 h-5" />
                          <span>Seç / Gezin</span>
                        </button>

                        {/* Translate */}
                        <button
                          onClick={() => {
                            setActiveTool('translate');
                            stopAudio();
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'translate'
                              ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <Globe className="w-5 h-5" />
                          <span>Çeviri (MyMemory)</span>
                        </button>

                        {/* DRAWING Pencil */}
                        <button
                          onClick={() => setActiveTool('pencil')}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'pencil'
                              ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <Pencil className="w-4.5 h-4.5" />
                          <span>Kalem</span>
                        </button>

                        {/* HIGHLIGHTER */}
                        <button
                          onClick={() => setActiveTool('highlighter')}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'highlighter'
                              ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <div className="w-5 h-5 rounded bg-amber-400 opacity-80 flex items-center justify-center text-white text-[10px] font-bold">H</div>
                          <span>Fosforlu Kalem</span>
                        </button>

                        {/* TEXT Overlay */}
                        <button
                          onClick={() => setActiveTool('text')}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'text'
                              ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <Type className="w-5 h-5" />
                          <span>Metin Ekle</span>
                        </button>

                        {/* PLACE SOUND BUTTONS */}
                        <button
                          onClick={() => setActiveTool('sound')}
                          className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                            activeTool === 'sound'
                              ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700'
                          }`}
                        >
                          <Volume2 className="w-5 h-5" />
                          <span>Ses Yerleştir</span>
                        </button>
                      </div>

                      {/* Tool Options (Color Palette and Weights) when drawing tools active */}
                      {(activeTool === 'pencil' || activeTool === 'highlighter' || activeTool === 'text') && (
                        <motion.div
                          id="tool-options-box"
                          className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 space-y-3"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-[10px] font-bold text-slate-400">RENK SEÇİNİZ</p>
                          <div className="flex space-x-2">
                            {['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#000000'].map((col) => (
                              <button
                                key={col}
                                onClick={() => setActiveColor(col)}
                                className={`w-6 h-6 rounded-full border-2 transition ${
                                  activeColor === col ? 'border-indigo-600 scale-115' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>KALEM KALINLIĞI</span>
                              <span className="font-mono text-slate-500">{activeWidth}px</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="15"
                              value={activeWidth}
                              onChange={(e) => setActiveWidth(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Placer Settings */}
                      {activeTool === 'sound' && (
                        <motion.div
                          id="sound-placer-options"
                          className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mt-2 space-y-3"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-center justify-between border-b border-amber-200/40 pb-2">
                            <span className="text-[10px] font-bold text-amber-850 tracking-wider uppercase block">
                              Ses Kütüphanesi
                            </span>
                            <button
                              onClick={() => document.getElementById('audio-file-uploader')?.click()}
                              className="text-[10px] bg-amber-600 hover:bg-amber-550 text-white font-bold py-1 px-2 rounded-lg flex items-center space-x-1 shadow transition cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Ses Yükle</span>
                            </button>
                          </div>

                          <input
                            type="file"
                            id="audio-file-uploader"
                            accept="audio/*"
                            onChange={handleUploadAudioFiles}
                            multiple
                            className="hidden"
                          />

                          {/* 1. Sizin Yüklediğiniz Dosyalar */}
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-amber-900/60 uppercase tracking-widest block mb-1">
                              Sizin Yükledikleriniz ({uploadedAudios.length})
                            </p>
                            {uploadedAudios.length === 0 ? (
                              <p className="text-[10px] text-slate-450 italic p-2 bg-white/70 rounded-lg border border-dashed border-slate-200 leading-normal">
                                Henüz ses dosyası yüklenmedi. "Ses Yükle" butonuyla yükleyip sırayla yerleştirebilirsiniz.
                              </p>
                            ) : (
                              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                {uploadedAudios.map((track) => (
                                  <button
                                    key={track.id}
                                    onClick={() => setSelectedAudioTrack(track)}
                                    className={`w-full text-left p-1.5 rounded-lg text-xs transition border flex items-center justify-between truncate ${
                                      selectedAudioTrack.id === track.id
                                        ? 'bg-amber-100 border-amber-350 text-amber-950 font-semibold shadow-sm animate-pulse-short'
                                        : 'bg-white border-slate-100 text-slate-650 hover:bg-white/80'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-1.5 truncate">
                                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate" title={track.name}>{track.name}</span>
                                    </div>
                                    <span className="text-[8px] bg-amber-200/50 px-1 py-0.5 rounded font-mono text-amber-800 font-semibold shrink-0">CİHAZ</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 2. Sistem Dahili Sesleri (Yapay Sentez) */}
                          <div className="space-y-1 pt-2 border-t border-amber-200/20">
                            <p className="text-[9px] font-bold text-amber-900/60 uppercase tracking-widest block mb-1">
                              Sistem Seslendirmeleri (TTS)
                            </p>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {BUILT_IN_TRACKS.map((track) => (
                                <button
                                  key={track.id}
                                  onClick={() => setSelectedAudioTrack(track)}
                                  className={`w-full text-left p-1.5 rounded-lg text-xs transition border flex items-center space-x-1.5 truncate ${
                                    selectedAudioTrack.id === track.id
                                      ? 'bg-amber-100 border-amber-350 text-amber-950 font-semibold shadow-sm'
                                      : 'bg-white/40 border-transparent text-slate-500 hover:bg-white/80'
                                  }`}
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate" title={track.name}>{track.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="text-[9.5px] text-amber-800 bg-amber-100/35 p-2 rounded-lg border border-amber-200/30 leading-normal">
                            👉 <strong>Nasıl Yerleştirilir:</strong> İstediğiniz sesi seçin ve kitaptaki herhangi bir konuma tıklayarak onu manuel olarak yerleştirin.
                          </div>
                        </motion.div>
                      )}

                      <button
                        onClick={handleClearDrawing}
                        className={`w-full mt-3 py-2 px-3 font-medium text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isDarkMode
                            ? 'bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-605 text-rose-600'
                        }`}
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Sayfa Çizimlerini Temizle</span>
                      </button>
                    </div>

                    {/* DYNAMIC NAV MENU JUMP MODULE */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                        ÜNİTELER (QUICK NAV)
                      </span>
                      <div className="space-y-1">
                        {UNIT_PAGES.map((unit) => {
                          const isCompleted = maxPageVisited >= unit.page;
                          return (
                            <button
                              key={unit.page}
                              onClick={() => handleJumpToUnit(unit.page)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between border ${
                                currentPageNum === unit.page
                                  ? (isDarkMode ? 'bg-blue-950/40 border-blue-800 text-blue-400 font-semibold' : 'bg-blue-50 border-blue-200 text-blue-700 font-semibold')
                                  : (isDarkMode ? 'bg-slate-800/20 border-transparent text-slate-350 hover:bg-slate-800/60' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 min-w-0">
                                {isCompleted && (
                                  <span className="text-emerald-500 font-bold shrink-0 text-[10px]" title="Tamamlandı">✅</span>
                                )}
                                <span className="truncate">{unit.name}</span>
                              </div>
                              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 shrink-0 ${
                                isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/60 text-slate-500'
                              }`}>
                                P.{unit.page}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* IMPORT / EXPORT DATA */}
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                        İÇE / DIŞA AKTAR (SAVE/LOAD)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleExportStateJson}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer"
                          title="Tüm çizimleri ve sesleri JSON olarak cihazına kaydet"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Yedek Al</span>
                        </button>
                        
                        <button
                          onClick={() => document.getElementById('import-json-input')?.click()}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer"
                          title="Daha önce kaydettiğin JSON yedeğini geri yükle"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Geri Yükle</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setExeModalOpen(true)}
                        className="w-full mt-2 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow border border-emerald-400/20 transition flex items-center justify-center space-x-1.5 cursor-pointer hover:shadow-md"
                        title="Tüm ses, pdf ve çizimlerinizi içeren çevrimdışı Windows .EXE dosyası oluşturun"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-100 animate-pulse" />
                        <span>Masaüstü .EXE Paketi Oluştur</span>
                      </button>

                      <input
                        id="import-json-input"
                        type="file"
                        accept="application/json"
                        onChange={handleImportStateJson}
                        className="hidden"
                      />
                    </div>
 
                   </div>

                  {/* Progress Bar Sticky Footer */}
                  <div className={`p-4 border-t transition-colors duration-300 ${
                    isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-slate-400">
                        <span>KİTAP TAMAMLAMA ORANI</span>
                        <span className="font-mono text-blue-500 font-extrabold text-xs">
                          %{Math.min(100, Math.round((maxPageVisited / 126) * 100))}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(100, Math.round((maxPageVisited / 126) * 100))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                        <span>En Yüksek: P. {maxPageVisited}</span>
                        <span>Toplam: 126 Sayfa</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DYNAMIC SCROLL CONTAINER OF ACTIVE PAGES */}
            <div
              id="pdf-scroll-viewport"
              className={`flex-1 overflow-auto p-8 relative flex justify-center items-start selection:bg-yellow-200 select-none cursor-default transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-950' : 'bg-slate-100'
              }`}
            >
              <div className="my-10">

                <InteractiveTextbookPage
                  pageNumber={currentPageNum}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  activeWidth={activeWidth}
                  scale={scale}
                  pdfDocument={pdfDocument}
                  soundMarkers={soundMarkers}
                  onAddSoundMarker={handleAddSoundMarker}
                  onRemoveSoundMarker={handleRemoveSoundMarker}
                  playingMarkerId={playingMarker?.id || null}
                  onPlaySoundMarker={playSoundMarker}
                  strokes={drawingStrokes}
                  onAddStroke={handleAddStroke}
                  onClearDrawing={handleClearDrawing}
                  texts={drawingTexts}
                  onAddText={handleAddText}
                  onRemoveText={handleRemoveText}
                  onTranslateWord={handleTranslateWord}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Floating Live Tooltip Translation Bubble inside Viewport */}
              <AnimatePresence>
                {translation && (
                  <motion.div
                    id="translation-tooltip-bubble"
                    className="fixed overflow-hidden bg-slate-950 border border-slate-800 text-white p-4.5 rounded-2xl shadow-2xl z-50 w-72 transition"
                    style={{
                      left: `${Math.max(160, Math.min(window.innerWidth - 160, translation.x))}px`,
                      top: `${translation.y < 200 ? translation.y + 20 : translation.y - 12}px`,
                      transform: translation.y < 200 ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)',
                    }}
                    initial={{ opacity: 0, scale: 0.9, y: translation.y < 200 ? -10 : 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: translation.y < 200 ? -10 : 10 }}
                    transition={{ duration: 0.15 }}
                    onMouseDown={(e) => e.stopPropagation()} // retain select focus
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 mb-2.5">
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                        Définition & Traduction
                      </span>
                      <div className="flex items-center space-x-2">
                        {/* ⭐ Save vocabulary button */ }
                        <button
                          onClick={() => {
                            const cleanWord = translation.word.trim();
                            if (!cleanWord) return;
                            const exists = savedVocabulary.some(v => v.word.toLowerCase() === cleanWord.toLowerCase());
                            if (!exists) {
                              const newVocab = {
                                id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                                word: cleanWord,
                                translation: translation.translation !== 'Yükleniyor...' ? translation.translation : 'Çeviri yok',
                                frenchDefinition: translation.frenchDefinition || ''
                              };
                              setSavedVocabulary(prev => [...prev, newVocab]);
                            } else {
                              setSavedVocabulary(prev => prev.filter(v => v.word.toLowerCase() !== cleanWord.toLowerCase()));
                            }
                          }}
                          className={`p-1 rounded-md text-[11px] leading-none transition-all duration-150 flex items-center justify-center cursor-pointer ${
                            savedVocabulary.some(v => v.word.toLowerCase() === translation.word.trim().toLowerCase())
                              ? 'text-amber-400 bg-amber-400/10'
                              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/40'
                          }`}
                          title={savedVocabulary.some(v => v.word.toLowerCase() === translation.word.trim().toLowerCase()) ? 'Defterimden Çıkar' : 'Deftere Kaydet'}
                        >
                          <span>⭐</span>
                        </button>

                        {/* Pronunciation audio speaker */}
                        <button
                          onClick={() => {
                            if (!window.speechSynthesis) return;
                            window.speechSynthesis.cancel();
                            const utter = new SpeechSynthesisUtterance(translation.word);
                            utter.lang = 'fr-FR';
                            utter.rate = 0.85;
                            window.speechSynthesis.speak(utter);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800/40 text-[11px] leading-none transition duration-150 cursor-pointer"
                          title="Fransızca Telaffuz"
                        >
                          <span>🔊</span>
                        </button>

                        {(translation.loadingFrench || translation.translation === "Yükleniyor...") ? (
                          <Globe className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-serif italic font-bold text-lg text-blue-300 capitalize tracking-tight">
                        {translation.word}
                      </div>

                      {/* Built-in quick badge indicators */}
                      {savedVocabulary.some(v => v.word.toLowerCase() === translation.word.trim().toLowerCase()) && (
                        <span className="text-[8px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">KAYDEDİLDİ</span>
                      )}
                    </div>

                    {/* UPPER SECTION: French Definition from Wiktionary */}
                    <div className="mt-2.5 border-t border-slate-800/50 pt-2.5">
                      <span className="flex items-center gap-1 font-sans font-bold text-[10.5px] uppercase tracking-wider text-yellow-400">
                        <span>📖</span> Définition en Français:
                      </span>
                      {translation.loadingFrench ? (
                        <div className="flex items-center gap-1.5 font-sans text-xs text-slate-400 mt-1.5 italic select-none">
                          <span className="block w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></span>
                          <span>Définition en cours...</span>
                        </div>
                      ) : translation.frenchDefinition ? (
                        <p className="font-sans text-xs text-slate-200 mt-1.5 leading-relaxed pl-1 border-l-2 border-yellow-500/20 italic max-h-36 overflow-y-auto custom-scrollbar">
                          {translation.frenchDefinition}
                        </p>
                      ) : (
                        <p className="font-sans text-xs text-slate-450 mt-1.5 italic pl-1 border-l-2 border-slate-800">
                          Aucune définition trouvée pour ce terme.
                        </p>
                      )}
                    </div>

                    {/* LOWER SECTION: Turkish Translation from MyMemory */}
                    {!showTurkish ? (
                      <button
                        onClick={() => setShowTurkish(true)}
                        className="mt-3.5 w-full flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800/80 hover:bg-slate-800/90 text-xs text-sky-400 font-semibold py-1.5 rounded-xl transition duration-150 cursor-pointer active:scale-[0.98]"
                      >
                        <span>🇹🇷</span> Türkçe Çeviriyi Göster
                      </button>
                    ) : (
                      <div className="mt-2.5 border-t border-slate-800/50 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-sans font-bold text-[10.5px] uppercase tracking-wider text-sky-400">
                            <span>🇹🇷</span> Çeviri (Türkçe):
                          </span>
                          <button
                            onClick={() => setShowTurkish(false)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                          >
                            Temizle
                          </button>
                        </div>
                        {translation.translation === "Yükleniyor..." ? (
                          <div className="flex items-center gap-1.5 font-sans text-xs text-slate-400 mt-1.5 italic select-none">
                            <span className="block w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                            <span>Çeviri alınıyor...</span>
                          </div>
                        ) : (
                          <p className="font-sans font-medium text-slate-200 text-[13.5px] mt-1.5 leading-normal pl-1 border-l-2 border-blue-500/20 w-full break-words">
                            {translation.translation}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3.5 border-t border-slate-900 pt-3">
                      <a
                        href={`https://fr.wiktionary.org/wiki/${encodeURIComponent(translation.word.toLowerCase())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-[10px] text-slate-300 hover:text-white font-medium py-1.5 rounded-xl transition"
                      >
                        Wiktionary ➔
                      </a>

                      <button
                        onClick={() => {
                          const cleanWord = translation.word.trim();
                          if (!cleanWord) return;
                          const exists = savedVocabulary.some(v => v.word.toLowerCase() === cleanWord.toLowerCase());
                          if (!exists) {
                            const newVocab = {
                              id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                              word: cleanWord,
                              translation: translation.translation !== 'Yükleniyor...' ? translation.translation : 'Çeviri yok',
                              frenchDefinition: translation.frenchDefinition || ''
                            };
                            setSavedVocabulary(prev => [...prev, newVocab]);
                          } else {
                            setSavedVocabulary(prev => prev.filter(v => v.word.toLowerCase() !== cleanWord.toLowerCase()));
                          }
                        }}
                        className={`text-center text-[10px] font-bold py-1.5 rounded-xl transition cursor-pointer border ${
                          savedVocabulary.some(v => v.word.toLowerCase() === translation.word.trim().toLowerCase())
                            ? 'bg-amber-900/20 border-amber-800/50 text-amber-300'
                            : 'bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-305 text-slate-300'
                        }`}
                      >
                        {savedVocabulary.some(v => v.word.toLowerCase() === translation.word.trim().toLowerCase()) ? '⭐ Kaydedildi' : '⭐ Kaydet'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ⭐ KELİMELERİM (MES MOTS) NOTEBOOK - FLASHCARDS MODAL */}
            <AnimatePresence>
              {myWordsOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl animate-fade-in"
                  onClick={() => setMyWordsOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative select-none flex flex-col max-h-[85vh] transition-colors duration-300 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className={`p-6 border-b flex items-center justify-between transition-colors duration-300 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                          <span className="text-xl">⭐</span>
                        </div>
                        <div>
                          <h3 className="font-sans font-extrabold text-base tracking-tight text-amber-400">Kelimelerim — Mes Mots</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Bireysel kelime defteri ve telaffuz eğiticisi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMyWordsOpen(false)}
                        className={`p-1.5 rounded-lg transition duration-150 cursor-pointer ${
                          isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="text-sm font-bold">✕</span>
                      </button>
                    </div>

                    {/* Content area */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
                      {savedVocabulary.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                            isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-50 text-slate-300'
                          }`}>
                            <span className="text-4xl opacity-60">📖</span>
                          </div>
                          <p className={`font-sans font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Henüz tescilli kelimeniz yok!
                          </p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Okuma yaparken kelimelere tıklayıp çeviri kutusundaki <strong>"⭐ Kaydet"</strong> butonuna basarak defterinize ekleyebilirsiniz.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedVocabulary.map((vocab) => (
                            <div
                              key={vocab.id}
                              className={`p-4 rounded-2xl border transition duration-200 group flex flex-col justify-between ${
                                isDarkMode 
                                  ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80' 
                                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between">
                                  <span className="font-serif italic font-extrabold text-lg text-blue-400 group-hover:text-blue-300 capitalize">
                                    {vocab.word}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    {/* Play audio speaker */}
                                    <button
                                      onClick={() => {
                                        if (!window.speechSynthesis) return;
                                        window.speechSynthesis.cancel();
                                        const utter = new SpeechSynthesisUtterance(vocab.word);
                                        utter.lang = 'fr-FR';
                                        utter.rate = 0.85;
                                        window.speechSynthesis.speak(utter);
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        isDarkMode ? 'hover:bg-slate-850 text-slate-400 hover:text-blue-400' : 'hover:bg-slate-200 text-slate-500 hover:text-blue-600'
                                      }`}
                                      title="Telaffuz"
                                    >
                                      <span>🔊</span>
                                    </button>
                                    {/* Delete word button */}
                                    <button
                                      onClick={() => {
                                        setSavedVocabulary(prev => prev.filter(v => v.id !== vocab.id));
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        isDarkMode ? 'hover:bg-slate-850 text-slate-400 hover:text-red-400' : 'hover:bg-slate-200 text-slate-500 hover:text-red-600'
                                      }`}
                                      title="Sil"
                                    >
                                      <span>🗑️</span>
                                    </button>
                                  </div>
                                </div>

                                {/* French Definition */}
                                {vocab.frenchDefinition && (
                                  <p className={`text-[11px] leading-relaxed italic mt-1.5 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                                    {vocab.frenchDefinition}
                                  </p>
                                )}

                                {/* Turkish Translation */}
                                {vocab.translation && (
                                  <p className={`text-xs mt-2 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>
                                    🇹🇷 {vocab.translation}
                                  </p>
                                )}
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-800/20 flex justify-between items-center text-[9px] text-slate-400">
                                <span>fr-FR Prononciation</span>
                                <a
                                  href={`https://fr.wiktionary.org/wiki/${encodeURIComponent(vocab.word.toLowerCase())}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline hover:text-blue-400"
                                >
                                  Wiktionary ↗
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer stats feedback */}
                    <div className={`p-4 border-t flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 transition-colors ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-150 bg-slate-50'
                    }`}>
                      <span>TOPLAM KAYITLI SÖZCÜK: {savedVocabulary.length}</span>
                      <button
                        onClick={() => {
                          if (confirm('Kelimelerim listesindeki tüm kayıtları silmek istediğinize emin misiniz?')) {
                            setSavedVocabulary([]);
                          }
                        }}
                        disabled={savedVocabulary.length === 0}
                        className="text-[10px] text-red-500 hover:text-red-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition hover:underline"
                      >
                        Tüm Defteri Temizle
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DYNAMIC ANSWER SHEETS PANEL */}
            <CorrectionPanel
              isOpen={correctionOpen}
              onClose={() => setCorrectionOpen(false)}
              currentPageNum={currentPageNum}
            />

            {/* EXTREMELY POLISHED WINDOWS EXE CON制造业 WIZARD DIALOG */}
            <AnimatePresence>
              {exeModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl"
                  onClick={() => setExeModalOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-sans font-bold text-base text-white">Windows Masaüstü (.EXE) Sihirbazı</h3>
                          <p className="text-[11px] text-slate-400 leading-normal">Sesli interaktif ders platformunuzu bağımsız bir Windows programına dönüştürün!</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExeModalOpen(false)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5 max-h-[65vh] overflow-auto">
                      
                      {/* STEP 1 */}
                      <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-500 text-slate-950 font-mono font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">1</span>
                          <span className="font-sans font-bold text-sm text-slate-200 font-semibold">Taşınabilir Çevrimdışı Sayfa Paketini İndirin</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Aşağıdaki butona tıkladığınızda; şu ana kadar yaptığınız tüm çizimler, cevaplar, yazdığınız yazılar, kelime sesleri ve Türkçe çeviri sözlüğünüzün <strong>tamamen yerel (offline) çalışan</strong> tek bir HTML5 program dosyası bilgisayarınıza indirilecektir.
                        </p>
                        
                        <button
                          onClick={() => {
                            handleDownloadOfflineHtml();
                          }}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/10 transition flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-emerald-100 animate-pulse" />
                          <span>Masaüstü Paketini İndir (.HTML)</span>
                        </button>
                      </div>

                      {/* STEP 2 */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-500 text-slate-950 font-mono font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">2</span>
                          <span className="font-sans font-bold text-sm text-slate-200 font-semibold">Masaüstü .EXE Dosyasına Çevirme (1 Dakika)</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Yazılımınızı gerçek bir Windows masaüstü programı (çift tıklandığında açılan bağımsız <code>.exe</code>) yapmak için en çok tercih edilen yöntemi uygulayın:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold text-blue-400 block uppercase font-mono">1. YÖNTEM: WEB DESTEKLİ ARAÇ</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              İndirdiğiniz HTML dosyasını <strong>HTML Compiler</strong> veya <strong>Web2Exe</strong> programına yükleyin. Programa bir simge (ikon) atayıp doğrudan <strong>Compile</strong> tuşuna basarak saniyeler içinde <code>.exe</code> dosyanızı elde edin!
                            </p>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold text-teal-400 block uppercase font-mono">2. YÖNTEM: PORTATİF SÜRÜM</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              İndirdiğiniz dosyayı <code>index.html</code> olarak adlandırın ve bir klasöre koyun. Bu klasörü NW.js şablonuna attığınızda bilgisayarınızda internet olmadan çift tıklamayla tıkır tıkır çalışır!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RECOMMENDATION BOOK */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-[10px] font-bold text-amber-500 block uppercase font-mono tracking-wider">TAVSİYE EDİLEN KULLANIM YÖNTEMİ</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          İndirdiğiniz ders dosyasını bir USB belleğe veya masaüstüne atarak, internet bağlantısı olmadan bile tüm dilleri çalışmaya, çizim yapmaya ve sesleri dinlemeye devam edebilirsiniz.
                        </p>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Her ders kaydı yerel tarayıcı hafızasına otomatik kaydedilmeye devam eder.</span>
                      <button
                        onClick={() => setExeModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
                      >
                        Kapat
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* GLOBAL MEDIA CONTROLLER BAR */}
          <AnimatePresence>
            {playingMarker && (
              <GlobalAudioPlayer
                isPlaying={audioIsPlaying}
                audioName={playingMarker.audioName}
                currentTime={audioCurrentTime}
                duration={audioDuration}
                onPlayPause={handleAudioPlayPause}
                onStop={stopAudio}
                onSeek={handleSeek}
                volume={audioVolume}
                onVolumeChange={(v) => {
                  setAudioVolume(v);
                  if (synthSpeechRef.current) {
                    synthSpeechRef.current.volume = v;
                  }
                }}
              />
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
