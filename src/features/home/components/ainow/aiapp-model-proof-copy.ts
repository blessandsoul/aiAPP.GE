export type AiAppModelProofTone =
  | "idea"
  | "prototype"
  | "build"
  | "test"
  | "platforms"
  | "permissions"
  | "handover"
  | "review"
  | "stores"
  | "payments"
  | "analytics";

export type AiAppModelProofProviderCopy = {
  readonly label: string;
  readonly detail: string;
};

export type AiAppModelProofLocale = "ka" | "en" | "ru";

export type AiAppModelProofTrustItem = {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
  readonly image: string;
};

export type AiAppModelProofSourceTone =
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "mistral"
  | "deepseek"
  | "meta"
  | "qwen"
  | "cohere"
  | "zai"
  | "kimi";

export type AiAppModelProofCoreTone = Exclude<AiAppModelProofTone, "stores" | "payments" | "analytics">;

// These suffixes are the frozen source CSS roles. They stay independent from
// the translated semantic labels shown to visitors.
export const AI_APP_MODEL_PROOF_SOURCE_TONES: Record<AiAppModelProofTone, AiAppModelProofSourceTone> = {
  idea: "openai",
  prototype: "anthropic",
  build: "google",
  test: "xai",
  platforms: "mistral",
  permissions: "deepseek",
  handover: "meta",
  review: "qwen",
  stores: "cohere",
  payments: "zai",
  analytics: "kimi",
};

export function getAiAppModelProofSourceTone(tone: AiAppModelProofTone) {
  return AI_APP_MODEL_PROOF_SOURCE_TONES[tone];
}

export function getAiAppModelProofTrustItemClassName(index: number) {
  return `ainow-model-stage__trust-item${index === 3 ? " ainow-model-stage__trust-item--always-on" : ""}`;
}

export const AI_APP_MODEL_PROOF_TRUST: Record<AiAppModelProofLocale, readonly AiAppModelProofTrustItem[]> = {
  ka: [
    { value: "პროტოტიპი", label: "პროტოტიპის გადახედვა", detail: "გადახედეთ ეკრანებსა და მომხმარებლის გზას აწყობამდე", image: "/images/aiapp/prototype-review-v1.png" },
    { value: "iOS/Android", label: "პლატფორმის ფარგლები", detail: "მაღაზიისა და პროვაიდერის პირობები შეთანხმებულ ფარგლებში მოწმდება.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "ტესტი", label: "სუსტი კავშირი და წვდომები", detail: "ტესტები აპის ჩაბარებამდე თანხმდება.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "ჩაბარება", label: "კოდი და წვდომა", detail: "კოდი, დიზაინი და წვდომა ჩაბარების პირობებში წერილობით განისაზღვრება.", image: "/images/aiapp/handover-code-v1.png" },
  ],
  en: [
    { value: "Prototype", label: "PROTOTYPE REVIEW", detail: "Review screens and the user journey before build.", image: "/images/aiapp/prototype-review-v1.png" },
    { value: "iOS/Android", label: "Platform boundary", detail: "Store and provider conditions stay within the agreed scope.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "Test", label: "Permissions and weak connection", detail: "Test cases are agreed before handover.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "Handover", label: "Code and access", detail: "Handover terms cover code, design and access in the proposal.", image: "/images/aiapp/handover-code-v1.png" },
  ],
  ru: [
    { value: "Прототип", label: "ПРОВЕРКА ПРОТОТИПА", detail: "Проверьте экраны и путь пользователя до разработки.", image: "/images/aiapp/prototype-review-v1.png" },
    { value: "iOS/Android", label: "Граница платформы", detail: "Условия магазина и провайдера входят только в согласованный объём.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "Тест", label: "Права и слабая связь", detail: "Тесты согласуются до передачи приложения.", image: "/images/aiapp/app-testing-v1.png" },
    { value: "Передача", label: "Код и доступ", detail: "Условия передачи кода, дизайна и доступов фиксируются в предложении.", image: "/images/aiapp/handover-code-v1.png" },
  ],
};

export function getAiAppModelProofTrust(locale: string) {
  if (locale === "en" || locale === "ru") return AI_APP_MODEL_PROOF_TRUST[locale];
  return AI_APP_MODEL_PROOF_TRUST.ka;
}

export const AI_APP_MODEL_PROOF_PROVIDER_COPY: Record<
  AiAppModelProofLocale,
  Record<AiAppModelProofCoreTone, AiAppModelProofProviderCopy>
> = {
  ka: {
    idea: { label: "იდეა", detail: "მომხმარებლის პირველი მოქმედება" },
    prototype: { label: "პროტოტიპი", detail: "ეკრანები და მომხმარებლის გზა" },
    build: { label: "აწყობა", detail: "შეთანხმებული აპის ფარგლები" },
    test: { label: "ტესტი", detail: "წვდომები და სუსტი ინტერნეტი" },
    platforms: { label: "პლატფორმები", detail: "iOS და Android" },
    permissions: { label: "წვდომა", detail: "როლები და უფლებები" },
    handover: { label: "ჩაბარება", detail: "კოდი და ანგარიშებზე წვდომა" },
    review: { label: "გადახედვა", detail: "მფლობელის თანხმობა" },
  },
  en: {
    idea: { label: "Idea", detail: "First user action" },
    prototype: { label: "Prototype", detail: "Screens and user journey" },
    build: { label: "Build", detail: "Agreed app scope" },
    test: { label: "Test", detail: "Permissions and weak connection" },
    platforms: { label: "Platforms", detail: "iOS and Android" },
    permissions: { label: "Permissions", detail: "Roles and access" },
    handover: { label: "Handover", detail: "Code and account access" },
    review: { label: "Review", detail: "Owner approval" },
  },
  ru: {
    idea: { label: "Идея", detail: "Первое действие пользователя" },
    prototype: { label: "Прототип", detail: "Экраны и путь пользователя" },
    build: { label: "Разработка", detail: "Согласованный объём приложения" },
    test: { label: "Тест", detail: "Разрешения и нестабильный интернет" },
    platforms: { label: "Платформы", detail: "iOS и Android" },
    permissions: { label: "Доступ", detail: "Роли и разрешения" },
    handover: { label: "Передача", detail: "Код и доступ к аккаунтам" },
    review: { label: "Проверка", detail: "Утверждение владельца" },
  },
};

export function getAiAppModelProofProviderCopy(locale: string) {
  if (locale === "en" || locale === "ru") return AI_APP_MODEL_PROOF_PROVIDER_COPY[locale];
  return AI_APP_MODEL_PROOF_PROVIDER_COPY.ka;
}
