import type { StateGuide, StateSlug } from '@/types/content';

/**
 * State guides. Descriptive copy is editorial; airports, capitals and seasons
 * are general knowledge but should still be checked by the owner before launch.
 */
export const STATES: StateGuide[] = [
  {
    slug: 'assam',
    name: 'Assam',
    shortName: 'Assam',
    tagline: 'Rhinos, river islands & tea country',
    capital: 'Dispur (Guwahati)',
    bestTime: 'Nov – Apr',
    bestTimeNote: 'Kaziranga’s safari zones usually open from November and close for the monsoon.',
    season: 'bbbggmmmgbbb',
    airports: ['Guwahati (Lokpriya Gopinath Bordoloi)', 'Jorhat', 'Dibrugarh', 'Tezpur'],
    languages: ['Assamese', 'Bodo', 'Bengali', 'English', 'Hindi'],
    cover: {
      scene: 'river',
      alt: 'Illustration of the Brahmaputra flowing past low green hills',
      tint: ['#E9C9A8', '#2F6B5E'],
    },
    description:
      'The gateway to the Northeast. Assam pairs the wide Brahmaputra with grassland national parks, rolling tea estates and Majuli — one of the world’s largest river islands and the heart of Vaishnavite satra culture.',
    attractions: [
      {
        name: 'Kaziranga National Park',
        location: 'Golaghat / Nagaon',
        timeNeeded: '2 days',
        interests: ['wildlife'],
        image: {
          scene: 'forest',
          alt: 'Illustration of tall grassland and a forest edge at dawn',
          tint: ['#F3D9B4', '#2F6B5E'],
        },
      },
      {
        name: 'Majuli island',
        location: 'Majuli district',
        timeNeeded: '2 days',
        interests: ['culture', 'spiritual'],
        image: {
          scene: 'river',
          alt: 'Illustration of a river island at sunset',
          tint: ['#F3C9B4', '#3E7A6B'],
        },
      },
      {
        name: 'Kamakhya Temple',
        location: 'Guwahati',
        timeNeeded: 'Half day',
        interests: ['spiritual'],
        image: {
          scene: 'monastery',
          alt: 'Illustration of a hilltop temple',
          tint: ['#F7EBD9', '#6E8C93'],
        },
      },
      {
        name: 'Tea estates of Upper Assam',
        location: 'Jorhat / Dibrugarh',
        timeNeeded: '1–2 days',
        interests: ['tea'],
        image: {
          scene: 'tea',
          alt: 'Illustration of rows of tea bushes',
          tint: ['#E6EEF0', '#3E7A6B'],
        },
      },
    ],
    food: ['Masor tenga (sour fish curry)', 'Pitha rice cakes', 'Khar', 'Assam tea, of course'],
    crafts: ['Muga & eri silk', 'Majuli mask-making', 'Bell-metal from Sarthebari', 'Cane & bamboo'],
    seo: {
      title: 'Assam travel guide — Kaziranga, Majuli & tea estates',
      description: 'Plan a trip to Assam: when to go, how to reach, Kaziranga safaris, Majuli island and tea country.',
    },
  },
  {
    slug: 'meghalaya',
    name: 'Meghalaya',
    shortName: 'Meghalaya',
    tagline: 'Abode of the clouds',
    capital: 'Shillong',
    bestTime: 'Oct – May',
    bestTimeNote: 'Waterfalls are at their fullest just after the monsoon; trails are safest in the dry months.',
    season: 'bbbggmmmgbbb',
    airports: ['Shillong (Umroi)', 'Guwahati (≈ 3 hours by road)'],
    languages: ['Khasi', 'Garo', 'English'],
    cover: {
      scene: 'hills',
      alt: 'Illustration of misty layered hills',
      tint: ['#E6EEF0', '#2E4A50'],
    },
    description:
      'Rolling plateaus, the world’s wettest villages, crystal-clear rivers and living root bridges grown by Khasi and Jaintia communities over generations.',
    attractions: [
      {
        name: 'Living root bridges',
        location: 'Nongriat, East Khasi Hills',
        timeNeeded: '1–2 days',
        interests: ['trekking', 'culture'],
        image: {
          scene: 'forest',
          alt: 'Illustration of a rainforest gorge',
          tint: ['#DCE3E0', '#2F6B5E'],
        },
      },
      {
        name: 'Dawki & Umngot river',
        location: 'West Jaintia Hills',
        timeNeeded: '1 day',
        interests: ['trekking'],
        image: {
          scene: 'lake',
          alt: 'Illustration of a clear river between hills',
          tint: ['#E6EEF0', '#6E8C93'],
        },
      },
      {
        name: 'Mawlynnong village',
        location: 'East Khasi Hills',
        timeNeeded: 'Half day',
        interests: ['culture'],
        image: {
          scene: 'village',
          alt: 'Illustration of a hill village',
          tint: ['#F7EBD9', '#3E7A6B'],
        },
      },
      {
        name: 'Sohra (Cherrapunji)',
        location: 'East Khasi Hills',
        timeNeeded: '1–2 days',
        interests: ['trekking'],
        image: {
          scene: 'hills',
          alt: 'Illustration of cliffs and a waterfall',
          tint: ['#DCE3E0', '#2E4A50'],
        },
      },
    ],
    food: ['Jadoh (rice with pork)', 'Dohneiiong', 'Tungrymbai', 'Pumaloi'],
    crafts: ['Khasi weaving', 'Cane & bamboo baskets', 'Ryndia (eri) shawls'],
    seo: {
      title: 'Meghalaya travel guide — root bridges, Shillong & Sohra',
      description: 'Plan a trip to Meghalaya: living root bridges, Dawki, Sohra, Shillong, when to go and how to reach.',
    },
  },
  {
    slug: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    shortName: 'Arunachal',
    tagline: 'Land of the dawn-lit mountains',
    capital: 'Itanagar',
    bestTime: 'Oct – Apr',
    bestTimeNote: 'High passes such as Sela can close after heavy snow — keep a buffer day.',
    season: 'ggbbgmmmgbbg',
    airports: ['Itanagar (Donyi Polo, Hollongi)', 'Tezpur (Assam) for Tawang', 'Dibrugarh (Assam) for the east'],
    languages: ['Nyishi', 'Adi', 'Monpa', 'Apatani', 'Hindi', 'English'],
    cover: {
      scene: 'monastery',
      alt: 'Illustration of a mountain monastery under snow peaks',
      tint: ['#E6EEF0', '#2E4A50'],
    },
    description:
      'India’s largest Northeastern state: Himalayan passes, Tawang’s great monastery, the Apatani rice valley of Ziro and more than two dozen major tribes.',
    attractions: [
      {
        name: 'Tawang Monastery',
        location: 'Tawang',
        timeNeeded: '2 days',
        interests: ['spiritual', 'culture'],
        image: {
          scene: 'monastery',
          alt: 'Illustration of a hillside monastery',
          tint: ['#F3C9B4', '#2E4A50'],
        },
      },
      {
        name: 'Ziro valley',
        location: 'Lower Subansiri',
        timeNeeded: '2 days',
        interests: ['culture'],
        image: {
          scene: 'village',
          alt: 'Illustration of a valley of rice fields',
          tint: ['#E6EEF0', '#3E7A6B'],
        },
      },
      {
        name: 'Sela Pass',
        location: 'West Kameng / Tawang',
        timeNeeded: 'En route',
        interests: ['trekking'],
        image: {
          scene: 'lake',
          alt: 'Illustration of a high-altitude lake',
          tint: ['#DCE3E0', '#6E8C93'],
        },
      },
      {
        name: 'Dirang & Sangti valley',
        location: 'West Kameng',
        timeNeeded: '1 day',
        interests: ['culture'],
        image: {
          scene: 'river',
          alt: 'Illustration of a mountain river valley',
          tint: ['#F7EBD9', '#2F6B5E'],
        },
      },
    ],
    food: ['Thukpa', 'Zan (millet porridge)', 'Pika pila (bamboo-shoot pickle)', 'Apong rice beer'],
    crafts: ['Monpa handmade paper', 'Apatani weaving', 'Wood carving'],
    seo: {
      title: 'Arunachal Pradesh travel guide — Tawang, Ziro & permits',
      description: 'Plan a trip to Arunachal Pradesh: Tawang, Ziro, Sela Pass, Inner Line Permits and the best time to visit.',
    },
  },
  {
    slug: 'nagaland',
    name: 'Nagaland',
    shortName: 'Nagaland',
    tagline: 'Hornbills, hill villages & warrior heritage',
    capital: 'Kohima',
    bestTime: 'Oct – May',
    bestTimeNote: 'Early December brings the Hornbill Festival — book stays months ahead.',
    season: 'bbbbgmmmgbbb',
    airports: ['Dimapur', 'Guwahati (longer drive)'],
    languages: ['Nagamese', 'English', 'Angami', 'Ao', 'Sumi', 'and many more'],
    cover: {
      scene: 'village',
      alt: 'Illustration of a ridge-top village',
      tint: ['#F3C9B4', '#2E4A50'],
    },
    description: 'Sixteen-plus Naga tribes, ridge-top villages and the Dzükou valley. Kohima’s Hornbill Festival brings them together every December.',
    attractions: [
      {
        name: 'Kisama Heritage Village',
        location: 'Near Kohima',
        timeNeeded: '1 day',
        interests: ['culture'],
        image: {
          scene: 'festival',
          alt: 'Illustration of a festival ground',
          tint: ['#F3C9B4', '#B5462E'],
        },
      },
      {
        name: 'Dzükou valley',
        location: 'Kohima district',
        timeNeeded: '2 days',
        interests: ['trekking'],
        image: {
          scene: 'hills',
          alt: 'Illustration of rolling meadow hills',
          tint: ['#E6EEF0', '#3E7A6B'],
        },
      },
      {
        name: 'Khonoma green village',
        location: 'Kohima district',
        timeNeeded: '1 day',
        interests: ['culture'],
        image: {
          scene: 'village',
          alt: 'Illustration of terraced village fields',
          tint: ['#F7EBD9', '#2F6B5E'],
        },
      },
    ],
    food: ['Smoked pork with bamboo shoot', 'Axone (fermented soybean)', 'Galho', 'King chilli chutney'],
    crafts: ['Naga shawls', 'Beadwork', 'Wood carving'],
    seo: {
      title: 'Nagaland travel guide — Kohima, Dzükou & Hornbill Festival',
      description: 'Plan a trip to Nagaland: Hornbill Festival, Dzükou valley, Khonoma, permits and how to reach.',
    },
  },
  {
    slug: 'manipur',
    name: 'Manipur',
    shortName: 'Manipur',
    tagline: 'The jewelled land around Loktak',
    capital: 'Imphal',
    bestTime: 'Oct – Mar',
    season: 'bbbggmmmgbbb',
    airports: ['Imphal (Bir Tikendrajit)'],
    languages: ['Meiteilon (Manipuri)', 'English', 'Tangkhul', 'Thadou'],
    cover: {
      scene: 'lake',
      alt: 'Illustration of a lake with floating islands',
      tint: ['#E6EEF0', '#6E8C93'],
    },
    description: 'Loktak lake and its floating phumdis, classical Manipuri dance, polo’s birthplace and Ima Keithel — a market run entirely by women.',
    attractions: [
      {
        name: 'Loktak lake & Keibul Lamjao',
        location: 'Bishnupur',
        timeNeeded: '1 day',
        interests: ['wildlife'],
        image: {
          scene: 'lake',
          alt: 'Illustration of a calm lake',
          tint: ['#F3D9B4', '#6E8C93'],
        },
      },
      {
        name: 'Ima Keithel',
        location: 'Imphal',
        timeNeeded: 'Half day',
        interests: ['culture'],
        image: {
          scene: 'village',
          alt: 'Illustration of a market town',
          tint: ['#F7EBD9', '#B5462E'],
        },
      },
      {
        name: 'Ukhrul highlands',
        location: 'Ukhrul',
        timeNeeded: '2 days',
        interests: ['trekking'],
        image: {
          scene: 'hills',
          alt: 'Illustration of highland ridges',
          tint: ['#E6EEF0', '#2E4A50'],
        },
      },
    ],
    food: ['Eromba', 'Singju', 'Chak-hao kheer (black rice)', 'Kangshoi'],
    crafts: ['Moirang phee weaving', 'Longpi black pottery', 'Kauna (water-reed) craft'],
    seo: {
      title: 'Manipur travel guide — Loktak lake, Imphal & Ukhrul',
      description: 'Plan a trip to Manipur: Loktak lake, Ima Keithel, Ukhrul, permits and the best time to visit.',
    },
  },
  {
    slug: 'mizoram',
    name: 'Mizoram',
    shortName: 'Mizoram',
    tagline: 'Blue hills & bamboo forests',
    capital: 'Aizawl',
    bestTime: 'Oct – Mar',
    season: 'bbbggmmmgbbb',
    airports: ['Aizawl (Lengpui)'],
    languages: ['Mizo', 'English'],
    cover: {
      scene: 'hills',
      alt: 'Illustration of steep blue hills',
      tint: ['#E6EEF0', '#6E8C93'],
    },
    description:
      'A quiet, hospitable hill state of steep ridges, bamboo forest and a strong community spirit, with Phawngpui — the Blue Mountain — on the Myanmar border.',
    attractions: [
      {
        name: 'Aizawl ridge-city',
        location: 'Aizawl',
        timeNeeded: '1 day',
        interests: ['culture'],
        image: {
          scene: 'village',
          alt: 'Illustration of a city along a ridge',
          tint: ['#F7EBD9', '#2E4A50'],
        },
      },
      {
        name: 'Phawngpui (Blue Mountain)',
        location: 'Lawngtlai',
        timeNeeded: '2–3 days',
        interests: ['trekking'],
        image: {
          scene: 'hills',
          alt: 'Illustration of a high blue ridge',
          tint: ['#DCE3E0', '#2E4A50'],
        },
      },
      {
        name: 'Reiek hills',
        location: 'Mamit district',
        timeNeeded: 'Half day',
        interests: ['trekking'],
        image: {
          scene: 'forest',
          alt: 'Illustration of forested hills',
          tint: ['#E6EEF0', '#2F6B5E'],
        },
      },
    ],
    food: ['Bai (vegetable stew)', 'Vawksa rep (smoked pork)', 'Sawhchiar'],
    crafts: ['Puan weaving', 'Bamboo & cane work'],
    seo: {
      title: 'Mizoram travel guide — Aizawl, Reiek & Phawngpui',
      description: 'Plan a trip to Mizoram: Aizawl, Reiek, Phawngpui, permits and when to go.',
    },
  },
  {
    slug: 'tripura',
    name: 'Tripura',
    shortName: 'Tripura',
    tagline: 'Palaces, rock carvings & lake temples',
    capital: 'Agartala',
    bestTime: 'Oct – Mar',
    season: 'bbbggmmmgbbb',
    airports: ['Agartala (Maharaja Bir Bikram)'],
    languages: ['Bengali', 'Kokborok', 'English'],
    cover: {
      scene: 'lake',
      alt: 'Illustration of a palace on a lake',
      tint: ['#F3C9B4', '#3E7A6B'],
    },
    description: 'Royal palaces, the lake palace of Neermahal and the giant rock-cut reliefs of Unakoti — Tripura is compact, green and easy to explore.',
    attractions: [
      {
        name: 'Ujjayanta Palace',
        location: 'Agartala',
        timeNeeded: 'Half day',
        interests: ['culture'],
        image: {
          scene: 'monastery',
          alt: 'Illustration of a white palace',
          tint: ['#F7EBD9', '#6E8C93'],
        },
      },
      {
        name: 'Neermahal',
        location: 'Melaghar',
        timeNeeded: 'Half day',
        interests: ['culture'],
        image: {
          scene: 'lake',
          alt: 'Illustration of a lake palace',
          tint: ['#F3C9B4', '#6E8C93'],
        },
      },
      {
        name: 'Unakoti rock carvings',
        location: 'Unakoti district',
        timeNeeded: '1 day',
        interests: ['spiritual', 'culture'],
        image: {
          scene: 'forest',
          alt: 'Illustration of a forest hillside',
          tint: ['#E6EEF0', '#2F6B5E'],
        },
      },
    ],
    food: ['Mui borok', 'Berma (fermented fish)', 'Chakhwi'],
    crafts: ['Risa weaving', 'Bamboo & cane furniture'],
    seo: {
      title: 'Tripura travel guide — Agartala, Neermahal & Unakoti',
      description: 'Plan a trip to Tripura: Ujjayanta Palace, Neermahal, Unakoti and how to reach.',
    },
  },
  {
    slug: 'sikkim',
    name: 'Sikkim',
    shortName: 'Sikkim',
    tagline: 'Kanchenjunga’s monastery kingdom',
    capital: 'Gangtok',
    bestTime: 'Mar – May, Oct – Nov',
    bestTimeNote: 'North Sikkim roads close after landslides in the monsoon; spring brings rhododendrons.',
    season: 'ggbbbmmmgbbg',
    airports: ['Pakyong (limited flights)', 'Bagdogra, West Bengal (≈ 4–5 hours by road)'],
    languages: ['Nepali', 'Sikkimese (Bhutia)', 'Lepcha', 'English'],
    cover: {
      scene: 'monastery',
      alt: 'Illustration of a monastery with snow peaks behind',
      tint: ['#E6EEF0', '#2E4A50'],
    },
    description:
      'A small Himalayan state with big views of Kanchenjunga, Buddhist monasteries such as Rumtek and Pemayangtse, and high lakes like Tsomgo and Gurudongmar.',
    attractions: [
      {
        name: 'Tsomgo lake & Nathula',
        location: 'East Sikkim',
        timeNeeded: '1 day',
        interests: ['trekking'],
        image: {
          scene: 'lake',
          alt: 'Illustration of a glacial lake',
          tint: ['#E6EEF0', '#6E8C93'],
        },
      },
      {
        name: 'Rumtek Monastery',
        location: 'Near Gangtok',
        timeNeeded: 'Half day',
        interests: ['spiritual'],
        image: {
          scene: 'monastery',
          alt: 'Illustration of a monastery courtyard',
          tint: ['#F3C9B4', '#2E4A50'],
        },
      },
      {
        name: 'Lachung & Yumthang valley',
        location: 'North Sikkim',
        timeNeeded: '2 days',
        interests: ['trekking'],
        image: {
          scene: 'hills',
          alt: 'Illustration of an alpine valley',
          tint: ['#DCE3E0', '#2F6B5E'],
        },
      },
      {
        name: 'Pelling & Pemayangtse',
        location: 'West Sikkim',
        timeNeeded: '1–2 days',
        interests: ['spiritual', 'culture'],
        image: {
          scene: 'monastery',
          alt: 'Illustration of a ridge monastery',
          tint: ['#F7EBD9', '#2E4A50'],
        },
      },
    ],
    food: ['Momos', 'Thukpa', 'Phagshapa', 'Sel roti'],
    crafts: ['Thangka painting', 'Carpet weaving', 'Lepcha weaving'],
    seo: {
      title: 'Sikkim travel guide — Gangtok, Tsomgo & North Sikkim',
      description: 'Plan a trip to Sikkim: Gangtok, Tsomgo lake, North Sikkim, protected-area permits and the best time to visit.',
    },
  },
];

export const STATE_SLUGS = STATES.map((s) => s.slug);

export function getState(slug: string): StateGuide | undefined {
  return STATES.find((s) => s.slug === slug);
}

export function stateName(slug: StateSlug): string {
  return getState(slug)?.name ?? slug;
}
