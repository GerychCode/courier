import { LocationKey } from '../types';

export const LOCATIONS: Record<LocationKey, string> = {
    oasis: 'Оазис',
    gorodok: 'Почайна',
    arcadia: 'Аркадія',
    academ: 'Академ',
    doma: 'Дарниця',
    dtf: 'ДТФ (Бублік)'
};

export const LOCATION_SYNONYMS: Record<string, LocationKey> = {
    'оазис': 'oasis', 'oasis': 'oasis',
    'почайна': 'gorodok', 'gorodok': 'gorodok', 'городок': 'gorodok',
    'аркадія': 'arcadia', 'аркадия': 'arcadia', 'arcadia': 'arcadia',
    'академ': 'academ', 'академмістечко': 'academ', 'academ': 'academ',
    'дарниця': 'doma', 'дарница': 'doma', 'дома': 'doma',
    'дтф': 'dtf', 'dtf': 'dtf',
    'бублік': 'dtf', 'бублик': 'dtf', 'bublik': 'dtf'
};

export const TRAVEL_TIMES: Record<LocationKey, Partial<Record<LocationKey, number>>> = {
    oasis: { gorodok: 15, arcadia: 45, academ: 53, doma: 34, dtf: 67 },
    gorodok: { oasis: 15, arcadia: 32, academ: 54, doma: 35, dtf: 48 },
    arcadia: { oasis: 45, gorodok: 32, academ: 45, doma: 48, dtf: 22 },
    academ: { oasis: 53, gorodok: 54, arcadia: 45, doma: 50, dtf: 41 },
    doma: { oasis: 34, gorodok: 35, arcadia: 48, academ: 50, dtf: 43 },
    dtf: { oasis: 67, gorodok: 48, arcadia: 22, academ: 41, doma: 43 }
};