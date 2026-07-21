'use client';

import { useTranslations } from 'next-intl';

import { ProductCapabilities } from './ProductCapabilities';

const ICONS = [
  'solar:code-2-bold-duotone',
  'solar:shield-check-bold-duotone',
  'solar:calculator-bold-duotone',
  'solar:layers-minimalistic-bold-duotone',
  'solar:key-bold-duotone',
] as const;

export function LandingShowcase(): React.ReactElement {
  const t = useTranslations('product.capabilities');

  return (
    <ProductCapabilities
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      outcomeLabel={t('outcomeLabel')}
      items={ICONS.map((icon, index) => {
        const key = index + 1;
        return {
          icon,
          title: t(`items.${key}.title`),
          description: t(`items.${key}.description`),
          result: t(`items.${key}.result`),
        };
      })}
    />
  );
}
