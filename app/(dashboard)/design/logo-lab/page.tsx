import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PageHeader } from '@/components/ui/page-header'
import { LOGO_VARIANTS } from '@/components/brand/logo-variants'
import { BrandLogo } from '@/components/brand/brand-logo'
import { SunMotif } from '@/components/brand/sun-motif'
import { BRAND_PALETTES } from '@/components/brand/palettes'
import { NavPillLogo } from '@/components/brand/nav-pill-logo'

export default function LogoLabPage() {
  if (process.env.NODE_ENV === 'production' && process.env.SHOW_DESIGN_SYSTEM !== 'true') {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        backHref="/design"
        backLabel="← Design System"
        eyebrow="Brand"
        title="Logo Lab"
        subtitle="Compare favicon-ready marks + button treatments. Pick one winner; we’ll wire it into nav + icons."
      />

      <section className="space-y-4">
        <h2 className="section-title">Mark Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOGO_VARIANTS.map(({ id, name, Mark }) => (
            <PremiumCard key={id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="card-heading">{name}</p>
                  <p className="text-sm text-slate-600">
                    Test it mentally at 16px. Does it still read?
                  </p>
                </div>
                <Mark className="h-12 w-12" />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <Mark className="h-6 w-6" />
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <Mark className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-500">32px • 24px • 16px</div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Lockups (Real-world previews)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* A) Wordmark alone – primary logo */}
          <PremiumCard className="p-5 space-y-4">
            <p className="card-heading">Primary logo (wordmark)</p>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-serif font-semibold tracking-tight text-slate-900">
                For One Day
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Use this on the hero, emails, legal pages, and OG images. The name does the recognition work.
            </p>
          </PremiumCard>

          {/* B) Sun tile – icon / app mark */}
          <PremiumCard className="p-5 space-y-4">
            <p className="card-heading">Sun tile (icon mark)</p>
            <div className="flex items-center justify-center">
              <div className="rounded-xl bg-slate-900 px-3 py-3 shadow-sm">
                <BrandLogo mark="horizon-a" markClassName="h-7 w-7" showText={false} />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Ideal for favicon, app icon, and tiny avatars where there&apos;s no room for the name.
            </p>
          </PremiumCard>

          {/* C) Stacked motif + wordmark – hero lockup */}
          <PremiumCard className="p-5 space-y-4">
            <p className="card-heading">Hero lockup (sun above)</p>
            <div className="flex items-center justify-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="rounded-full bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                  <SunMotif className="h-8 w-auto" />
                </div>
                <span className="text-2xl font-serif font-semibold tracking-tight text-slate-900">
                  For One Day
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Use this motif + wordmark stack sparingly on the landing hero or key headers for a &ldquo;new day&rdquo;
              feel.
            </p>
          </PremiumCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Button Feel</h2>
        <PremiumCard className="p-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            <PremiumButton>Primary</PremiumButton>
            <PremiumButton variant="secondary">Secondary</PremiumButton>
            <PremiumButton variant="ghost">Ghost</PremiumButton>
          </div>
          <p className="section-description">
            Next step: once you pick the winning mark, we’ll subtly echo the amber “moment dot” in Pro
            highlights and success moments—without turning the UI loud.
          </p>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Palette Lab (psychology-based)</h2>
        <p className="text-sm text-slate-600">
          These are distinct brand directions. Judge them by: calm, trust, premium feel, and how strongly they
          match “memories-first”.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {BRAND_PALETTES.map((p) => (
            <PremiumCard key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="card-heading">{p.name}</p>
                  <p className="text-sm text-slate-600">{p.pitch}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {[
                  { label: 'Canvas', color: p.colors.canvas },
                  { label: 'Surface', color: p.colors.surface },
                  { label: 'Primary', color: p.colors.primary },
                  { label: 'Accent', color: p.colors.accent },
                  { label: 'Border', color: p.colors.border },
                ].map((c) => (
                  <div key={c.label} className="space-y-1">
                    <div
                      className="h-8 rounded-md border border-slate-200"
                      style={{ backgroundColor: c.color }}
                      title={c.color}
                    />
                    <div className="text-[11px] text-slate-500">{c.label}</div>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 rounded-xl border p-4"
                style={{ backgroundColor: p.colors.canvas, borderColor: p.colors.border }}
              >
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: p.colors.surface, borderColor: p.colors.border }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-lg"
                        style={{ backgroundColor: p.colors.primary }}
                        aria-hidden
                      />
                      <div>
                        <div style={{ color: p.colors.text, fontWeight: 600, fontSize: 14 }}>
                          Capture a moment
                        </div>
                        <div style={{ color: p.colors.muted, fontSize: 12 }}>
                          Calm UI, clear action, premium tone.
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded-full px-2 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: p.colors.accent, color: '#fff' }}
                    >
                      Pro
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-semibold"
                      style={{ backgroundColor: p.colors.primary, color: '#fff' }}
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${p.colors.border}`,
                        color: p.colors.text,
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">What to do next</h2>
        <PremiumCard className="p-5">
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>Pick a mark: <strong>horizon-a</strong> (recommended), horizon-b, or handoff-a.</li>
            <li>We set it as the default in the nav + header, and update the app icon generator.</li>
            <li>We generate a clean OG image so links look like a real product.</li>
          </ol>
          <div className="mt-4">
            <Link href="/dashboard" className="text-sm text-blue-800 hover:underline">
              Back to Today
            </Link>
          </div>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Brand spec (company-level)</h2>
        <PremiumCard className="p-5 space-y-3">
          <p className="text-sm text-slate-700">
            This is how <span className="font-semibold">For One Day</span> should look everywhere so it feels like a real
            company, not just a nice phrase.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
            <li>
              <span className="font-semibold">Primary logo = wordmark</span> – use <span className="font-mono">For One Day</span>{' '}
              in this exact serif treatment for nav, emails, legal pages, and OG images.
            </li>
            <li>
              <span className="font-semibold">Primary mark = sun tile</span> – favicon, app icon, and tiny avatars only.
            </li>
            <li>
              <span className="font-semibold">Hero lockup</span> – sunrise motif above the wordmark on the marketing hero
              (not inside the app shell).
            </li>
            <li>
              <span className="font-semibold">Product shell vs. pages</span> – brand lives in the top nav and footer; page
              headers like <span className="font-mono">Today</span> or <span className="font-mono">Memories</span> are
              logo‑free.
            </li>
            <li>
              <span className="font-semibold">No intersections</span> – never let borders, rules, or gradients cross
              through the logo or sunrise; they always sit inside padded containers.
            </li>
          </ul>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Motion concepts & usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nav pill logo */}
          <PremiumCard className="p-5 space-y-3">
            <p className="card-heading">Nav pill logo (shell)</p>
            <div className="flex items-center justify-center py-2">
              <NavPillLogo />
            </div>
            <p className="text-sm text-slate-600">
              Primary in-app logo: <span className="font-semibold">sun motif above</span> a navy wordmark pill (no mark
              inside the pill). Lives in the top header, centered. Static in product (no animation).
            </p>
          </PremiumCard>

          {/* Hero entrance */}
          <PremiumCard className="p-5 space-y-3">
            <p className="card-heading">Hero logo entrance</p>
            <div className="flex items-center justify-center py-2">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="rounded-full bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                  <SunMotif className="h-8 w-auto" />
                </div>
                <span className="text-2xl font-serif font-semibold tracking-tight text-slate-900">
                  For One Day
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Marketing-only. On the landing hero, fade the sun chip and wordmark up once on page load (no loops).
            </p>
          </PremiumCard>

          {/* Celebration moment */}
          <PremiumCard className="p-5 space-y-3">
            <p className="card-heading">First keepsake celebration</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200">
                  <SunMotif className="h-5 w-auto" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">A new day in their story</p>
                  <p className="text-xs text-slate-600">
                    After the first keepsake is saved, show this once with a gentle one-time glow on the sun.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Product moment. Never used in the header. Appears once after the first successful keepsake save, then
              remembered.
            </p>
          </PremiumCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Header logo presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PremiumCard className="p-5 space-y-3">
            <p className="card-heading">Premium calm (current default)</p>
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-5">
              <NavPillLogo variant="premium-calm" />
            </div>
            <p className="text-sm text-slate-600">
              Softer contrast and cleaner rhythm for everyday product use.
            </p>
          </PremiumCard>

          <PremiumCard className="p-5 space-y-3">
            <p className="card-heading">Bold brand</p>
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-5">
              <NavPillLogo variant="bold-brand" />
            </div>
            <p className="text-sm text-slate-600">
              Larger sun and stronger wordmark for maximum brand presence.
            </p>
          </PremiumCard>
        </div>
      </section>
    </div>
  )
}

