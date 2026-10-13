"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { AiNowSectionFrame } from "./AiNowSectionFrame";
import { AiNowImage } from "./AiNowImage";
import { AiNowDisclosure } from "./AiNowDisclosure";
import {
  getAiAppModelProofProviderCopy,
  getAiAppModelProofSourceTone,
  getAiAppModelProofTrust,
  getAiAppModelProofTrustItemClassName,
  type AiAppModelProofTone,
} from "./aiapp-model-proof-copy";

type Provider = {
  readonly lab: string;
  readonly mark: string | null;
  readonly wordmark: string;
  readonly tone: AiAppModelProofTone;
};

const providers: readonly Provider[] = [
  { lab: "Idea", mark: null, wordmark: "Idea", tone: "idea" },
  { lab: "Prototype", mark: null, wordmark: "Prototype", tone: "prototype" },
  { lab: "Build", mark: null, wordmark: "Build", tone: "build" },
  { lab: "Test", mark: null, wordmark: "Test", tone: "test" },
  { lab: "Platforms", mark: null, wordmark: "Platforms", tone: "platforms" },
  { lab: "Permissions", mark: null, wordmark: "Permissions", tone: "permissions" },
  { lab: "Handover", mark: null, wordmark: "Handover", tone: "handover" },
  { lab: "Review", mark: null, wordmark: "Review", tone: "review" },
  { lab: "Stores", mark: null, wordmark: "Stores", tone: "stores" },
  { lab: "Payments", mark: null, wordmark: "Payments", tone: "payments" },
  { lab: "Analytics", mark: null, wordmark: "Analytics", tone: "analytics" },
];

const copyByLocale = {
  ka: {
    eyebrow: "რა უნდა იცოდეს ბიზნესმა აპის დაწყებამდე",
    title: "აპი მომხმარებლის პირველი მოქმედებით იწყება.",
    description: "aiAPP თქვენზე მორგებულ iOS/Android აპს ქმნის: ჩვენ ვიწყებთ მომხმარებლის პირველი მოქმედებით, შემდეგ ვამზადებთ პროტოტიპს, ვტესტავთ და გადმოგაბარებთ შეთანხმებულ ვერსიას.",
    radar: "აპის მნიშვნელოვანი ნაწილები",
    moreTechnologies: "დამატებითი დეტალები",
    jevKicker: "ტესტის შედეგი",
    jevTitle: "პრაქტიკული შემდეგი ნაბიჯი",
    jevDescription: "ტესტი აჩვენებს, რა უნდა გამოსწორდეს; ჩამოტვირთვა, მაღაზიის დამტკიცება და გაყიდვები გარანტირებული არ არის.",
    trustLabel: "პროტოტიპი, ტესტი და ჩაბარება",
    brand: {
      established: "aiAPP · aiNOW",
      title: "იდეიდან აპამდე მკაფიო ჩაბარებით",
      location: "თბილისი / aiNOW-ის გუნდი",
      language: "თქვენი მომხმარებელი. რეალური ტესტი. შეთანხმებული ფარგლები.",
    },
    trust: getAiAppModelProofTrust("ka"),
    providerLabels: getAiAppModelProofProviderCopy("ka"),
  },
  en: {
    eyebrow: "What a business should know before app work",
    title: "Start with the user's first action.",
    description: "aiAPP builds a custom iOS/Android app: it starts with the user's first action, then moves through prototyping, testing and handover of the agreed version.",
    radar: "The app's important parts",
    moreTechnologies: "More detail",
    jevKicker: "Decision layer",
    jevTitle: "Reviewed next step",
    jevDescription: "Testing informs the next proposal; installs, store approval and sales are not guaranteed.",
    trustLabel: "Prototype, testing and handover",
    brand: {
      established: "aiAPP · aiNOW",
      title: "IDEA TO APP. CLEAR HANDOVER.",
      location: "Tbilisi / aiNOW team",
      language: "Your users. Real tests. Agreed scope.",
    },
    trust: getAiAppModelProofTrust("en"),
    providerLabels: getAiAppModelProofProviderCopy("en"),
  },
  ru: {
    eyebrow: "Что бизнесу важно знать до начала работы над приложением",
    title: "Начните с одной задачи в приложении.",
    description: "aiAPP создаёт приложение для iOS/Android под ваши задачи. Начинаем с первого действия пользователя, готовим прототип, тестируем приложение и передаём согласованную версию.",
    radar: "Что важно определить в приложении",
    moreTechnologies: "Подробнее",
    jevKicker: "Слой принятия решений",
    jevTitle: "Проверенный следующий шаг",
    jevDescription: "Тестирование помогает подготовить предложение; установки, одобрение магазина и продажи не гарантируются.",
    trustLabel: "Прототип, тестирование и передача",
    brand: {
      established: "aiAPP · aiNOW",
      title: "ОТ ИДЕИ К ПРИЛОЖЕНИЮ С ПОНЯТНОЙ ПЕРЕДАЧЕЙ",
      location: "Тбилиси / команда aiNOW",
      language: "Пользователь. Реальная задача. Согласованный объём.",
    },
    trust: getAiAppModelProofTrust("ru"),
    providerLabels: getAiAppModelProofProviderCopy("ru"),
  },
} as const;

const extraProviderLabels = {
  ka: { stores: { label: "მაღაზიები", detail: "App Store და Google Play" }, payments: { label: "გადახდები", detail: "დამტკიცებული პროვაიდერები" }, analytics: { label: "ანალიტიკა", detail: "მოვლენები და წვდომა" } },
  en: { stores: { label: "Stores", detail: "App Store and Google Play" }, payments: { label: "Payments", detail: "Approved providers" }, analytics: { label: "Analytics", detail: "Events and access" } },
  ru: { stores: { label: "Магазины", detail: "App Store и Google Play" }, payments: { label: "Платежи", detail: "Утверждённые провайдеры" }, analytics: { label: "Аналитика", detail: "События и доступ" } },
} as const;

