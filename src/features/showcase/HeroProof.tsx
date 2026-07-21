'use client';

import { useTranslations } from 'next-intl';

import {
  HeroWorkflowStory,
  type HeroWorkflowCopy,
} from '@/features/home/components/HeroWorkflowStory';

export function HeroProof(): React.ReactElement {
  const t = useTranslations('product.heroStory');

  const copy: HeroWorkflowCopy = {
    badge: t('badge'),
    inputLabel: t('inputLabel'),
    input: t('input'),
    bridgeLabel: t('bridgeLabel'),
    bridge: t('bridge'),
    productLabel: t('productLabel'),
    productAction: t('productAction'),
    detailOne: t('detailOne'),
    detailTwo: t('detailTwo'),
    resultLabel: t('resultLabel'),
    result: t('result'),
    businessLabel: t('businessLabel'),
    businessValue: t('businessValue'),
    replay: t('replay'),
  };

  return (
    <HeroWorkflowStory
      demoId="app-hero"
      mode="autonomous"
      productName="aiAPP"
      productIcon="solar:smartphone-bold-duotone"
      copy={copy}
    />
  );
}
