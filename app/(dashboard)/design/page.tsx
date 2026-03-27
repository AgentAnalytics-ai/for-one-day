import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PageHeader } from '@/components/ui/page-header'

const colors = [
  { name: 'Canvas', value: 'bg-slate-50', label: '#F8FAFC - App background' },
  { name: 'Surface', value: 'bg-white', label: '#FFFFFF - Cards and panels' },
  { name: 'Primary', value: 'bg-primary-900', label: '#102A43 - Main actions and active states' },
  { name: 'Primary Soft', value: 'bg-primary-100', label: '#D9E6F1 - Gentle emphasis surfaces' },
  { name: 'Accent', value: 'bg-accent-600', label: '#D97706 - Highlights and milestones' },
]

export default function DesignSystemPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        eyebrow="Design"
        title="Design System (Lite)"
        subtitle="A lightweight source of truth for tokens, typography, and reusable UI patterns."
      />

      <section className="space-y-4">
        <h2 className="section-title">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {colors.map((color) => (
            <PremiumCard key={color.name} className="p-3 space-y-2">
              <div className={`h-12 rounded-lg border border-slate-200 ${color.value}`} />
              <p className="card-heading text-sm">{color.name}</p>
              <p className="text-xs text-slate-600">{color.label}</p>
            </PremiumCard>
          ))}
        </div>
        <PremiumCard className="p-4">
          <p className="text-sm text-slate-700">
            Usage ratio: <strong>70% neutrals</strong>, <strong>20% primary navy</strong>,{' '}
            <strong>10% amber accent</strong>. Keep accents intentional so the product feels calm and trustworthy.
          </p>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Typography</h2>
        <PremiumCard className="p-5 space-y-4">
          <div>
            <p className="page-title">Page Title</p>
            <p className="page-subtitle">Used for page-level headings.</p>
          </div>
          <div>
            <p className="section-title">Section Title</p>
            <p className="section-description">Used for section-level structure within pages.</p>
          </div>
          <div>
            <p className="card-heading">Card Heading</p>
            <p className="text-sm text-slate-600">Used inside cards and modals.</p>
          </div>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Primary Components</h2>
        <PremiumCard className="p-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            <PremiumButton>Primary Action</PremiumButton>
            <PremiumButton variant="secondary">Secondary</PremiumButton>
            <PremiumButton variant="danger">Danger</PremiumButton>
          </div>
          <p className="section-description">
            Use these shared primitives before introducing one-off button styles.
          </p>
        </PremiumCard>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Golden Path Coverage</h2>
        <PremiumCard className="p-5">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Today empty state</li>
            <li>Today filled + save success</li>
            <li>Memories list and person timeline</li>
            <li>Upgrade and Pro-gate moments</li>
          </ul>
        </PremiumCard>
      </section>
    </div>
  )
}
