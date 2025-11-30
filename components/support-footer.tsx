/**
 * 📞 Support Footer Component
 * Minimal, unobtrusive support link - Meta-level mobile UX
 * Stays at bottom without competing with content
 */

import { SupportContactButton } from './support-contact-button'

export function SupportFooter() {
  return (
    <footer className="mt-auto py-2 sm:py-3 border-t border-gray-100 bg-white/95 backdrop-blur-sm sticky bottom-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2">
          <SupportContactButton />
        </div>
      </div>
    </footer>
  )
}