function getCopy(locale: string) {
  if (locale === "en" || locale === "ru") return copyByLocale[locale];
  if (["de", "tr", "fa", "zh"].includes(locale)) return copyByLocale.en;
  return copyByLocale.ka;
}

export function AiNowModelProof() {
  const locale = useLocale();
  const copy = getCopy(locale);
  const extra = extraProviderLabels[locale === "ka" || locale === "ru" ? locale : "en"];

  const renderProvider = (provider: Provider) => {
    const providerCopy = (copy.providerLabels as Record<string, { label: string; detail: string }>)[provider.tone] ?? extra[provider.tone as keyof typeof extra] ?? { label: provider.wordmark, detail: provider.wordmark };

    return (
    <div className={`ainow-model-stage__provider ainow-model-stage__provider--${getAiAppModelProofSourceTone(provider.tone)}`} key={provider.lab} title={`${providerCopy.label}: ${providerCopy.detail}`}>
      <span className="ainow-model-stage__provider-mark" aria-hidden="true">
        {provider.mark ? (
          <AiNowImage
            src={provider.mark}
            alt=""
            width={18}
            height={18}
            frameClassName="inline-flex size-[18px]"
            className="size-full object-contain"
            unoptimized
          />
        ) : (
          <span className="ainow-model-stage__wordmark">{providerCopy.label.slice(0, 1)}</span>
        )}
      </span>
      <span className="ainow-model-stage__provider-copy">
        <span className="ainow-model-stage__provider-lab">{providerCopy.label}</span>
        <span className="ainow-model-stage__provider-model">{providerCopy.detail}</span>
      </span>
    </div>
    );
  };

  return (
    <AiNowSectionFrame
      id="model-architecture"
      hasLaser={false}
      showTicks={false}
      containerClassName="px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
    >
      <section className="ainow-model-stage" aria-labelledby="ainow-model-stage-title">
        <div className="ainow-model-stage__intro">
          <div className="ainow-model-stage__eyebrow">
            <span className="ainow-model-stage__status" aria-hidden="true" />
            <span>{copy.eyebrow}</span>
          </div>
          <h2 id="ainow-model-stage-title">{copy.title}</h2>
          <p>{copy.description}</p>
        </div>

        <div
          className="ainow-model-stage__decision ainow-model-stage__visual-card"
        >
          <AiNowImage
            className="ainow-model-stage__decision-image"
            src="/images/aiapp/prototype-review-v1.png"
            alt=""
            fill
            frameClassName="absolute inset-0"
            sizes="(max-width: 767px) 100vw, 40vw"
          />
          <div className="ainow-model-stage__decision-scrim" aria-hidden="true" />
          <div className="ainow-model-stage__decision-content">
            <div className="ainow-model-stage__decision-copy">
              <span>{copy.jevKicker}</span>
              <strong>{copy.jevTitle}</strong>
              <p>{copy.jevDescription}</p>
            </div>
          </div>
        </div>

        <div
          className="ainow-model-stage__catalog ainow-model-stage__visual-card"
          aria-label={copy.radar}
        >
          <AiNowImage
            className="ainow-model-stage__catalog-image"
            src="/images/aiapp/app-testing-v1.png"
            alt=""
            fill
            frameClassName="absolute inset-0"
            sizes="(max-width: 767px) 100vw, 58vw"
          />
          <div className="ainow-model-stage__catalog-scrim" aria-hidden="true" />
          <div className="ainow-model-stage__catalog-content">
            <div className="ainow-model-stage__catalog-heading">
              <span>{copy.radar}</span>
            </div>
            <div className="ainow-model-stage__providers" data-model-provider-group="primary">
              {providers.slice(0, 4).map(renderProvider)}
            </div>
            <AiNowDisclosure
              title={copy.moreTechnologies}
              className="mt-2 border-t border-slate-200/60 [&>button]:min-h-10 [&>button]:py-2 [&>button]:text-xs dark:border-white/10"
            >
              <div className="ainow-model-stage__providers pb-1" data-model-provider-group="additional">
                {providers.slice(4).map(renderProvider)}
              </div>
            </AiNowDisclosure>
          </div>
        </div>

        <dl className="ainow-model-stage__trust" aria-label={copy.trustLabel} tabIndex={0}>
          {copy.trust.map((item, index) => (
            <div className={getAiAppModelProofTrustItemClassName(index)} key={item.value}>
              <AiNowImage
                className="ainow-model-stage__trust-image"
                src={item.image}
                alt=""
                fill
                frameClassName="absolute inset-0"
                sizes="(max-width: 767px) 82vw, (max-width: 1040px) 25vw, 30vw"
              />
              <div className="ainow-model-stage__trust-copy">
                <dt>{item.value}</dt>
                <dd>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <section className="ainow-model-stage__brand ainow-model-stage__visual-card" aria-label={copy.brand.title}>
          <AiNowImage
            className="ainow-model-stage__brand-image"
            src="/images/aiapp/handover-code-v1.png"
            alt=""
            fill
            frameClassName="absolute inset-0"
            sizes="(max-width: 767px) 100vw, 100vw"
          />
          <div className="ainow-model-stage__brand-scrim" aria-hidden="true" />
          <div className="ainow-model-stage__brand-copy">
            <span>{copy.brand.established}</span>
            <h3>{copy.brand.title}</h3>
            <p>{copy.brand.language}</p>
            <small>{copy.brand.location}</small>
          </div>
        </section>
      </section>
    </AiNowSectionFrame>
  );
}
