"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  X, 
  ArrowRight, 
  AlertTriangle, 
  Cpu, 
  Fingerprint,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface SafetyGuardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  txData: {
    fromSymbol: string;
    toSymbol: string;
    fromAmount: string;
    toAmount: string;
    priceImpact: number;
    rpcActive: boolean;
    balance: number;
  };
}

const SafetyGuardModal: React.FC<SafetyGuardProps> = ({ isOpen, onClose, onConfirm, txData }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Security Logic: Critical Blocks
  const isHighRisk = txData.priceImpact > 5;
  const isRpcDown = !txData.rpcActive;
  const isOverBalance = parseFloat(txData.fromAmount) > txData.balance;

  // Hold-to-Confirm Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && progress < 100 && !isHighRisk && !isRpcDown) {
      interval = setInterval(() => {
        setProgress((prev) => prev + 2);
      }, 20);
    } else {
      if (progress < 100) setProgress(0);
    }

    if (progress >= 100) {
      onConfirm();
      setIsHolding(false);
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isHolding, progress, isHighRisk, isRpcDown, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300">
      {/* Backdrop with heavy blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 font-['Geist']">
        
        {/* Neon Top Border Accent */}
        <div className={`h-1 w-full ${isHighRisk ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}`} />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <ShieldAlert className={isHighRisk ? "text-red-500" : "text-cyan-400"} />
                Verify Transaction
              </h2>
              <p className="text-gray-400 text-sm">Review details to avoid fat-finger errors.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transaction Summary Card */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">From</p>
                <p className="text-xl font-medium text-white">{txData.fromAmount} {txData.fromSymbol}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-full">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">To (Est.)</p>
                <p className="text-xl font-medium text-cyan-400">{txData.toAmount} {txData.toSymbol}</p>
              </div>
            </div>
          </div>

          {/* Critical Risk Warnings */}
          <div className="space-y-3 mb-8">
            {/* Price Impact Check */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isHighRisk ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5'}`}>
              <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-red-500/20' : 'bg-cyan-500/20'}`}>
                <AlertTriangle className={`w-5 h-5 ${isHighRisk ? 'text-red-500' : 'text-cyan-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Price Impact</span>
                  <span className={`text-sm font-black ${isHighRisk ? 'text-red-500' : 'text-green-400'}`}>
                    {txData.priceImpact}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isHighRisk ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(txData.priceImpact * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RPC Integrity Check */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className={`p-2 rounded-xl ${isRpcDown ? 'bg-yellow-500/20' : 'bg-emerald-500/20'}`}>
                <Cpu className={`w-5 h-5 ${isRpcDown ? 'text-yellow-500' : 'text-emerald-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Node Status (RPC)</span>
                  <span className={`text-xs font-bold ${isRpcDown ? 'text-yellow-500' : 'text-emerald-400'}`}>
                    {isRpcDown ? 'Connection Unstable' : 'Verified Secure'}
                  </span>
                </div>
              </div>
              {!isRpcDown && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>

          {/* Interactive Action Button */}
          <div className="relative">
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              disabled={isHighRisk || isRpcDown || isOverBalance}
              className={`relative w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center transition-all overflow-hidden ${
                (isHighRisk || isRpcDown || isOverBalance)
                ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black active:scale-[0.98]'
              }`}
            >
              {/* Progress Bar Overlay */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-cyan-500 transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
              
              <div className="relative z-10 flex items-center gap-3">
                {isHighRisk ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Impact Too High</span>
                  </>
                ) : isRpcDown ? (
                  <span>Syncing Nodes...</span>
                ) : (
                  <>
                    <Fingerprint className={`w-6 h-6 ${isHolding ? 'animate-pulse' : ''}`} />
                    <span>{isHolding ? 'Hold to confirm...' : 'Press & Hold to Swap'}</span>
                  </>
                )}
              </div>
            </button>
            
            {/* Visual feedback for hold */}
            {!isHighRisk && !isRpcDown && (
              <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest animate-pulse">
                Safety Guard Active: Anti-Fat-Finger Enabled
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuardModal;
        
