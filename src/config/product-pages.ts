import type { ProductPagesConfig } from '@/features/product-pages/types';

export const PRODUCT_PAGES = {
  pricing: { status: 'public', mode: 'project' },
  contact: { status: 'public' },
  blog: { status: 'off' },
  integrations: {
    status: 'public',
    records: [
      { id: 'app-store', name: 'App Store', icon: 'solar:smartphone-bold-duotone', category: 'development', connection: 'custom', status: 'customSetup', dataFlow: 'applicationRelease' },
      { id: 'google-play', name: 'Google Play', icon: 'solar:play-circle-bold-duotone', category: 'development', connection: 'custom', status: 'customSetup', dataFlow: 'applicationRelease' },
      { id: 'payments', name: 'Payments', icon: 'solar:calculator-bold-duotone', category: 'businessSystems', connection: 'custom', status: 'customSetup', dataFlow: 'paymentEvents' },
      { id: 'push-notifications', name: 'Push notifications', icon: 'solar:letter-bold-duotone', category: 'communication', connection: 'custom', status: 'customSetup', dataFlow: 'notifications' },
    ],
  },
  security: { status: 'public' },
  privacy: { status: 'public' },
  terms: { status: 'public' },
  cookies: { status: 'off' },
  solutions: { status: 'off', slugs: [] },
  localeNamespaces: {
    ka: ['productPages.common', 'productPages.pricing', 'productPages.contact', 'productPages.integrations', 'productPages.security', 'productPages.privacy', 'productPages.terms'],
    en: ['productPages.common', 'productPages.pricing', 'productPages.contact', 'productPages.integrations', 'productPages.security', 'productPages.privacy', 'productPages.terms'],
    ru: ['productPages.common', 'productPages.pricing', 'productPages.contact', 'productPages.integrations', 'productPages.security', 'productPages.privacy', 'productPages.terms'],
  },
} as const satisfies ProductPagesConfig;
