/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phrase } from './types';

export const SPANISH_PHRASES: Phrase[] = [
  // --- PAST TENSE (Անցյալ ժամանակ) ---
  {
    id: 'past_1',
    spanish: 'Ayer comí una paella deliciosa en el centro de Madrid.',
    armenian: 'Երեկ ես համեղ պաելյա կերա Մադրիդի կենտրոնում։',
    tense: 'past',
    clue: 'comí (կերա), ayer (երեկ)',
    explanation: '«comí» բայը Pretérito Indefinido անցյալ կատարյալ ժամանակում է (yo - ես ձևը), իսկ «ayer» (երեկ) բառը ուղղակիորեն մատնանշում է անցյալը։'
  },
  {
    id: 'past_2',
    spanish: 'El año pasado viajamos a Barcelona por vacaciones.',
    armenian: 'Անցյալ տարի մենք արձակուրդի մեկնեցինք Բարսելոնա։',
    tense: 'past',
    clue: 'viajamos (ճանապարհորդեցինք), el año pasado (անցյալ տարի)',
    explanation: '«el año pasado» (անցյալ տարի) ժամանակային ցուցիչը մատնանշում է անցյալում ավարտված գործողություն։'
  },
  {
    id: 'past_3',
    spanish: 'Ellos estudiaron mucho para el examen de ayer por la tarde.',
    armenian: 'Նրանք շատ սովորեցին երեկ կեսօրից հետո կայանալիք քննության համար։',
    tense: 'past',
    clue: 'estudiaron (սովորեցին), de ayer (երեկվա)',
    explanation: '«estudiaron» բայը մատնանշում է անցյալում մի խումբ մարդկանց (ellos - նրանք) կողմից կատարված գործողություն։'
  },
  {
    id: 'past_4',
    spanish: 'Anoche vi una película española muy interesante.',
    armenian: 'Երեկ երեկոյան ես դիտեցի շատ հետաքրքիր իսպանական ֆիլմ։',
    tense: 'past',
    clue: 'vi (տեսա/դիտեցի), anoche (երեկ երեկոյան)',
    explanation: '«anoche» նշանակում է «երեկ երեկոյան»։ «vi» բայը ver (տեսնել/դիտել) բայի անցյալ ձևն է «yo» դերանվան համար։'
  },
  {
    id: 'past_5',
    spanish: 'La semana pasada compré este libro en una librería pequeña.',
    armenian: 'Անցյալ շաբաթ ես գնեցի այս գիրքը մի փոքրիկ գրախանութից։',
    tense: 'past',
    clue: 'compré (գնեցի), la semana pasada (անցյալ շաբաթ)',
    explanation: '«la semana pasada» (անցյալ շաբաթ) ժամանակային ցուցիչը որոշում է անցյալ ավարտված գործողությունը։'
  },
  {
    id: 'past_6',
    spanish: 'Mis abuelos vivieron en un pueblo hermoso durante treinta años.',
    armenian: 'Տատիկս ու պապիկս երեսուն տարի ապրեցին մի գեղեցիկ գյուղում։',
    tense: 'past',
    clue: 'vivieron (ապրեցին), durante treinta años (30 տարվա ընթացքում)',
    explanation: '«vivieron»-ը vivir (ապրել) բայի անցյալ ձևն է ellos (նրանք) դերանվան համար։'
  },
  {
    id: 'past_7',
    spanish: 'Ayer por la tarde llovió mucho en la ciudad.',
    armenian: 'Երեկ կեսօրից հետո քաղաքում ուժեղ անձրև եկավ։',
    tense: 'past',
    clue: 'llovió (անձրևեց), ayer por la tarde (երեկ կեսօրից հետո)',
    explanation: 'Բնության երևույթն արտահայտված է անդեմ «llovió» բայով անցյալ ժամանակում։'
  },
  {
    id: 'past_8',
    spanish: 'El coche se estropeó a mitad del camino el sábado pasado.',
    armenian: 'Մեքենան փչացավ ճանապարհի կեսին՝ անցյալ շաբաթ օրը։',
    tense: 'past',
    clue: 'se estropeó (փչացավ), el sábado pasado (անցյալ շաբաթ օրը)',
    explanation: '«se estropeó»-ն estropearse (փչանալ) անդրադարձ բայի անցյալ ձևն է։'
  },
  {
    id: 'past_9',
    spanish: 'Nosotros bebimos café con leche en la cafetería histórica.',
    armenian: 'Մենք սուրճ խմեցինք կաթով պատմական սրճարանում։',
    tense: 'past',
    clue: 'bebimos (խմեցինք)',
    explanation: 'Կանոնավոր beber (խմել) բայի -imos վերջավորությունը Pretérito Indefinido ժամանակում մատնանշում է «մենք»-ին անցյալում։'
  },
  {
    id: 'past_10',
    spanish: 'El pintor famoso pintó este cuadro en mil ochocientos noventa.',
    armenian: 'Հայտնի նկարիչը նկարեց այս պատկերը 1890 թվականին։',
    tense: 'past',
    clue: 'pintó (նկարեց), en 1890 (1890 թվականին)',
    explanation: 'Գործողությունը տեղի է ունեցել պատմության կոնկրետ տարում՝ արտահայտված «pintó» (նա նկարեց) բայով։'
  },

  // --- PRESENT TENSE (Ներկա ժամանակ) ---
  {
    id: 'present_1',
    spanish: 'Hoy el sol brilla con mucha fuerza en el cielo azul.',
    armenian: 'Այսօր արևը շատ պայծառ շողում է կապույտ երկնքում։',
    tense: 'present',
    clue: 'brilla (շողում է), hoy (այսօր)',
    explanation: '«Hoy» (այսօր) բառը մատնանշում է ներկա ժամանակը։ «brilla» բայը ներկա ժամանակի ձևով է (Presente de Indicativo)։'
  },
  {
    id: 'present_2',
    spanish: 'Estudio español todos los días porque me encanta el idioma.',
    armenian: 'Ես ամեն օր իսպաներեն եմ սովորում, որովհետև պաշտում եմ այս լեզուն։',
    tense: 'present',
    clue: 'estudio (սովորում եմ), todos los días (ամեն օր)',
    explanation: '«todos los días» (ամեն օր) արտահայտությունը ներկայացնում է ներկայում պարբերաբար կրկնվող գործողություն։'
  },
  {
    id: 'present_3',
    spanish: 'En este momento mis amigos juegan al fútbol en el parque grande.',
    armenian: 'Այս պահին ընկերներս ֆուտբոլ են խաղում մեծ զբոսայգում։',
    tense: 'present',
    clue: 'juegan (խաղում են), en este momento (այս պահին)',
    explanation: '«en este momento» (այս պահին / հենց հիմա) արտահայտությունը ուղղակիորեն ցույց է տալիս ներկա ժամանակը։'
  },
  {
    id: 'present_4',
    spanish: 'Ella escribe una carta larga para su abuelo en la cocina.',
    armenian: 'Նա խոհանոցում երկար նամակ է գրում իր պապիկին։',
    tense: 'present',
    clue: 'escribe (գրում է)',
    explanation: '«escribe» բայը (escribir-ից) օգտագործված է ներկա ժամանակի եզակի թվի երրորդ դեմքով։'
  },
  {
    id: 'present_5',
    spanish: 'Nosotros vivimos en un apartamento cómodo cerca del centro.',
    armenian: 'Մենք ապրում ենք հարմարավետ բնակարանում՝ կենտրոնին մոտ։',
    tense: 'present',
    clue: 'vivimos (ապրում ենք), cerca (մոտ)',
    explanation: '«vivimos»-ը ներկա ժամանակում մատնանշում է տվյալ կյանքի ժամանակահատվածում մշտական բնակության վիճակը։'
  },
  {
    id: 'present_6',
    spanish: 'Los niños cantan una canción alegre en la escuela de música.',
    armenian: 'Երեխաները ուրախ երգ են երգում երաժշտական դպրոցում։',
    tense: 'present',
    clue: 'cantan (երգում են)',
    explanation: '«cantan» բայը (cantar-ից) ներկա ժամանակում մատնանշում է այս պահին կատարվող գործողություն։'
  },
  {
    id: 'present_7',
    spanish: 'Siempre bebo un vaso de agua fría antes de desayunar.',
    armenian: 'Ես միշտ մեկ բաժակ սառը ջուր եմ խմում նախաճաշից առաջ։',
    tense: 'present',
    clue: 'bebo (խմում եմ), siempre (միշտ)',
    explanation: '«siempre» (միշտ) հաճախականության մակբայը զուգակցվում է ներկա ժամանակի կանոնավոր սովորությունների հետ։'
  },
  {
    id: 'present_8',
    spanish: 'El tren de Barcelona llega a la estación ahora mismo.',
    armenian: 'Բարսելոնայից եկող գնացքը հենց հիմա ժամանում է կայարան։',
    tense: 'present',
    clue: 'llega (ժամանում է), ahora mismo (հենց հիմա)',
    explanation: '«ahora mismo» նշանակում է անմիջապես ընթացիկ պահին, «llega» բայը ներկա ժամանակում է։'
  },
  {
    id: 'present_9',
    spanish: 'La cafetería moderna ofrece deliciosos pasteles caseros.',
    armenian: 'Ժամանակակից սրճարանը առաջարկում է համեղ տնական թխվածքներ։',
    tense: 'present',
    clue: 'ofrece (առաջարկում է)',
    explanation: '«ofrece» բայը (ofrecer-ից) ներկա ժամանակում սրճարանի հատկությունների մասին կանոնավոր պնդում է։'
  },
  {
    id: 'present_10',
    spanish: '¿Entiendes tú lo que dice el profesor en la clase?',
    armenian: 'Հասկանո՞ւմ ես այն, ինչ ասում է ուսուցիչը դասարանում։',
    tense: 'present',
    clue: 'entiendes (հասկանում ես), dice (ասում է)',
    explanation: 'Հարցը վերաբերում է ներկա պահին հասկանալուն։ «entender» և «decir» բայերը Presente-ով են։'
  },

  // --- FUTURE TENSE (Ապառնի ժամանակ) ---
  {
    id: 'future_1',
    spanish: 'Mañana iré a la playa hermosa con toda mi familia.',
    armenian: 'Վաղը ես կգնամ գեղեցիկ լողափ իմ ամբողջ ընտանիքի հետ։',
    tense: 'future',
    clue: 'iré (կգնամ), mañana (վաղը)',
    explanation: '«mañana» (վաղը) բառը մատնանշում է ապառնին։ «iré»-ն ir (գնալ) բայի ապառնի ժամանակի ձևն է «yo»-ի (ես) համար։'
  },
  {
    id: 'future_2',
    spanish: 'El próximo año compraremos un coche eléctrico muy moderno.',
    armenian: 'Հաջորդ տարի մենք շատ ժամանակակից էլեկտրական մեքենա կգնենք։',
    tense: 'future',
    clue: 'compraremos (կգնենք), el próximo año (հաջորդ տարի)',
    explanation: 'Ապառնի ժամանակի «el próximo año» ցուցիչը լրացվում է «compraremos» բայի Futuro Simple ձևով։'
  },
  {
    id: 'future_3',
    spanish: 'Ellos viajarán a México en las próximas vacaciones de verano.',
    armenian: 'Նրանք հաջորդ ամառային արձակուրդներին կմեկնեն Մեքսիկա։',
    tense: 'future',
    clue: 'viajarán (կճանապարհորդեն/կմեկնեն), las próximas (հաջորդ)',
    explanation: '«viajarán»-ը viajar (ճանապարհորդել) բայի ապառնի ձևն է։ «próximas» նշանակում է գալիք/հաջորդ։'
  },
  {
    id: 'future_4',
    spanish: 'La próxima semana se celebrará un gran festival en la ciudad.',
    armenian: 'Հաջորդ շաբաթ քաղաքում մեծ փառատոն կանցկացվի։',
    tense: 'future',
    clue: 'se celebrará (կանցկացվի/կտոնվի), la próxima semana (հաջորդ շաբաթ)',
    explanation: '«se celebrará» բայը ապառնի ժամանակի եզակի թվի երրորդ դեմքով է։'
  },
  {
    id: 'future_5',
    spanish: 'Estudiaré medicina en la universidad de Madrid en el futuro.',
    armenian: 'Ապագայում ես բժշկություն կուսանեմ Մադրիդի համալսարանում։',
    tense: 'future',
    clue: 'estudiaré (կուսանեմ/կսովորեմ), en el futuro (ապագայում)',
    explanation: 'Ապագային ուղղակի հղում՝ «en el futuro» և «estudiaré» բայը Futuro Simple-ով։'
  },
  {
    id: 'future_6',
    spanish: 'El próximo fin de semana descansaremos en una cabaña de madera.',
    armenian: 'Հաջորդ հանգստյան օրերին մենք կհանգստանանք փայտե տնակում։',
    tense: 'future',
    clue: 'descansaremos (կհանգստանանք), el próximo fin de semana (հաջորդ հանգստյան օրերին)',
    explanation: 'Ապառնի ժամանակի -aremos վերջավորության համադրումը descansar բայի հետ մատնանշում է մեր ծրագրերը։'
  },
  {
    id: 'future_7',
    spanish: 'Te llamaré por teléfono tan pronto como llegue al hotel.',
    armenian: 'Ես քեզ կզանգահարեմ հեռախոսով, հենց որ հասնեմ հյուրանոց։',
    tense: 'future',
    clue: 'llamaré (կզանգահարեմ)',
    explanation: '«llamaré»-ն առաջին դեմքի ապառնի ժամանակի ձևն է, նշանակում է ապագայում զանգահարելու խոստում։'
  },
  {
    id: 'future_8',
    spanish: 'Mañana por la mañana lloverá en toda la costa del norte.',
    armenian: 'Վաղը առավոտյան անձրև կգա հյուսիսային ողջ ափին։',
    tense: 'future',
    clue: 'lloverá (անձրև կգա), mañana por la mañana (վաղը առավոտյան)',
    explanation: 'Եղանակի տեսություն ապագայի համար՝ արտահայտված ապառնի ժամանակի անդեմ «lloverá» ձևով։'
  },
  {
    id: 'future_9',
    spanish: 'El domingo comeremos paella en el jardín de nuestros tíos.',
    armenian: 'Կիրակի օրը մենք պաելյա կուտենք մեր հորեղբոր/մորաքրոջ պարտեզում։',
    tense: 'future',
    clue: 'comeremos (կուտենք), el domingo (կիրակի օրը)',
    explanation: 'Գալիք կիրակի օրվա համար նախատեսված գործողությունը արտահայտված է «comeremos» բայով։'
  },
  {
    id: 'future_10',
    spanish: 'El próximo mes mis tíos me visitarán y traerán muchos regalos.',
    armenian: 'Հաջորդ ամիս իմ հորեղբայրն ու մորաքույրը կայցելեն ինձ և շատ նվերներ կբերեն։',
    tense: 'future',
    clue: 'visitarán (կայցելեն), traerán (կբերեն), el próximo mes (հաջորդ ամիս)',
    explanation: 'Ապառնի ժամանակի երկու «visitarán» և «traerán» բայերն արտահայտում են հարազատների մտադրությունները հաջորդ ամսվա համար։'
  }
];
