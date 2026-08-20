/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import AnimatedLogo from "@public/animated-logo.gif";

export function SplashScreen() {
  const screenRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Only show on first visit per session
    if (sessionStorage.getItem("vbx-splash-seen")) {
      setVisible(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("vbx-splash-seen", "1");
        setVisible(false);
      },
    });

    /* ── 1. Backdrop fade in ── */
    tl.fromTo(
      screenRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
    );

    /* ── 2. Logo scale + glow ── */
    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotate: -15 },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.9,
        ease: "back.out(1.7)",
      },
      "-=0.15",
    );

    // glow pulse on the logo
    tl.to(
      logoRef.current,
      {
        filter: "drop-shadow(0 0 30px rgba(196,134,76,0.6))",
        duration: 0.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
      },
      "-=0.3",
    );

    /* ── 3. Divider line draws in ── */
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: "power3.inOut" },
      "-=0.8",
    );

    /* ── 4. Title letters reveal ── */
    const letters = titleRef.current?.querySelectorAll(".splash-letter");
    if (letters?.length) {
      tl.fromTo(
        letters,
        { y: 60, opacity: 0, rotateX: -40 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
    }

    /* ── 5. Tagline fade up ── */
    tl.fromTo(
      taglineRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2",
    );

    /* ── 6. Preview keywords stagger in ── */
    const words = wordsRef.current?.querySelectorAll(".splash-word");
    if (words?.length) {
      tl.fromTo(
        words,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.15",
      );
    }

    /* ── 7. Hold for a beat ── */
    tl.to({}, { duration: 0.6 });

    /* ── 8. Exit — everything scales down and fades ── */
    // fade out spinner
    tl.to(".splash-spinner", {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });

    tl.to(
      [logoRef.current, titleRef.current, taglineRef.current, lineRef.current],
      {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.04,
      },
      "-=0.1",
    );

    tl.to(
      wordsRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
      },
      "-=0.3",
    );

    tl.to(
      screenRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      },
      "-=0.2",
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={screenRef}
      className="splash-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background:
          "linear-gradient(160deg, #1a0f08 0%, #2a1b0f 40%, #1a0f08 100%)",
        overflow: "hidden",
      }}
    >
      {/* subtle grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          pointerEvents: "none",
        }}
      />

      {/* corner dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle, #c4864c 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* ── Logo ── */}
      <div
        ref={logoRef}
        style={{
          position: "relative",
          zIndex: 1,
          filter: "drop-shadow(0 0 20px rgba(196,134,76,0.3))",
        }}
      >
        <Image
          src={AnimatedLogo}
          alt="VaybeEx"
          width={100}
          height={100}
          priority
          unoptimized
          style={{ display: "block" }}
        />
        {/* spinning ring loader */}
        <div className="splash-spinner" />
      </div>

      {/* ── Divider line ── */}
      <div
        ref={lineRef}
        style={{
          width: "80px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #c4864c, transparent)",
          transformOrigin: "center",
          zIndex: 1,
        }}
      />

      {/* ── Title: VAYBEEX ── */}
      <h1
        ref={titleRef}
        style={{
          fontFamily:
            "var(--font-big-shoulders), var(--font-display), sans-serif",
          fontSize: "clamp(36px, 8vw, 72px)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#fbf7f1",
          display: "flex",
          gap: "0.02em",
          perspective: "600px",
          zIndex: 1,
          margin: 0,
        }}
      >
        {"VAYBE".split("").map((ch, i) => (
          <span
            key={`v-${i}`}
            className="splash-letter"
            style={{ display: "inline-block" }}
          >
            {ch}
          </span>
        ))}
        <span
          className="splash-letter"
          style={{ display: "inline-block", color: "#c4864c" }}
        >
          EX
        </span>
      </h1>

      {/* ── Tagline ── */}
      <p
        ref={taglineRef}
        style={{
          fontFamily: "var(--font-display), var(--font-sans), sans-serif",
          fontSize: "clamp(12px, 1.5vw, 18px)",
          fontWeight: 400,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(251,247,241,0.5)",
          zIndex: 1,
          margin: 0,
        }}
      >
        Group Travel, Reimagined
      </p>
    </div>
  );
}
