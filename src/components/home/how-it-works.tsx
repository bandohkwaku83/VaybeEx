import { FadeInUp } from "../ui/fadeInUp"
import { Search, CreditCard, Backpack } from "lucide-react"
import { useRef , useEffect} from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"


const STEPS = [
  {
    n: "01",
    title: "Browse the journal",
    body: "Filter by destination, vibe, dates, or budget. Every detail upfront — no surprises.",
    Icon: Search,
  },
  {
    n: "02",
    title: "Apply & pay deposit",
    body: "MoMo, card, or bank transfer. We hold funds in escrow until your trip departs safely.",
    Icon: CreditCard,
  },
  {
    n: "03",
    title: "Pack your bag",
    body: "Meet your group, follow your organiser's pack-list, and just show up. Memories handled.",
    Icon: Backpack,
  },
];

gsap.registerPlugin(ScrollTrigger)

const HowItWorks = () => {

      const stepperRef = useRef<HTMLDivElement>(null);
  const stepperPathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
    const cleanupFns: (() => void)[] = [];
    const ctx = gsap.context(() => {
      // Hero: animated typography reveal + 3D layered parallax
     

      // Stepper: draw connecting path on scroll + reveal nodes
      if (stepperPathRef.current && stepperRef.current) {
        const path = stepperPathRef.current;
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stepperRef.current,
            start: "top 75%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        });
        gsap.from(".step-node", {
          scale: 0.6,
          opacity: 0,
          y: 30,
          stagger: 0.2,
          duration: 0.9,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: stepperRef.current, start: "top 70%" },
        });
        gsap.from(".step-card", {
          y: 40,
          opacity: 0,
          stagger: 0.18,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: stepperRef.current, start: "top 70%" },
        });
      }
    });
    const onResizeGlobal = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResizeGlobal);
    return () => {
      cleanupFns.forEach((fn) => fn());
      window.removeEventListener("resize", onResizeGlobal);
      ctx.revert();
    };
  }, []);
  return (
    <section
          ref={stepperRef}
          className="relative border-t border-border bg-bg-secondary py-24 sm:py-32 overflow-hidden"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <FadeInUp>
              <div className="text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  How it works
                </span>
                <h2 className="mt-3 font-display text-4xl font-bold text-text sm:text-5xl">
                  Three steps.{" "}
                  <span className="italic font-light text-gradient-warm">One great trip.</span>
                </h2>
              </div>
            </FadeInUp>

            {/* Connecting path + nodes */}
            <div className="relative mt-20">
              {/* Desktop wavy path */}
              <svg
                className="pointer-events-none absolute inset-x-0 top-7 hidden h-24 w-full md:block"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M 80 50 Q 250 -10 500 50 T 920 50"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />
                <path
                  ref={stepperPathRef}
                  d="M 80 50 Q 250 -10 500 50 T 920 50"
                  stroke="url(#stepperGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="stepperGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6B3F1D" />
                    <stop offset="50%" stopColor="#C4864C" />
                    <stop offset="100%" stopColor="#B5523A" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Mobile vertical line */}
              <div className="absolute bottom-0 left-7 top-0 w-px border-l-2 border-dashed border-border md:hidden" />

              <div className="relative grid gap-12 md:grid-cols-3 md:gap-6">
                {STEPS.map((s, i) => (
                  <div
                    key={s.n}
                    className="relative flex flex-col items-center md:items-center text-center"
                  >
                    {/* Node */}
                    <div className="step-node relative z-10 mb-6 grid h-14 w-14 place-items-center rounded-full bg-bg shadow-[0_0_0_6px_var(--bg-secondary)] ring-2 ring-primary">
                      <div className="grid h-full w-full place-items-center rounded-full bg-gradient-teal text-primary-foreground">
                        <s.Icon size={20} />
                      </div>
                      <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-gold text-[11px] font-bold text-primary-dark ring-2 ring-bg-secondary">
                        {i + 1}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="step-card w-full max-w-sm rounded-3xl border border-border bg-surface p-7 shadow-[0_30px_60px_-40px_rgba(74,42,18,0.45)]">
                      <span className="font-display text-5xl font-bold text-primary/10">{s.n}</span>
                      <h3 className="-mt-4 font-display text-2xl font-bold text-text">{s.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  )
}

export default HowItWorks