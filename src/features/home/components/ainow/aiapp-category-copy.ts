export type AiAppCategoryProductId =
  | "aichats"
  | "aicall"
  | "aicontent"
  | "aiads"
  | "aimusic"
  | "aistaff"
  | "aibrain"
  | "aioffice"
  | "aidocs"
  | "aiweb"
  | "aiapp"
  | "vibecoding";

export type AiAppCategoryLocale = "ka" | "en" | "ru";

export type AiAppCategoryProductCopy = {
  readonly name: string;
  readonly description: string;
  readonly href: "#hero" | "#categories" | "#process" | "#model-architecture";
};

export const AI_APP_CATEGORY_PRODUCT_COPY: Record<
  AiAppCategoryLocale,
  Record<AiAppCategoryProductId, AiAppCategoryProductCopy>
> = {
  ka: {
    aichats: { name: "პირველი მოქმედება", description: "აირჩიეთ, რას აკეთებს მომხმარებელი პირველ რიგში.", href: "#hero" },
    aicall: { name: "მომხმარებლის გზა", description: "განსაზღვრეთ გზა ეკრანებს შორის.", href: "#hero" },
    aicontent: { name: "ეკრანები", description: "გადააქციეთ იდეა განსახილველ ეკრანებად.", href: "#categories" },
    aiads: { name: "აპის პროტოტიპი", description: "ნახეთ და შეცვალეთ გზა სრულ აწყობამდე.", href: "#categories" },
    aimusic: { name: "აპის მდგომარეობები", description: "განიხილეთ შეცდომა, დატვირთვა და კავშირი.", href: "#categories" },
    aistaff: { name: "ტესტირება", description: "შეამოწმეთ რეგისტრაცია, წვდომა და სუსტი კავშირი.", href: "#model-architecture" },
    aibrain: { name: "წვდომები", description: "განსაზღვრეთ როლები და ანგარიშები.", href: "#model-architecture" },
    aioffice: { name: "ჩაბარება", description: "მიიღეთ კოდი, დიზაინი და შეთანხმებული წვდომები.", href: "#process" },
    aidocs: { name: "კოდის მომზადება", description: "დააკავშირეთ ეკრანები, მონაცემები და წესები.", href: "#process" },
    aiweb: { name: "iOS და Android", description: "აირჩიეთ პირველი პლატფორმები.", href: "#hero" },
    aiapp: { name: "შეთანხმებული ფარგლები", description: "განსაზღვრეთ, რა შედის პირველ ვერსიაში.", href: "#process" },
    vibecoding: { name: "პროვაიდერის პირობები", description: "გამოყავით კავშირები, რომლებიც ცალკე მოწმდება.", href: "#model-architecture" },
  },
  en: {
    aichats: { name: "First user action", description: "Choose what the user does first.", href: "#hero" },
    aicall: { name: "User journey", description: "Map the path between screens.", href: "#hero" },
    aicontent: { name: "Screens", description: "Turn the idea into screens people can review.", href: "#categories" },
    aiads: { name: "App prototype", description: "Review and change the flow before full build.", href: "#categories" },
    aimusic: { name: "App states", description: "Review loading, errors and connection states.", href: "#categories" },
    aistaff: { name: "Testing", description: "Test registration, access and weak connection.", href: "#model-architecture" },
    aibrain: { name: "Access", description: "Define roles and account access.", href: "#model-architecture" },
    aioffice: { name: "Handover", description: "Receive the code, design and agreed access.", href: "#process" },
    aidocs: { name: "Code preparation", description: "Connect screens, data and app rules.", href: "#process" },
    aiweb: { name: "iOS and Android", description: "Choose the first platforms.", href: "#hero" },
    aiapp: { name: "Agreed scope", description: "Define what belongs in the first version.", href: "#process" },
    vibecoding: { name: "Provider conditions", description: "Separate connections that need their own review.", href: "#model-architecture" },
  },
  ru: {
    aichats: { name: "Первое действие", description: "Выберите, что пользователь делает сначала.", href: "#hero" },
    aicall: { name: "Путь пользователя", description: "Определите переходы между экранами.", href: "#hero" },
    aicontent: { name: "Экраны", description: "Превратите идею в экраны для обсуждения.", href: "#categories" },
    aiads: { name: "Прототип приложения", description: "Проверьте и измените сценарий до разработки.", href: "#categories" },
    aimusic: { name: "Состояния приложения", description: "Обсудите загрузку, ошибки и связь.", href: "#categories" },
    aistaff: { name: "Тестирование", description: "Проверьте регистрацию, доступ и нестабильный интернет.", href: "#model-architecture" },
    aibrain: { name: "Доступ", description: "Определите роли и доступ к аккаунтам.", href: "#model-architecture" },
    aioffice: { name: "Передача", description: "Получите код, дизайн и согласованный доступ.", href: "#process" },
    aidocs: { name: "Подготовка кода", description: "Свяжите экраны, данные и правила приложения.", href: "#process" },
    aiweb: { name: "iOS и Android", description: "Выберите первые платформы.", href: "#hero" },
    aiapp: { name: "Согласованный объём", description: "Определите, что войдёт в первую версию.", href: "#process" },
    vibecoding: { name: "Условия провайдеров", description: "Отдельно рассмотрите подключения с особыми условиями.", href: "#model-architecture" },
  },
};

export function getAiAppCategoryProductCopy(locale: string) {
  if (locale === "ka" || locale === "ru") return AI_APP_CATEGORY_PRODUCT_COPY[locale];
  return AI_APP_CATEGORY_PRODUCT_COPY.en;
}
