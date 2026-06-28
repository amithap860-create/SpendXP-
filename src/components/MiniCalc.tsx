'use client';

import React, { useState, useCallback } from 'react';
import { Calculator, X, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Safe recursive-descent math evaluator.
 * Supports: +  -  *  /  and parentheses. No eval, no Function().
 * Grammar:
 *   expr   = term   (('+' | '-') term)*
 *   term   = factor (('*' | '/') factor)*
 *   factor = '-' factor | '(' expr ')' | number
 */
function safeMathEval(expr: string): number {
  let pos = 0;
  const peek = () => expr[pos];
  const consume = () => expr[pos++];
  const skipWs = () => { while (expr[pos] === ' ') pos++; };

  function parseExpr(): number {
    skipWs();
    let val = parseTerm();
    skipWs();
    while (peek() === '+' || peek() === '-') {
      const op = consume(); skipWs();
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
      skipWs();
    }
    return val;
  }

  function parseTerm(): number {
    skipWs();
    let val = parseFactor();
    skipWs();
    while (peek() === '*' || peek() === '/') {
      const op = consume(); skipWs();
      const right = parseFactor();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      val = op === '*' ? val * right : val / right;
      skipWs();
    }
    return val;
  }

  function parseFactor(): number {
    skipWs();
    if (peek() === '-') { consume(); return -parseFactor(); }
    if (peek() === '(') {
      consume();
      const val = parseExpr();
      skipWs();
      if (peek() === ')') consume();
      return val;
    }
    // Parse number
    let num = '';
    while (pos < expr.length && /[0-9.]/.test(expr[pos])) num += consume();
    if (!num) throw new Error('Expected number');
    return parseFloat(num);
  }

  const result = parseExpr();
  return result;
}

interface MiniCalcProps {
  onInsert?: (value: string) => void;
  className?: string;
}

/**
 * Inline basic calculator.
 * Place next to any input field where the user might need to compute a value.
 * Pass onInsert to receive the result into the parent input.
 */
export function MiniCalc({ onInsert, className }: MiniCalcProps) {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleKey = useCallback((key: string) => {
    if (key === 'C') {
      setDisplay('0');
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (key === '⌫') {
      setDisplay(d => (d.length > 1 ? d.slice(0, -1) : '0'));
      return;
    }

    if (key === '=') {
      try {
        // Safe recursive-descent math parser — no eval, no Function()
        const safe = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/().]/g, '');
        const result = safeMathEval(safe);
        const formatted = isFinite(result) && !isNaN(result)
          ? (Math.round(result * 1000000) / 1000000).toString()
          : 'Error';
        setDisplay(formatted);
        setExpression(formatted);
        setJustEvaluated(true);
      } catch {
        setDisplay('Error');
        setExpression('');
      }
      return;
    }

    const operators = ['+', '-', '×', '÷'];
    const isOp = operators.includes(key);

    if (justEvaluated && !isOp) {
      // Start fresh number after =
      setExpression(key);
      setDisplay(key);
      setJustEvaluated(false);
      return;
    }

    setJustEvaluated(false);

    const newExpr = (justEvaluated && isOp ? expression : expression) + key;
    setExpression(newExpr);

    // Update display: show current number being typed
    if (!isOp) {
      setDisplay(d => (d === '0' && key !== '.' ? key : d + key));
    } else {
      setDisplay(key);
    }
  }, [expression, justEvaluated]);

  const handleInsert = () => {
    if (display !== 'Error' && onInsert) {
      onInsert(display);
      setOpen(false);
    }
  };

  const keys = [
    ['C', '⌫', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '', ''],
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
          open
            ? 'bg-primary text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary'
        )}
        title="Open mini calculator"
        suppressHydrationWarning
      >
        <Calculator className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900">
            <div className="flex items-center gap-1 text-white">
              <Calculator className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Calculator</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white" suppressHydrationWarning>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Display */}
          <div className="px-3 py-2 bg-slate-800">
            <div className="text-[10px] text-slate-500 h-3 truncate">{expression}</div>
            <div className="text-2xl font-black text-white text-right truncate">{display}</div>
          </div>

          {/* Keys */}
          <div className="p-2 grid grid-cols-4 gap-1.5">
            {keys.flat().map((key, i) => {
              if (!key) return <div key={i} />;
              const isOp = ['÷', '×', '-', '+'].includes(key);
              const isEq = key === '=';
              const isClear = key === 'C';
              const isDel = key === '⌫';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={cn(
                    'h-10 rounded-xl text-sm font-black transition-all active:scale-95',
                    isEq && 'bg-primary text-white hover:bg-primary/90',
                    isOp && 'bg-[#E8F5EE] text-[#2E7D5A] hover:bg-[#C8E8D8]',
                    isClear && 'bg-rose-50 text-rose-600 hover:bg-rose-100',
                    isDel && 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    !isOp && !isEq && !isClear && !isDel && 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  )}
                  suppressHydrationWarning
                >
                  {isDel ? <Delete className="h-3.5 w-3.5 mx-auto" /> : key}
                </button>
              );
            })}
          </div>

          {/* Insert button */}
          {onInsert && (
            <div className="px-2 pb-2">
              <button
                type="button"
                onClick={handleInsert}
                disabled={display === 'Error'}
                className="w-full h-9 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary disabled:opacity-40 transition-colors"
                suppressHydrationWarning
              >
                Insert {display !== 'Error' ? display : ''} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
