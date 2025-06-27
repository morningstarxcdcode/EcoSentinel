'use client'

import { motion } from 'framer-motion'
import { Code, Database, Cloud, Shield, Zap, Globe } from 'lucide-react'

export function TechStack() {
  const techCategories = [
    {
      title: 'Frontend',
      icon: Code,
      color: 'from-blue-500 to-blue-600',
      technologies: [
        { name: 'Next.js 14', description: 'React framework with App Router' },
        { name: 'TypeScript', description: 'Type-safe development' },
        { name: 'Tailwind CSS', description: 'Utility-first styling' },
        { name: 'Framer Motion', description: 'Smooth animations' }
      ]
    },
    {
      title: 'Backend',
      icon: Database,
      color: 'from-green-500 to-green-600',
      technologies: [
        { name: 'Node.js', description: 'JavaScript runtime' },
        { name: 'Express.js', description: 'Web application framework' },
        { name: 'PostgreSQL', description: 'Relational database' },
        { name: 'Redis', description: 'In-memory caching' }
      ]
    },
    {
      title: 'AI/ML',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      technologies: [
        { name: 'Python', description: 'AI/ML development' },
        { name: 'TensorFlow', description: 'Machine learning models' },
        { name: 'OpenAI GPT-4', description: 'Natural language insights' },
        { name: 'scikit-learn', description: 'Data analysis & modeling' }
      ]
    },
    {
      title: 'DevOps',
      icon: Cloud,
      color: 'from-orange-500 to-orange-600',
      technologies: [
        { name: 'Docker', description: 'Containerization' },
        { name: 'GitHub Actions', description: 'CI/CD pipeline' },
        { name: 'Prometheus', description: 'Monitoring & metrics' },
        { name: 'Grafana', description: 'Data visualization' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      technologies: [
        { name: 'JWT', description: 'Authentication tokens' },
        { name: 'Helmet.js', description: 'Security headers' },
        { name: 'Rate Limiting', description: 'API protection' },
        { name: 'Input Validation', description: 'Data sanitization' }
      ]
    },
    {
      title: 'APIs',
      icon: Globe,
      color: 'from-teal-500 to-teal-600',
      technologies: [
        { name: 'OpenWeatherMap', description: 'Weather data' },
        { name: 'NASA Earth Data', description: 'Satellite imagery' },
        { name: 'Google Earth Engine', description: 'Environmental data' },
        { name: 'Twilio', description: 'Notifications' }
      ]
    }
  ]

  const architectureFeatures = [
    {
      title: 'Microservices Architecture',
      description: 'Scalable, independent services for optimal performance',
      percentage: 95
    },
    {
      title: 'Real-time Data Processing',
      description: 'Sub-200ms response times with intelligent caching',
      percentage: 98
    },
    {
      title: 'Enterprise Security',
      description: 'Multi-layer security with comprehensive protection',
      percentage: 99
    },
    {
      title: 'Global CDN',
      description: 'Worldwide content delivery for optimal speed',
      percentage: 97
    }
  ]

  return (
    <section className="py-20 bg-secondary-900 text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built with
            <span className="text-primary-400 block">Cutting-Edge Technology</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Enterprise-grade architecture designed for scale, security, and performance. 
            Every component chosen for reliability and innovation.
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {techCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              {/* Category Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {category.title}
                </h3>
              </div>

              {/* Technologies */}
              <div className="space-y-4">
                {category.technologies.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: (index * 0.1) + (techIndex * 0.05) }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {tech.name}
                      </div>
                      <div className="text-xs text-secondary-300">
                        {tech.description}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Architecture Highlights
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {architectureFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-white">
                    {feature.title}
                  </h4>
                  <span className="text-primary-400 font-bold">
                    {feature.percentage}%
                  </span>
                </div>
                <p className="text-secondary-300 text-sm">
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
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { metric: '<200ms', label: 'Response Time', icon: Zap },
            { metric: '99.9%', label: 'Uptime SLA', icon: Shield },
            { metric: '94%', label: 'AI Accuracy', icon: Zap },
            { metric: '10K+', label: 'Concurrent Users', icon: Globe }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {stat.metric}
              </div>
              <div className="text-sm text-secondary-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Open Source CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-400/30 max-w-4xl mx-auto">
            <Code className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Open Source Ready
            </h3>
            <p className="text-secondary-300 mb-6 max-w-2xl mx-auto">
              Core components will be open-sourced for the developer community. 
              Contribute to the future of environmental technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View on GitHub
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-primary-400 text-primary-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 hover:text-white transition-colors"
              >
                API Documentation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
