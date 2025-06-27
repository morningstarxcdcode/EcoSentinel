'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
/**
 * EcoSentinel - AI-Powered Environmental Intelligence Platform
 * Main Landing Page
 * 
 * @author morningstarxcdcode
 * @version 1.0.0
 * @license MIT
 * @repository https://github.com/morningstarxcdcode/ecosentinel
 */

import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Dashboard } from '@/components/sections/Dashboard'
import { AIInsights } from '@/components/sections/AIInsights'
import { CommunityImpact } from '@/components/sections/CommunityImpact'
import { TechStack } from '@/components/sections/TechStack'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [environmentalData, setEnvironmentalData] = useState<any>(null)

  useEffect(() => {
    // Load real environmental data
    const loadEnvironmentalData = async () => {
      try {
        setIsLoading(true);
        
        // Get user's location if possible
        let lat = 40.7128; // Default to NYC
        let lon = -74.0060;
        
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
          } catch (geoError) {
            console.log('📍 Geolocation not available, using default location');
          }
        }
        
        // Fetch real environmental data
        const response = await fetch(`/api/environmental-data?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
          throw new Error('Failed to fetch environmental data');
        }
        
        const data = await response.json();
        console.log('🌍 Environmental data loaded:', data);
        
        setEnvironmentalData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load environmental data:', error);
        
        // Fallback to demo data
        setEnvironmentalData({
          airQuality: 75,
          temperature: 22.5,
          humidity: 65,
          carbonLevel: 410,
          riskLevel: 'low',
          lastUpdated: new Date().toISOString(),
          dataSource: 'fallback'
        });
        
        setIsLoading(false);
      }
    };

    loadEnvironmentalData();
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Live Dashboard Preview */}
      <Dashboard data={environmentalData} />

      {/* AI Insights Section */}
      <AIInsights />

      {/* Community Impact */}
      <CommunityImpact />

      {/* Tech Stack */}
      <TechStack />

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of environmental champions using AI to create positive climate impact
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Start Monitoring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
