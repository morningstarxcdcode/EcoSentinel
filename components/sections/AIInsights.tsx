'use client'

import { motion } from 'framer-motion'
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function AIInsights() {
  const insights = [
    {
      type: 'prediction',
      icon: TrendingUp,
      title: 'Air Quality Forecast',
      content: 'Air quality will improve by 15% over the next 3 days due to favorable wind patterns and reduced industrial activity.',
      confidence: 94,
      color: 'green',
      action: 'Plan outdoor activities for Thursday-Friday'
    },
    {
      type: 'alert',
      icon: AlertTriangle,
      title: 'Temperature Anomaly',
      content: 'Unusual temperature spike detected in urban areas. 3°C above seasonal average, likely due to urban heat island effect.',
      confidence: 87,
      color: 'orange',
      action: 'Increase hydration and limit sun exposure'
    },
    {
      type: 'recommendation',
      icon: Target,
      title: 'Carbon Reduction',
      content: 'Switching to public transport 3 days/week could reduce your carbon footprint by 2.3 tons CO₂ annually.',
      confidence: 91,
      color: 'blue',
      action: 'Join local carpooling initiative'
    }
  ]

  const aiFeatures = [
    {
      title: 'Multi-Source Analysis',
      description: 'Combines satellite data, weather stations, and IoT sensors',
      percentage: 95
    },
    {
      title: 'Pattern Recognition',
      description: 'Identifies environmental trends and anomalies',
      percentage: 92
    },
    {
      title: 'Predictive Modeling',
      description: '7-day forecasting with 94% accuracy',
      percentage: 94
    },
    {
      title: 'Natural Language',
      description: 'Explains complex data in simple terms',
      percentage: 89
    }
  ]

  const getInsightColor = (color: string) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      blue: 'from-blue-500 to-blue-600',
      red: 'from-red-500 to-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getInsightBg = (color: string) => {
    const colors = {
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      blue: 'bg-blue-50 border-blue-200',
      red: 'bg-red-50 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-primary-400 mr-4" />
            <h2 className="text-4xl lg:text-5xl font-bold">
              AI-Powered
              <span className="text-primary-400 block">Environmental Intelligence</span>
            </h2>
          </div>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Our explainable AI analyzes millions of data points to provide 
            actionable environmental insights you can trust and understand.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Info className="w-6 h-6 text-primary-400 mr-2" />
              Live AI Insights
            </h3>

            <div className="space-y-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`${getInsightBg(insight.color)} rounded-2xl p-6 border`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getInsightColor(insight.color)} flex items-center justify-center`}>
                        <insight.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-900">
                          {insight.title}
                        </h4>
                        <span className="text-sm text-secondary-600 capitalize">
                          {insight.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-secondary-700">
                        {insight.confidence}% Confidence
                      </div>
                      <div className="w-16 h-2 bg-secondary-200 rounded-full mt-1">
                        <div 
                          className={`h-full bg-gradient-to-r ${getInsightColor(insight.color)} rounded-full`}
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-secondary-700 mb-4 leading-relaxed">
                    {insight.content}
                  </p>

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-secondary-800">
                        Recommended Action:
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-700 mt-2 pl-6">
                    {insight.action}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Capabilities */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Brain className="w-6 h-6 text-primary-400 mr-2" />
              AI Capabilities
            </h3>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="space-y-8">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-white">
                        {feature.title}
                      </h4>
                      <span className="text-primary-400 font-bold">
                        {feature.percentage}%
                      </span>
                    </div>
                    <p className="text-secondary-300 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="w-full h-2 bg-secondary-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${feature.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Explainable AI Section */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 text-primary-400 mr-2" />
                  Explainable AI Reasoning
                </h4>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-secondary-300 space-y-2">
                    <div className="flex justify-between">
                      <span>Historical Patterns</span>
                      <span className="text-primary-400">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather Conditions</span>
                      <span className="text-primary-400">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pollution Sources</span>
                      <span className="text-primary-400">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seasonal Trends</span>
                      <span className="text-primary-400">20%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-secondary-400 mt-3">
                  Every prediction includes detailed reasoning so you understand exactly how we reached our conclusions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Experience AI-Powered Environmental Intelligence
            </h3>
            <p className="text-secondary-300 mb-6 max-w-2xl mx-auto">
              Get personalized environmental insights powered by cutting-edge AI that you can actually understand and trust.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
            >
              Try AI Insights Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
