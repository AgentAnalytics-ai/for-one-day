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
        <div className="flex items-center justify-center gap-4 mb-2">
          <SupportContactButton />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Message for general questions or urgent requests
        </p>
      </div>
    </footer>
  )
}

