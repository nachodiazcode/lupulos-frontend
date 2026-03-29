"use client";

import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, StepIcon, TiltCard } from "./shared";
import { STEPS } from "./data";

export default function StepsSection() {
  return (
    <section
      className="border-border-subtle relative overflow-hidden border-y py-24 sm:py-28"
      style={{ background: "var(--gradient-section-darker)" }}
      aria-label="Cómo funciona"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ background: "color-mix(in srgb, var(--color-amber-primary) 3%, transparent)" }}
        aria-hidden="true"
      />

      <div className="home-content-shell">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <SectionBadge>Simple como abrir una chela</SectionBadge>
          <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            De curioso a cervecero en <GradientText>tres pasos</GradientText>
          </h2>
          <p className="text-text-muted mt-3 max-w-md text-sm leading-relaxed">
            Ya sea que vengas a descubrir tu próxima cerveza favorita o a mostrar lo que fabricas — en menos de un minuto estás dentro.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Animated connecting line */}
          <motion.div
            className="pointer-events-none absolute top-[52px] right-[calc(100%/6)] left-[calc(100%/6)] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-border-amber) 10%, var(--color-border-amber) 90%, transparent 100%)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.45 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="relative"
            >
              <TiltCard
                className="glass-card group hover:border-amber-primary/25 relative flex h-full flex-col overflow-hidden rounded-2xl p-7"
                style={{}}
                tiltDeg={5}
                glowColor="color-mix(in srgb, var(--color-amber-primary) 6%, transparent)"
              >
                {/* Step number badge with pulse on hover */}
                <motion.div
                  className="text-amber-primary relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full text-sm font-black"
                  style={{
                    background: "var(--color-surface-deepest)",
                    border: "1.5px solid var(--color-border-amber)",
                    boxShadow: "0 0 0 4px var(--color-border-subtle)",
                  }}
                  whileHover={{
                    boxShadow: "0 0 0 4px var(--color-border-subtle), 0 0 20px color-mix(in srgb, var(--color-amber-primary) 30%, transparent)",
                    scale: 1.1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  aria-label={`Paso ${step.number}`}
                >
                  {step.number}
                </motion.div>

                <motion.div
                  className="text-amber-primary relative mb-4"
                  aria-hidden="true"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                >
                  <StepIcon name={step.icon} />
                </motion.div>

                <h3 className="text-text-primary relative text-lg font-bold">{step.title}</h3>
                <p className="text-text-muted relative mt-2 flex-1 text-sm leading-relaxed transition-colors duration-300 group-hover:text-text-secondary">
                  {step.desc}
                </p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-amber-primary), var(--color-orange-cta))",
                  }}
                  aria-hidden="true"
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
