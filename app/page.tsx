import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 🏠 Billion-Dollar UI Landing Page - 2026 Design
 * Smooth-scroll single-page experience with expert-validated sections
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/ForOneDay_HeroLockup.png"
              alt="For One Day"
              width={400}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          
          {/* Hero Copy */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-gray-900 mb-8 leading-tight">
            Live today.<br />
            <span className="font-medium">Prepare for the day that matters most.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            Preserve your legacy with secure, encrypted letters and messages for your family.
          </p>
          
          {/* Primary CTA */}
          <div className="mb-20">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 bg-blue-900 hover:bg-blue-800 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Free Today
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link
              href="#how"
              className="block mt-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-24 px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-center text-gray-900 mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <HowItWorksCard
              step="1"
              title="Write Your Legacy"
              subtitle="Secure & Private"
              description="Create letters, messages, and memories for your family in a secure vault."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
            />
            
            <HowItWorksCard
              step="2"
              title="Organize & Share"
              subtitle="Family Access"
              description="Designate trusted family members to access your legacy when needed."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            
            <HowItWorksCard
              step="3"
              title="Peace of Mind"
              subtitle="Forever Secure"
              description="Your words are encrypted, backed up, and preserved for generations to come."
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Feature Previews Section */}
      <section id="features" className="py-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-center text-gray-900 mb-16">
            See It In Action
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeaturePreviewCard
              title="Daily Devotion"
              preview="What unexpected blessing did you notice today?"
              microCTA="Try This"
              href="/auth/signup"
            />
            
            <FeaturePreviewCard
              title="Table Talk"
              preview="Which day do you think Dad felt most grateful?"
              microCTA="Try This"
              href="/auth/signup"
            />
            
            <FeaturePreviewCard
              title="For One Day"
              preview="Letter to My Daughter • release: wedding day"
              microCTA="Try This"
              href="/auth/signup"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="stories" className="py-24 px-6 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-16">
            Trusted by fathers across the country
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <TestimonialCard
              quote="Changed how I lead my family. Three minutes that matter."
              author="David, Father of 3"
            />
            
            <TestimonialCard
              quote="Finally, a way to connect with my kids that feels authentic."
              author="Marcus, Father of 2"
            />
            
            <TestimonialCard
              quote="Knowing my family will have my words forever brings peace."
              author="James, Father of 4"
            />
          </div>
          
          <p className="text-lg text-gray-600">
            Join a growing movement of fathers building what lasts.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-center text-gray-900 mb-16">
            Choose Your Legacy Journey
          </h2>
          
          <PricingTable />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <FAQItem
              question="Is this faith-specific?"
              answer="Faith-friendly, not pushy. You control content."
            />
            
            <FAQItem
              question="Is my data secure?"
              answer="Encrypted storage, timed releases, cancel anytime."
            />
            
            <FAQItem
              question="Can my spouse see it?"
              answer="Yes—grant access for Table Talk and shared memories."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-8">
            Start building what lasts
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link
              href="/auth/signup"
              className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Free Today
            </Link>
            
            <Link
              href="#pricing"
              className="text-gray-700 hover:text-gray-900 px-10 py-4 rounded-full text-lg font-medium transition-colors border border-gray-300 hover:border-gray-400"
            >
              See Pricing
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            Encrypted storage · Cancel anytime · Built for fathers who lead with love.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-8 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/ForOneDay_PrimaryLogo.png"
              alt="For One Day"
              width={200}
              height={60}
              className="mx-auto opacity-80"
            />
          </div>
          <p className="text-gray-400 text-sm">
            For fathers building what lasts.
          </p>
        </div>
      </footer>
    </main>
  )
}

function HowItWorksCard({ 
  step, 
  title, 
  subtitle, 
  description, 
  icon 
}: { 
  step: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full mb-6 text-xl font-bold">
        {step}
      </div>
      
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-6 group-hover:bg-primary-100 transition-colors duration-300">
        <div className="text-primary-600">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-primary-600 font-medium mb-4">
        {subtitle}
      </p>
      
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function FeaturePreviewCard({ 
  title, 
  preview, 
  microCTA, 
  href 
}: { 
  title: string
  preview: string
  microCTA: string
  href: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-serif font-medium text-gray-900 mb-4">
        {title}
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-gray-700 text-sm italic">
          &ldquo;{preview}&rdquo;
        </p>
      </div>
      
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
      >
        {microCTA}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

function TestimonialCard({ 
  quote, 
  author 
}: { 
  quote: string
  author: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <p className="text-gray-700 italic mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-sm text-gray-600 font-medium">
        — {author}
      </p>
    </div>
  )
}

function PricingTable() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <PricingCard
        name="Free"
        price="$0"
        period=""
        description="Perfect for getting started"
        features={[
          "Daily devotions",
          "5 legacy notes",
          "Basic reflections",
          "Email reminders"
        ]}
        cta="Start Free"
        href="/auth/signup"
        popular={false}
      />
      
      <PricingCard
        name="Pro"
        price="$9.99"
        period="/mo"
        description="Complete legacy platform"
        features={[
          "Unlimited legacy notes",
          "Unlimited reflections",
          "Family sharing",
          "AI-powered devotionals",
          "Priority support"
        ]}
        cta="Upgrade to Pro"
        href="/auth/signup"
        popular={true}
      />
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  href, 
  popular 
}: { 
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  href: string
  popular: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border-2 p-6 ${popular ? 'border-primary-500 shadow-lg' : 'border-gray-200 shadow-sm'} relative`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
        {name}
      </h3>
      
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-600">{period}</span>
      </div>
      
      <p className="text-gray-600 mb-6">
        {description}
      </p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        href={href}
        className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
          popular 
            ? 'bg-primary-500 hover:bg-primary-600 text-white' 
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function FAQItem({ 
  question, 
  answer 
}: { 
  question: string
  answer: string
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        {question}
      </h3>
      <p className="text-gray-600">
        {answer}
      </p>
    </div>
  )
}

