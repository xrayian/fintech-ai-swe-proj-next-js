import TechnicalSuite from '@/components/technical/technical-suite';

export default async function TechnicalPage({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const { symbol } = await searchParams;
  return <TechnicalSuite initialSymbol={symbol} />;
}
