export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = params?.email

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">
            Unsubscribed
          </h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          {email 
            ? `We've removed ${email} from our email list.`
            : 'You have been unsubscribed from For One Day emails.'}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          You won't receive any more emails from us.
        </p>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Changed your mind?
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
          >
            Return to For One Day
          </a>
        </div>
      </div>
    </div>
  )
}
