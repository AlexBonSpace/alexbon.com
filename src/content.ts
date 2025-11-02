export type LocaleKey = "ru" | "ua" | "en";

export type DetailIconKey = "video" | "donate" | "lock";

export interface LandingContent {
  locale: LocaleKey;
  brandName: string;
  tagline: string;
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
  lighthouse?: {
    heading: string;
    paragraphs: string[];
    bullets: Array<
      | string
      | {
          label: string;
          description: string;
          href: string;
          external?: boolean;
        }
    >;
    closing: string;
  };
  door?: {
    heading: string;
    paragraphs: string[];
    cta?: {
      text: string;
      contacts: Array<{
        label: string;
        href: string;
        external?: boolean;
      }>;
    };
  };
  footerNote: string;
  blog: {
    badge: string;
    heroTitle: string;
    heroDescription: string;
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
    tagline: "Просто место, чтобы выдохнуть и разобраться",
    metaTitle: "Психолог онлайн Алекс Бон | Человек, который слушает и слышит",
    metaDescription:
      "Запутался(ась), устал(а) или просто хочешь выдохнуть? Я не лечу, а слушаю. Предлагаю безопасное пространство для разговора и бесплатную 20-минутную встречу, чтобы познакомиться.",
    hero: {
      title: "Просто место, чтобы выдохнуть и разобраться.",
      paragraphs: [],
    },
    introduction: {
      heading: "Знакомство",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Александр, психолог онлайн",
      paragraphs: [
        "Привет, меня зовут Александр.",
        "Я психолог. Но если отбросить термины, я - человек, который помогает другим распутывать клубки мыслей и чувств.",
        "Моя работа - не ставить тебе диагнозы и не рассказывать, как нужно жить. Моя работа - создать пространство, в котором ты сам(а) сможешь услышать себя. Возможно, впервые за долгое время.",
      ],
      highlight: {
        title: "Что я делаю?",
        paragraphs: [
          "Помогаю распутать тот самый клубок в голове. Без заумных терминов, нравоучений, эзотерической пыли и копания в твоих детских обидах (разве что это действительно важно сейчас).",
          "Мы просто берем твою конкретную ситуацию, твой затык, твою боль — и работаем с этим. Практически. Честно. Эффективно.",
          "Я не буду тебя \"лечить\" — я буду разговаривать. Как человек с человеком.",
        ],
      },
    },
    process: {
      heading: "Как всё проходит? Очень просто.",
      intro:
        "Я верю, что исцеление начинается не с диагнозов, а с честного разговора. Поэтому я убрал все лишние сложности, чтобы твой путь к себе оставался понятным и спокойным. Вот карта нашего возможного путешествия.",
      steps: [
        {
          title: "Шаг 1. Встреча-знакомство (бесплатно)",
          description:
            "**Что это?** 20 минут онлайн. Это не консультация, а простой человеческий разговор, чтобы мы познакомились.\n\n**Зачем это?** Чтобы ты мог(ла) задать любые вопросы, почувствовать, комфортно ли тебе со мной, и понять, тот ли я человек, которому ты готов(а) доверять.\n\n**Какие обязательства?** Никаких. Если почувствуешь, что это \"не твоё\", это нормально. Моя задача — помочь тебе встретить своего проводника.",
        },
        {
          title: "Шаг 2. Глубокая работа (если ты решишь)",
          description:
            "**Что это?** Если после знакомства ты почувствуешь: \"да, это оно\", договоримся о полноценных встречах. Обычно они проходят раз в неделю, но мы подберём ритм, комфортный именно тебе.\n\n**Зачем это?** Чтобы не просто \"поговорить\", а спокойно, шаг за шагом распутывать твой клубок и приближаться к жизни, которую ты хочешь для себя построить.",
        },
      ],
    },
    details: {
      heading: "Более подробно о наших встречах",
      items: [
        {
          icon: "video",
          title: "Формат",
          description:
            "Онлайн (Zoom, Telegram, WhatsApp, Viber). Тебе достаточно найти уютное место, где тебя никто не потревожит.",
        },
        {
          icon: "donate",
          title: "Стоимость",
          description:
            "Я не хочу, чтобы цена становилась преградой для тех, кому нужна помощь. Поэтому работаю на основе добровольного пожертвования: после каждой нашей встречи ты сам(а) выбираешь сумму, которая кажется справедливой и посильной. Твоё желание меняться — главная валюта.",
        },
        {
          icon: "lock",
          title: "Конфиденциальность",
          description:
            "Это — нерушимое правило. Всё, о чем мы говорим, остаётся только между нами. Это не просто обещание, это этический кодекс моей профессии. Ты можешь быть уверен(а), что находишься в безопасном пространстве.",
        },
      ],
    },
    faq: {
      heading: "Частые вопросы, которые нормально задавать",
      items: [
        {
          question: "А вдруг моя проблема слишком мелкая?",
          answer:
            "Не бывает мелких проблем. Если это болит у тебя, значит, это важно.",
        },
        {
          question: "А что, если я не смогу ничего сказать?",
          answer:
            "Это абсолютно нормально. Мы не будем сидеть в неловкой тишине. Разговор — это моя работа. Я помогу.",
        },
        {
          question: "Ты будешь меня анализировать?",
          answer:
            "Моя цель не \"разгадать\" тебя, как ребус, а помочь тебе услышать и понять себя.",
        },
      ],
    },
    invitation: {
      heading: "Готов(а) сделать первый, самый маленький шаг?",
      body:
        "Просто напиши мне, чтобы договориться о нашей бесплатной 20-минутной встрече-знакомстве. Это тебя ни к чему не обязывает.",
      buttons: [
        { label: "Написать в Telegram", href: "https://t.me/alexbon_com" },
        { label: "Написать в WhatsApp", href: "https://wa.me/+380986552222" },
        { label: "Написать в Viber", href: "viber://chat?number=+380986552222" },
      ],
    },
    testimonials: {
      heading: "Голоса тех, кого услышали",
      items: [
        "Хочу поблагодарить Александра за профессионализм и отзывчивость. Он помог мне разобраться с моими внутренними переживаниями: я перестала зацикливаться в будущем и стала ценить момент \"здесь и сейчас\". Благодаря нашей работе я избавилась от чрезмерной самокритики, страхов и чувства вины, которое долго меня тяготило. Появилось больше уверенности в себе и в покое. Александр создает безопасное пространство, где можно честно взглянуть на свои проблемы и найти решение. Очень рада, что обратилась именно к нему.",
        "Благодарю Александра за столь быстрый поиск путей решения моего вопроса. После сеанса исчезло напряжение и переживание. Начали появляться новые идеи и ушли сомнения по многим аспектам. Александр чётко увидел мои проблемы и описал всё, что происходило внутри, чего я не могла объяснить сама.",
        "Александр прекрасный специалист. После консультации стало гораздо легче и спокойнее, мысли прояснились. С ним легко общаться, он располагает к себе. Благодарна за помощь и с уверенностью рекомендую.",
      ],
      cta: {
        text: "Почитать другие отзывы на Google Картах или оставить свой можно здесь:",
        button: {
          label: "Отзывы на Google Картах",
          href: "https://g.page/AlexBon?share",
        },
      },
    },
    story: {
      heading: "Моя история (для тех, кто остался до конца)",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Алекс Бон смотрит в камеру, опершись руками на стол",
      paragraphs: [
        "Психологом я стал не по плану. Мой путь начался неожиданно - в армии. Среди берцев и строевой подготовки я понял простую и важную вещь: внутренняя гармония не зависит от внешних обстоятельств. Вселенная любит шутить, подбрасывая озарения в самых неожиданных местах.",
        "Я много путешествовал, жил в Йемене, Индии и Англии, получил высшее экономическое и высшее психологическое образование, поработал в разных сферах и на разных должностях - от \"принеси-подай\" до учредителя и руководителя собственной компании.",
        "Был женат, развелся, сохранил хорошие отношения и последние десять лет живу сам. Ну, если быть точным, не совсем сам - со мной кошка. Этот опыт не сделал меня гуру, но научил замечать в чужих историях ниточки, которые когда-то проходили через мою собственную. И понимать, что любой клубок можно распутать.",
      ],
    },
    footerNote:
      "P.S. \"Алекс Бон\" - это мой псевдоним, так проще. А настоящее имя пусть остается для скучных бумаг.",
    blog: {
      badge: "Отражения",
      heroTitle: "Отражения",
      heroDescription: "",
    },
  },
  ua: {
    locale: "ua",
    brandName: "Алекс Бон",
    tagline: "Просто простір, щоб видихнути і розібратися",
    metaTitle: "Психолог онлайн Алекс Бон | Людина, яка слухає та чує",
    metaDescription:
      "Заплутався/заплуталася, втомився/втомилася чи просто хочеш видихнути? Я не лікую, а слухаю. Пропоную безпечний простір для розмови та безкоштовну 20-хвилинну зустріч, щоб познайомитися.",
    hero: {
      title: "Просто простір, щоб видихнути і розібратися.",
      paragraphs: [],
    },
    introduction: {
      heading: "Знайомство",
      image: "/images/about-portrait-hero.webp",
      imageAlt: "Олександр, психолог онлайн",
      paragraphs: [
        "Привіт, мене звати Олександр.",
        "Я психолог. Але якщо відкинути терміни, я - людина, яка допомагає іншим розплутувати клубки думок і почуттів.",
        "Моя робота - не ставити тобі діагнози і не розповідати, як слід жити. Моя робота - створити простір, у якому ти зможеш почути себе. Можливо, вперше за довгий час.",
      ],
      highlight: {
        title: "Що я роблю?",
        paragraphs: [
          "Допомагаю розплутати той самий клубок у голові. Без заумних термінів, моралізаторства, езотеричного пилу й копирсання у твоїх дитячих образах (хіба що це справді важливо саме зараз).",
          "Ми просто беремо твою конкретну ситуацію, твій глухий кут, твій біль — і працюємо з цим. Практично. Чесно. Ефективно.",
          "Я не буду тебе \"лікувати\" — я буду розмовляти. Як людина з людиною.",
        ],
      },
    },
    process: {
      heading: "Як усе відбувається? Дуже просто.",
      intro:
        "Я вірю, що зцілення починається не з діагнозів, а з чесної розмови. Тому прибрав усе зайве, щоб твій шлях до себе був простим і не лякав. Ось мапа нашої можливої подорожі.",
      steps: [
        {
          title: "Крок 1. Зустріч-знайомство (безкоштовно)",
          description:
            "**Що це?** 20 хвилин онлайн. Це не консультація, а тепла розмова, щоб ми могли познайомитися.\n\n**Навіщо це?** Щоб ти міг(ла) поставити будь-які запитання, відчути, чи комфортно тобі зі мною, і зрозуміти, чи готовий(а) довіряти саме мені.\n\n**Які зобов'язання?** Жодних. Якщо відчуєш, що це \"не твоє\", — це нормально. Моя мета — щоб ти знайшов(знайшла) свого провідника.",
        },
        {
          title: "Крок 2. Глибока робота (якщо вирішиш)",
          description:
            "**Що це?** Якщо після знайомства ти відчуєш: \"так, воно\", домовимося про повноцінні зустрічі. Зазвичай це раз на тиждень, але ми підберемо ритм, що буде комфортний саме тобі.\n\n**Навіщо це?** Щоб не просто \"поговорити\", а лагідно, крок за кроком розплутувати твій клубок і рухатися до життя, яке ти хочеш для себе створити.",
        },
      ],
    },
    details: {
      heading: "Детальніше про наші зустрічі",
      items: [
        {
          icon: "video",
          title: "Формат",
          description:
            "Онлайн (Zoom, Telegram, WhatsApp, Viber). Тобі достатньо знайти затишне місце, де тебе ніхто не потурбує.",
        },
        {
          icon: "donate",
          title: "Вартість",
          description:
            "Я не хочу, щоб вартість ставала бар'єром для тих, кому потрібна підтримка. Тому працюю на принципах добровільної пожертви: після кожної зустрічі ти сам(а) визначаєш суму, що здається чесною й посильною. Твоє бажання змінюватися — головна валюта.",
        },
        {
          icon: "lock",
          title: "Конфіденційність",
          description:
            "Це — непорушне правило. Усе, про що ми говоримо, залишається лише між нами. Це не просто обіцянка, а етичний кодекс моєї професії. Можеш бути певен(а): ти в безпечному просторі.",
        },
      ],
    },
    faq: {
      heading: "Питання, які нормально ставити",
      items: [
        {
          question: "А раптом моя проблема надто дрібна?",
          answer:
            "Не буває дрібних проблем. Якщо воно болить у тобі, значить, це важливо.",
        },
        {
          question: "А що, якщо я нічого не зможу сказати?",
          answer:
            "Це абсолютно нормально. Ми не сидітимемо в незручній тиші. Розмова — моя робота. Я підхоплю.",
        },
        {
          question: "Ти будеш мене аналізувати?",
          answer:
            "Моя мета не \"розгадати\" тебе, мов ребус, а допомогти почути й зрозуміти себе.",
        },
      ],
    },
    invitation: {
      heading: "Готовий(а) зробити перший, зовсім невеликий крок?",
      body:
        "Просто напиши мені, щоб домовитися про нашу безкоштовну 20-хвилинну зустріч-знайомство. Це ні до чого тебе не зобов'язує.",
      buttons: [
        { label: "Написати в Telegram", href: "https://t.me/alexbon_com" },
        { label: "Написати в WhatsApp", href: "https://wa.me/+380986552222" },
        { label: "Написати у Viber", href: "viber://chat?number=+380986552222" },
      ],
    },
    testimonials: {
      heading: "Голоси тих, кого почули",
      items: [
        "Хочу подякувати Олександра за професіоналізм і чуйність. Він допоміг мені розібратися зі своїми внутрішніми переживаннями: я перестала жити лише майбутнім і навчилася цінувати момент \"тут і зараз\". Завдяки нашій роботі я позбулася надмірної самокритики, страхів і давнього почуття провини. З'явилося більше впевненості у собі та спокою. Олександр створює безпечний простір, де можна чесно подивитися на свої труднощі й знайти рішення. Я дуже рада, що звернулася саме до нього.",
        "Дякую Олександрові за швидкий пошук шляхів вирішення мого запиту. Після сеансу зникло напруження і хвилювання. З'явилися нові ідеї і зникли сумніви в багатьох аспектах. Олександр чітко побачив мої проблеми і описав усе, що відбувалося всередині, чого я не могла пояснити сама.",
        "Олександр чудовий фахівець. Після консультації стало значно легше і спокійніше, думки прояснилися. З ним легко спілкуватися, він викликає довіру. Вдячна за допомогу і із задоволенням рекомендую.",
      ],
      cta: {
        text: "Інші відгуки у Google Картах можна почитати або залишити свій тут:",
        button: {
          label: "Відгуки у Google Картах",
          href: "https://g.page/AlexBon?share",
        },
      },
    },
    story: {
      heading: "Моя історія (для тих, хто залишився до кінця)",
      image: "/images/about-story-portrait.webp",
      imageAlt: "Олександр у затишній студії, облокотившись на стіл",
      paragraphs: [
        "Психологом я став не за планом. Мій шлях почався несподівано - в армії. Серед берців і стройової підготовки я зрозумів просту і важливу річ: внутрішня гармонія не залежить від зовнішніх обставин. Всесвіт любить жартувати, підкидаючи осяяння у найнеочікуваніших місцях.",
        "Я багато подорожував, жив у Ємені, Індії та Англії, здобув вищу економічну та вищу психологічну освіту, працював у різних сферах і на різних посадах - від \"принеси-подай\" до засновника і керівника власної компанії.",
        "Був одружений, розлучився, зберіг добрі стосунки і останні десять років живу сам. Якщо точніше, не зовсім сам - зі мною кішка. Цей досвід не зробив мене гуру, але навчив помічати в чужих історіях ниточки, які колись проходили через мою власну. І розуміти, що будь-який клубок можна розплутати.",
      ],
    },
    footerNote:
      "P.S. \"Алекс Бон\" - це мій псевдонім, так простіше. А справжнє ім'я нехай залишається для нудних паперів.",
    blog: {
      badge: "Відображення",
      heroTitle: "Відображення",
      heroDescription: "",
    },
  },
  en: {
    locale: "en",
    brandName: "Alex Bon",
    tagline: "A lighthouse to see yourself",
    metaTitle: "Meet Alex Bon | Keeper of the Lighthouse",
    metaDescription:
      "Writer, psychologist, and keeper of a quiet lighthouse of reflections. Discover why these stories stay free and how their light helps you see yourself.",
    hero: {
      title: "Meet the keeper of this lighthouse.",
      paragraphs: [],
    },
    introduction: {
      heading: "",
      image: "https://alexbon.com/images/about-story-portrait.webp",
      imageAlt: "Alex Bon seated in warm light, notebook in hand",
      paragraphs: [
        "My name is Alex Bon. I am a writer, a psychologist, and the keeper of this quiet space. The stories you find here are reflections, a space to see yourself.",
        "But for any reflection to appear, there must be a source of light. That thought is what brought me to the image of a lighthouse.",
        "My work here is to tend its light—the stories and reflections you find on this site.",
        "A lighthouse does not steer your ship or promise a safe harbor. Its task is more honest: it holds its ground, so you can find yours.",
        "Its light exists to illuminate three things:",
        "This is why I write.",
      ],
      bulletList: {
        afterParagraph: "Its light exists to illuminate three things:",
        items: [
          "The shape of the rocks — the patterns that lie in our path.",
          "The outlines of other ships — to remind us we are not alone.",
          "And most importantly, the reflection of our own vessel in the water.",
        ],
      },
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
      buttons: [],
    },
    testimonials: {
      heading: "",
      intro: "",
      items: [],
    },
    story: {
      heading: "The Story of the Keeper",
      image: "https://alexbon.com/images/about-portrait-hero.webp",
      imageAlt: "Alex Bon standing by a window, looking toward the horizon",
      paragraphs: [
        "My path to this shore was never part of a plan.",
        "It began unexpectedly, in the army. Among the polished boots and the rigid drills, I learned a simple truth: inner balance does not depend on outer circumstances. The universe enjoys hiding its greatest insights in the most unlikely places. I have traveled widely, lived in Yemen, India, and England. I have built and lost. I have been married and divorced. Today, I live and write in Ukraine, tending this light amidst the chaos of war.",
        "This journey hasn't made me a guru. It has simply taught me to recognize the threads in other people's stories that once ran through my own. And for the last ten years, I've lived on my own. Well, not entirely on my own—I live with my cat.",
      ],
    },
    lighthouse: {
      heading: "Tending the Light",
      paragraphs: [
        "This lighthouse is kept running by those who find value in its light. Everything I create is free, without paywalls or exclusive content. This is not a transaction.",
        "If you feel this work is necessary, here are a few ways to help keep the light burning:",
      ],
      bullets: [
        {
          label: "Become a Reader",
          description: ": Join my reader circle for free and receive stories as they are born.",
          href: "https://www.patreon.com/cw/alexboncom",
          external: true,
        },
        {
          label: "Become a Patron",
          description:
            ": Your support helps me dedicate more time to writing and ensures this beam continues to shine for everyone.",
          href: "https://www.patreon.com/cw/alexboncom",
          external: true,
        },
        {
          label: "Explore the Designs",
          description: ": Carry a piece of this space with you.",
          href: "https://www.redbubble.com/people/AlexBonSpace/explore?page=1&sortOrder=recent",
          external: true,
        },
      ],
      closing: "Thank you for being here. Thank you for standing watch with me.",
    },
    door: {
      heading: "The Door",
      paragraphs: [
        "The lighthouse is for everyone. It shines for ships I will never know. That is its job.",
        "But at the base of the lighthouse, there's a small door you'd mistake for part of the wall until you get up close. It doesn't lead up to the lamp. It leads to my kitchen.",
        "It doesn't smell of sea and wind in there. It smells of coffee, old wood, and, if you're lucky, something good to eat. There's a perpetual mess of books and mugs on the table, but there's always room for one more cup. A man in an old sweater sits there. Not the keeper. Just Alex.",
        "This door is never locked.",
      ],
      cta: {
        text: "Knock, if you need to:",
        contacts: [
          { label: "Telegram", href: "https://t.me/alexbon_com", external: true },
          { label: "Viber", href: "viber://chat?number=+380986552222" },
          { label: "WhatsApp", href: "https://wa.me/+380986552222", external: true },
        ],
      },
    },
    footerNote: "",
    blog: {
      badge: "Reflections",
      heroTitle: "Reflections",
      heroDescription: "",
    },
  },
};

export const getContent = (locale: LocaleKey): LandingContent => contentByLocale[locale];
