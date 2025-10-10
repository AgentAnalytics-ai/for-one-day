/**
 * 🗂️ Vault page - One Day legacy
 * Secure storage for letters, documents, and videos
 */
export default async function VaultPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Vault
        </h1>
        <p className="text-gray-600 mt-1">Letters and legacy for One Day</p>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl p-12 text-center">
        <p className="text-6xl mb-4">🗂️</p>
        <h2 className="text-2xl font-serif font-bold mb-2">Your Private Vault</h2>
        <p className="text-gray-600 mb-6">
          Store letters, videos, and important documents<br />
          Safe and encrypted for the ones you love
        </p>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Upload First Item
        </button>
      </div>
    </div>
  )
}

