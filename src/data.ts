import { UnitInfo } from './types';

export const VALID_IDS = ["OGR123", "PROF456", "DEMO", "STUDENT1", "TEACHER1"];

export const UNIT_PAGES: UnitInfo[] = [
  { name: "Unité 0: Bienvenue !", page: 4 },
  { name: "Unité 1: Je suis...", page: 8 },
  { name: "Unité 2: Près de moi", page: 20 },
  { name: "Unité 3: Qu'est-ce qu'on mange?", page: 31 },
  { name: "Unité 4: C'est où ?", page: 43 },
  { name: "Unité 5: C'est tendance !", page: 55 },
  { name: "Unité 6: Qu'est-ce qu'on fait aujourd'hui ?", page: 67 },
  { name: "Unité 7: Chez moi", page: 79 },
  { name: "Unité 8: En forme !", page: 91 },
  { name: "Unité 9: Bonnes vacances !", page: 103 },
  { name: "Unité 10: Au travail !", page: 115 }
];
// Flat-text answers indexable by BOOK PAGE NUMBER (PDF Page - 1)
export const PAGE_CORRECTIONS: Record<string, string> = {
  "3": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 3, Bonjour, ça va ?</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. 4 - b. 1 - c. 2 - d. 3</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. Salut - b. Bonjour - c. Merci - d. Au revoir - e. À bientôt</p></div>`,
  
  "4": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 4, L'alphabet</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. Lynda - b. Martin - c. Colline - d. Klara - e. Giulian</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. Strasbourg - b. Nantes - c. Dijon - d. Bordeaux - e. Toulouse - f. Marseille</p></div>`,
  
  "5": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 5, Je m'appelle...</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. toi/Moi - b. vous - c. toi</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 5, Un, deux, trois !</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. 3 - b. 1 - c. 5 - d. 7 - e. 0 - f. 9 - g. 2 - h. 4 - i. 8 - j. 6</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. 12 - b. 3 - c. 4 - d. 15 - e. 6 - f. 21 - g. 30 - h. 27 - i. 19 - j. 8</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> J'entends /z/ : a, c, e - J'entends /n/ : b, c</p></div>`,
  
  "6": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 6, Aujourd'hui, c'est...</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> mardi - mercredi - jeudi - vendredi - dimanche</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> mars: 3 - janvier: 1 - novembre: 11 - décembre: 12 - avril: 4 - mai: 5 - février: 2 - octobre: 10 - juillet: 7 - août: 8 - septembre: 9 - juin: 6</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. le 14 Juillet - b. dimanche - c. le 21 juin - d. Demain - e. Aujourd'hui</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 6, Dans la classe</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. 5 - b. 4 - c. 3 - d. 1 - e. 2</p></div>`,
  
  "7": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 7, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les adjectifs de nationalité</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Adjectifs masculins: américain - allemand - argentin. Adjectifs féminins : sénégalaise - espagnole - colombienne</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. suisse - b. colombien - c. congolaise - d. turc - e. tunisienne</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. française - b. suédois - c. japonaise - d. grec - e. anglais</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. italienne - b. belge - c. chinoise - d. marocaine - e. coréenne - f. portugais</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>5.</span> a. 4 - b. 1 - c. 2 - d. 6 - e. 3 - f. 5</p></div>`,
  
  "8": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 8, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les articles définis le, la, l', les</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Pays masculins: Mali, Iran - Pays féminins: France, Italie - Pays au pluriel: Pays-Bas, États-Unis</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. Le - b. La - c. Le - d. L'</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. l' - b. la - c. l' - d. la - e. l'</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. le/la - b. les/l' - c. le/le</p></div>`,
  
  "9": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 9, Vocabulaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les loisirs, les nombres</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. 3 - b. 2 - c. 4 - d. 5 - e. 1</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. 7 - b. 1 - c. 3 - d. 5 - e. 4 - f. 2 - g. 6</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. quarante-six - b. trente-huit - c. soixante-cinq - d. cinquante-deux - e. trente-sept - f. cinquante et un</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. 59 - b. 68 - c. 40 - d. 31 - e. 06 69 31 42 57</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 9, Phonie-graphie</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>a.</span> 2. Nous sommes coréennes. - b. 5. J'aime le tennis. - c. 4. Il s'appelle Vincent - d. 1. Tu as quarante-deux ans. - e. 6. Il habite à Munich. - f. 3. Elle parle anglais</p></div>`,
  
  "10": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 10, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les prépositions devant les noms de villes et pays</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. à Moscou, en Russie - b. à Ottawa, au Canada - c. à Calcutta, en Inde - d. à Amsterdam, aux Pays-Bas - e. à Porto, au Portugal</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. à - b. aux - c. en - d. au - e. à - f. en</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. à Glasgow, au Royaume-Uni - b. à Rotterdam, aux Pays-Bas - c. à Bordeaux, en France - d. à Madrid, en Espagne - e. à Alger, en Algérie</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. a - b. sommes - c. as - d. sont - e. avez</p></div>`,
  
  "11": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 11, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>L'adjectif interrogatif quel</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. Quelles - b. quelle - c. Quelle - d. Quelles - e. Quels - f. quel</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. âge - b. langues - c. auteurs - d. numéro - e. ville - f. adresse</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. Quel - b. Quels - c. Quelle - d. Quelles - e. Quelle - f. Quelles</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. Quel - b. Quel - c. Quelle - d. Quelles - e. Quels - f. Quelle</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>5.</span> a. parle - b. parlons - c. parlez - d. parlent - e. parle - f. parles</p></div>`,
  
  "12": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 12, Vocabulaire</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. belge - b. camerounais - c. coréen - d. sénégalaise - e. polonais - f. allemande</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> Prénom - Adresse - Pays - Numéro de téléphone - Mail</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> L'Argentine - L'Inde - tchèque - Le Maroc - américain(e) - Le Vietnam</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. date de naissance - b. 81 - c. 99 - d. 64 - e. lieu de naissance - f. 06 76 66 89 99</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 12, Phonie-graphie</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>a.</span> 3. Il est né en Inde. - b. 4. Elle est née aux États-Unis. - c. 5. Il habite aux îles Fidji. - d. 2. Elle habite en Espagne. - e. 1. Tu habites en Algérie</p></div>`,
  
  "13": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 13, Compréhension orale</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Adam Briant</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> belge</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> à Bruxelles</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> En France</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>5.</span> EA311273</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 13, Production écrite</h4><p class='text-sm italic text-slate-500'>Exemple de production: Il s'appelle Thomas Puissat. Il est né à Anvers, en Belgique. Il a 36 ans. Il habite à Marseille, en France. Il aime la musique et le cinéma. Il parle français, italien et japonais.</p></div>`,
  
  "14": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 14, Bilan linguistique (Grammaire)</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. japonaise - b. turque - c. suédoise - d. espagnole - e. mexicaine</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. le - b. l' - c. l' - d. les - e. la</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. en - b. aux - c. à - d. au - e. en</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. 4 - b. 2 - c. 5 - d. 3 - e. 1</p></div>`,
  
  "15": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 15, Bilan linguistique (Vocabulaire)</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Raquel aime l'art, les langues, le cinéma, la musique, et le sport.</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. 42 - b. 59 - c. 31 - d. 68 - e. 51</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. Allemagne - b. États-Unis - c. Argentine - d. Maroc - e. Vietnam</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. soixante-dix-neuf - b. quatre-vingt-deux - c. quatre-vingt-douze - d. soixante-dix - e. quatre-vingts</p></div>`,
  
  "16": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 16, DELF</h4><p class='text-rose-500 font-bold text-sm mb-2'>1. Compréhension de l'oral</p><p class='mb-1'>1. C. - 2. A. - 3. B. - 4. C.</p><p class='text-rose-500 font-bold text-sm mt-3 mb-2'>2. Compréhension des écrits</p><p class='mb-1'>1. A. - 2. A. - 3. C. - 4. B. - 5. B.</p></div>`,
  
  "17": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 17, DELF</h4><p class='text-rose-500 font-bold text-sm mb-2'>3. Production écrite</p><p class='text-sm italic text-slate-500 mb-3'>Exemple: Nom: XXX - Prénom: Atsuko - Adresse: 5 rue Martainville - Ville: Rouen - Téléphone: 06 25 39 07 13 - Âge: 22 ans - Nationalité: japonaise - Langues: japonais, anglais - Aime: la musique, le café - Pays préféré: Italie</p><p class='text-rose-500 font-bold text-sm mb-2'>4. Production orale</p><p class='text-sm text-slate-600'>- Nationalité: Vous êtes française ?<br>- Âge: Vous avez quel âge ?<br>- Téléphone: Quel est votre numéro de téléphone ?<br>- Aimer: Vous aimez le cinéma ?<br>- Habiter: Dans quelle ville vous habitez ?</p></div>`,
  
  "18": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 18, Jeux</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> art - sport - langues - cinéma - musique</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> POLONAISE, FRANÇAISE, VIETNAMIENNE, ITALIENNE, CORÉENNE, INDIENNE, ESPAGNOLE, SENEGALAISE, CHINOISE, TUNISIENNE, ÉGYPTIENNE</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. l'Algérie - b. la Colombie - c. le Brésil - d. l'Allemagne - e. le Cameroun - f. les Pays-Bas</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> Réponses libres</p></div>`,
  
  "19": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 19, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les articles définis et indéfinis</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. un - b. le - c. la - d. les - e. des - f. l' - g. une</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. un - b. les - c. l' - d. le</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> un - le - un - une - L' - la - des - un - une</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. habitent - b. habite - c. habite - d. habitons - e. habitez - f. habites</p></div>`,
  
  "20": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 20, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Verbes en -er au présent</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. je - b. j' - c. n' - d. n' - e. ne - f. j'</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. 4 - b. 1 - c. 6 - d. 2 - e. 3 - f. 5</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. aime - b. adorent - c. parle - d. détestes - e. aimons - f. dansez</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. déteste - b. marche - c. adorent - d. habitez - e. danses - f. skions</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>5.</span> a. ne marchons pas - b. n'aime pas - c. ne parle pas - d. n'aiment pas - e. n'habitez pas - f. ne danses pas</p></div>`,
  
  "21": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 21, Vocabulaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les lieux, les loisirs</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. natation - b. marche - c. danser</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. appartement - b. mer - plages - c. quartier - d. instrument</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. 3 - b. 6 - c. 7 - d. 4 - e. 5 - f. 1 - g. 2</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. films - b. festival - c. guitare - d. marche - e. université</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 21, Phonie-graphie</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> J'habite à Grenoble. Je travaille à l'université. Mon collègue Mathieu joue de la guitare et ma collègue Manon joue du piano. Ils adorent la musique classique...</p></div>`,
  
  "22": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 22, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Les adjectifs possessifs</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. Ma - b. Ton - c. Sa - d. Mes - e. Tes - f. Sa</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. ses frères - b. nos enfants - c. leurs amis - d. vos filles - e. leurs fils - f. nos cousins</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. à moi - b. à moi - c. à vous - d. à toi - e. à lui/à elle - f. à vous - g. à eux/à elles - h. à nous</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. ton - b. ma - c. sa - d. son - e. mes - f. leurs</p></div>`,
  
  "23": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 23, Grammaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>Le masculin et le féminin des professions</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Masculin: infirmier - informaticien - étudiant. Féminin: professeure - actrice - coiffeuse</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> professeure - informaticien - étudiant - coiffeuse - actrice - infirmier</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. infirmier - b. coiffeur - c. informaticienne - d. étudiant - e. actrice</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. étudie - b. travaillons - c. travaillent - d. étudient - e. travaillez - f. étudies</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>5.</span> a. travaille - b. travaillent - c. étudie - d. étudient - e. travaille - f. étudies</p></div>`,
  
  "24": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 24, Vocabulaire</h4><p class='text-rose-500 font-bold text-sm mb-2'>La famille, les professions</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> Monique + Albert => Karim, Isabelle, Richard, Diane (Sarah est fille de Karim/Isabelle, Cécilia de Richard/Diane)</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. oncle - b. grands-parents - c. cousin - d. petite-fille - e. tante</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. grand-père - b. mari - c. nièce - d. petits-enfants - e. petit ami - f. mariage</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. professeure - b. fleuriste - c. coiffeur - d. informaticien - e. étudiante - f. acteur</p></div>`,
  
  "25": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 25, Compréhension écrite</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. petit ami de Fiona - b. professeur - c. n'a pas de frères et sœurs</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. Vrai - b. Vrai - c. Faux</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> La danse et la musique</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> Ils ont un piano</p></div><div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 25, Production orale</h4><p class='text-sm italic text-slate-500'>Jeux de rôle (réponses libres)</p></div>`,
  
  "26": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 26, Bilan linguistique (Grammaire)</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. une - b. les - c. l' - d. un - e. la</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. parle - b. habitons - c. skie - d. aimez - e. adorent</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. son - b. Ma - c. ses - d. leur - e. leurs</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. coiffeuse - b. fleuriste - c. actrice - d. infirmier - e. informaticienne</p></div>`,
  
  "27": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 27, Bilan linguistique (Vocabulaire)</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> quartier - guitare - festival - plage - mer</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> a. 5 - b. 4 - c. 1 - d. 2 - e. 3</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. Vrai - b. Vrai - c. Vrai - d. Faux - e. Vrai</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> a. infirmier - b. petit ami - c. petits-enfants - d. actrice - e. professeure</p></div>`,
  
  "28": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 28, DELF</h4><p class='text-rose-500 font-bold text-sm mb-2'>1. Compréhension de l'oral</p><p class='mb-1'>A: situation n°4 - B: aucune - C: situation n°2 - D: aucune - E: situation n°3 - F: situation n°1.</p><p class='text-rose-500 font-bold text-sm mt-3 mb-2'>2. Compréhension des écrits</p><p class='mb-1'>1. C. - 2. A. - 3. A. - 4. B. - 5. C.</p></div>`,
  
  "29": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 29, DELF</h4><p class='text-rose-500 font-bold text-sm mb-2'>3. Production écrite</p><p class='text-sm italic text-slate-500 mb-3'>Exemple: Bonjour, Je m'appelle Atsuko. Je suis japonaise, j'ai 22 ans. J'étudie les langues à l'université de Rouen. Mes parents habitent au Japon. J'adore la musique française...</p><p class='text-rose-500 font-bold text-sm mb-2'>4. Production orale</p><p class='text-sm text-slate-600'>- Profession: Quelle est votre profession? <br>- Quartier: Votre quartier est calme ? <br>- Adresse: Vous habitez où ?</p></div>`,
  
  "30": `<div class='mb-4'><h4 class='text-sky-600 font-bold text-base border-b border-sky-100 pb-1 mb-2'>Page 30, Jeux</h4><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>1.</span> a. célibataire - b. marié - c. mariage - d. petit ami - e. étudiant - f. enfants</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>2.</span> Mots cachés: INFORMATICIEN, PROFESSEUR etc.</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>3.</span> a. TRAVAILLENT - b. NAGE - c. DANSE - d. ETUDIES - 2. PARLONS - 3. AIMENT - 4. DETESTEZ</p><p class='mb-1'><span class='bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-xs mr-1'>4.</span> Réponses libres.</p></div>`
};

