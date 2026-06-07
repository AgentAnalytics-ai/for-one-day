import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { KitchenWallPreview } from '@/components/marketing/kitchen-wall-preview'
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll'

/**
 * 2027 marketing surface — daily plan lead, memories as plus.
 * Product IA (Step 8) unchanged; outward psychology aligned with brand-vision.
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-8 md:px-8 md:pb-28 md:pt-12">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="page-eyebrow mb-6">Your family&apos;s daily plan</span>

            <h1 className="text-balance text-4xl font-serif font-light leading-tight text-primary-900 md:text-5xl lg:text-6xl">
              Know what matters today.
              <span className="mt-2 block font-medium text-primary-900/90">
                Keep what matters for one day.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#5C6478] md:text-xl lg:mx-0">
              Dinner, schedule, and lists — glanceable on the kitchen tablet.
              Save memories and keepsakes on your phone when you&apos;re ready.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/auth/signup" className="btn-primary touch-tablet gap-2 px-8 py-3.5 text-base">
                Start with Today
                <ArrowIcon />
              </Link>
              <Link href="/auth/login" className="btn-secondary touch-tablet px-8 py-3.5 text-base">
                Sign in
              </Link>
            </div>

            <Link
              href="#how"
              className="mt-6 inline-block text-sm font-medium text-[#5C6478] transition-colors hover:text-primary-900"
            >
              See how it works
            </Link>
          </div>

          <KitchenWallPreview className="lg:max-w-none" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-[#E7E2DA] bg-white/50 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="mb-14 text-center">
              <p className="section-label mb-3">Three steps</p>
              <h2 className="text-3xl font-serif font-light text-primary-900 md:text-4xl">
                Calm at home. Depth on your phone.
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid gap-8 md:grid-cols-3">
            <RevealOnScroll stagger={1}>
              <StepCard
                step="1"
                title="Set up your home"
                description="Name your household and invite your spouse. One plan covers everyone at home."
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={2}>
              <StepCard
                step="2"
                title="Glance at Today"
                description="Schedule, dinner tonight, and our focus — answered in three seconds on the wall."
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={3}>
              <StepCard
                step="3"
                title="Save what lasts"
                description="On your phone, save a memory or write a keepsake for the people you love."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Wall vs phone */}
      <section className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <p className="section-label mb-3">Wall and phone</p>
              <h2 className="text-3xl font-serif font-light text-primary-900 md:text-4xl">
                Different screens. Same household.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#5C6478]">
                The kitchen wall is for daily ops — not memory browsing.
                Reflective work lives on your phone, inside More.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 md:grid-cols-2">
            <RevealOnScroll stagger={1}>
              <div className="surface-card p-6 md:p-8">
                <span className="page-eyebrow mb-4">Kitchen wall</span>
                <h3 className="card-heading mb-3">Today · This week · Lists</h3>
                <p className="text-sm leading-relaxed text-[#5C6478]">
                  Big type, soft cards, no forms. Dinner and soccer before coffee is poured.
                  Family settings behind a gear — not a bottom tab.
                </p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll stagger={2}>
              <div className="surface-card p-6 md:p-8">
                <span className="page-eyebrow mb-4">Your phone</span>
                <h3 className="card-heading mb-3">Today · Lists · This week · More</h3>
                <p className="text-sm leading-relaxed text-[#5C6478]">
                  Inside More: memories, keepsakes, and family.
                  One subtle memory line on Today — tap when you&apos;re ready.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Plus layer */}
      <section id="features" className="border-t border-[#E7E2DA] bg-white/50 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <p className="section-label mb-3">The plus</p>
              <h2 className="text-3xl font-serif font-light text-primary-900 md:text-4xl">
                Daily plan first. Memories when it matters.
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 md:grid-cols-3">
            <RevealOnScroll stagger={1}>
              <FeatureCard
                title="Schedule & dinner"
                preview="3:30 PM · Soccer · Tacos tonight"
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={2}>
              <FeatureCard
                title="Lists that stick"
                preview="Groceries · Pack lunches · Call Grandma"
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={3}>
              <FeatureCard
                title="Memories & keepsakes"
                preview="A note for Sara · A keepsake for Josie"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="mb-14 text-center">
              <p className="section-label mb-3">One home</p>
              <h2 className="text-3xl font-serif font-light text-primary-900 md:text-4xl">
                Choose your plan
              </h2>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <PricingTable />
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#E7E2DA] bg-white/50 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <RevealOnScroll>
            <h2 className="mb-12 text-center text-3xl font-serif font-light text-primary-900 md:text-4xl">
              Questions
            </h2>
          </RevealOnScroll>

          <div className="space-y-4">
            <RevealOnScroll stagger={1}>
              <FAQItem
                question="Is this built for a kitchen tablet?"
                answer="Yes. Today is designed to be glanceable on a wall-mounted tablet — schedule, dinner, and lists without digging through menus."
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={2}>
              <FAQItem
                question="Does my spouse get Pro?"
                answer="One Pro plan covers your household. When you invite your spouse, they inherit Pro — no second subscription."
              />
            </RevealOnScroll>
            <RevealOnScroll stagger={3}>
              <FAQItem
                question="Where do memories live?"
                answer="On your phone, inside More — not as a tab on the kitchen wall. Save a memory or write a keepsake when you're ready."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 md:px-8 md:py-24">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-serif font-light text-primary-900 md:text-4xl">
              Start with Today
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#5C6478]">
              Set up your home&apos;s daily plan free. Add memories and keepsakes whenever you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup" className="btn-primary touch-tablet px-8 py-3.5 text-base">
                Start with Today
              </Link>
              <Link href="#pricing" className="btn-secondary touch-tablet px-8 py-3.5 text-base">
                See plans
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-[#E7E2DA] bg-primary-900 px-6 py-14 text-white md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl font-light">For One Day</p>
          <p className="mt-2 text-sm text-white/70">
            Know what matters today. Keep what matters for one day.
          </p>
        </div>
      </footer>
    </main>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="surface-card p-6 text-center md:p-8">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-900 text-lg font-semibold text-white">
        {step}
      </div>
      <h3 className="card-heading mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-[#5C6478]">{description}</p>
    </div>
  )
}

