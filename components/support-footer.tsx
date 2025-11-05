/**
 * 📧 Support Footer Component
 * Shows support contact information across the app
 */
export function SupportFooter() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Need help?{' '}
          <a 
            href="mailto:support@foroneday.app" 
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            support@foroneday.app
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          For emergency access requests or urgent assistance
        </p>
      </div>
    </footer>
  )
}

