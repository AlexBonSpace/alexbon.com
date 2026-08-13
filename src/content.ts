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
      heading: string;
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
    reviews?: {
      rating: string;
      count: string;
      source: string;
      link: { label: string; href: string };
    };
    process: {
      heading: string;
      paragraphs: string[];
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
      paragraphs: [
        "Помогаю распутать клубок мыслей, эмоций и чувств. Если внутри что-то запуталось - разберемся вместе.",
      ],
    },
    introduction: {
      heading: "Обо мне",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Александр, психолог и практик осознанности",
      paragraphs: [
        "Здравствуйте! Меня зовут Александр. Большинство знает меня как Алекс Бон.",
        "Мой путь начался в армии. В глухих лесах, за сотни километров от дома, я осознал парадоксальную вещь: можно жить в аду - и при этом чувствовать себя как в раю. Так я увлекся психологией, медитацией и осознанностью.",
        "Сначала это был способ помочь самому себе. Но со временем практика стала образом жизни, а затем и профессией. Я понял, что мой опыт возвращения к себе может быть полезен тем, кто запутался, выгорел или переживает трудные времена.",
        "Сегодня я помогаю найти внутреннюю опору, пройти через жизненные кризисы и выстроить здоровые, зрелые отношения - соединяя древние практики медитации и осознанности с современной психологией и психоанализом.",
        "Мой опыт - это не только теория из книг:",
        "✅ Жил в разных культурах: в Йемене, Индии и Англии, много путешествовал, медитировал в ашрамах.",
        "✅ Получил разностороннее образование: за плечами военное училище, магистратура по финансам, а также высшее психологическое образование и психоанализ.",
        "✅ Знаю бизнес изнутри: сменил около десятка профессий - от рядовых должностей до основателя собственной компании.",
        "✅ Понимаю семейные кризисы: прошел через развод и сумел сохранить теплые отношения.",
        "✅ Знаю, что значит жить одному, со всеми плюсами и минусами: последние десять лет живу один. Ну, не совсем один - со мной кошка 😊.",
        "✅ Больше 30 лет в психологии, психоанализе и практике осознанности - для меня это не хобби, а образ жизни.",
        "По-настоящему понимать людей и то, с чем они приходят, помогает именно прожитый опыт, а не дипломы.",
        'А еще я увлекаюсь ИИ - с его помощью пишу музыку и делаю видео. Мой проект - <a href="https://www.youtube.com/@AlexBonSpace" target="_blank" rel="noopener noreferrer">Alex Bon Space</a>, «глубокие звуки для темных времен». Звуки помогают вернуться в настоящий момент.',
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
      heading: "Консультации",
      reviews: {
        rating: "4.9",
        count: "28 отзывов",
        source: "Google",
        link: { label: "Посмотреть отзывы на Google Картах", href: AUTHOR_CONTACTS.googleMaps },
      },
      process: {
        heading: "",
        paragraphs: [
          "<strong>Как мы работаем.</strong> Запутанный клубок начинают распускать с одного узла - вот и мы начнем с одной темы, самой важной для вас сейчас. Уже первая встреча - это живой отклик именно на вас и вашу ситуацию: прямой, честный, неформальный разговор, где можно быть собой и говорить о наболевшем без страха осуждения.",
          "<strong>Кому подойдет.</strong> Взрослым, которые ищут развития и ясности, - без психических заболеваний и опыта приема психотропных препаратов. Если ваш запрос выходит за рамки моей работы, я честно скажу об этом уже на первой встрече.",
          "<strong>Первый шаг</strong> - бесплатная встреча-знакомство (20 минут онлайн). Без обязательств: просто понять, смогу ли я быть полезен.",
        ],
        social:
          "У меня есть несколько «социальных» мест со сниженной стоимостью - для тех, кто сейчас в трудной ситуации. Спросите меня об этом на первой встрече.",
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
        "А еще помогаю распутать то, что запуталось в вашей жизни.",
        "30 лет практикую медитацию и осознанность.",
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
      paragraphs: [
        "Допомагаю розплутати клубок думок, емоцій і почуттів. Якщо щось усередині заплуталося - розберемося разом.",
      ],
    },
    introduction: {
      heading: "Про мене",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Олександр, психолог і практик усвідомленості",
      paragraphs: [
        "Вітаю! Мене звати Олександр. Більшість знає мене як Алекс Бон.",
        "Мій шлях почався в армії. У глухих лісах, за сотні кілометрів від дому, я усвідомив парадоксальну річ: можна жити в пеклі - і при цьому почуватися як у раю. Так я захопився психологією, медитацією та усвідомленістю.",
        "Спершу це був спосіб допомогти самому собі. Але з часом практика стала способом життя, а згодом і професією. Я зрозумів, що мій досвід повернення до себе може бути корисним тим, хто заплутався, вигорів або переживає складні часи.",
        "Сьогодні я допомагаю знайти внутрішню опору, пройти через життєві кризи й вибудувати здорові, зрілі стосунки - поєднуючи давні практики медитації та усвідомленості із сучасною психологією та психоаналізом.",
        "Мій досвід - це не лише теорія з книжок:",
        "✅ Жив у різних культурах: у Ємені, Індії та Англії, багато подорожував, медитував в ашрамах.",
        "✅ Здобув різнобічну освіту: за плечима військове училище, магістратура з фінансів, а також вища психологічна освіта і психоаналіз.",
        "✅ Знаю бізнес зсередини: змінив близько десятка професій - від рядових посад до засновника власної компанії.",
        "✅ Розумію сімейні кризи: пройшов через розлучення й зумів зберегти теплі стосунки.",
        "✅ Знаю, що означає жити самому, з усіма плюсами й мінусами: останні десять років живу сам. Ну, не зовсім сам - зі мною кішка 😊.",
        "✅ Понад 30 років у психології, психоаналізі та практиці усвідомленості - для мене це не хобі, а спосіб життя.",
        "По-справжньому розуміти людей і те, з чим вони приходять, допомагає саме прожитий досвід, а не дипломи.",
        'А ще я захоплююся ШІ - з його допомогою пишу музику й роблю відео. Мій проєкт - <a href="https://www.youtube.com/@AlexBonSpace" target="_blank" rel="noopener noreferrer">Alex Bon Space</a>, «глибокі звуки для темних часів». Звуки допомагають повернутися в теперішній момент.',
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
      heading: "Консультації",
      reviews: {
        rating: "4.9",
        count: "28 відгуків",
        source: "Google",
        link: { label: "Подивитися відгуки на Google Картах", href: AUTHOR_CONTACTS.googleMaps },
      },
      process: {
        heading: "",
        paragraphs: [
          "<strong>Як ми працюємо.</strong> Як заплутаний клубок починають розплутувати з одного вузла - так і ми почнемо з однієї, найважливішої зараз теми. Уже перша зустріч - це живий відгук на вас і вашу ситуацію: пряма, щира, неформальна розмова, де можна бути собою й говорити про болюче без страху осуду.",
          "<strong>Кому підійде.</strong> Дорослим, які шукають розвитку та ясності, - без психічних захворювань і досвіду вживання психотропних препаратів. Якщо ваш запит поза межами моєї роботи, я чесно скажу про це вже на першій зустрічі.",
          "<strong>Перший крок</strong> - безкоштовна зустріч-знайомство (20 хвилин онлайн). Без зобов'язань - просто зрозуміти, чи зможу я бути корисним.",
        ],
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
        "А ще допомагаю розплутати те, що заплуталося у вашому житті.",
        "30 років практикую медитацію та усвідомленість.",
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
        "I live in Kyiv. The power sometimes goes out, creativity doesn't.",
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
        "I also help untangle what got tangled in your life.",
        "30 years of meditation and mindfulness practice.",
      ],
      aboutButton: {
        label: "About me",
        href: "/en/about/",
      },
    },
  },
};

export const getContent = (locale: LocaleKey): LandingContent => contentByLocale[locale];
