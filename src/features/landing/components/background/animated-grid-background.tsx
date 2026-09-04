"use client";

import { useEffect, useRef } from "react";

const BACKGROUND_DOTS: React.CSSProperties[] = [
  {
    left: "7%",
    top: "13%",
    animationDelay: "0s",
    animationDuration: "6.2s",
    opacity: 0.48,
  },
  {
    left: "93%",
    top: "9%",
    animationDelay: "-2.4s",
    animationDuration: "7.8s",
    opacity: 0.4,
  },
  {
    left: "14%",
    top: "80%",
    animationDelay: "-4s",
    animationDuration: "5.6s",
    opacity: 0.42,
  },
  {
    left: "88%",
    top: "76%",
    animationDelay: "-1.2s",
    animationDuration: "8.4s",
    opacity: 0.38,
  },
  {
    left: "52%",
    top: "5%",
    animationDelay: "-3.6s",
    animationDuration: "6.8s",
    opacity: 0.34,
  },
  {
    left: "44%",
    top: "92%",
    animationDelay: "-2.8s",
    animationDuration: "7.6s",
    opacity: 0.4,
  },
];

export function AnimatedGridBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    let targetX = 50;
    let targetY = 50;

    const onMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--mx", `${targetX.toFixed(2)}%`);
      element.style.setProperty("--my", `${targetY.toFixed(2)}%`);
      element.style.setProperty("--grid-opacity", "1");
    };

    const onMouseLeave = () => {
      element.style.setProperty("--grid-opacity", "0");
    };

    const onClick = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const ripple = document.createElement("div");
      ripple.className = "landing-click-ripple";
      ripple.style.left = `${(event.clientX - rect.left).toFixed(1)}px`;
      ripple.style.top = `${(event.clientY - rect.top).toFixed(1)}px`;
      element.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="landing-welcome-bg">
      <div className="landing-welcome-scene">
        <div className="landing-welcome-grid" />
        {BACKGROUND_DOTS.map((dot, index) => (
          <div key={index} className="landing-dot" style={dot} />
        ))}
      </div>
    </div>
  );
}
