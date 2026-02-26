import { RouteStep, StopData } from '../types';
import { LOCATIONS } from '../constants/logistics';

export const groupSteps = (steps: RouteStep[]): StopData[] => {
    const stops: StopData[] = [];
    let currentStop: StopData | null = null;

    if (steps.length > 0 && steps[0].type === 'start') {
        currentStop = {
            locationKey: steps[0].location,
            locationName: LOCATIONS[steps[0].location],
            label: "Починаємо на",
            pickups: [], drops: [], waits: [], rawPickups: [], rawDrops: []
        };
        stops.push(currentStop);
    }

    steps.forEach((step) => {
        if (step.type === 'start') return;

        if (!currentStop || (step.location !== currentStop.locationKey && step.type !== 'finish_stay')) {
            let label = "Далі";
            if (step.type === 'finish') label = "Кінцева";

            currentStop = {
                locationKey: step.location,
                locationName: LOCATIONS[step.location],
                label: label,
                pickups: [], drops: [], waits: [], rawPickups: [], rawDrops: []
            };
            stops.push(currentStop);
        }

        if (step.type === 'pickup' && step.goods && step.dropTarget) {
            const timeInfo = step.readyTime ? ` (на ${step.readyTime})` : '';
            currentStop.pickups.push(`"${step.goods}"${timeInfo} на ${LOCATIONS[step.dropTarget]}`);
            currentStop.rawPickups.push({ goods: step.goods, target: LOCATIONS[step.dropTarget] });
        } else if (step.type === 'drop' && step.goods) {
            currentStop.drops.push(`"${step.goods}"`);
            currentStop.rawDrops.push({ goods: step.goods });
        } else if (step.type === 'wait' && step.waitTime) {
            currentStop.waits.push(`Чекаємо ${step.waitTime} хв`);
        }
    });

    return stops;
};

export const formatRouteForClipboard = (stops: StopData[]): string => {
    let textResult = "";
    stops.forEach((stop) => {
        textResult += `${stop.label} ${stop.locationName}\n`;
        if (stop.waits && stop.waits.length > 0) {
            stop.waits.forEach(w => textResult += `⏳ ${w}\n`);
        }
        if (stop.pickups.length > 0) {
            textResult += `Забрати:\n`;
            stop.pickups.forEach(p => textResult += `-${p}\n`);
        }
        if (stop.drops.length > 0) {
            textResult += `Віддати:\n`;
            stop.drops.forEach(d => textResult += `-${d}\n`);
        }
        textResult += "\n";
    });
    return textResult.trim();
};