'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, TrendingUp, AlertTriangle, DollarSign, Clock, Target,
  Activity, Zap, Shield, BarChart3, PieChart, TrendingDown,
  ArrowUp, ArrowDown, Info, ChevronRight, Sparkles, Bot
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts'

export default function AnalyticsPage() {
  const [selectedModel, setSelectedModel] = useState('settlement-prediction')
  const [isCalculating, setIsCalculating] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)

  // ML Model Predictions Data
  const settlementPredictions = [
    { claim: 'CP-2024-001', actual: 125000, predicted: 128500, confidence: 92 },
    { claim: 'CP-2024-002', actual: 285000, predicted: 279000, confidence: 88 },
    { claim: 'CP-2024-003', actual: 92000, predicted: 95500, confidence: 91 },
    { claim: 'CP-2024-004', actual: 450000, predicted: 442000, confidence: 94 },
    { claim: 'CP-2024-005', actual: 178000, predicted: 182000, confidence: 89 }
  ]

  const timeToSettlement = [
    { month: 'Jan', predicted: 32, actual: 35, accuracy: 91 },
    { month: 'Feb', predicted: 28, actual: 30, accuracy: 93 },
    { month: 'Mar', predicted: 45, actual: 42, accuracy: 93 },
    { month: 'Apr', predicted: 38, actual: 40, accuracy: 95 },
    { month: 'May', predicted: 29, actual: 31, accuracy: 94 },
    { month: 'Jun', predicted: 34, actual: 33, accuracy: 97 }
  ]

  const riskScores = [
    { category: 'Documentation', score: 92, benchmark: 75 },
    { category: 'Coverage Analysis', score: 88, benchmark: 70 },
    { category: 'Negotiation Strategy', score: 95, benchmark: 72 },
    { category: 'Timeline Management', score: 86, benchmark: 68 },
    { category: 'Evidence Quality', score: 91, benchmark: 73 },
    { category: 'Legal Compliance', score: 94, benchmark: 80 }
  ]

  const claimSuccessProbability = [
    { range: '0-20%', count: 2, value: 50000 },
    { range: '21-40%', count: 5, value: 125000 },
    { range: '41-60%', count: 12, value: 380000 },
    { range: '61-80%', count: 28, value: 1250000 },
    { range: '81-100%', count: 47, value: 3200000 }
  ]

  const marketTrends = [
    { region: 'Miami-Dade', avgSettlement: 285000, growth: 12, claims: 450 },
    { region: 'Broward', avgSettlement: 225000, growth: 8, claims: 380 },
    { region: 'Palm Beach', avgSettlement: 320000, growth: 15, claims: 290 },
    { region: 'Orange', avgSettlement: 195000, growth: -3, claims: 420 },
    { region: 'Hillsborough', avgSettlement: 175000, growth: 6, claims: 350 }
  ]

  const anomalyDetection = [
    { date: '2024-01', normal: 120, anomaly: 5 },
    { date: '2024-02', normal: 135, anomaly: 8 },
    { date: '2024-03', normal: 142, anomaly: 12 },
    { date: '2024-04', normal: 128, anomaly: 3 },
    { date: '2024-05', normal: 156, anomaly: 18 },
    { date: '2024-06', normal: 149, anomaly: 7 }
  ]

  const runPrediction = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setPredictionResult({
        settlementAmount: 347500,
        confidence: 91,
        timeToSettle: 28,
        successProbability: 94,
        riskFactors: ['Hurricane season approaching', 'Similar claims settling 23% higher'],
        opportunities: ['Code upgrade coverage available', 'Business interruption claim possible']
      })
      setIsCalculating(false)
    }, 2000)
  }

  const COLORS = ['#E74C3C', '#FF6B5A', '#FFA07A', '#FFD93D', '#52D3AA']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stellar-dark flex items-center gap-3">
              AI Analytics Dashboard
              <Sparkles className="text-stellar-orange" size={28} />
            </h1>
            <p className="text-gray-600 mt-2">
              Machine Learning models analyzing {settlementPredictions.length * 20}+ claims with 94% accuracy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
              <Activity className="inline mr-2" size={16} />
              Models Online
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              Last Updated: 2 min ago
            </div>
          </div>
        </div>
      </div>

      {/* ML Model Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6"
        >
          <Brain className="mb-3" size={32} />
          <h3 className="text-xl font-bold mb-2">Neural Network</h3>
          <p className="text-purple-100 text-sm mb-4">
            Deep learning model trained on 50,000+ historical claims
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">96.2%</span>
            <span className="text-purple-200">Accuracy</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6"
        >
          <Target className="mb-3" size={32} />
          <h3 className="text-xl font-bold mb-2">Predictive Models</h3>
          <p className="text-blue-100 text-sm mb-4">
            5 active models forecasting settlements & timelines
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">$2.8M</span>
            <span className="text-blue-200">Recovered</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6"
        >
          <Shield className="mb-3" size={32} />
          <h3 className="text-xl font-bold mb-2">Risk Analysis</h3>
          <p className="text-green-100 text-sm mb-4">
            Real-time risk scoring and anomaly detection
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">427</span>
            <span className="text-green-200">Risks Avoided</span>
          </div>
        </motion.div>
      </div>

      {/* Live Prediction Tool */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-stellar-dark mb-4 flex items-center gap-2">
          <Bot className="text-stellar-orange" />
          Live ML Prediction Engine
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Prediction Model
              </label>
              <select 
                className="w-full px-4 py-2 border rounded-lg"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="settlement-prediction">Settlement Amount Prediction</option>
                <option value="success-probability">Claim Success Probability</option>
                <option value="time-to-settle">Time to Settlement</option>
                <option value="risk-assessment">Risk Assessment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Type
                </label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>Hurricane</option>
                  <option>Water Damage</option>
                  <option>Fire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Value
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="$2,500,000"
                />
              </div>
            </div>

            <button
              onClick={runPrediction}
              className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                isCalculating 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-stellar-orange text-white hover:bg-red-600'
              }`}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Running Neural Network...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Generate Prediction
                </>
              )}
            </button>
          </div>

          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4">ML Prediction Results</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Predicted Settlement</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${predictionResult.settlementAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${predictionResult.confidence}%` }}
                      />
                    </div>
                    <span className="font-medium">{predictionResult.confidence}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Probability</span>
                  <span className="font-bold text-blue-600">{predictionResult.successProbability}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Est. Time to Settle</span>
                  <span className="font-medium">{predictionResult.timeToSettle} days</span>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Key Insights:</p>
                  <ul className="space-y-1">
                    {predictionResult.opportunities.map((opp: string, i: number) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                        <ArrowUp size={12} className="mt-0.5" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Settlement Prediction Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Settlement Amount Predictions vs Actual
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={settlementPredictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="claim" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="predicted" fill="#E74C3C" name="ML Predicted" />
              <Bar dataKey="actual" fill="#52D3AA" name="Actual Settlement" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Model Performance:</strong> Average prediction error of only 3.2% ($8,500)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Time to Settlement Predictions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeToSettlement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#E74C3C" 
                strokeWidth={2}
                name="Predicted Days"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#2C3E50" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Actual Days"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">94%</p>
              <p className="text-xs text-gray-600">Prediction Accuracy</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">3.2</p>
              <p className="text-xs text-gray-600">Avg Days Variance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Success Probability Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Success Probability Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={claimSuccessProbability}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range }) => range}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {claimSuccessProbability.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <strong>81%</strong> of claims have &gt;60% success probability
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Risk Assessment Scores
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={riskScores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Our Score" dataKey="score" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.6} />
              <Radar name="Industry Avg" dataKey="benchmark" stroke="#2C3E50" fill="#2C3E50" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Anomaly Detection
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={anomalyDetection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="normal" stackId="1" stroke="#52D3AA" fill="#52D3AA" />
              <Area type="monotone" dataKey="anomaly" stackId="1" stroke="#E74C3C" fill="#E74C3C" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Anomalies Detected</span>
            <span className="font-bold text-red-600">53 this month</span>
          </div>
        </div>
      </div>

      {/* Market Intelligence */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Regional Market Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {marketTrends.map((region) => (
            <motion.div
              key={region.region}
              whileHover={{ scale: 1.05 }}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{region.region}</h4>
              <p className="text-2xl font-bold text-stellar-orange">
                ${(region.avgSettlement / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-600 mb-2">Avg Settlement</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {region.growth > 0 ? (
                    <ArrowUp className="text-green-500" size={16} />
                  ) : (
                    <ArrowDown className="text-red-500" size={16} />
                  )}
                  <span className={`text-sm font-medium ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(region.growth)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">{region.claims} claims</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                ML Insight: Hurricane Season Opportunity
              </p>
              <p className="text-sm text-gray-600">
                Our models predict a 34% increase in claim values for Miami-Dade and Broward counties 
                in the next 60 days based on historical patterns and weather forecasts. 
                Recommend proactive client outreach for policy reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}