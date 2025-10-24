import { DebugLogger } from '@/lib/debug'
import { testDatabaseConnection, testEnvironmentVariables } from '@/lib/database-test'

/**
 * 🔍 2026 Expert Debug Dashboard
 * Comprehensive debugging and system health monitoring
 */

export default async function DebugPage() {
  const logger = DebugLogger.getInstance()
  const logs = logger.getLogs()
  
  // Test current system state
  const envTest = await testEnvironmentVariables()
  const dbTest = await testDatabaseConnection()

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-red-800 mb-2">🔍 Debug Dashboard</h1>
        <p className="text-red-700">This is a development debugging tool. Remove in production.</p>
      </div>

      {/* Environment Variables Test */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className={`p-4 rounded-lg ${envTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-medium ${envTest.success ? 'text-green-800' : 'text-red-800'}`}>
            {envTest.success ? '✅ All environment variables present' : '❌ Missing environment variables'}
          </p>
          {!envTest.success && (
            <ul className="mt-2 text-red-700">
              {envTest.missing.map((env) => (
                <li key={env}>• {env}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Database Connection Test */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
        <div className={`p-4 rounded-lg ${dbTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-medium ${dbTest.success ? 'text-green-800' : 'text-red-800'}`}>
            {dbTest.success ? '✅ Database connection successful' : '❌ Database connection failed'}
          </p>
          {!dbTest.success && (
            <p className="mt-2 text-red-700">Error: {dbTest.error}</p>
          )}
          {dbTest.success && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Connection:</strong> {dbTest.details.connection ? '✅' : '❌'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Authentication:</strong> {dbTest.details.auth ? '✅' : '❌'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tables:</strong> {dbTest.details.tables.join(', ')}
              </p>
              {dbTest.details.userProfile && (
                <p className="text-sm text-gray-600">
                  <strong>User Profile:</strong> ✅ Found
                </p>
              )}
              {dbTest.details.familyData && (
                <p className="text-sm text-gray-600">
                  <strong>Family Data:</strong> ✅ Found
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debug Logs */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No debug logs available</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                log.error ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${log.error ? 'text-red-800' : 'text-green-800'}`}>
                      {log.error ? '❌' : '✅'} {log.action}
                    </p>
                    <p className="text-sm text-gray-600">{log.message}</p>
                    {log.userId && (
                      <p className="text-xs text-gray-500">User: {log.userId}</p>
                    )}
                    <p className="text-xs text-gray-500">{log.timestamp}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.environment} | {log.deployment}
                  </div>
                </div>
                {log.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                    <p><strong>Error:</strong> {log.error.name}: {log.error.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Logs Button */}
      <div className="bg-white rounded-lg border p-6">
        <form action={async () => {
          'use server'
          const logger = DebugLogger.getInstance()
          logger.clearLogs()
        }}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear Debug Logs
          </button>
        </form>
      </div>
    </div>
  )
}
