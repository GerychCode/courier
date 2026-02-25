'use client';

import { useState, useMemo } from 'react';
import { RouteResult } from '../types';
import { groupSteps, formatRouteForClipboard } from '../utils/formatter';
import { exportToExcel } from '../utils/excel';
import { FileSpreadsheet, Copy, Check, MapPin, ArrowUp, ArrowDown, Clock } from 'lucide-react';

interface Props {
    routeData: RouteResult | null;
    isCalculating: boolean;
}

export default function RouteDisplay({ routeData, isCalculating }: Props) {
    const [copied, setCopied] = useState(false);

    const stops = useMemo(() => {
        if (!routeData) return [];
        return groupSteps(routeData.steps);
    }, [routeData]);

    const handleCopy = () => {
        if (stops.length === 0) return;
        const text = formatRouteForClipboard(stops);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        });
    };

    const handleExcel = () => {
        if (stops.length === 0) {
            alert("Маршрут пустий");
            return;
        }
        exportToExcel(stops);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-[500px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Маршрутний лист
                        {isCalculating && (
                            <span className="text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center">
                <span className="loader mr-1 border-[2px] w-[14px] h-[14px]"></span> Рахую...
              </span>
                        )}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExcel}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-md active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Excel (Print Ready)</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-md active:scale-95 ${copied ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? 'ОК' : 'Копіювати'}</span>
                    </button>
                    <div className="text-right ml-2 border-l pl-3 border-slate-200">
            <span className="text-2xl font-bold text-indigo-600">
              {routeData ? `${Math.floor(routeData.totalMins / 60) > 0 ? `${Math.floor(routeData.totalMins / 60)}год ` : ''}${routeData.totalMins % 60}хв` : '0 хв'}
            </span>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto relative">
                {stops.map((stop, index) => {
                    const isLast = index === stops.length - 1;

                    let iconColor = 'bg-slate-200 text-slate-500';
                    if (index === 0) iconColor = 'bg-emerald-500 text-white shadow-lg shadow-emerald-200';
                    else if (isLast) iconColor = 'bg-slate-800 text-white shadow-lg shadow-slate-300';
                    else if (stop.pickups.length > 0 || stop.drops.length > 0) iconColor = 'bg-white border-2 border-indigo-600 text-indigo-600';

                    return (
                        <div key={index} className={`relative pl-12 pb-8 fade-in ${isLast ? 'last-item' : ''}`}>
                            <div className="route-line"></div>
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-10 ${iconColor}`}>
                                <MapPin className="w-4 h-4" />
                            </div>

                            <div>
                                <div className="text-base font-bold text-slate-800 mb-2">
                                    {stop.label} <span className="text-indigo-700">{stop.locationName}</span>
                                </div>

                                {stop.waits && stop.waits.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[10px] font-bold uppercase text-amber-500 tracking-wider mb-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Очікування:
                                        </div>
                                        <ul className="space-y-1">
                                            {stop.waits.map((w, i) => (
                                                <li key={i} className="text-sm text-amber-700 pl-2 border-l-2 border-amber-200 bg-amber-50 py-0.5 rounded-r">{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {stop.pickups.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-1 flex items-center gap-1">
                                            <ArrowUp className="w-3 h-3" /> Забрати:
                                        </div>
                                        <ul className="space-y-1">
                                            {stop.pickups.map((p, i) => (
                                                <li key={i} className="text-sm text-slate-700 pl-2 border-l-2 border-emerald-200 bg-emerald-50/50 py-0.5 rounded-r">-{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {stop.drops.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider mb-1 flex items-center gap-1">
                                            <ArrowDown className="w-3 h-3" /> Віддати:
                                        </div>
                                        <ul className="space-y-1">
                                            {stop.drops.map((d, i) => (
                                                <li key={i} className="text-sm text-slate-700 pl-2 border-l-2 border-indigo-200 bg-indigo-50/50 py-0.5 rounded-r">-{d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {stop.pickups.length === 0 && stop.drops.length === 0 && (!stop.waits || stop.waits.length === 0) && (
                                    <div className="text-slate-400 italic text-xs mt-1">
                                        {stop.label.includes("Кінцева") ? "(Повернення на базу)" : "(Виїзд)"}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}