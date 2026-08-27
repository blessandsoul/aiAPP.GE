"use client";

import { useEffect, useState } from "react";

const SHARED_MEASUREMENT_ID = "G-LHWNXVZ9B9";
const DEFAULT_MEASUREMENT_IDS = [SHARED_MEASUREMENT_ID] as const;
const DEFAULT_STORAGE_KEY = "ainow.analytics-consent.v1";

type Consent = "accepted" | "declined" | null;

type FamilyAnalyticsProps = {
  measurementIds?: readonly string[];
  consentStorageKey?: string;
  renderBanner?: boolean;
};

function readConsent(storageKey: string): Consent {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    if (raw === "accepted" || raw === "declined") return raw;
    const parsed = JSON.parse(raw) as {
      status?: string;
      analytics?: boolean;
    };
    if (parsed.status === "declined" || parsed.analytics === false) return "declined";
    if (parsed.status === "accepted") return "accepted";
  } catch {
    return null;
  }
  return null;
}

function loadAnalytics(measurementIds: readonly string[]): void {
  const ids = Array.from(new Set(measurementIds.filter(Boolean)));
  if (ids.length === 0) return;

  const analyticsWindow = window as Window & { dataLayer?: unknown[][] };
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  const gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);

  if (!document.getElementById("ainow-ga4-loader")) {
    const script = document.createElement("script");
    script.id = "ainow-ga4-loader";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`;
    document.head.appendChild(script);
    gtag("js", new Date());
  }

  for (const id of ids) {
    gtag("config", id, {
      allow_google_signals: false,
      cookie_domain: "auto",
      cookie_flags: "SameSite=None;Secure",
      send_page_view: true,
    });
  }
}

const copy = {
  ka: {
    title: "ანალიტიკის ნებართვა",
    body: "ანონიმური სტატისტიკა გვეხმარება საიტის გაუმჯობესებაში. ანალიტიკა ჩაირთვება მხოლოდ თქვენი თანხმობის შემდეგ.",
    accept: "თანხმობა",
    decline: "უარი",
  },
  en: {
    title: "Analytics permission",
    body: "Anonymous usage data helps us improve the site. Analytics starts only after you agree.",
    accept: "Allow",
    decline: "Decline",
  },
  ru: {
    title: "Разрешение на аналитику",
    body: "Анонимная статистика помогает улучшать сайт. Аналитика включится только после вашего согласия.",
    accept: "Разрешить",
    decline: "Отказаться",
  },
} as const;

export function FamilyAnalytics({
  measurementIds = DEFAULT_MEASUREMENT_IDS,
  consentStorageKey = DEFAULT_STORAGE_KEY,
  renderBanner = true,
}: FamilyAnalyticsProps) {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const measurementKey = measurementIds.join(",");

  useEffect(() => {
    const current = readConsent(consentStorageKey);
    setConsent(current);
    setReady(true);
    if (current === "accepted") loadAnalytics(measurementKey.split(","));
  }, [consentStorageKey, measurementKey]);

  const save = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(consentStorageKey, value);
    setConsent(value);
    if (value === "accepted") loadAnalytics(measurementKey.split(","));
  };

  if (!ready || consent !== null || !renderBanner) return null;

  const language = document.documentElement.lang.split("-")[0] as keyof typeof copy;
  const text = copy[language] || copy.ka;

  return (
    <aside
      aria-label={text.title}
      style={{
        position: "fixed",
        zIndex: 2147483000,
        right: 16,
        bottom: 16,
        width: "min(420px, calc(100vw - 32px))",
        padding: 18,
        border: "1px solid rgba(148,163,184,.35)",
        borderRadius: 18,
        background: "rgba(15,23,42,.96)",
        color: "#f8fafc",
        boxShadow: "0 20px 60px rgba(2,6,23,.35)",
        backdropFilter: "blur(16px)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8, fontSize: 16 }}>
        {text.title}
      </strong>
      <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.55 }}>
        {text.body}
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={() => save("accepted")}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: 0,
            borderRadius: 10,
            background: "#6366f1",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {text.accept}
        </button>
        <button
          type="button"
          onClick={() => save("declined")}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid #475569",
            borderRadius: 10,
            background: "transparent",
            color: "#e2e8f0",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {text.decline}
        </button>
      </div>
    </aside>
  );
}
