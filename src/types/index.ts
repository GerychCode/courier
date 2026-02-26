export type LocationKey = 'oasis' | 'gorodok' | 'arcadia' | 'academ' | 'doma' | 'dtf';

export interface Order {
    id: number;
    goods: string;
    pickupLoc: LocationKey;
    dropLoc: LocationKey;
    readyTime?: string; // HH:MM
}

export interface RouteStep {
    type: 'start' | 'finish' | 'finish_stay' | 'pickup' | 'drop' | 'wait';
    location: LocationKey;
    goods?: string;
    dropTarget?: LocationKey;
    alreadyThere?: boolean;
    readyTime?: string;
    waitTime?: number;
}

export interface StopData {
    locationKey: LocationKey;
    locationName: string;
    label: string;
    pickups: string[];
    drops: string[];
    waits: string[];
    rawPickups: { goods: string; target: string }[];
    rawDrops: { goods: string }[];
}

export interface RouteResult {
    steps: RouteStep[];
    totalMins: number;
}