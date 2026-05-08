import CompareAnalytics from '@/components/compare/compare-analytics';

export const dynamic = 'force-dynamic';

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const { symbol } = await searchParams;
  return <CompareAnalytics initialSymbol={symbol} />;
}
