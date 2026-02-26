"use client";

import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, StepIcon } from "./shared";
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
        style={{ background: "rgba(251,191,36,0.03)" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <SectionBadge>Cómo funciona</SectionBadge>
          <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Tres pasos para comenzar <GradientText>tu aventura</GradientText>
          </h2>
          <p className="text-text-muted mt-3 max-w-md text-sm leading-relaxed">
            Regístrate, explora y conecta con la comunidad cervecera más apasionada.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div
            className="pointer-events-none absolute top-[52px] right-[calc(100%/6)] left-[calc(100%/6)] hidden h-px md:block"
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
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group border-border-subtle hover:border-amber-primary/25 relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-500"
                style={{ background: "var(--gradient-card-step)" }}
              >
                {/* Hover glow overlay */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.08), transparent 60%)",
                  }}
                  aria-hidden="true"
                />

                {/* Step number badge */}
                <div
                  className="text-amber-primary relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full text-sm font-black transition-shadow duration-500 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                  style={{
                    background: "var(--color-surface-deepest)",
                    border: "1.5px solid var(--color-border-amber)",
                    boxShadow: "0 0 0 4px var(--color-border-subtle)",
                  }}
                  aria-label={`Paso ${step.number}`}
                >
                  {step.number}
                </div>

                <div
                  className="text-amber-primary relative mb-4 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <StepIcon name={step.icon} />
                </div>

                <h3 className="text-text-primary relative text-lg font-bold">{step.title}</h3>
                <p className="text-text-muted relative mt-2 flex-1 text-sm leading-relaxed">
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
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
