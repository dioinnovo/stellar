'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, DollarSign, Clock, TrendingUp, Shield, FileText, Camera, Zap, Users, BarChart3, Brain, AlertTriangle, UserCheck, Banknote } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import VirtualAssistant from '@/components/virtual-assistant'

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src="/images/stellar_logo.png" 
                alt="Stellar Adjusting" 
                width={150} 
                height={42}
                className="object-contain"
              />
            </div>
            <div className="flex items-center">
              <Link 
                href="/dashboard/inspection" 
                className="text-gray-700 hover:text-stellar-orange transition font-medium px-4 py-2 whitespace-nowrap"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-stellar-dark mb-6">
              Scale Your Public Adjusting
              <br />with <span className="text-stellar-orange">AI-Powered</span>
              <br />Automation
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Handle 10x more claims with AI-driven damage assessment, documentation, 
              and negotiation support. Maximize settlements for your clients at scale.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/claim-assessment"
                className="group bg-stellar-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
              >
                Claim Analysis
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard/inspection"
                className="group bg-white text-stellar-orange border-2 border-stellar-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-stellar-orange hover:text-white transition flex items-center gap-2"
              >
                Property Inspection
                <Camera className="transition-transform group-hover:scale-110" size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-stellar-dark mb-4">
              What Your AI Can Achieve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empower your adjusters and delight your customers with AI that delivers measurable results
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { value: '10x', label: 'More Claims Handled Per Adjuster', icon: TrendingUp, color: 'text-orange-600' },
              { value: '47%', label: 'Higher Settlement Amounts', icon: Banknote, color: 'text-green-600' },
              { value: '3hrs', label: 'From Inspection to Report', icon: Clock, color: 'text-blue-600' },
              { value: '95%', label: 'Documentation Accuracy', icon: Brain, color: 'text-purple-600' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition"
              >
                <stat.icon className={`mx-auto mb-4 ${stat.color}`} size={40} />
                <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Claim Triage Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-stellar-dark mb-4">
            Claim Analysis & Maximum Recovery
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            AI-powered tools to document damage comprehensively and negotiate maximum settlements for your clients
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'AI-Powered Damage Documentation',
                description: 'Comprehensive damage analysis that captures every detail insurers might overlook',
                benefits: [
                  'Identify all covered damages',
                  'Generate detailed loss reports',
                  'Document hidden damages',
                  'Build irrefutable claim packages'
                ]
              },
              {
                icon: Banknote,
                title: 'Maximum Settlement Negotiation',
                description: 'AI-driven valuation ensures your clients receive every dollar they deserve',
                benefits: [
                  '47% higher settlement amounts',
                  'Policy coverage optimization',
                  'Comparable claims analysis',
                  'Evidence-based negotiations'
                ]
              },
              {
                icon: UserCheck,
                title: 'Automated Client Communication',
                description: 'Keep clients informed while you focus on maximizing their recovery',
                benefits: [
                  'Automated status updates',
                  'Document request workflows',
                  'Settlement tracking portal',
                  'NO RECOVERY, NO FEE transparency'
                ]
              },
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <div className="bg-stellar-orange/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <solution.icon className="text-stellar-orange" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-stellar-dark mb-3">{solution.title}</h3>
                <p className="text-gray-600 mb-4">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={16} />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Generated Estimates Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-stellar-dark mb-6">
                AI-Generated Preliminary Estimates
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Empower your adjusters with AI that creates accurate estimates in seconds, 
                not hours, while maintaining consistency across your entire operation.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: 'AI-Verified Estimates',
                    description: 'Automatically pre-fill repair cost estimates with AI-verified accuracy'
                  },
                  {
                    title: 'Faster, Easier Adjustments',
                    description: 'Reduce manual effort for adjusters, improving cycle time'
                  },
                  {
                    title: 'Consistent Pricing',
                    description: 'Ensure uniform estimates across all adjusters and regions'
                  },
                  {
                    title: 'Real-Time Market Data',
                    description: 'Leverage current labor and material costs for accurate pricing'
                  },
                  {
                    title: 'Supplement Prevention',
                    description: 'Reduce supplement requests with comprehensive initial estimates'
                  }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <DollarSign className="text-stellar-orange flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-stellar-dark">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-stellar-orange/10 to-stellar-orange/5 rounded-xl p-4 sm:p-6 lg:p-8"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-stellar-dark mb-4">
                  Impact on Your Operations
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Average Estimate Time</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">45 minutes</div>
                      <div className="text-xl font-bold text-green-600">3 minutes</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Adjuster Productivity</span>
                    <div className="text-xl font-bold text-green-600">+280%</div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Estimate Accuracy</span>
                    <div className="text-xl font-bold text-green-600">94%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Supplement Rate</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">32%</div>
                      <div className="text-xl font-bold text-green-600">8%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Claim Review & Fraud Detection Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-stellar-dark mb-4">
            Intelligent Claim Review & Fraud Detection
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Protect your bottom line while ensuring fair and consistent settlements for legitimate claims
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <AlertTriangle className="text-red-500 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-stellar-dark mb-4">
                AI-Powered Fraud Detection
              </h3>
              <p className="text-gray-600 mb-6">
                Detect potential errors or fraud with AI-driven claim review that analyzes patterns, 
                inconsistencies, and anomalies across multiple data points.
              </p>
              <div className="space-y-3">
                {[
                  'Pattern recognition across historical claims',
                  'Image authenticity verification',
                  'Damage consistency analysis',
                  'Network fraud detection',
                  'Real-time risk scoring'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <Shield className="text-green-500 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-stellar-dark mb-4">
                Fair and Consistent Claims Settlements
              </h3>
              <p className="text-gray-600 mb-6">
                Ensure consistency and fairness in claim settlements with AI that applies 
                uniform decision criteria while adapting to unique circumstances.
              </p>
              <div className="space-y-3">
                {[
                  'Standardized settlement guidelines',
                  'Bias-free decision making',
                  'Transparent audit trails',
                  'Compliance monitoring',
                  'Quality assurance automation'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fraud Detection Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 bg-red-50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-stellar-dark mb-6 text-center">
              Fraud Detection Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { metric: '$2.4M', label: 'Annual Fraud Prevention', trend: '+42%' },
                { metric: '95%', label: 'Detection Accuracy', trend: '+15%' },
                { metric: '0.3%', label: 'False Positive Rate', trend: '-67%' },
                { metric: '24hrs', label: 'Investigation Time Saved', trend: '-80%' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stat.metric}</div>
                  <div className="text-gray-700 mt-1">{stat.label}</div>
                  <div className="text-sm text-green-600 mt-1">{stat.trend} vs manual</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Capabilities Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-stellar-dark mb-12">
            Your Complete AI Claims Intelligence Suite
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Camera, label: 'Computer Vision', description: 'Damage detection from photos' },
              { icon: Brain, label: 'Machine Learning', description: 'Pattern recognition & prediction' },
              { icon: FileText, label: 'NLP Processing', description: 'Document understanding' },
              { icon: BarChart3, label: 'Predictive Analytics', description: 'Outcome forecasting' },
              { icon: Zap, label: 'Real-Time Processing', description: 'Instant results' },
              { icon: Shield, label: 'Anomaly Detection', description: 'Fraud identification' },
              { icon: Users, label: 'Behavioral Analysis', description: 'Customer insights' },
              { icon: TrendingUp, label: 'Continuous Learning', description: 'Self-improving AI' },
            ].map((capability, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-lg p-6 text-center hover:bg-stellar-orange/5 transition"
              >
                <capability.icon className="mx-auto mb-3 text-stellar-orange" size={32} />
                <h4 className="font-semibold text-stellar-dark mb-1">{capability.label}</h4>
                <p className="text-sm text-gray-600">{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stellar-orange">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your Free Claim Assessment Today
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get an instant AI-powered analysis of your property damage and discover 
              how much your claim could be worth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/claim-assessment"
                className="inline-block bg-white text-stellar-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
              >
                Free Claim Analysis
              </Link>
              <Link
                href="/dashboard/inspection"
                className="inline-block bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-stellar-orange transition"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Virtual Assistant - Only on landing page */}
      <VirtualAssistant />
    </main>
  )
}