import AICopilot from '@/components/ai/ai-copilot';

export default async function CopilotPage({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const { symbol } = await searchParams;
  return (
    <div style={{ padding: "16px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
      <AICopilot initialSymbol={symbol} />
    </div>
  );
}
