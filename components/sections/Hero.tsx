'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, Zap, Shield } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              AI-Powered Climate Action
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
                Environmental
                <span className="gradient-text block">Intelligence</span>
                for Everyone
              </h1>
              
              <p className="text-xl text-secondary-600 leading-relaxed max-w-lg">
                Real-time environmental monitoring powered by explainable AI. 
                Get actionable insights, predict risks, and drive meaningful climate action in your community.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-lg">
                Start Monitoring
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                View Live Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-secondary-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Data
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Enterprise Security
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                94% AI Accuracy
              </div>
            </div>
          </motion.div>

          {/* Right Column - Interactive Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Stats Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                    Real-Time Impact
                  </h3>
                  <p className="text-secondary-600">
                    Live environmental monitoring across the globe
                  </p>
                </div>

                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <Globe className="w-12 h-12 text-primary-600" />
                  </div>
                  <div className="text-4xl font-bold text-secondary-900 mb-2">
                    2.4M
                  </div>
                  <div className="text-lg text-secondary-600 mb-1">
                    tons
                  </div>
                  <div className="text-sm text-secondary-500">
                    CO₂ Monitored
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-accent-400 text-white p-3 rounded-lg shadow-lg">
              <Zap className="w-6 h-6" />
            </div>

            <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-3 rounded-lg shadow-lg">
              <Globe className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
