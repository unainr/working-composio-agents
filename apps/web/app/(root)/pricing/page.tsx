// app/pricing/page.tsx
import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-center mb-2">Choose your plan</h1>
      <p className="text-muted-foreground text-center mb-10">
        Free includes 3 agents and 40 conversation credits. Pro unlocks 10 agents and 200 credits.
      </p>
      <PricingTable />
    </div>
  );
}