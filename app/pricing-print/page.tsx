'use client'

import React, { useEffect } from "react";
import { Check, Link as LinkIcon, Printer, ShieldCheck, Clock3, BrainCircuit, FileText, Camera, Layers3 } from "lucide-react";

export default function InternalPricingOnePagerPrint() {
  const openaiPricing = "https://openai.com/api/pricing/";
  const gcvPricing = "https://cloud.google.com/vision/pricing";

  // Automatically trigger print when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      // Go back after print dialog
      setTimeout(() => {
        window.history.back();
      }, 1000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
        "~50 claims included",
        "Text + vision analysis",
        "Enhanced reporting",
        "Standard support",
      ],
    },
    {
      name: "Tier 2",
      price: "$14,999/mo",
      highlight: true,
      bullets: [
        "~150 claims included",
        "Negotiation levers + dashboards",
        "Priority support",
        "Faster turnaround & higher image limits",
      ],
    },
    {
      name: "Tier 3",
      price: "$29,999/mo",
      highlight: false,
      bullets: [
        "~300 claims included",
        "Custom vision/damage models",
        "Executive insights dashboard",
        "SLA + strategy consulting + CRM/ERP integration",
      ],
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      ` }} />

      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        {/* Hero */}
        <section className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-700 text-xs mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Internal • High‑side estimates with 30% buffer
          </div>
          <h1 className="text-2xl font-bold mb-4">
            Property Inspection Intelligence for Maximum Claim Outcomes
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Reduce report prep from <strong>hours</strong> to <strong>≈15 minutes</strong> while improving settlement outcomes.
          </p>
        </section>

        {/* Cost Table */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Cost Comparison</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="border p-2 text-left">Component</th>
                <th className="border p-2 text-left">Provider</th>
                <th className="border p-2 text-left">Cost/Unit</th>
                <th className="border p-2 text-left">Usage</th>
                <th className="border p-2 text-left">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {costRows.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r.component}</td>
                  <td className="border p-2">{r.provider}</td>
                  <td className="border p-2">{r.cost}</td>
                  <td className="border p-2">{r.usage}</td>
                  <td className="border p-2 font-semibold">{r.est}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="border p-2 font-semibold" colSpan={4}>Total (incl. 30% buffer)</td>
                <td className="border p-2 font-bold text-emerald-700">~$1–$3</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Pricing Tiers */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Subscription Tiers</h2>
          <div className="grid grid-cols-3 gap-4">
            {tiers.map((t) => (
              <div key={t.name} className={`border rounded-lg p-4 ${t.highlight ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.name}</div>
                <div className="text-xl font-bold mb-4">{t.price}</div>
                <ul className="space-y-2 text-sm">
                  {t.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}