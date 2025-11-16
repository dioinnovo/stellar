'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Clock, Brain, TrendingUp, Check, Star, ChevronRight, BarChart3, FileText, Zap } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced vision and language models analyze damage with superhuman accuracy"
    },
    {
      icon: Clock,
      title: "90% Time Reduction",
      description: "Generate comprehensive reports in 15 minutes instead of hours"
    },
    {
      icon: Shield,
      title: "Maximum Recovery",
      description: "Find overlooked coverage and negotiate better settlements"
    },
    {
      icon: TrendingUp,
      title: "20-30% Higher Payouts",
      description: "Data-driven insights lead to significantly better claim outcomes"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Adjuster",
      company: "Premier Claims Services",
      content: "Stellar has transformed our workflow. We're processing 3x more claims with better accuracy.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Claims Manager",
      company: "National Insurance Group",
      content: "The AI insights have helped us recover millions in previously overlooked coverage.",
      rating: 5
    },
    {
      name: "Jennifer Martinez",
      role: "Public Adjuster",
      company: "Martinez & Associates",
      content: "Our settlement amounts have increased by 28% on average. This tool pays for itself.",
      rating: 5
    }
  ]

  const stats = [
    { value: "10,000+", label: "Claims Processed" },
    { value: "$50M+", label: "Additional Recovery" },
    { value: "15 min", label: "Average Report Time" },
    { value: "98%", label: "Customer Satisfaction" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-stellar-orange rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Stellar Intelligence</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-100">Features</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 dark:text-gray-100">Testimonials</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-100">Pricing</Link>
              <Link href="/dashboard/inspection" className="bg-stellar-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-stellar-orange px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                AI-Powered Insurance Intelligence
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Maximize Every
                <span className="text-stellar-orange"> Insurance Claim</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Transform property inspections into comprehensive reports in minutes. Our AI finds overlooked coverage,
                accelerates processing, and increases settlement values by 20-30%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/inspection" className="inline-flex items-center justify-center gap-2 bg-stellar-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-semibold">
                  View Pricing
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  14-day free trial
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Claim Analysis Dashboard</h3>
                    <span className="text-green-500 text-sm font-medium">Live</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Coverage Found</span>
                        <span className="text-sm font-semibold text-green-600">+$24,500</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Processing Time</span>
                        <span className="text-sm font-semibold text-blue-600">12 minutes</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</span>
                        <span className="text-sm font-semibold text-purple-600">98.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Report Generated</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ready for review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform combines computer vision, natural language processing, and machine learning to deliver
              unmatched accuracy and speed in claims processing.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-stellar-orange" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From inspection to settlement in record time
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-stellar-orange text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Upload Inspection Data</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply upload photos, videos, and notes from your property inspection. Our AI handles all formats.
                </p>
              </div>
              <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-8 w-8" />
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-stellar-orange text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI analyzes damage, finds coverage opportunities, and generates a comprehensive report in minutes.
                </p>
              </div>
              <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-8 w-8" />
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-stellar-orange text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Maximize Settlement</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use our detailed report with negotiation insights to secure the best possible settlement for your client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our customers have to say about Stellar Intelligence
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-stellar-orange">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Claims Process?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of adjusters who are settling claims faster and for higher amounts with Stellar Intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/inspection" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-stellar-orange px-8 py-4 rounded-lg hover:bg-orange-50 transition font-semibold">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 bg-orange-700 text-white px-8 py-4 rounded-lg hover:bg-orange-800 transition font-semibold">
              View Pricing Plans
            </Link>
          </div>
          <p className="text-orange-100 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-stellar-orange rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-white font-bold">Stellar Intelligence</span>
              </div>
              <p className="text-sm">Maximizing insurance settlements with AI-powered intelligence.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 Stellar Intelligence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}