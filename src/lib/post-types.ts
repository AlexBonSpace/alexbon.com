import { defaultLocale, type Locale } from "@/i18n/config";

export const POST_TYPES = ["article", "story", "note", "okna"] as const;
export type PostType = (typeof POST_TYPES)[number];

type TypeCopy = {
  label: string;
  description: string;
};

const TYPE_COPY: Record<PostType, Record<Locale, TypeCopy>> = {
  article: {
    ru: {
      label: "Карты внутреннего мира",
      description:
        "Статьи о психологии, осознанности и устройстве нашего сознания. Разбираем устройство человеческой психики и ищем пути к осознанности, чтобы лучше понимать себя и свои реакции. Материалов: {count}.",
    },
    ua: {
      label: "Карти внутрішнього світу",
      description:
        "Статті про психологію, усвідомленість і будову нашої свідомості. Розбираємо устрій людської психіки та шукаємо шляхи до усвідомленості, щоб краще розуміти себе та свої реакції. Матеріалів: {count}.",
    },
    en: {
      label: "Inner World Maps",
      description:
        "Essays on psychology, mindfulness, and how the mind works. Exploring the structure of the human psyche and seeking paths to awareness, to better understand yourself and your reactions. Entries: {count}.",
    },
  },
  story: {
    ru: {
      label: "Истории-зеркала",
      description:
        "Художественные рассказы и притчи, в которых можно увидеть себя. Про одиночество и близость. Про страх ошибки и смелость быть несовершенным. Про кризисы и социальные маски, за которыми мы прячемся... Про то, что мы чувствуем на самом деле. Материалов: {count}.",
    },
    ua: {
      label: "Історії-дзеркала",
      description:
        "Художні оповідання та притчі, в яких можна побачити себе. Про самотність і близькість. Про страх помилки та сміливість бути недосконалим. Про кризи та соціальні маски, за якими ми ховаємось... Про те, що ми насправді відчуваємо. Матеріалів: {count}.",
    },
    en: {
      label: "Mirror Stories",
      description:
        "Literary stories and parables in which you can see yourself. About loneliness and intimacy. About the fear of making mistakes and the courage to be imperfect. About crises and the social masks we hide behind... About what we truly feel. Entries: {count}.",
    },
  },
  note: {
    ru: {
      label: "Телеграммы от Реальности",
      description:
        "Коллекция коротких инсайтов, очищенных от шума. Часть из них получена в диалогах с ИИ, часть - расшифрована из жизненного опыта. Мысли, которые сбивают автопилот, убирают шаблоны и помогают увидеть суть вещей. Материалов: {count}.",
    },
    ua: {
      label: "Телеграми від Реальності",
      description:
        "Колекція коротких інсайтів, очищених від шуму. Частина з них отримана в діалогах з ШІ, частина - розшифрована з життєвого досвіду. Думки, що збивають автопілот, прибирають шаблони й допомагають побачити суть речей. Матеріалів: {count}.",
    },
    en: {
      label: "Telegrams from Reality",
      description:
        "A collection of brief insights, distilled from noise. Some emerged from dialogues with AI, others were decoded from life experience. Thoughts that disrupt autopilot, break patterns, and help see through to the essence of things. Entries: {count}.",
    },
  },
  okna: {
    ru: {
      label: "Окна во двор",
      description:
        "Свободный поток. Тексты, которые удивляют, вдохновляют или заставляют улыбнуться. Короткие истории и эссе обо всем на свете. Материалов: {count}.",
    },
    ua: {
      label: "Вікна у двір",
      description:
        "Вільний потік. Тексти, що дивують, надихають або змушують усміхнутися. Короткі історії та есе про все на світі. Матеріалів: {count}.",
    },
    en: {
      label: "Windows to the Yard",
      description:
        "Free flow. Texts that surprise, inspire, or make you smile. Short stories and essays about everything under the sun. Entries: {count}.",
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
