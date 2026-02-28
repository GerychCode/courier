'use client';

import { useState, useEffect } from 'react';
import { LocationKey, Order, RouteResult } from '../types';
import { calculateOptimalRoute } from '../utils/solver';
import { LOCATIONS } from '../constants/logistics';
import SmartInput from '../components/SmartInput';
import RouteDisplay from '../components/RouteDisplay';
import { Map, PlusCircle } from 'lucide-react';

export default function LogisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startLoc, setStartLoc] = useState<LocationKey>('oasis');
  const [endLoc, setEndLoc] = useState<LocationKey>('doma');
  const [startTime, setStartTime] = useState('09:00');

  const [manualGoods, setManualGoods] = useState('');
  const [manualPickup, setManualPickup] = useState<LocationKey>('gorodok');
  const [manualDrop, setManualDrop] = useState<LocationKey>('doma');
  const [hasReadyTime, setHasReadyTime] = useState(false);
  const [manualReadyTime, setManualReadyTime] = useState('');

  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const now = new Date();
    setStartTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const runCalculation = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      setIsCalculating(true);

      await new Promise(resolve => setTimeout(resolve, 50));
      if (!isMounted) return;

      const result = calculateOptimalRoute(startLoc, endLoc, orders, startTime);
      if (isMounted) {
        setRouteData(result);
        setIsCalculating(false);
      }
    };
    runCalculation();
    return () => { isMounted = false; };
  }, [orders, startLoc, endLoc, startTime]);

  const handleManualAdd = () => {
    if (!manualGoods || manualPickup === manualDrop) return;
    setOrders(prev => [...prev, {
      id: Date.now(),
      goods: manualGoods,
      pickupLoc: manualPickup,
      dropLoc: manualDrop,
      readyTime: hasReadyTime && manualReadyTime ? manualReadyTime : undefined
    }]);
    setManualGoods('');
    setHasReadyTime(false);
    setManualReadyTime('');
  };

  const handleClearAll = () => {
    if (confirm("Очистити список?")) {
      setOrders([]);
    }
  };

  return (
      <div className="min-h-screen py-8 px-4 bg-slate-50 font-sans text-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 space-y-6">
            <SmartInput onAddOrder={(order) => setOrders(prev => [...prev, order])} />

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Map className="w-4 h-4 text-indigo-600" /> Маршрут
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Старт</label>
                  <select value={startLoc} onChange={(e) => setStartLoc(e.target.value as LocationKey)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500">
                    {Object.entries(LOCATIONS).map(([key, name]) => (
                        <option key={`start-${key}`} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Фініш</label>
                  <select value={endLoc} onChange={(e) => setEndLoc(e.target.value as LocationKey)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500">
                    {Object.entries(LOCATIONS).map(([key, name]) => (
                        <option key={`end-${key}`} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 mt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Час виїзду (для розрахунку очікування)</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" /> Ручне додаваня
              </h2>
              <div className="space-y-3">
                <input
                    type="text"
                    value={manualGoods}
                    onChange={(e) => setManualGoods(e.target.value)}
                    placeholder="Що веземо?"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select value={manualPickup} onChange={(e) => setManualPickup(e.target.value as LocationKey)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {Object.entries(LOCATIONS).map(([key, name]) => <option key={`p-${key}`} value={key}>{name}</option>)}
                  </select>
                  <select value={manualDrop} onChange={(e) => setManualDrop(e.target.value as LocationKey)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {Object.entries(LOCATIONS).map(([key, name]) => <option key={`d-${key}`} value={key}>{name}</option>)}
                  </select>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={hasReadyTime} onChange={(e) => setHasReadyTime(e.target.checked)} className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"/>
                    Має час готовності
                  </label>
                  {hasReadyTime && (
                      <input
                          type="time"
                          value={manualReadyTime}
                          onChange={(e) => setManualReadyTime(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                      />
                  )}
                </div>

                <button
                    onClick={handleManualAdd}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg transition"
                >
                  Додати
                </button>
              </div>
            </div>

            <button onClick={handleClearAll} className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition">
              Очистити все
            </button>
          </div>

          <div className="lg:col-span-8">
            <RouteDisplay routeData={routeData} isCalculating={isCalculating} />
          </div>

        </div>
      </div>
  );
}