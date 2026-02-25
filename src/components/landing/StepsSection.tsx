"use client";

import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, StepIcon } from "./shared";
import { STEPS } from "./data";

export default function StepsSection() {
  return (
    <section
      className="border-border-subtle relative overflow-hidden border-y py-20 sm:py-24"
      style={{ background: "var(--gradient-section-darker)" }}
      aria-label="Cómo funciona"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <SectionBadge>Cómo funciona</SectionBadge>
          <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Tres pasos para comenzar <GradientText>tu aventura</GradientText>
          </h2>
        </motion.div>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div
            className="pointer-events-none absolute top-[44px] right-[calc(100%/6)] left-[calc(100%/6)] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-border-amber) 10%, var(--color-border-amber) 90%, transparent 100%)",
              opacity: 0.45,
            }}
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
              <div
                className="group border-border-subtle hover:border-amber-primary/25 flex h-full flex-col rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-0.5"
                style={{ background: "var(--gradient-card-step)" }}
              >
                <div
                  className="text-amber-primary relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
                  style={{
                    background: "var(--color-surface-deepest)",
                    border: "1.5px solid var(--color-border-amber)",
                    boxShadow: "0 0 0 4px var(--color-border-subtle)",
                  }}
                  aria-label={`Paso ${step.number}`}
                >
                  {step.number}
                </div>

                <div className="text-amber-primary mb-3" aria-hidden="true">
                  <StepIcon name={step.icon} />
                </div>

                <h3 className="text-text-primary text-base font-bold">{step.title}</h3>
                <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