export interface MockPageContent {
  pageNumber: number;
  bookPageNumber: number;
  title: string;
  unitTitle: string;
  texts: string[];
  exercises: {
    instruction: string;
    questions: string[];
  }[];
  interactiveTips: string;
}

export const MOCK_TEXTBOOK_PAGES: Record<number, MockPageContent> = {
  // Unité 1 on page 12 (corresponding to Book Page 11)
  12: {
    pageNumber: 12,
    bookPageNumber: 11,
    title: "Se présenter en français",
    unitTitle: "Unité 1: Les Salutations",
    texts: [
      "Bonjour! Je m'appelle Jean. J'ai vingt-cinq ans et je suis étudiant de langues à Paris. J'adore voyager à travers la France pendant la saison d'été.",
      "La langue française est très belle et mélodieuse. Pour commencer à apprendre, nous devons maîtriser les salutations formelles et informelles pour saluer nos amis et collègues.",
      "Écoutez l'enregistrement audio placé par votre enseignant pour écouter la prononciation exacte du mot 'Enchanté' et de la phrase 'Comment allez-vous?'."
    ],
    exercises: [
      {
        instruction: "Exercice 1: Lisez le texte ci-dessus et associez la question à la bonne réponse.",
        questions: [
          "1. Comment ça va?  (a / b / c)",
          "2. Comment tu t'appelles?  (a / b / c)",
          "3. Tu es d'où?  (a / b / c)"
        ]
      },
      {
        instruction: "Exercice 2: Choisissez le pronom sujet correct pour compléter la salutation.",
        questions: [
          "a) Comment ____ vous appelez-vous? (tu / vous / nous)",
          "b) Salut! ____ m'appelle Julie. (je / tu / il)",
          "c) Enchanté, ____ est ravi de vous voir! (on / nous / vous)"
        ]
      }
    ],
    interactiveTips: "Cliquez sur n'importe quel mot comme 'voyager' ou 'étudiant' pour le traduire instantanément en turc avec MyMemory!"
  },

  // Unité 2 on page 24 (corresponding to Book Page 23)
  24: {
    pageNumber: 24,
    bookPageNumber: 23,
    title: "Décrire sa ville natale",
    unitTitle: "Unité 2: La Ville et Ma Maison",
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
          "- Qu'est-ce qu'ils achètent à la boulangerie locale?",
          "- Ma ville est située à quel endroit par rapport à l'Allemagne?"
        ]
      }
    ],
    interactiveTips: "Utilisez le pinceau ou le surligneur pour souligner la localisation de la cathédrale!"
  },

  // Unité 3 on page 36 (corresponding to Book Page 35)
  36: {
    pageNumber: 36,
    bookPageNumber: 35,
    title: "Ma Famille et Nos Traditions",
    unitTitle: "Unité 3: Ma Famille",
    texts: [
      "Ma famille est assez grande et nous sommes très soudés. Mon père s'appelle Pierre, il est docteur. Ma mère s'appelle Marie, elle est enseignante de musique classique.",
      "J'ai une sœur cadette qui s'appelle Sophie et un frère aîné s'appelant Lucas. Pendant le week-end, nous aimons préparer des dîners spéciaux ensemble.",
      "Ce soir, Lucas apporte une tarte aux pommes préparée par notre grand-mère chaleureuse."
    ],
    exercises: [
      {
        instruction: "Exercice 1: Complétez les phrases avec l'adjectif possessif correct.",
        questions: [
          "1. C'est ____ père (mon/ma/mes).",
          "2. Voilà ____ mère (son/sa/ses).",
          "3. Ce sont ____ enfants (leur/leurs)."
        ]
      }
    ],
    interactiveTips: "Écoutez les pistes audio pour entendre les introductions de chaque membre de la famille."
  },

  // Unité 4 on page 48 (corresponding to Book Page 47)
  48: {
    pageNumber: 48,
    bookPageNumber: 47,
    title: "Commander de la nourriture au bistrot",
    unitTitle: "Unité 4: Au Restaurant",
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
          "- Client: Je voudrais un ____ et un café au lait, s'il vous plaît.",
          "- Client: Et comme entrée, je prendrai une ____ lorraine."
        ]
      }
    ],
    interactiveTips: "Traduisez des mots comestibles comme 'nourriture', 'bœuf' ou 'pain' pour enrichir votre vocabulaire."
  },

  // Unité 5 on page 60 (corresponding to Book Page 59)
  60: {
    pageNumber: 60,
    bookPageNumber: 59,
    title: "Planifier des Vacances de Rêve",
    unitTitle: "Unité 5: Les Voyages",
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
          "- Il est recommandé d'avoir un passeport pour voyager. (Vrai / Faux)",
          "- Le Musée Matisse se situe sur la Côte d'Azur. (Vrai / Faux)"
        ]
      }
    ],
    interactiveTips: "Surlignez les conseils pratiques pour préparer un voyage réussi."
  }
};

// Generates dummy content if any other page is accessed
export function getPageContent(page: number): MockPageContent {
  if (MOCK_TEXTBOOK_PAGES[page]) {
    return MOCK_TEXTBOOK_PAGES[page];
  }
  // Interpolated dummy content
  return {
    pageNumber: page,
    bookPageNumber: page - 1,
    title: `Leçon Supplémentaire sur la Page ${page}`,
    unitTitle: `Page de Exercices Génériques ${page}`,
    texts: [
      `Ceci est la page ${page} de la plateforme. Vous pouvez dessiner, ajouter des sons et traduire les textes présents.`,
      "Le dictionnaire Wiktionary vous fournira également des informations complémentaires pour chaque mot traduit."
    ],
    exercises: [
      {
        instruction: "Exercice d'entraînement autonome:",
        questions: [
          "Q1: Pouvez-vous surligner des verbes français?",
          "Q2: Ajoutez un déclencheur audio sur cette page."
        ]
      }
    ],
    interactiveTips: "Toutes les fonctionnalités restent pleinement optionnelles et interactives !"
  };
}
