"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { AlertTriangle, Loader2, Info, ArrowDownUp } from 'lucide-react';

// --- Types ---
interface ChartProps {
  data: { time: string; value: number }[];
  userBalance: number;
}

const TradingViewChart: React.FC<ChartProps> = ({ data, userBalance }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  // State Management
  const [amount, setAmount] = useState<string>("");
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [isRpcLoading, setIsRpcLoading] = useState<boolean>(true);

  // 1. Inisialisasi Chart (Anti-Lag Optimization)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: { borderVisible: false },
      rightPriceScale: { borderVisible: false },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#22d3ee', // Cyan Neon
      topColor: 'rgba(34, 211, 238, 0.3)',
      bottomColor: 'rgba(34, 211, 238, 0.0)',
      lineWidth: 2,
    });

    areaSeries.setData(data);
    seriesRef.current = areaSeries;
    chartRef.current = chart;

    // Simulate RPC Load
    setTimeout(() => setIsRpcLoading(false), 1500);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  // 2. Logic Validasi & Price Impact
  const handleAmountChange = (val: string) => {
    const numericValue = parseFloat(val);
    
    // Anti-Exploit: No negatives, no over-balance
    if (numericValue < 0) return;
    if (numericValue > userBalance) {
      setAmount(userBalance.toString());
    } else {
      setAmount(val);
    }

    // Simulasi Price Impact Logic (Contoh: > 1000 tokens impact naik)
    const impact = numericValue > 0 ? (numericValue / 500) : 0;
    setPriceImpact(impact);
  };

  const isHighImpact = priceImpact > 5;
  const isButtonDisabled = isRpcLoading || isHighImpact || !amount || parseFloat(amount) <= 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-4 font-['Geist',_sans-serif]">
      {/* Container Utama - Glassmorphism */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-cyan-500/10">
        
        {/* Header Section */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold tracking-tight">Market View</h2>
            <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
              <span className="text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="relative w-full h-[300px]" ref={chartContainerRef}>
            {isRpcLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-xl">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Swap UI Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>Input Amount</span>
              <span>Balance: {userBalance.toLocaleString()}</span>
            </div>
            
            <div className="relative group">
              <input 
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-white font-bold">ETH</span>
                <button 
                  onClick={() => handleAmountChange(userBalance.toString())}
                  className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md hover:bg-cyan-500/40 transition-colors uppercase font-bold"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Price Impact Indicator */}
          {amount && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
              isHighImpact ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-white/5'
            }`}>
              {isHighImpact ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Info className="w-4 h-4 text-cyan-500" />}
              <div className="flex-1 flex justify-between items-center">
                <span className="text-xs text-slate-400">Price Impact</span>
                <span className={`text-xs font-bold ${isHighImpact ? 'text-red-500' : 'text-cyan-400'}`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            disabled={isButtonDisabled}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isHighImpact 
                ? 'bg-red-600 text-white cursor-not-allowed shadow-lg shadow-red-900/20' 
                : isButtonDisabled 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:opacity-90'
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
              <>
                <ArrowDownUp className="w-5 h-5" />
                <span>Swap Tokens</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Meta */}
      <p className="mt-6 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
        Powered by High-Frequency Engine v2.0
      </p>
    </div>
  );
};

export default TradingViewChart;
            
