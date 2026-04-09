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
      <h1 className="page-title text-balance text-slate-900">{greeting}</h1>
      <p className="mt-1 text-base text-slate-600 md:text-lg md:text-slate-500">{dateString}</p>
    </>
  )
}

