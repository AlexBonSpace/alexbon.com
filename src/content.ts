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
    steps: Array<{
      title: string;
      description: string;
      icon?: "video" | "calendar";
      details?: Array<{
        text: string;
        subtext?: string;
        icon?: "monitor" | "building";
      }>;
    }>;
    reviewsText: string;
    reviewsLink: { label: string; href: string };
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
    tagline: "Короткие истории и эссе. Чтобы сбить автопилот.",
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
        "Привет, меня зовут Александр. Я психолог. Если отбросить термины — человек, который помогает другим распутывать клубки мыслей, эмоций и чувств.",
        "Я верю, что распутывать эти клубки можно двумя способами.",
        "Первый — через истории, в которых вдруг узнаёшь себя. Именно для этого я веду этот блог.",
        "Второй — в тишине личной сессии, через живой диалог. Если что-то из прочитанного откликнулось или у вас есть свой «клубок», который пора распутать — добро пожаловать!",
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
        { label: "Написать в Telegram", href: "https://t.me/alexbon_com", icon: "telegram" },
        { label: "Написать в WhatsApp", href: "https://wa.me/+380986552222", icon: "whatsapp" },
        { label: "Написать в Viber", href: "viber://chat?number=+380986552222", icon: "viber" },
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
      heading: "Моя история (для тех, кто хочет знать больше)",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Алекс Бон смотрит в камеру, опершись руками на стол",
      paragraphs: [
        "Психологом я стал не по плану. Мой путь начался неожиданно — в армии. В тяжёлых условиях, в глухих лесах за сотни километров от дома я понял парадоксальную вещь: можно находиться в аду, но чувствовать себя как в раю. Вселенная любит шутить, подбрасывая озарения в самых неожиданных местах :)",
        'Я много путешествовал, жил в Йемене, Индии и Англии, медитировал в ашрамах, получил два высших образования (экономическое и психологическое), поработал в разных сферах и на разных должностях — от "принеси-подай" до учредителя и руководителя собственной компании.',
        "Был женат, развелся, сохранил хорошие отношения и последние десять лет живу один. Ну, если быть точным, не совсем один — со мной кошка. Этот опыт не сделал меня гуру, но научил замечать в чужих историях ниточки, которые когда-то проходили через мою собственную.",
      ],
    },
    personalWork: {
      heading: "Как устроена личная работа (для тех, кому нужна конкретика)",
      steps: [
        {
          title: "Первый шаг — встреча-знакомство (бесплатно)",
          icon: "video",
          description:
            "20 минут онлайн. Это не консультация, а простой человеческий разговор, чтобы понять, комфортно ли нам друг с другом и смогу ли я помочь именно в вашей ситуации. Никаких обязательств.",
        },
        {
          title: "Глубокая работа (если решим продолжить)",
          icon: "calendar",
          description: "Встречи обычно проходят раз в неделю, длительность — 1 час.",
          details: [
            {
              icon: "monitor",
              text: "Онлайн (Zoom, Telegram, Viber, WhatsApp) — 1500 грн / 30 € / 35 $",
              subtext:
                "Я держу несколько «социальных мест» со сниженной стоимостью для тех, кто сейчас в сложной ситуации. Спросите меня об этом на первой встрече.",
            },
            {
              icon: "building",
              text: "В кабинете (Киев, м. Левобережная) — 2000 грн",
            },
          ],
        },
      ],
      reviewsText: "Отзывы о моей работе можно посмотреть на",
      reviewsLink: { label: "Google картах >>>", href: "https://g.page/AlexBon?share" },
    },
    footerNote:
      'P.S. "Алекс Бон" — это мой псевдоним, так проще меня найти в интернете :) А реальная фамилия пусть остается для скучных бумаг.',
    blog: {
      badge: "Отражения",
      heroTitle: "Отражения",
      metaTitle: "Отражения — короткие рассказы и истории | Алекс Бон",
      heroDescription: [
        "Меня зовут Алекс Бон. Я психолог и писатель из Украины.",
        "Пишу тихие истории в громком мире, чтобы вы могли услышать себя.",
        "Живу с кошкой, практикую дзен и учу нейросети эмпатии.",
        "Добро пожаловать!",
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
    tagline: "Короткі історії та есе. Щоб збити автопілот.",
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
        "Привіт, мене звати Олександр. Я психолог. Якщо відкинути терміни — людина, яка допомагає іншим розплутувати клубки думок, емоцій і почуттів.",
        "Я вірю, що розплутувати ці клубки можна двома способами.",
        "Перший — через історії, в яких раптом впізнаєш себе. Саме для цього я веду цей блог.",
        "Другий — у тиші особистої сесії, через живий діалог. Якщо щось із прочитаного відгукнулося або у вас є свій «клубок», який час розплутати — ласкаво просимо!",
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
        { label: "Написати в Telegram", href: "https://t.me/alexbon_com", icon: "telegram" },
        { label: "Написати в WhatsApp", href: "https://wa.me/+380986552222", icon: "whatsapp" },
        { label: "Написати у Viber", href: "viber://chat?number=+380986552222", icon: "viber" },
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
      heading: "Моя історія (для тих, хто хоче знати більше)",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Олександр у затишній студії, спершись на стіл",
      paragraphs: [
        "Психологом я став не за планом. Мій шлях почався несподівано — в армії. У важких умовах, у глухих лісах за сотні кілометрів від дому я зрозумів парадоксальну річ: можна перебувати в пеклі, але відчувати себе як у раю. Всесвіт любить жартувати, підкидаючи осяяння у найнеочікуваніших місцях :)",
        'Я багато подорожував, жив у Ємені, Індії та Англії, медитував в ашрамах, здобув дві вищі освіти (економічну та психологічну), попрацював у різних сферах і на різних посадах — від "принеси-подай" до засновника і керівника власної компанії.',
        "Був одружений, розлучився, зберіг добрі стосунки і останні десять років живу сам. Якщо точніше, не зовсім сам — зі мною кішка. Цей досвід не зробив мене гуру, але навчив помічати в чужих історіях ниточки, які колись проходили через мою власну.",
      ],
    },
    personalWork: {
      heading: "Як влаштована особиста робота (для тих, кому потрібна конкретика)",
      steps: [
        {
          title: "Перший крок — зустріч-знайомство (безкоштовно)",
          icon: "video",
          description:
            "20 хвилин онлайн. Це не консультація, а проста людська розмова, щоб зрозуміти, чи комфортно нам один з одним і чи зможу я допомогти саме у вашій ситуації. Жодних зобов'язань.",
        },
        {
          title: "Глибока робота (якщо вирішимо продовжити)",
          icon: "calendar",
          description: "Зустрічі зазвичай проходять раз на тиждень, тривалість — 1 година.",
          details: [
            {
              icon: "monitor",
              text: "Онлайн (Zoom, Telegram, Viber, WhatsApp) — 1500 грн / 30 € / 35 $",
              subtext:
                "Я тримаю декілька «соціальних місць» зі зниженою вартістю для тих, хто зараз у складній ситуації. Запитайте мене про це на першій зустрічі.",
            },
            {
              icon: "building",
              text: "У кабінеті (Київ, м. Лівобережна) — 2000 грн",
            },
          ],
        },
      ],
      reviewsText: "Відгуки про мою роботу можна подивитися на",
      reviewsLink: { label: "Google картах >>>", href: "https://g.page/AlexBon?share" },
    },
    footerNote:
      'P.S. "Алекс Бон" — це мій псевдонім, так простіше мене знайти в інтернеті :) А справжнє прізвище нехай залишається для нудних паперів.',
    blog: {
      badge: "Відображення",
      heroTitle: "Відображення",
      metaTitle: "Відображення — короткі розповіді та історії | Алекс Бон",
      heroDescription: [
        "Мене звати Алекс Бон. Я психолог і письменник з України.",
        "Пишу тихі історії в гучному світі, щоб ви могли почути себе.",
        "Живу з кішкою, практикую дзен і вчу нейромережі емпатії.",
        "Ласкаво просимо!",
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
    tagline: "Short stories and essays. To break the autopilot.",
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
        "Hi, my name is Alexander. I'm a psychologist. If we drop the terminology, I'm simply someone who helps untangle the knots of thoughts, emotions, and feelings.",
        "I believe there are two ways to do this.",
        "The first is through stories where you suddenly recognize yourself. That is exactly why I run this blog.",
        "The second is through dialogue. While I offer professional therapy only in Russian and Ukrainian, I am always open to a friendly chat in English. If a story resonated with you and you want to share your thoughts — feel free to message me. I use translation tools to communicate, so let's keep it to text :)",
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
        { label: "Message on Telegram", href: "https://t.me/alexbon_com", icon: "telegram" },
        { label: "Message on WhatsApp", href: "https://wa.me/+380986552222", icon: "whatsapp" },
        { label: "Message on Viber", href: "viber://chat?number=+380986552222", icon: "viber" },
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
      heading: "My Story",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Alex Bon looking at the camera, leaning on a table",
      paragraphs: [
        "Becoming a psychologist wasn't part of the plan. My path began unexpectedly — in the army. In harsh conditions, in remote forests hundreds of kilometers from home, I realized a paradoxical thing: you can be in hell but feel like you're in paradise. The universe loves to joke, dropping insights in the most unexpected places.",
        "I traveled a lot, lived in Yemen, India, and England, meditated in ashrams, and earned two degrees (economics and psychology). I've worked in various fields — from running errands to being the founder of my own company.",
        "I was married, divorced, maintained good relationships, and have been living on my own for the last ten years. Well, not entirely alone — I have a cat. This experience hasn't made me a guru, but it taught me to notice the threads in other people's stories that are woven into my own life too.",
      ],
    },
    footerNote:
      'P.S. "Alex Bon" is my pen name — it\'s easier to find me online :) My real surname is reserved for boring paperwork.',
    blog: {
      badge: "Reflections",
      heroTitle: "Reflections",
      metaTitle: "Reflections — short stories and tales | Alex Bon",
      heroDescription: [
        "My name is Alex Bon. I'm a psychologist and writer from Ukraine.",
        "I write quiet stories in a loud world so you can hear yourself.",
        "I live with a cat, practice Zen, and teach neural networks empathy.",
        "Welcome!",
      ],
      aboutButton: {
        label: "About me",
        href: "/en/about/",
      },
    },
  },
};

export const getContent = (locale: LocaleKey): LandingContent => contentByLocale[locale];
