"use client";

import { useEffect, useState } from "react";
import { AnimateOnScroll } from "./animate-on-scroll";
import { PlaceCard } from "./place-card";
import type { Place } from "@/lib/places";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FeaturedShuffled({ places }: { places: Place[] }) {
  const [order, setOrder] = useState<Place[]>(places);

  useEffect(() => {
    setOrder(shuffle(places));
  }, [places]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {order.map((place, i) => (
        <AnimateOnScroll key={place.slug} delay={i * 100}>
          <PlaceCard place={place} />
        </AnimateOnScroll>
      ))}
    </div>
  );
}
