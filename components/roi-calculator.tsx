'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Clock, Users, Target, ChevronRight } from 'lucide-react'

interface ROIMetrics {
  currentClaims: number
  averageClaimValue: number
  currentSettlementRate: number
  hoursPerClaim: number
  teamSize: number
}

export default function ROICalculator() {
  const [metrics, setMetrics] = useState<ROIMetrics>({
    currentClaims: 120,
    averageClaimValue: 150000,
    currentSettlementRate: 100,
    hoursPerClaim: 40,
    teamSize: 5
  })

  const [results, setResults] = useState({
    additionalRecovery: 0,
    timeSaved: 0,
    additionalClaims: 0,
    totalROI: 0,
    roiMultiple: 0,
    breakEvenClaims: 0
  })

  // Stellar platform annual cost
  const annualCost = 75000

  useEffect(() => {
    calculateROI()
  }, [metrics])

  const calculateROI = () => {
    // Settlement increase: 34% average with Stellar
    const settlementIncrease = 0.34
    const additionalRecoveryPerClaim = metrics.averageClaimValue * (metrics.currentSettlementRate / 100) * settlementIncrease
    const totalAdditionalRecovery = additionalRecoveryPerClaim * metrics.currentClaims

    // Time savings: 50% reduction
    const timeSavingsRate = 0.5
    const hoursPerClaimSaved = metrics.hoursPerClaim * timeSavingsRate
    const totalHoursSaved = hoursPerClaimSaved * metrics.currentClaims

    // Additional capacity: 40% more claims
    const capacityIncrease = 0.4
    const additionalClaimsHandled = Math.floor(metrics.currentClaims * capacityIncrease)
    const revenueFromAdditionalClaims = additionalClaimsHandled * metrics.averageClaimValue * (metrics.currentSettlementRate / 100) * 0.1 // 10% fee

    // Total ROI calculation
    const totalBenefit = totalAdditionalRecovery * 0.1 + revenueFromAdditionalClaims // Assuming 10% contingency fee
    const roi = totalBenefit - annualCost
    const roiMultiple = totalBenefit / annualCost

    // Break-even calculation
    const revenuePerClaim = metrics.averageClaimValue * (metrics.currentSettlementRate / 100) * settlementIncrease * 0.1
    const breakEven = Math.ceil(annualCost / revenuePerClaim)

    setResults({
      additionalRecovery: totalAdditionalRecovery,
      timeSaved: totalHoursSaved,
      additionalClaims: additionalClaimsHandled,
      totalROI: roi,
      roiMultiple: roiMultiple,
      breakEvenClaims: breakEven
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-stellar-orange text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8" />
          <h2 className="text-2xl font-bold">ROI Calculator</h2>
        </div>
        <p className="text-orange-100">See your potential return with Stellar Intelligence Platform</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-stellar-orange" />
            Your Current Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claims per year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Claims Per Year
              </label>
              <input
                type="number"
                value={metrics.currentClaims}
                onChange={(e) => setMetrics({...metrics, currentClaims: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
              />
            </div>

            {/* Average claim value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Average Claim Value
              </label>
              <input
                type="number"
                value={metrics.averageClaimValue}
                onChange={(e) => setMetrics({...metrics, averageClaimValue: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
                step="10000"
              />
            </div>

            {/* Current settlement rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Settlement Rate (%)
              </label>
              <input
                type="number"
                value={metrics.currentSettlementRate}
                onChange={(e) => setMetrics({...metrics, currentSettlementRate: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
                min="0"
                max="100"
              />
            </div>

            {/* Hours per claim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours Per Claim
              </label>
              <input
                type="number"
                value={metrics.hoursPerClaim}
                onChange={(e) => setMetrics({...metrics, hoursPerClaim: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
              />
            </div>

            {/* Team size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Size
              </label>
              <input
                type="number"
                value={metrics.teamSize}
                onChange={(e) => setMetrics({...metrics, teamSize: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-orange focus:border-stellar-orange"
              />
            </div>

            {/* Annual Investment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stellar Annual Investment
              </label>
              <input
                type="text"
                value={formatCurrency(annualCost)}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Projected Results with Stellar
          </h3>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Additional Recovery */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Additional Recovery</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {formatCurrency(results.additionalRecovery)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">34% average increase</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-30" />
              </div>
            </div>

            {/* Time Saved */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Saved</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {formatNumber(results.timeSaved)} hrs
                  </p>
                  <p className="text-xs text-blue-600 mt-1">50% time reduction</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-30" />
              </div>
            </div>

            {/* Additional Claims */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Additional Claims</p>
                  <p className="text-2xl font-bold text-purple-700 mt-1">
                    +{results.additionalClaims}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">40% capacity increase</p>
                </div>
                <Users className="w-8 h-8 text-purple-500 opacity-30" />
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="bg-gradient-to-r from-stellar-orange to-orange-600 rounded-xl p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-orange-100 text-sm">Annual ROI</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(results.totalROI)}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">ROI Multiple</p>
                <p className="text-3xl font-bold mt-1">{results.roiMultiple.toFixed(1)}x</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Break-Even</p>
                <p className="text-3xl font-bold mt-1">{results.breakEvenClaims} claims</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-orange-400/30">
              <p className="text-sm text-orange-100">
                With just {results.breakEvenClaims} successfully maximized claims, Stellar pays for itself.
                Everything after that is pure profit.
              </p>
            </div>
          </div>

          {/* Value Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Value Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Settlement Increases (10% fee)</span>
                <span className="font-medium">{formatCurrency(results.additionalRecovery * 0.1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Additional Claim Revenue</span>
                <span className="font-medium">{formatCurrency(results.additionalClaims * metrics.averageClaimValue * (metrics.currentSettlementRate / 100) * 0.1)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total Annual Benefit</span>
                <span className="font-bold text-green-600">{formatCurrency(results.totalROI + annualCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Stellar Investment</span>
                <span className="font-medium text-red-600">-{formatCurrency(annualCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-gray-100">Net Annual ROI</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(results.totalROI)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 bg-stellar-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
              Start Your Pilot Program
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="flex-1 bg-white dark:bg-gray-900 border-2 border-stellar-orange text-stellar-orange px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors">
              Download ROI Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}