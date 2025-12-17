"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  ChevronDown, 
  ArrowDown, 
  AlertCircle, 
  Info, 
  Loader2, 
  Wallet,
  Zap,
  ShieldCheck
} from 'lucide-react';

// --- Types ---
interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  iconColor: string;
}

const SwapTerminal: React.FC = () => {
  // State untuk Simulasi Data Web3
  const [sellAmount, setSellAmount] = useState<string>("");
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isRpcLoading, setIsRpcLoading] = useState<boolean>(true);
  const [priceImpact, setPriceImpact] = useState<number>(0);

  // Mock Data (Ganti dengan Hooks dari Wagmi/Ethers nanti)
  const userBalance = 1.4502; // ETH Balance
  const ethPrice = 2450.50;

  // 1. RPC Outage Protection Simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsRpcLoading(false), 2000); // Simulasi load data on-chain
    return () => clearTimeout(timer);
  }, []);

  // 2. Logic: Price Impact & Slippage Calculation
  const handleSellChange = (val: string) => {
    // Anti-Exploit: Validasi Angka & Max Check
    const num = parseFloat(val);
    if (val === "") {
      setSellAmount("");
      setBuyAmount("");
      setPriceImpact(0);
      return;
    }
    
    if (num < 0) return; // Prevent negative
    
    // Auto-correct jika melebihi balance
    const sanitizedVal = num > userBalance ? userBalance.toString() : val;
    setSellAmount(sanitizedVal);

    // Simulasi Algoritma Price Impact (V2/V3 AMM Style)
    // Semakin besar swap, semakin besar impact
    const simulatedImpact = (parseFloat(sanitizedVal) / 10) * 100;
    setPriceImpact(simulatedImpact);

    // Simulasi Buy Amount (1 ETH = 2450.50 USDC)
    const estimatedBuy = parseFloat(sanitizedVal) * ethPrice * (1 - simulatedImpact / 100);
    setBuyAmount(isNaN(estimatedBuy) ? "" : estimatedBuy.toFixed(2));
  };

  // 3. Security Status Checks
  const isHighImpact = priceImpact > 5;
  const isButtonDisabled = isRpcLoading || isHighImpact || !sellAmount || parseFloat(sellAmount) <= 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 font-['Geist',_sans-serif] selection:bg-cyan-500/30">
      
      {/* Container Utama - Glassmorphism FX */}
      <div className="w-full max-w-[420px] relative group">
        
        {/* Background Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-600 rounded-[34px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative bg-[#0d0d0d]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
          
          {/* Header Terminal */}
          <div className="flex justify-between items-center p-6 pb-2">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tight">
              Swap Terminal
            </h1>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 pt-2 space-y-2">
            
            {/* Input Panel: Sell */}
            <div className="bg-white/5 border border-white/5 hover:border-cyan-500/30 p-5 rounded-[24px] transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">You Sell</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded-lg">
                  <Wallet className="w-3 h-3 text-cyan-500" />
                  <span>{userBalance.toFixed(4)} ETH</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="number"
                  value={sellAmount}
                  onChange={(e) => handleSellChange(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-3xl font-medium text-white outline-none w-full placeholder:text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => handleSellChange(userBalance.toString())}
                  className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-all uppercase"
                >
                  Max
                </button>
                <div className="flex items-center gap-2 bg-black/40 p-2 pr-3 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/60 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <span className="font-bold text-white text-sm">ETH</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Swap Divider Icon */}
            <div className="relative h-2 flex items-center justify-center z-10">
              <div className="bg-[#0d0d0d] border border-white/10 p-2 rounded-xl text-cyan-500 shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* Input Panel: Buy */}
            <div className="bg-white/5 border border-white/5 hover:border-fuchsia-500/30 p-5 rounded-[24px] transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">You Receive</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="text"
                  readOnly
                  value={buyAmount}
                  placeholder="0.0"
                  className="bg-transparent text-3xl font-medium text-white outline-none w-full placeholder:text-gray-700 cursor-default"
                />
                <div className="flex items-center gap-2 bg-black/40 p-2 pr-3 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/60 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="font-bold text-white text-sm">USDC</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Security Warnings */}
          <div className="px-6 pb-6 space-y-3">
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yellow-500" /> Price Impact
                </span>
                <span className={isHighImpact ? "text-red-500 font-bold" : "text-gray-300"}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-cyan-500" /> Slippage Tolerance
                </span>
                <span className="text-gray-300">{slippage}%</span>
              </div>
            </div>

            {/* High Price Impact Alert */}
            {isHighImpact && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[10px] text-red-200 leading-tight">
                  <span className="font-bold uppercase block mb-0.5">Price Impact Warning</span>
                  Slippage melebihi batas aman. Transaksi akan menyebabkan kerugian signifikan.
                </p>
              </div>
            )}

            {/* Main Action Button */}
            <button
              disabled={isButtonDisabled}
              className={`w-full py-4 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                isRpcLoading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                  : isHighImpact
                  ? 'bg-red-600 text-white cursor-not-allowed shadow-red-900/20'
                  : isButtonDisabled
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {isRpcLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Syncing RPC...</span>
                </>
              ) : isHighImpact ? (
                <span>Price Impact Too High</span>
              ) : (
                <span>Confirm Swap</span>
              )}
            </button>

            {/* Extra Info */}
            <div className="flex items-center justify-center gap-1.5 opacity-40">
              <Info className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">
                Optimized by AI-Router v4
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SwapTerminal;
      
