'use client'

/**
 * ⏰ Time-Based Greeting Component
 * Client-side component to show greeting and date based on user's local time
 */
export function TimeGreeting() {
  const now = new Date()
  const timeOfDay = now.getHours()
  const greeting = timeOfDay < 12 
    ? 'Good morning' 
    : timeOfDay < 17 
    ? 'Good afternoon' 
    : 'Good evening'
  
  // Format date: "Saturday, November 2"
  const dateString = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-2">
        {greeting}
      </h1>
      <p className="text-xl text-gray-600 mb-4">{dateString}</p>
    </>
  )
}

