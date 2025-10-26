import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12">
          <div className="mb-8">
            <Image
              src="/ForOneDay_PrimaryLogo.png"
              alt="For One Day"
              width={200}
              height={60}
              className="mb-6"
            />
            <h1 className="text-4xl font-serif font-light text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using For One Day ("Service"), you accept and agree to be bound by 
              the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to use For One Day for personal, non-commercial purposes. This 
              license shall automatically terminate if you violate any of these restrictions.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2>4. Content and Privacy</h2>
            <p>
              All content you create and store on For One Day remains your property. We respect 
              your privacy and will never share or access your personal legacy notes without your 
              explicit permission.
            </p>

            <h2>5. Subscription and Billing</h2>
            <p>
              For One Day offers both free and Pro subscription plans. Pro subscriptions are billed 
              monthly and may be cancelled at any time. We reserve the right to change pricing with 
              30 days notice.
            </p>

            <h2>6. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for any 
              breach of these Terms of Service.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              For One Day shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of the Service.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be posted on this 
              page with an updated revision date.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:hello@foroneday.app" className="text-blue-600 hover:text-blue-700">
                hello@foroneday.app
              </a>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

