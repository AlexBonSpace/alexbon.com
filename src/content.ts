import { AUTHOR_BIO, AUTHOR_CONTACTS } from "@/lib/author-data";

export type LocaleKey = "ru" | "ua" | "en";

export type DetailIconKey = "video" | "donate" | "lock";

export interface LandingContent {
  locale: LocaleKey;
  brandName: string;
  tagline: string;
  taglineSubtext?: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    title: string;
    paragraphs: string[];
  };
  introduction: {
    heading: string;
    image: string;
    imageAlt: string;
    paragraphs: string[];
    bulletList?: {
      afterParagraph: string;
      items: string[];
    };
    highlight?: {
      title: string;
      paragraphs: string[];
    };
  };
  process: {
    heading: string;
    intro: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  details: {
    heading: string;
    items: Array<{
      icon: DetailIconKey;
      title: string;
      description: string;
    }>;
  };
  faq: {
    heading: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  invitation: {
    heading: string;
    body: string;
    buttons: Array<{
      label: string;
      href: string;
      icon?: "telegram" | "whatsapp" | "viber";
    }>;
  };
  testimonials: {
    heading: string;
    intro?: string;
    items: string[];
    cta?: {
      text: string;
      button: {
        label: string;
        href: string;
      };
    };
  };
  story: {
    heading: string;
    image: string;
    imageAlt: string;
    paragraphs: string[];
  };
  personalWork?: {
    heading: string;
    directions: Array<{
      heading: string;
      description: string;
      reviews?: string;
      reviewsLink?: { label: string; href: string };
    }>;
    process: {
      heading: string;
      step1: string;
      social: string;
    };
    pricing: {
      heading: string;
      online: string;
      office: string;
    };
  };
  footerNote: string;
  blog: {
    badge: string;
    heroTitle: string;
    metaTitle: string;
    heroDescription: string | string[];
    aboutButton?: {
      label: string;
      href: string;
    };
  };
}

export const languageLinks: Array<{
  label: string;
  locale: LocaleKey;
  href: string;
}> = [
  { label: "UA", locale: "ua", href: "/" },
  { label: "RU", locale: "ru", href: "/ru" },
  { label: "EN", locale: "en", href: "/en" },
];

export const contentByLocale: Record<LocaleKey, LandingContent> = {
  ru: {
    locale: "ru",
    brandName: "Алекс Бон",
    tagline: "Алекс Бон | Отражения",
    metaTitle: "Алекс Бон | Отражения - истории, музыка, осознанность",
    metaDescription: AUTHOR_BIO.ru,
    hero: {
      title: "Короткие рассказы и истории без фильтров.",
      paragraphs: [],
    },
    introduction: {
      heading: "Обо мне",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Александр, психолог, писатель, музыкант",
      paragraphs: [
        "Привет, меня зовут Александр. Большинство знает меня как Алекс Бон.",
        "Мне сложно уместить себя в одно слово. Психолог? Да. Писатель? Тоже. Музыкант? С недавних пор. Вайб-кодер? Тоже я :)",
        "Мой путь начался в армии. В глухих лесах за сотни километров от дома я понял парадоксальную вещь: можно жить в аду, но чувствовать себя как в раю. С тех пор я ищу это состояние - и помогаю находить его другим.",
        'Я много путешествовал - жил в Йемене, Индии и Англии, медитировал в ашрамах. Более 30 лет практикую осознанность - это не хобби, а способ жить. Получил два высших образования (экономическое и психологическое), поработал на всех должностях - от "принеси-подай" до учредителя собственной компании. Был женат, развелся, сохранил хорошие отношения. Последние десять лет живу один. Ну, не совсем один - со мной кошка.',
        'В какой-то момент я понял, что звук делает то же, что годами я делал словами: возвращает человека в настоящий момент. Так родился <a href="https://www.youtube.com/@AlexBonSpace" target="_blank" rel="noopener noreferrer">Alex Bon Space</a> - музыкальный проект с лозунгом "deep sounds for dark times" (глубокие звуки для темных времен). Послушать можно на <a href="https://open.spotify.com/artist/6oFimUSI5K66NlDyUQyIyU" target="_blank" rel="noopener noreferrer">Spotify</a>, <a href="https://music.apple.com/us/artist/alex-bon-space/1879505673" target="_blank" rel="noopener noreferrer">Apple Music</a> и других платформах.',
        "Живу в Киеве. Свет иногда гаснет, но творчество - нет :)",
      ],
    },
    process: {
      heading: "",
      intro: "",
      steps: [],
    },
    details: {
      heading: "",
      items: [],
    },
    faq: {
      heading: "",
      items: [],
    },
    invitation: {
      heading: "",
      body: "",
      buttons: [
        { label: "Написать в Telegram", href: AUTHOR_CONTACTS.telegram, icon: "telegram" },
        { label: "Написать в WhatsApp", href: AUTHOR_CONTACTS.whatsapp, icon: "whatsapp" },
        { label: "Написать в Viber", href: AUTHOR_CONTACTS.viber, icon: "viber" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "Отзывы о моей работе можно посмотреть на Google Картах:",
        button: {
          label: "Отзывы на Google Картах",
          href: AUTHOR_CONTACTS.googleMaps,
        },
      },
    },
    story: {
      heading: "",
      image: "",
      imageAlt: "",
      paragraphs: [],
    },
    personalWork: {
      heading: "Сотрудничество со мной",
      directions: [
        {
          heading: "Психология и осознанность",
          description:
            "Помогаю распутывать клубки мыслей, эмоций и чувств. Более 30 лет практики медитации и осознанности, психологическое образование, сотрудничество с <a href='https://tomalogy.com/' target='_blank' rel='noopener noreferrer'>Центром томалогии</a>, а также обширный собственный опыт - все это научило меня понимать других через себя. Если что-то внутри запуталось - разберемся вместе.",
          reviews: "29 отзывов · рейтинг 4.9",
          reviewsLink: { label: "Посмотреть на Google Картах >>>", href: AUTHOR_CONTACTS.googleMaps },
        },
        {
          heading: "ИИ в творчестве",
          description:
            "Не теория, а реальная практика. Промпт-инжиниринг, генерация изображений, видео, голоса, вайб-кодинг, автоматизация творческих задач и т.д. Если вам нужно встроить ИИ в творческий процесс или у вас есть вопросы по работе с ИИ - напишите, и я сделаю все возможное, чтобы вы и ИИ нашли общий язык.",
        },
      ],
      process: {
        heading: "Процесс нашего сотрудничества",
        step1:
          "Первый шаг - бесплатная встреча-знакомство (20 минут онлайн), чтобы понять, смогу ли я помочь. Никаких обязательств.",
        social:
          "Я держу несколько «социальных мест» со сниженной стоимостью для тех, кто сейчас в сложной ситуации. Спросите меня об этом на первой встрече.",
      },
      pricing: {
        heading: "Стоимость консультаций",
        online: "Онлайн (Zoom, Telegram, Viber, WhatsApp) - 2000 грн / 40 € / 45 $",
        office: "В кабинете (Киев, м. Левобережная) - 2500 грн / 50 € / 57 $",
      },
    },
    footerNote: "",
    blog: {
      badge: "Отражения",
      heroTitle: "Отражения",
      metaTitle: "Алекс Бон | Отражения - истории, музыка, осознанность",
      heroDescription: [
        "Меня зовут Алекс Бон. Живу в Киеве.",
        "Пишу истории о людях - чтобы вы увидели в них себя.",
        "Пишу музыку для людей - чтобы вы почувствовали момент.",
        "Пишу код - потому что идеи не должны оставаться в голове.",
        "А еще помогаю распутать то, что запуталось в вашей жизни.",
        "30 лет практикую медитацию и осознанность.",
        "Свет может погаснуть, но творчество - нет.",
      ],
      aboutButton: {
        label: "Обо мне",
        href: "/ru/about/",
      },
    },
  },
  ua: {
    locale: "ua",
    brandName: "Алекс Бон",
    tagline: "Алекс Бон | Відображення",
    metaTitle: "Алекс Бон | Відображення - історії, музика, усвідомленість",
    metaDescription: AUTHOR_BIO.ua,
    hero: {
      title: "Короткі розповіді та історії без фільтрів.",
      paragraphs: [],
    },
    introduction: {
      heading: "Про мене",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Олександр, психолог, письменник, музикант",
      paragraphs: [
        "Привіт, мене звати Олександр. Більшість знає мене як Алекс Бон.",
        "Мені складно вмістити себе в одне слово. Психолог? Так. Письменник? Теж. Музикант? З недавніх пір. Вайб-кодер? Теж я :)",
        "Мій шлях почався в армії. У глухих лісах за сотні кілометрів від дому я зрозумів парадоксальну річ: можна жити в пеклі, але відчувати себе як у раю. З того часу я шукаю цей стан - і допомагаю знаходити його іншим.",
        'Я багато подорожував - жив у Ємені, Індії та Англії, медитував в ашрамах. Понад 30 років практикую усвідомленість - це не хобі, а спосіб жити. Здобув дві вищі освіти (економічну та психологічну), попрацював на різних посадах - від "принеси-подай" до засновника власної компанії. Був одружений, розлучився, зберіг добрі стосунки. Останні десять років живу сам. Ну, не зовсім сам - зі мною кішка.',
        'В якийсь момент я зрозумів, що звук робить те саме, що роками я робив словами: повертає людину в теперішній момент. Так народився <a href="https://www.youtube.com/@AlexBonSpace" target="_blank" rel="noopener noreferrer">Alex Bon Space</a> - музичний проєкт з гаслом "deep sounds for dark times" (глибокі звуки для темних часів). Послухати можна на <a href="https://open.spotify.com/artist/6oFimUSI5K66NlDyUQyIyU" target="_blank" rel="noopener noreferrer">Spotify</a>, <a href="https://music.apple.com/us/artist/alex-bon-space/1879505673" target="_blank" rel="noopener noreferrer">Apple Music</a> та інших платформах.',
        "Живу в Києві. Світло іноді гасне, але творчість - ні :)",
      ],
    },
    process: {
      heading: "",
      intro: "",
      steps: [],
    },
    details: {
      heading: "",
      items: [],
    },
    faq: {
      heading: "",
      items: [],
    },
    invitation: {
      heading: "",
      body: "",
      buttons: [
        { label: "Написати в Telegram", href: AUTHOR_CONTACTS.telegram, icon: "telegram" },
        { label: "Написати в WhatsApp", href: AUTHOR_CONTACTS.whatsapp, icon: "whatsapp" },
        { label: "Написати у Viber", href: AUTHOR_CONTACTS.viber, icon: "viber" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "Відгуки про мою роботу можна подивитися на Google Картах:",
        button: {
          label: "Відгуки на Google Картах",
          href: AUTHOR_CONTACTS.googleMaps,
        },
      },
    },
    story: {
      heading: "",
      image: "",
      imageAlt: "",
      paragraphs: [],
    },
    personalWork: {
      heading: "Співпраця зі мною",
      directions: [
        {
          heading: "Психологія та усвідомленість",
          description:
            "Допомагаю розплутувати клубки думок, емоцій і почуттів. Понад 30 років практики медитації та усвідомленості, психологічна освіта, співпраця з <a href='https://tomalogy.com/' target='_blank' rel='noopener noreferrer'>Центром томалогії</a>, а також великий власний досвід - все це навчило мене розуміти інших через себе. Якщо щось усередині заплуталося - розберемося разом.",
          reviews: "29 відгуків · рейтинг 4.9",
          reviewsLink: { label: "Подивитися на Google Картах >>>", href: AUTHOR_CONTACTS.googleMaps },
        },
        {
          heading: "ШІ у творчості",
          description:
            "Не теорія, а реальна практика. Промпт-інжиніринг, генерація зображень, відео, голосу, вайб-кодинг, автоматизація творчих завдань тощо. Якщо вам потрібно вбудувати ШІ у творчий процес або у вас є питання щодо роботи з ШІ - напишіть, і я зроблю все можливе, щоб ви і ШІ знайшли спільну мову.",
        },
      ],
      process: {
        heading: "Процес нашої співпраці",
        step1:
          "Перший крок - безкоштовна зустріч-знайомство (20 хвилин онлайн), щоб зрозуміти, чи зможу я допомогти. Жодних зобов'язань.",
        social:
          "Я тримаю декілька «соціальних місць» зі зниженою вартістю для тих, хто зараз у складній ситуації. Запитайте мене про це на першій зустрічі.",
      },
      pricing: {
        heading: "Вартість консультацій",
        online: "Онлайн (Zoom, Telegram, Viber, WhatsApp) - 2000 грн / 40 € / 45 $",
        office: "У кабінеті (Київ, м. Лівобережна) - 2500 грн / 50 € / 57 $",
      },
    },
    footerNote: "",
    blog: {
      badge: "Відображення",
      heroTitle: "Відображення",
      metaTitle: "Алекс Бон | Відображення - історії, музика, усвідомленість",
      heroDescription: [
        "Мене звати Алекс Бон. Живу в Києві.",
        "Пишу історії про людей - щоб ви побачили в них себе.",
        "Пишу музику для людей - щоб ви відчули момент.",
        "Пишу код - бо ідеї не повинні залишатися в голові.",
        "А ще допомагаю розплутати те, що заплуталося у вашому житті.",
        "30 років практикую медитацію та усвідомленість.",
        "Світло може згаснути, але творчість - ні.",
      ],
      aboutButton: {
        label: "Про мене",
        href: "/ua/about/",
      },
    },
  },
  en: {
    locale: "en",
    brandName: "Alex Bon",
    tagline: "Alex Bon | Reflections",
    metaTitle: "Alex Bon | Reflections - stories, music, mindfulness",
    metaDescription: AUTHOR_BIO.en,
    hero: {
      title: "Short stories and tales without filters.",
      paragraphs: [],
    },
    introduction: {
      heading: "About me",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Alexander, psychologist, writer, musician",
      paragraphs: [
        "Hi, my name is Alexander. Most people know me as Alex Bon.",
        "It's hard to fit me into one word. Psychologist? Yes. Writer? That too. Musician? Recently. Vibe coder? Also me :)",
        "My path started in the army. In remote forests hundreds of kilometers from home, I realized a paradoxical thing: you can live in hell but feel like you're in paradise. Since then, I've been searching for that state - and helping others find it.",
        "I traveled a lot - lived in Yemen, India, and England, meditated in ashrams. I've been practicing mindfulness for over 30 years - it's not a hobby, it's a way of life. I earned two degrees (economics and psychology), worked in every position from \"fetch this\" to founding my own company. Was married, divorced, kept good relationships. For the last ten years I've been living on my own. Well, not entirely - I have a cat.",
        'At some point I realized that sound does the same thing I had been doing with words for years: it brings a person back to the present moment. That\'s how <a href="https://www.youtube.com/@AlexBonSpace" target="_blank" rel="noopener noreferrer">Alex Bon Space</a> was born - a music project with the motto "deep sounds for dark times." Listen on <a href="https://open.spotify.com/artist/6oFimUSI5K66NlDyUQyIyU" target="_blank" rel="noopener noreferrer">Spotify</a>, <a href="https://music.apple.com/us/artist/alex-bon-space/1879505673" target="_blank" rel="noopener noreferrer">Apple Music</a>, and other platforms.',
        "I live in Kyiv. The power sometimes goes out, but creativity doesn't :)",
      ],
    },
    process: {
      heading: "",
      intro: "",
      steps: [],
    },
    details: {
      heading: "",
      items: [],
    },
    faq: {
      heading: "",
      items: [],
    },
    invitation: {
      heading: "",
      body: "",
      buttons: [
        { label: "Message on Telegram", href: AUTHOR_CONTACTS.telegram, icon: "telegram" },
        { label: "Message on WhatsApp", href: AUTHOR_CONTACTS.whatsapp, icon: "whatsapp" },
        { label: "Message on Viber", href: AUTHOR_CONTACTS.viber, icon: "viber" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "You can see reviews of my work on Google Maps:",
        button: {
          label: "Reviews on Google Maps",
          href: AUTHOR_CONTACTS.googleMaps,
        },
      },
    },
    story: {
      heading: "",
      image: "",
      imageAlt: "",
      paragraphs: [],
    },
    footerNote: "",
    blog: {
      badge: "Reflections",
      heroTitle: "Reflections",
      metaTitle: "Alex Bon | Reflections - stories, music, mindfulness",
      heroDescription: [
        "My name is Alex Bon. I live in Kyiv.",
        "I write stories about people - so you can see yourself in them.",
        "I make music for people - so you can feel the moment.",
        "I write code - because ideas shouldn't stay in your head.",
        "I also help untangle what got tangled in your life.",
        "30 years of meditation and mindfulness practice.",
        "The power may go out, but creativity doesn't stop.",
      ],
      aboutButton: {
        label: "About me",
        href: "/en/about/",
      },
    },
  },
};

export const getContent = (locale: LocaleKey): LandingContent => contentByLocale[locale];
