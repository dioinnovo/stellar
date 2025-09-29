'use client'

import React from "react";
import { Check, Link as LinkIcon, Printer, ShieldCheck, Clock3, BrainCircuit, FileText, Camera, Layers3 } from "lucide-react";

// Internal Pricing One‑Pager Website (Light Mode + Print)
// Full content version

export default function InternalPricingOnePager() {
  const openaiPricing = "https://openai.com/api/pricing/";
  const gcvPricing = "https://cloud.google.com/vision/pricing";



  const costRows = [
    { component: "STT", provider: "OpenAI Whisper-1", cost: "$0.006 / min", usage: "120 min", est: "$0.72" },
    { component: "Embeddings", provider: "OpenAI (text-embedding-3-small)", cost: "$0.00002 / 1k tokens", usage: "30k tokens", est: "$0.0006" },
    { component: "LLM (RAG + Gen)", provider: "OpenAI GPT‑4o mini", cost: "$0.15/$0.60 per 1M in/out", usage: "~48k tokens", est: "~$0.01–$0.03" },
    { component: "Vision", provider: "Google Vision (Labels + Object Loc.)", cost: "$1.50 + $2.25 / 1k images", usage: "40 images", est: "~$0.15" },
    { component: "Retrieval / Overhead", provider: "Internal infra", cost: "Flat", usage: "per report", est: "~$0.05" },
  ];

  const tiers = [
    {
      name: "Tier 1",
      price: "$4,999/mo",
      highlight: false,
      bullets: [
        "Up to 25 claims included",
        "AI-powered text + vision analysis",
        "Professional inspection reports",
        "Email support within 24 hours",
      ],
    },
    {
      name: "Tier 2",
      price: "$14,999/mo",
      highlight: true,
      bullets: [
        "Up to 100 claims included",
        "Advanced negotiation intelligence",
        "Real-time analytics dashboard",
        "Priority support & 2x faster processing",
      ],
    },
    {
      name: "Tier 3",
      price: "$29,999/mo",
      highlight: false,
      bullets: [
        "Up to 300 claims included",
        "Custom AI models & white-label options",
        "Dedicated success manager",
        "API access & seamless integrations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 text-slate-900">
      {/* Print styles for clean PDF output */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }

          /* Reset and base styles */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.5;
            color: #1e293b;
          }

          /* Hide non-essential elements */
          header,
          .print\\:hidden,
          button[type="button"] {
            display: none !important;
          }

          /* Main container */
          main {
            max-width: 100% !important;
            padding: 0 !important;
          }

          /* Typography hierarchy */
          h1, h2 {
            color: #0f172a;
            font-weight: 700;
            margin: 0;
            padding: 0;
            line-height: 1.2;
          }

          h2 {
            font-size: 24px !important;
            margin-bottom: 12px !important;
            page-break-after: avoid;
          }

          h3 {
            font-size: 14px !important;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px !important;
            page-break-after: avoid;
          }

          p {
            font-size: 11px !important;
            line-height: 1.4 !important;
            margin: 6px 0 !important;
            color: #475569;
          }

          /* Hero section */
          section:first-of-type {
            margin-bottom: 20px !important;
          }

          section:first-of-type h2 {
            font-size: 22px !important;
          }

          section:first-of-type p {
            font-size: 11px !important;
          }

          /* Grid layouts */
          .grid {
            display: grid !important;
            gap: 12px !important;
          }

          .lg\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }

          .sm\\:grid-cols-3,
          .md\\:grid-cols-3,
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }

          /* Visual Cost Snapshot box */
          .relative.rounded-3xl {
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 12px !important;
            background: white !important;
            box-shadow: none !important;
          }

          /* Cost cards */
          .rounded-2xl {
            border-radius: 6px !important;
            padding: 12px 8px !important;
            text-align: center;
            border: 1px solid #e2e8f0 !important;
          }

          .rounded-2xl .text-3xl {
            font-size: 20px !important;
            font-weight: 700 !important;
            margin: 4px 0 !important;
          }

          .rounded-2xl .text-xs {
            font-size: 9px !important;
          }

          /* Badges and pills */
          .rounded-full {
            border-radius: 12px !important;
            padding: 2px 8px !important;
            font-size: 9px !important;
            display: inline-block !important;
            margin-bottom: 8px !important;
          }

          /* Links section */
          section a {
            display: inline-block !important;
            padding: 6px 10px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 4px !important;
            font-size: 10px !important;
            text-decoration: none !important;
            color: #0891b2 !important;
            margin-right: 8px !important;
            margin-bottom: 8px !important;
            background: white !important;
          }

          /* Table styling */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
            margin-top: 8px !important;
            page-break-inside: avoid;
          }

          thead {
            background-color: #f8fafc !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          th {
            padding: 6px 8px !important;
            text-align: left !important;
            font-weight: 600 !important;
            font-size: 10px !important;
            color: #334155 !important;
          }

          td {
            padding: 5px 8px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 10px !important;
            color: #475569 !important;
          }

          tbody tr:hover {
            background: transparent !important;
          }

          /* Pricing tiers */
          section:has(.md\\:grid-cols-3) {
            margin-top: 16px !important;
            margin-bottom: 16px !important;
          }

          /* Tier cards */
          .relative.rounded-3xl:has(.text-2xl) {
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 16px !important;
            background: white !important;
            min-height: auto !important;
            page-break-inside: avoid;
          }

          .relative.rounded-3xl.ring-cyan-300 {
            border: 2px solid #06b6d4 !important;
            background: #f0fdfa !important;
          }

          /* Tier pricing */
          .text-2xl {
            font-size: 18px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin: 4px 0 8px 0 !important;
          }

          /* Tier features list */
          ul li {
            font-size: 10px !important;
            line-height: 1.4 !important;
            color: #475569 !important;
            margin: 4px 0 !important;
          }

          ul li .h-4 {
            width: 12px !important;
            height: 12px !important;
            color: #10b981 !important;
          }

          /* Key takeaway box */
          .border-emerald-300 {
            border: 1px solid #86efac !important;
            border-radius: 8px !important;
            padding: 12px !important;
            background: #f0fdf4 !important;
            margin-top: 16px !important;
          }

          .border-emerald-300 h3 {
            color: #064e3b !important;
            font-size: 13px !important;
            margin-bottom: 6px !important;
          }

          .border-emerald-300 p {
            font-size: 10px !important;
            line-height: 1.5 !important;
            color: #047857 !important;
          }

          /* Footer */
          footer {
            margin-top: 16px !important;
            padding-top: 8px !important;
            border-top: 1px solid #e2e8f0 !important;
            font-size: 9px !important;
            color: #64748b !important;
            page-break-before: avoid;
          }

          footer a {
            color: #0891b2 !important;
            text-decoration: underline !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 4px !important;
            display: inline !important;
          }

          /* Ensure backgrounds print */
          .bg-emerald-500\\/15 {
            background-color: rgba(16, 185, 129, 0.15) !important;
          }

          .bg-cyan-50 {
            background-color: #ecfeff !important;
          }

          .bg-slate-50\\/60 {
            background-color: rgba(248, 250, 252, 0.6) !important;
          }

          /* Remove unnecessary effects in print */
          .shadow,
          .shadow-sm,
          .shadow-lg,
          .backdrop-blur,
          .backdrop-blur-sm {
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          /* Compact spacing adjustments */
          section {
            margin: 12px 0 !important;
            page-break-inside: avoid;
          }

          .mt-14,
          .mt-16,
          .mt-12 {
            margin-top: 12px !important;
          }

          .mb-4 {
            margin-bottom: 6px !important;
          }

          .gap-8 {
            gap: 12px !important;
          }

          .gap-6 {
            gap: 10px !important;
          }

          .p-6 {
            padding: 12px !important;
          }

          .px-4 {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .py-3 {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }

          /* Icons sizing */
          .h-5,
          .w-5 {
            height: 14px !important;
            width: 14px !important;
          }

          .h-4,
          .w-4 {
            height: 12px !important;
            width: 12px !important;
          }

          .h-3\\.5,
          .w-3\\.5 {
            height: 10px !important;
            width: 10px !important;
          }
        }
      ` }} />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white dark:bg-gray-900/80 border-b border-slate-200 print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between print:py-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30 grid place-items-center">
              <BrainCircuit className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Property Inspection Intelligence — Maximizing Claim Value</h1>
              <p className="text-xs text-slate-500">For CEO/CTO use only • Printable one‑pager • Transform inspections into negotiation leverage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={openaiPricing} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 hover:bg-slate-50 text-xs ring-1 ring-slate-200 transition">
              <LinkIcon className="h-3.5 w-3.5" /> OpenAI Pricing
            </a>
            <a href={gcvPricing} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 hover:bg-slate-50 text-xs ring-1 ring-slate-200 transition">
              <LinkIcon className="h-3.5 w-3.5" /> Google Vision Pricing
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 print:px-3 print:pb-4 print:pt-4 print-single-page">
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-8 items-center print:gap-4 print:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 backdrop-blur-sm px-3 py-1 text-emerald-700 text-xs mb-4">
              <ShieldCheck className="h-3.5 w-3.5" /> Internal • High‑side estimates with 30% buffer
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight print:text-xl print:leading-tight">
              Property Inspection <span className="text-cyan-700">Intelligence</span> for Maximum Claim Outcomes
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed print:mt-2 print:text-sm">
              Reduce report prep from <strong>hours</strong> to <strong>≈15 minutes</strong> while improving settlement outcomes. Our platform fuses
              <em> text + vision</em>, performs <em>RAG benchmarking</em> against historical claims, and generates a <em>strategic report</em> with negotiation levers to maximize claim value.
            </p>
            <ul className="mt-6 grid sm:grid-cols-3 gap-3 print:mt-3 print:text-xs">
              <li className="flex items-center gap-2 text-sm text-slate-800"><Clock3 className="h-4 w-4 text-emerald-700" /> Hours → 15 min</li>
              <li className="flex items-center gap-2 text-sm text-slate-800"><Camera className="h-4 w-4 text-emerald-700" /> Vision + Localization</li>
              <li className="flex items-center gap-2 text-sm text-slate-800"><Layers3 className="h-4 w-4 text-emerald-700" /> RAG on Similar Claims</li>
            </ul>
          </div>
          <div>
            <div className="relative rounded-3xl border border-slate-200/50 bg-white dark:bg-gray-900/70 backdrop-blur-sm p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Visual Cost Snapshot</h3>
              <p className="text-xs text-slate-500 mb-4">Estimated all‑in cost per report (with 30% buffer applied).</p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                {[
                  { label: "Low", val: "$1", tone: "from-emerald-100/70 to-emerald-50/50", ring: "ring-emerald-300/50" },
                  { label: "Typical", val: "$2", tone: "from-cyan-100/70 to-cyan-50/50", ring: "ring-cyan-300/50" },
                  { label: "High", val: "$3", tone: "from-amber-100/70 to-amber-50/50", ring: "ring-amber-300/50" },
                ].map((c, i) => (
                  <div key={i} className={`rounded-2xl bg-gradient-to-br ${c.tone} ring-1 ${c.ring} px-4 py-6 text-center`}>
                    <div className="text-xs uppercase tracking-wide text-slate-600">{c.label}</div>
                    <div className="text-3xl font-bold text-slate-900 mt-1">{c.val}</div>
                    <div className="text-[11px] text-slate-600 mt-1">per report</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 dark:bg-gray-900/60 backdrop-blur-sm p-3 text-[13px] text-slate-700 ring-1 ring-slate-200/50">
                <p>COGS are dominated by STT minutes and number of photos processed; LLM + embeddings are minimal at this scale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sources & Links */}
        <section className="mt-14 print:mt-6">
          <h3 className="text-lg font-semibold">Authoritative Pricing Sources</h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm print:grid-cols-2">
            <a href={openaiPricing} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 p-3 rounded-xl ring-1 ring-slate-200 bg-white dark:bg-gray-900 hover:bg-slate-50 transition">
              <LinkIcon className="h-4 w-4 text-cyan-700" /> OpenAI Pricing (Whisper, Embeddings, GPT‑4o mini)
              <span className="ml-auto text-xs text-slate-500 group-hover:text-slate-700">openai.com</span>
            </a>
            <a href={gcvPricing} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 p-3 rounded-xl ring-1 ring-slate-200 bg-white dark:bg-gray-900 hover:bg-slate-50 transition">
              <LinkIcon className="h-4 w-4 text-cyan-700" /> Google Cloud Vision Pricing (Labels, Object Localization)
              <span className="ml-auto text-xs text-slate-500 group-hover:text-slate-700">cloud.google.com</span>
            </a>
          </div>
        </section>

        {/* Cost Table */}
        <section className="mt-12 print:mt-6">
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold print:text-sm">Cost Comparison Table</h3>
            <p className="text-xs text-slate-500">Assumes 120 min audio, 40 images, ~48k total LLM tokens.</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200 print:mt-2">
            <table className="min-w-full divide-y divide-slate-200 text-sm print:text-xs">
              <thead className="bg-slate-50 dark:bg-gray-900/70 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium print:px-2 print:py-1">Component</th>
                  <th className="px-4 py-3 text-left font-medium print:px-2 print:py-1">Provider</th>
                  <th className="px-4 py-3 text-left font-medium print:px-2 print:py-1">Cost / Unit</th>
                  <th className="px-4 py-3 text-left font-medium print:px-2 print:py-1">Usage / Report</th>
                  <th className="px-4 py-3 text-left font-medium print:px-2 print:py-1">Est. Cost / Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:bg-gray-900">
                {costRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:bg-gray-900">
                    <td className="px-4 py-3 print:px-2 print:py-1">{r.component}</td>
                    <td className="px-4 py-3 print:px-2 print:py-1">{r.provider}</td>
                    <td className="px-4 py-3 print:px-2 print:py-1">{r.cost}</td>
                    <td className="px-4 py-3 print:px-2 print:py-1">{r.usage}</td>
                    <td className="px-4 py-3 font-semibold print:px-2 print:py-1">{r.est}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-gray-900/70">
                  <td className="px-4 py-3 font-semibold print:px-2 print:py-1" colSpan={4}>Total (incl. 30% buffer range)</td>
                  <td className="px-4 py-3 font-extrabold text-emerald-700 print:px-2 print:py-1">~$1–$3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="mt-14 print:mt-6">
          <div className="flex items-end justify-between">
            <h3 className="text-lg font-semibold print:text-sm">Pricing Guide - Suggested Subscription Tiers for Medium‑Sized Clients</h3>
            <div className="text-xs text-slate-500">Additional claims: $149 each</div>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-6 print:mt-3 print:gap-3 print:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className={`relative rounded-3xl p-6 ring-1 print:p-3 print:rounded-xl ${t.highlight ? "ring-cyan-300/70 bg-cyan-50/40" : "ring-slate-200/70 bg-white/40 backdrop-blur-sm"}`}>
                {t.highlight && (
                  <div className="absolute -top-3 right-4 rounded-full bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 shadow">Recommended</div>
                )}
                <div className="text-sm text-slate-600 print:text-xs">{t.name}</div>
                <div className="mt-1 text-2xl font-semibold print:text-lg">{t.price}</div>
                <ul className="mt-4 space-y-2 text-sm print:mt-2 print:space-y-1 print:text-xs">
                  {t.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-700 mt-0.5" /> <span>{b}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Key Takeaway */}
        <section className="mt-14 print:mt-6">
          <div className="rounded-3xl border border-emerald-300/50 bg-emerald-50/40 backdrop-blur-sm p-6 print:p-3 print:rounded-xl">
            <h3 className="text-lg font-semibold text-emerald-900 print:text-sm">Key Takeaway</h3>
            <p className="mt-2 text-slate-800 leading-relaxed print:mt-1 print:text-xs print:leading-normal">
              This platform is a <strong>property inspection intelligence engine</strong>: it fuses inspector notes + photos, compares against similar claims to surface
              what&apos;s missing, and generates a <strong>comprehensive, negotiation‑ready report</strong>. It dramatically <strong>reduces prep time</strong> and improves
              <strong>settlement leverage</strong> — all with <strong>COGS of roughly $1–$3 per report</strong>.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-600 print:mt-6 print:pt-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Internal Use Only — Pricing & Positioning</div>
            <div className="flex items-center gap-3">
              <a href={openaiPricing} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline underline-offset-4">OpenAI Pricing</a>
              <a href={gcvPricing} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline underline-offset-4">Google Cloud Vision Pricing</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}