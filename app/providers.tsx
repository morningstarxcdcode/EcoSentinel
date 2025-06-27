'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Theme Context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

// Environmental Data Context
const EnvironmentalContext = createContext({
  data: null as any,
  loading: false,
  error: null as string | null,
  refetch: () => {},
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  const [environmentalData, setEnvironmentalData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const refetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock API call - in real app, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEnvironmentalData({
        airQuality: Math.floor(Math.random() * 100) + 50,
        temperature: Math.round((Math.random() * 30 + 10) * 10) / 10,
        humidity: Math.floor(Math.random() * 40) + 40,
        carbonLevel: Math.floor(Math.random() * 50) + 400,
        riskLevel: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        lastUpdated: new Date().toISOString()
      })
    } catch (err) {
      setError('Failed to fetch environmental data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetchData()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <EnvironmentalContext.Provider 
        value={{ 
          data: environmentalData, 
          loading, 
          error, 
          refetch: refetchData 
        }}
      >
        <div className={theme}>
          {children}
        </div>
      </EnvironmentalContext.Provider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export const useEnvironmentalData = () => useContext(EnvironmentalContext)
