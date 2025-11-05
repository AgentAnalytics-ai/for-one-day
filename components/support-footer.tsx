/**
 * 📞 Support Footer Component
 * Shows support contact information across the app
 */

import { SupportContactButton } from './support-contact-button'

export function SupportFooter() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          Need help?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
          <a 
            href="tel:+14055357750"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            (405) 535-7750
          </a>
          <span className="text-gray-400 hidden sm:block">|</span>
          <SupportContactButton />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Call for emergencies • Message for general questions
        </p>
      </div>
    </footer>
  )
}

