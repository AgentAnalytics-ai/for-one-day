/**
 * 📞 Support Footer Component
 * Shows support contact information across the app
 */

import { SupportContactButton } from './support-contact-button'

export function SupportFooter() {
  return (
    <footer className="mt-12 py-6 md:py-8 border-t border-gray-200/50 bg-white/90 backdrop-blur-md sticky bottom-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3 font-medium">
            Need help?
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <SupportContactButton />
          </div>
          <p className="text-xs text-gray-500 mt-2 px-4 max-w-md mx-auto">
            Message for general questions or urgent requests
          </p>
        </div>
      </div>
    </footer>
  )
}

