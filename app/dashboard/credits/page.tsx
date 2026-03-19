"use client";

import { useState } from "react";
import { Coins, Plus, Minus, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const CREDIT_PACKAGES = [
  { credits: 10, label: "Starter", desc: "Perfect to try out" },
  { credits: 50, label: "Popular", desc: "Most users choose this", popular: true },
  { credits: 100, label: "Pro", desc: "Best value per credit" },
  { credits: 200, label: "Power", desc: "For serious job seekers" },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CreditsPage() {
  const [customCredits, setCustomCredits] = useState(10);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const creditCount = selectedPackage !== null ? selectedPackage : customCredits;
  const priceInRs = (creditCount * 0.5).toFixed(2);

  async function handleBuyCredits() {
    setLoading(true);
    setSuccess(false);
    try {
      // 1. Create Razorpay order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: creditCount }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { orderId, amount, keyId } = await res.json();

      // 2. Load Razorpay checkout
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      await new Promise<void>((resolve) => { script.onload = () => resolve(); });

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "GetSetJob",
        description: `${creditCount} Job Credits`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            setSuccess(true);
            router.refresh();
          }
        },
        theme: { color: "#7c3aed" },
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Buy Credits</h1>
        <p className="text-neutral-400">1 credit = ₹0.50 · Credits power your job applications across all platforms.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <div className="text-green-300 font-semibold">Credits added successfully!</div>
            <div className="text-green-400/70 text-sm">Your balance has been updated.</div>
          </div>
        </div>
      )}

      {/* Packages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <button
            key={pkg.credits}
            onClick={() => { setSelectedPackage(pkg.credits); setCustomCredits(pkg.credits); }}
            className={`relative p-4 rounded-xl border text-left transition-all duration-150 ${
              selectedPackage === pkg.credits
                ? "border-violet-500 bg-violet-600/20 text-white"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 bg-violet-600 text-white rounded-full font-semibold">
                Popular
              </div>
            )}
            <div className="text-2xl font-bold text-white">{pkg.credits}</div>
            <div className="text-xs text-neutral-400 mt-0.5 font-medium">{pkg.label}</div>
            <div className="text-xs text-neutral-500 mt-1">{pkg.desc}</div>
            <div className="mt-2 text-sm font-semibold text-violet-400">₹{(pkg.credits * 0.5).toFixed(2)}</div>
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="p-5 rounded-xl border border-white/10 bg-white/5 mb-6">
        <div className="text-sm font-medium text-neutral-300 mb-3">Or enter a custom amount</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedPackage(null); setCustomCredits((c) => Math.max(1, c - 1)); }}
            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={10000}
            value={selectedPackage !== null ? selectedPackage : customCredits}
            onChange={(e) => { setSelectedPackage(null); setCustomCredits(Math.max(1, parseInt(e.target.value) || 1)); }}
            className="flex-1 text-center text-2xl font-bold bg-transparent text-white border-0 outline-none"
          />
          <button
            onClick={() => { setSelectedPackage(null); setCustomCredits((c) => c + 1); }}
            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-center text-neutral-500 mt-2">{creditCount} credits = ₹{priceInRs}</div>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleBuyCredits}
        disabled={loading || creditCount < 1}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Pay ₹{priceInRs} for {creditCount} Credits</>
        )}
      </button>

      <p className="text-xs text-neutral-600 text-center mt-3">
        Secured by Razorpay · UPI, Cards, Net Banking accepted
      </p>
    </div>
  );
}
