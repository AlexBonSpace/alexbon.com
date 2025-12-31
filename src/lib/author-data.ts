/**
 * Единый источник правды для данных автора.
 * Все остальные файлы должны импортировать данные отсюда.
 */
import type { Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

// ============================================================================
// Имя автора
// ============================================================================

export const AUTHOR_NAME: Record<Locale, string> = {
  ua: "Алекс Бон",
  ru: "Алекс Бон",
  en: "Alex Bon",
};

export const AUTHOR_REAL_NAME: Record<Locale, string> = {
  ua: "Олександр",
  ru: "Александр",
  en: "Alexander",
};

export const AUTHOR_ALTERNATE_NAMES: Record<Locale, string[]> = {
  ru: ["Alex Bon", "Александр"],
  ua: ["Alex Bon"],
  en: ["Алекс Бон"],
};

// ============================================================================
// Биография / описание
// ============================================================================

export const AUTHOR_BIO: Record<Locale, string> = {
  ru: "Меня зовут Алекс Бон. Я психолог. Живу и работаю в Киеве. Пишу истории о людях, чтобы вы могли увидеть в них себя. А на личных встречах помогаю переписать истории вашей жизни.",
  ua: "Мене звати Алекс Бон. Я психолог. Живу і працюю в Києві. Пишу історії про людей, щоб ви могли побачити в них себе. А на особистих зустрічах допомагаю переписати історії вашого життя.",
  en: "My name is Alex Bon. I'm a psychologist. I live and work in Kyiv. I write stories about people so you can see yourself in them. And in personal sessions, I help rewrite the stories of your life.",
};

export const AUTHOR_ROLE: Record<Locale, string> = {
  ua: "Психолог",
  ru: "Психолог",
  en: "Psychologist",
};

// ============================================================================
// Контакты (единые URL для всех локалей)
// ============================================================================

export const AUTHOR_CONTACTS = {
  telegram: "https://t.me/alexbon_com",
  whatsapp: "https://wa.me/+380986552222",
  viber: "viber://chat?number=+380986552222",
  googleMaps: "https://g.page/AlexBon?share",
} as const;

// ============================================================================
// Локация
// ============================================================================

export const AUTHOR_LOCATION: Record<Locale, { city: string; country: string; onlineCoverage: string }> = {
  ru: { city: "Киев", country: "Украина", onlineCoverage: "весь мир" },
  ua: { city: "Київ", country: "Україна", onlineCoverage: "весь світ" },
  en: { city: "Kyiv", country: "Ukraine", onlineCoverage: "worldwide" },
};

// ============================================================================
// Цены
// ============================================================================

export const AUTHOR_PRICING = {
  online: { UAH: 1500, EUR: 30, USD: 35 },
  inPerson: { UAH: 2000 },
} as const;

export const AUTHOR_PRICING_NOTE: Record<Locale, string> = {
  ru: "Есть места со сниженной стоимостью для тех, кто в сложной ситуации",
  ua: "Є місця зі зниженою вартістю для тих, хто у складній ситуації",
  en: "Reduced-rate slots available for those in difficult situations",
};

// ============================================================================
// Специализации
// ============================================================================

export const AUTHOR_SPECIALIZATIONS: Record<Locale, string[]> = {
  ru: [
    "тревога и тревожные расстройства",
    "выгорание и потеря смысла",
    "проблемы в отношениях и одиночество",
    "эмоциональная зависимость",
    "кризисы идентичности и поиск себя",
    "внутренний критик и перфекционизм",
    "сложности с принятием решений",
    "переживание потерь и расставаний",
    "прокрастинация и самосаботаж",
  ],
  ua: [
    "тривога та тривожні розлади",
    "вигорання та втрата сенсу",
    "проблеми у стосунках та самотність",
    "емоційна залежність",
    "кризи ідентичності та пошук себе",
    "внутрішній критик та перфекціонізм",
    "складнощі з прийняттям рішень",
    "переживання втрат та розставань",
    "прокрастинація та самосаботаж",
  ],
  en: [
    "anxiety and anxiety disorders",
    "burnout and loss of meaning",
    "relationship problems and loneliness",
    "emotional dependency",
    "identity crises and self-discovery",
    "inner critic and perfectionism",
    "difficulty making decisions",
    "processing loss and breakups",
    "procrastination and self-sabotage",
  ],
};

export const AUTHOR_DOES_NOT_WORK_WITH: Record<Locale, string[]> = {
  ru: ["острые психиатрические состояния", "химические зависимости (требуют специализированной помощи)"],
  ua: ["гострі психіатричні стани", "хімічні залежності (потребують спеціалізованої допомоги)"],
  en: ["acute psychiatric conditions", "chemical addictions (require specialized help)"],
};

// ============================================================================
// Образование и подход
// ============================================================================

export const AUTHOR_CREDENTIALS: Record<Locale, { education: string[]; approach: string }> = {
  ru: {
    education: ["Высшее психологическое образование", "Высшее экономическое образование"],
    approach: "Глубинная психология, работа через истории и метафоры",
  },
  ua: {
    education: ["Вища психологічна освіта", "Вища економічна освіта"],
    approach: "Глибинна психологія, робота через історії та метафори",
  },
  en: {
    education: ["Higher education in Psychology", "Higher education in Economics"],
    approach: "Depth psychology, working through stories and metaphors",
  },
};

export const AUTHOR_EXPERIENCE_YEARS = 10;

export const AUTHOR_LANGUAGES = ["ru", "uk", "en"] as const;

// ============================================================================
// Ссылки sameAs (для Schema.org)
// ============================================================================

export const AUTHOR_SAME_AS = [
  `${SITE_URL}/en/about/`,
  `${SITE_URL}/ru/about/`,
  `${SITE_URL}/ua/about/`,
  "https://github.com/AlexBonSpace/alexbon.com",
  "https://www.facebook.com/AlexBonSpace",
] as const;

// ============================================================================
// Консультации
// ============================================================================

export const AUTHOR_CONSULTATION = {
  freeIntroSession: true,
  freeIntroDurationMinutes: 20,
  sessionDurationMinutes: 60,
  frequency: {
    ru: "обычно раз в неделю",
    ua: "зазвичай раз на тиждень",
    en: "usually once a week",
  } as Record<Locale, string>,
  formats: {
    ru: ["Zoom", "Telegram", "Viber", "WhatsApp", "очно в Киеве"],
    ua: ["Zoom", "Telegram", "Viber", "WhatsApp", "очно в Києві"],
    en: ["Zoom", "Telegram", "Viber", "WhatsApp", "in-person in Kyiv"],
  } as Record<Locale, string[]>,
} as const;

// ============================================================================
// Хелперы для форматирования
// ============================================================================

export function formatPricingText(_locale: Locale): { online: string; inPerson: string } {
  const { online, inPerson } = AUTHOR_PRICING;
  return {
    online: `${online.UAH} грн / ${online.EUR} € / ${online.USD} $`,
    inPerson: `${inPerson.UAH} грн`,
  };
}

export function getBookingUrl(locale: Locale): string {
  return `${SITE_URL}/${locale}/about/`;
}
