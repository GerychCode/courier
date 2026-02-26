'use client';

import { useState } from 'react';
import { Brain } from 'lucide-react';
import { LocationKey, Order } from '../types';
import { LOCATION_SYNONYMS, LOCATIONS } from '../constants/logistics';

interface Props {
    onAddOrder: (order: Order) => void;
}

export default function SmartInput({ onAddOrder }: Props) {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const parseAndAdd = () => {
        const rawText = text.trim();
        if (!rawText) return;

        const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length === 0) return;

        let routeLineIndex = lines.findIndex(l => l.match(/[—–-]/));
        if (routeLineIndex === -1) routeLineIndex = 0;
        const routeText = lines[routeLineIndex];

        let goodsText = "";
        if (lines.length > 1) {
            goodsText = lines.filter((_, i) => i !== routeLineIndex).join(" ").trim();
        }

        const routeParts = routeText.split(/\s*[-–—]\s*/);
        if (routeParts.length < 2) {
            setError("Формат: Звідки - Куди");
            return;
        }

        const clean = (s: string) => s.toLowerCase().trim();
        let fromKey: LocationKey | null = null;
        let toKey: LocationKey | null = null;

        for (const [name, key] of Object.entries(LOCATION_SYNONYMS)) {
            if (clean(routeParts[0]).includes(name)) fromKey = key as LocationKey;
            if (clean(routeParts[1]).includes(name)) toKey = key as LocationKey;
        }

        if (!fromKey || !toKey) {
            setError("Невідома локація");
            return;
        }

        if (!goodsText) {
            const destRaw = routeParts[1];
            if (destRaw.length > 10) {
                goodsText = destRaw.replace(new RegExp(LOCATIONS[toKey], 'i'), '').trim();
            }
            if (!goodsText) goodsText = "Вантаж";
        }

        onAddOrder({ id: Date.now(), goods: goodsText, pickupLoc: fromKey, dropLoc: toKey });
        setText('');
        setError('');
    };

    return (
        <div className="bg-slate-800 p-5 rounded-xl shadow-lg text-white">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-300 flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" /> Розумний ввід
    </h2>
    <textarea
    rows={3}
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder={`Приклад:\nПочайна - Бублік\nХолст 30х40`}
    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-purple-400 transition"
    />
    <button
        onClick={parseAndAdd}
    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg transition shadow-md"
        >
        Додати
        </button>
    {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
        </div>
    );
    }