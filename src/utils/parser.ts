import { LOCATION_SYNONYMS, LOCATIONS } from '../constants/logistics';
import { LocationKey } from '../types';

interface ParseResult {
    pickupLoc: LocationKey;
    dropLoc: LocationKey;
    goods: string;
    error?: string;
}

export const parseSmartInput = (rawText: string): ParseResult | null => {
    const text = rawText.trim();
    if (!text) return null;

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return null;

    let routeLineIndex = lines.findIndex(l => l.match(/[—–-]/));
    if (routeLineIndex === -1) routeLineIndex = 0;
    const routeText = lines[routeLineIndex];

    let goodsText = "";
    if (lines.length > 1) {
        goodsText = lines.filter((_, i) => i !== routeLineIndex).join(" ").trim();
    }

    const routeParts = routeText.split(/\s*[-–—]\s*/);
    if (routeParts.length < 2) {
        return { pickupLoc: 'oasis', dropLoc: 'oasis', goods: '', error: "Формат: Звідки - Куди" };
    }

    const clean = (s: string) => s.toLowerCase().trim();
    let fromKey: LocationKey | null = null;
    let toKey: LocationKey | null = null;

    for (const [name, key] of Object.entries(LOCATION_SYNONYMS)) {
        if (clean(routeParts[0]).includes(name)) fromKey = key as LocationKey;
        if (clean(routeParts[1]).includes(name)) toKey = key as LocationKey;
    }

    if (!fromKey || !toKey) {
        return { pickupLoc: 'oasis', dropLoc: 'oasis', goods: '', error: "Невідома локація" };
    }

    if (!goodsText) {
        const destRaw = routeParts[1];
        if (destRaw.length > 10) {
            goodsText = destRaw.replace(new RegExp(LOCATIONS[toKey], 'i'), '').trim();
        }
        if (!goodsText) goodsText = "Вантаж";
    }

    return { pickupLoc: fromKey, dropLoc: toKey, goods: goodsText };
};