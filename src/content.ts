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
  footerNote: string;
  blog: {
    badge: string;
    heroTitle: string;
    metaTitle: string;
    heroDescription: string | string[];
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
    tagline: "Короткие рассказы и истории без фильтров. Чтобы сбить автопилот.",
    metaTitle: "Алекс Бон | Короткие рассказы и истории без фильтров",
    metaDescription:
      "Меня зовут Алекс Бон. Я психолог, писатель и хранитель этого пространства. Истории, которые вы найдете здесь — это отражения. Нашего мира и нас самих.",
    hero: {
      title: "Короткие рассказы и истории без фильтров.",
      paragraphs: [],
    },
    introduction: {
      heading: "Знакомство",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Александр, писатель и психолог",
      paragraphs: [
        "Привет, меня зовут Александр. Я психолог, писатель и хранитель этого пространства.",
        "Истории, которые вы найдете здесь — это отражения. Нашего мира и нас самих. Это способ посмотреть со стороны и хотя бы немного сбить автопилот, в котором мы существуем большую часть времени.",
        "Тексты созданы в тандеме с ИИ. Смыслы, чувства и сюжеты — мои, огранка — нейросети.",
        "Если вы захотите обсудить написанное или просто поговорить, как человек с человеком, я всегда на связи:",
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
        { label: "Написать в Telegram", href: "https://t.me/alexbon_com" },
        { label: "Написать в WhatsApp", href: "https://wa.me/+380986552222" },
        { label: "Написать в Viber", href: "viber://chat?number=+380986552222" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "Отзывы о моей работе можно посмотреть на Google Картах:",
        button: {
          label: "Отзывы на Google Картах",
          href: "https://g.page/AlexBon?share",
        },
      },
    },
    story: {
      heading: "Немного обо мне",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Алекс Бон смотрит в камеру, опершись руками на стол",
      paragraphs: [
        "Психологом я стал не по плану. Мой путь начался неожиданно — в армии. В тяжёлых условиях, в глухих лесах за сотни километров от дома я понял парадоксальную вещь: можно находиться в аду, но чувствовать себя как в раю. Вселенная любит шутить, подбрасывая озарения в самых неожиданных местах :)",
        'Я много путешествовал, жил в Йемене, Индии и Англии, медитировал в ашрамах, получил два высших образования (экономическое и психологическое), поработал в разных сферах и на разных должностях — от "принеси-подай" до учредителя и руководителя собственной компании.',
        "Был женат, развелся, сохранил хорошие отношения и последние десять лет живу один. Ну, если быть точным, не совсем один — со мной кошка. Этот опыт не сделал меня гуру, но научил замечать в чужих историях ниточки, которые когда-то проходили через мою собственную.",
      ],
    },
    footerNote:
      'P.S. "Алекс Бон" — это мой псевдоним, так проще меня найти в интернете :) А реальная фамилия пусть остается для скучных бумаг.',
    blog: {
      badge: "Отражения",
      heroTitle: "Отражения",
      metaTitle: "Отражения — короткие рассказы и истории | Алекс Бон",
      heroDescription: [],
    },
  },
  ua: {
    locale: "ua",
    brandName: "Алекс Бон",
    tagline: "Короткі розповіді та історії без фільтрів. Щоб збити автопілот.",
    metaTitle: "Алекс Бон | Короткі розповіді та історії без фільтрів",
    metaDescription:
      "Мене звати Алекс Бон. Я психолог, письменник і хранитель цього простору. Історії, які ви знайдете тут — це відображення. Нашого світу і нас самих.",
    hero: {
      title: "Короткі розповіді та історії без фільтрів.",
      paragraphs: [],
    },
    introduction: {
      heading: "Знайомство",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Олександр, письменник і психолог",
      paragraphs: [
        "Привіт, мене звати Олександр. Я психолог, письменник і хранитель цього простору.",
        "Історії, які ви знайдете тут — це відображення. Нашого світу і нас самих. Це спосіб подивитися збоку і хоча б трохи збити автопілот, у якому ми існуємо більшу частину часу.",
        "Тексти створені в тандемі з ШІ. Сенси, почуття й сюжети — мої, огранка — нейромережі.",
        "Якщо захочете обговорити написане або просто поговорити, як людина з людиною, я завжди на зв'язку:",
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
        { label: "Написати в Telegram", href: "https://t.me/alexbon_com" },
        { label: "Написати в WhatsApp", href: "https://wa.me/+380986552222" },
        { label: "Написати у Viber", href: "viber://chat?number=+380986552222" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "Відгуки про мою роботу можна подивитися на Google Картах:",
        button: {
          label: "Відгуки на Google Картах",
          href: "https://g.page/AlexBon?share",
        },
      },
    },
    story: {
      heading: "Трохи про мене",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Олександр у затишній студії, спершись на стіл",
      paragraphs: [
        "Психологом я став не за планом. Мій шлях почався несподівано — в армії. У важких умовах, у глухих лісах за сотні кілометрів від дому я зрозумів парадоксальну річ: можна перебувати в пеклі, але відчувати себе як у раю. Всесвіт любить жартувати, підкидаючи осяяння у найнеочікуваніших місцях :)",
        'Я багато подорожував, жив у Ємені, Індії та Англії, медитував в ашрамах, здобув дві вищі освіти (економічну та психологічну), попрацював у різних сферах і на різних посадах — від "принеси-подай" до засновника і керівника власної компанії.',
        "Був одружений, розлучився, зберіг добрі стосунки і останні десять років живу сам. Якщо точніше, не зовсім сам — зі мною кішка. Цей досвід не зробив мене гуру, але навчив помічати в чужих історіях ниточки, які колись проходили через мою власну.",
      ],
    },
    footerNote:
      'P.S. "Алекс Бон" — це мій псевдонім, так простіше мене знайти в інтернеті :) А справжнє прізвище нехай залишається для нудних паперів.',
    blog: {
      badge: "Відображення",
      heroTitle: "Відображення",
      metaTitle: "Відображення — короткі розповіді та історії | Алекс Бон",
      heroDescription: [],
    },
  },
  en: {
    locale: "en",
    brandName: "Alex Bon",
    tagline: "Short stories and tales without filters. To break the autopilot.",
    metaTitle: "Alex Bon | Short stories and tales without filters",
    metaDescription:
      "My name is Alex Bon. I am a psychologist, writer, and the keeper of this space. The stories you find here are reflections. Of our world and of ourselves.",
    hero: {
      title: "Short stories and tales without filters.",
      paragraphs: [],
    },
    introduction: {
      heading: "Introduction",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Alexander, writer and psychologist",
      paragraphs: [
        "Hi, my name is Alexander. I am a psychologist, writer, and the keeper of this space.",
        "The stories you find here are reflections. Of our world and of ourselves. A way to look from the outside and at least slightly break the autopilot in which we exist most of the time.",
        "The texts are created in tandem with AI. The meanings, feelings, and plots are mine; the polish is the neural network's.",
        "If you want to discuss what you've read or just talk, person to person, I'm always available (I write in English better than I speak it, so let's keep to text):",
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
        { label: "Message on Telegram", href: "https://t.me/alexbon_com" },
        { label: "Message on WhatsApp", href: "https://wa.me/+380986552222" },
        { label: "Message on Viber", href: "viber://chat?number=+380986552222" },
      ],
    },
    testimonials: {
      heading: "",
      items: [],
      cta: {
        text: "You can see reviews of my work on Google Maps:",
        button: {
          label: "Reviews on Google Maps",
          href: "https://g.page/AlexBon?share",
        },
      },
    },
    story: {
      heading: "A bit about me",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Alex Bon looking at the camera, leaning on a table",
      paragraphs: [
        "I didn't become a psychologist by plan. My path began unexpectedly — in the army. In harsh conditions, in remote forests hundreds of kilometers from home, I understood a paradoxical thing: you can be in hell but feel like you're in paradise. The universe loves to joke, dropping insights in the most unexpected places :)",
        'I traveled a lot, lived in Yemen, India, and England, meditated in ashrams, got two higher education degrees (economics and psychology), worked in various fields and positions — from "fetch and carry" to founder and director of my own company.',
        "I was married, divorced, maintained good relationships, and have lived alone for the last ten years. Well, to be precise, not entirely alone — I have a cat. This experience hasn't made me a guru, but it taught me to notice in other people's stories the threads that once ran through my own.",
      ],
    },
    footerNote:
      'P.S. "Alex Bon" is my pen name — it\'s easier to find me online :) My real surname is reserved for boring paperwork.',
    blog: {
      badge: "Reflections",
      heroTitle: "Reflections",
      metaTitle: "Reflections — short stories and tales | Alex Bon",
      heroDescription: [],
    },
  },
};

export const getContent = (locale: LocaleKey): LandingContent => contentByLocale[locale];
