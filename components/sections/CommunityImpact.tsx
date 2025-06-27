'use client'

import { motion } from 'framer-motion'
import { Users, TreePine, Recycle, Zap, Globe, Award, TrendingUp, Heart } from 'lucide-react'

export function CommunityImpact() {
  const impactStats = [
    {
      icon: TreePine,
      value: '2.4M',
      unit: 'Trees Planted',
      description: 'Through community initiatives',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Recycle,
      value: '850K',
      unit: 'Tons CO₂ Saved',
      description: 'Carbon footprint reduction',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      value: '1,200+',
      unit: 'Communities',
      description: 'Active environmental groups',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Zap,
      value: '45%',
      unit: 'Energy Saved',
      description: 'Through smart recommendations',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const communityFeatures = [
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with environmental champions worldwide and share best practices.',
      stats: '50+ Countries'
    },
    {
      icon: Award,
      title: 'Impact Challenges',
      description: 'Participate in monthly environmental challenges and earn recognition.',
      stats: '25 Active Challenges'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your environmental impact and see how you compare to others.',
      stats: '94% Engagement'
    },
    {
      icon: Heart,
      title: 'Local Actions',
      description: 'Find and join environmental initiatives happening in your neighborhood.',
      stats: '500+ Local Groups'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Environmental Scientist',
      location: 'San Francisco, CA',
      quote: 'EcoSentinel helped our community reduce air pollution by 30% through data-driven action plans.',
      impact: '30% Pollution Reduction'
    },
    {
      name: 'Marcus Johnson',
      role: 'Community Organizer',
      location: 'Austin, TX',
      quote: 'The AI insights made it easy to identify the most impactful environmental actions for our city.',
      impact: '15 Initiatives Launched'
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'Climate Researcher',
      location: 'Barcelona, Spain',
      quote: 'Finally, environmental data that communities can actually understand and act upon.',
      impact: '200+ Families Engaged'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-green-50">
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
            Community-Driven
            <span className="gradient-text block">Environmental Impact</span>
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Join a global community of environmental champions making measurable 
            impact through AI-powered insights and collective action.
          </p>
        </motion.div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.unit}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-secondary-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-secondary-700 mb-2">
                  {stat.unit}
                </div>
                <p className="text-secondary-600 text-sm">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Features */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-secondary-900 mb-8">
              Connect & Collaborate
            </h3>
            <div className="space-y-6">
              {communityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-secondary-900">
                        {feature.title}
                      </h4>
                      <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                    <p className="text-secondary-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-secondary-900 mb-6">
              Global Community Impact
            </h3>
            
            {/* Mock World Map */}
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="text-secondary-600 font-medium">
                  Interactive Community Map
                </p>
                <p className="text-sm text-secondary-500 mt-2">
                  1,200+ active communities worldwide
                </p>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-md">
                <div className="text-sm font-medium text-green-600">North America</div>
                <div className="text-xs text-secondary-500">450 communities</div>
              </div>
              
              <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md">
                <div className="text-sm font-medium text-blue-600">Europe</div>
                <div className="text-xs text-secondary-500">380 communities</div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md">
                <div className="text-sm font-medium text-purple-600">Asia</div>
                <div className="text-xs text-secondary-500">290 communities</div>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-md">
                <div className="text-sm font-medium text-orange-600">Others</div>
                <div className="text-xs text-secondary-500">80 communities</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2.4M</div>
                <div className="text-sm text-secondary-600">Trees Planted</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">850K</div>
                <div className="text-sm text-secondary-600">Tons CO₂ Saved</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-secondary-900 text-center mb-12">
            Community Success Stories
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="mb-4">
                  <div className="text-4xl text-primary-600 mb-2">&ldquo;</div>
                  <p className="text-secondary-700 italic">
                    {testimonial.quote}
                  </p>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-secondary-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {testimonial.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {testimonial.impact}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join Community CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-green-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Join the Environmental Revolution
            </h3>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Connect with like-minded individuals, share knowledge, and make a measurable impact on our planet&apos;s future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg"
              >
                Join Community
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Start Local Group
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
