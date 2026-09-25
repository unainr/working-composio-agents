"use client";

import { AnimatedBars } from "./animated-bar";
import ScrollOverHero from "./scroll-hero";


export default function AmanisesHero() {
  return (
    <div className="w-full">
      <AnimatedBars numBars={20} className="h-full">
      <ScrollOverHero
        className="bg-transparent!"
        title="Every metric that matters, in one view."
        description="Real-time dashboards that turn raw events into decisions."
        actions={
          <>
            <button className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
              Start free
            </button>
            <button className="rounded-full px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-border">
              Book a demo
            </button>
          </>
        }
        media={
          <img
            src="/das1.png"
            alt="Product dashboard"
            className="aspect-video w-full object-cover"
          />
        }
      />
      
 </AnimatedBars>
    </div>
  );
}