"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterProps = {
  text: string;
  className?: string;
  speed?: number;
};

export function Typewriter({ text, className = "", speed = 60 }: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span ref={ref} className={className}>
      {started ? displayed : "\u00A0"}
      {started && displayed.length < text.length && (
        <span className="inline-block w-[3px] translate-y-[2px] animate-pulse bg-current" style={{ height: "0.85em" }} />
      )}
    </span>
  );
}
