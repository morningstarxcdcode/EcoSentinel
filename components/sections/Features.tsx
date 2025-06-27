'use client'

import { motion } from 'framer-motion'
import { Brain, Shield, Zap, Globe, Users, TrendingUp, AlertTriangle, Smartphone } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Brain,
      title: 'Explainable AI',
      description: 'Every prediction comes with clear reasoning you can understand and trust.',
      color: 'from-blue-500 to-blue-600',
      stats: '94% Accuracy'
    },
    {
      icon: Globe,
      title: 'Real-time Monitoring',
      description: 'Live environmental data from satellites, sensors, and weather stations worldwide.',
      color: 'from-green-500 to-green-600',
      stats: '24/7 Coverage'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Prediction',
      description: '7-day environmental risk forecasting with actionable recommendations.',
      color: 'from-orange-500 to-orange-600',
      stats: '7-Day Forecast'
    },
    {
      icon: Users,
      title: 'Community Action',
      description: 'Connect with local environmental groups and track collective impact.',
      color: 'from-purple-500 to-purple-600',
      stats: '1,200+ Communities'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with comprehensive data protection and privacy.',
      color: 'from-red-500 to-red-600',
      stats: '99.9% Uptime'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access environmental insights anywhere with our responsive platform.',
      color: 'from-indigo-500 to-indigo-600',
      stats: 'All Devices'
    },
    {
      icon: TrendingUp,
      title: 'Impact Tracking',
      description: 'Measure and visualize your environmental contributions over time.',
      color: 'from-teal-500 to-teal-600',
      stats: 'Personal Metrics'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-200ms response times with intelligent caching and optimization.',
      color: 'from-yellow-500 to-yellow-600',
      stats: '<200ms Response'
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
            Powerful Features for
            <span className="gradient-text block">Climate Action</span>
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Advanced AI technology meets environmental science to deliver 
            actionable insights for a sustainable future.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {feature.title}
                    </h3>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${feature.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-secondary-900 mb-4">
              Ready to Make an Impact?
            </h3>
            <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
              Join thousands of environmental champions using AI to create positive climate change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
