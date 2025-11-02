'use client'

/**
 * ⏰ Time-Based Greeting Component
 * Client-side component to show greeting based on user's local time
 */
export function TimeGreeting() {
  const timeOfDay = new Date().getHours()
  const greeting = timeOfDay < 12 
    ? 'Good morning' 
    : timeOfDay < 17 
    ? 'Good afternoon' 
    : 'Good evening'
  
  return (
    <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-2">
      {greeting}
    </h1>
  )
}