function FeatureCard({ title, preview }: { title: string; preview: string }) {
  return (
    <div className="surface-card p-6">
      <h3 className="card-heading mb-4">{title}</h3>
      <div className="surface-inset p-4">
        <p className="text-sm italic text-[#5C6478]">{preview}</p>
      </div>
    </div>
  )
}

function PricingTable() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
      <PricingCard
        name="Free"
        price="$0"
        description="Start your home's daily plan"
        features={[
          'Household setup',
          '3 saved keepsakes',
          '10 people in Memories',
          'Daily reflections on phone',
        ]}
        cta="Start with Today"
        href="/auth/signup"
        popular={false}
      />
      <PricingCard
        name="Pro"
        price="$9.99"
        period="/mo per home"
        description="Run the full week for your household"
        features={[
          'Spouse inherits Pro — one subscription',
          'Unlimited keepsakes',
          'Unlimited people in Memories',
          'AI writing tools on phone',
        ]}
        cta="Run the full week"
        href="/auth/signup"
        popular
      />
    </div>
  )
}

function PricingCard({
  name,
  price,
  period = '',
  description,
  features,
  cta,
  href,
  popular,
}: {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  href: string
  popular: boolean
}) {
  return (
    <div
      className={`surface-card relative p-6 md:p-8 ${popular ? 'ring-2 ring-accent-500/40' : ''}`}
    >
      {popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-600 px-4 py-1 text-xs font-semibold text-white">
          For your home
        </span>
      ) : null}

      <h3 className="card-heading mb-1">{name}</h3>
      <div className="mb-3">
        <span className="text-3xl font-bold text-primary-900">{price}</span>
        {period ? <span className="text-sm text-[#5C6478]"> {period}</span> : null}
      </div>
      <p className="mb-6 text-sm text-[#5C6478]">{description}</p>

      <ul className="mb-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-[#5C6478]">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={popular ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}
      >
        {cta}
      </Link>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="surface-card p-6">
      <h3 className="mb-2 text-base font-semibold text-primary-900">{question}</h3>
      <p className="text-sm leading-relaxed text-[#5C6478]">{answer}</p>
    </div>
  )
}
