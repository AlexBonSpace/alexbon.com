import { defaultLocale, type Locale } from "@/i18n/config";

export const POST_TYPES = ["article", "story", "note", "okno"] as const;
export type PostType = (typeof POST_TYPES)[number];

type TypeCopy = {
  label: string;
  description: string;
};

const TYPE_COPY: Record<PostType, Record<Locale, TypeCopy>> = {
  article: {
    ru: {
      label: "Карты внутреннего мира",
      description: "Статьи о психологии, осознанности и устройстве нашего сознания. Материалов: {count}.",
    },
    ua: {
      label: "Карти внутрішнього світу",
      description: "Глибокі статті про психологію, усвідомленість і будову нашої свідомості. Матеріалів: {count}.",
    },
    en: {
      label: "Inner World Maps",
      description: "In-depth essays on psychology, mindfulness, and how the mind works. Entries: {count}.",
    },
  },
  story: {
    ru: {
      label: "Истории-зеркала",
      description:
        "Художественные рассказы и психологические притчи в которых ты можешь узнать себя. Материалов: {count}.",
    },
    ua: {
      label: "Історії-дзеркала",
      description: "Художні оповідання та психологічні притчі в яких ти можеш впізнати себе. Матеріалів: {count}.",
    },
    en: {
      label: "Mirror Stories",
      description: "Literary stories and psychological parables in which you can recognize yourself. Entries: {count}.",
    },
  },
  note: {
    ru: {
      label: "Искры и проблески",
      description: "Короткие заметки и афоризмы, которые помогают увидеть привычное по-новому. Материалов: {count}.",
    },
    ua: {
      label: "Іскри й проблиски",
      description: "Короткі нотатки й афоризми, що допомагають побачити звичне по-новому. Матеріалів: {count}.",
    },
    en: {
      label: "Sparks and Glimmers",
      description: "Short notes and aphorisms that help you see the familiar in a new light. Entries: {count}.",
    },
  },
  okno: {
    ru: {
      label: "Окно во двор",
      description:
        "Свободный поток. Тексты, которые удивляют, вдохновляют или заставляют улыбнуться. Материалов: {count}.",
    },
    ua: {
      label: "Вікно у двір",
      description: "Вільний потік. Тексти, що дивують, надихають або змушують усміхнутися. Матеріалів: {count}.",
    },
    en: {
      label: "Window to the Yard",
      description: "Free flow. Texts that surprise, inspire, or make you smile. Entries: {count}.",
    },
  },
};

function resolveCopy(locale: Locale, type: PostType) {
  return TYPE_COPY[type][locale] ?? TYPE_COPY[type][defaultLocale];
}

function formatCount(locale: Locale, count: number) {
  const formatter = new Intl.NumberFormat(locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US");
  return formatter.format(count);
}

export function isValidPostType(value: string): value is PostType {
  return POST_TYPES.includes(value as PostType);
}

export function getPostTypeLabel(locale: Locale, type: PostType): string {
  return resolveCopy(locale, type).label;
}

export function getPostTypeDescription(locale: Locale, type: PostType, count: number): string {
  const template = resolveCopy(locale, type).description;
  return template.replace("{count}", formatCount(locale, count));
}

export function getPostTypeShortDescription(locale: Locale, type: PostType): string {
  const template = resolveCopy(locale, type).description;
  return template.replace(/ Материалов: \{count\}\.| Матеріалів: \{count\}\.| Entries: \{count\}\./, "");
}

export function buildPostTypePath(locale: Locale, type: PostType): string {
  return `/${locale}${buildPostTypeRelativePath(type)}`;
}

export function buildPostTypeRelativePath(type: PostType): string {
  return `/blog/type/${type}/`;
}

export function getPostTypePageTitle(locale: Locale, type: PostType, page: number): string {
  const label = getPostTypeLabel(locale, type);
  const formattedPage = formatCount(locale, page);
  if (locale === "en") {
    return `${label} — page ${formattedPage}`;
  }
  if (locale === "ua") {
    return `${label} — сторінка ${formattedPage}`;
  }
  return `${label} — страница ${formattedPage}`;
}

export function getPostTypePageDescription(locale: Locale, type: PostType, count: number, page: number): string {
  const base = getPostTypeDescription(locale, type, count);
  const formattedPage = formatCount(locale, page);
  if (locale === "en") {
    return `${base} Page ${formattedPage}.`;
  }
  if (locale === "ua") {
    return `${base} Сторінка ${formattedPage}.`;
  }
  return `${base} Страница ${formattedPage}.`;
}
