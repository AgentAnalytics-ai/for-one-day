import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your name, email address, 
              and any content you create (legacy notes, reflections, etc.). We also collect technical 
              information such as your IP address and browser type.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to provide, maintain, and improve our Service. Your personal 
              legacy notes and reflections are stored securely and are only accessible by you and 
              those you explicitly grant access to.
            </p>

            <h2>3. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use Supabase for 
              database storage and implement Row-Level Security (RLS) to ensure your data remains 
              private.
            </p>

            <h2>4. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only with your explicit consent or as required by law.
            </p>

            <h2>5. Family Sharing</h2>
            <p>
              When you invite family members to your account, you control their level of access. 
              They can only see content you explicitly share with them based on their assigned role.
            </p>

            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies to maintain your session and improve your experience. We do not use 
              third-party tracking cookies or advertising trackers.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. 
              You can do this through your account settings or by contacting us.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              For One Day is not intended for users under the age of 13. We do not knowingly collect 
              personal information from children under 13.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this 
              page with an updated revision date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
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

