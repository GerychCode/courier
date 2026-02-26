import { LocationKey, Order, RouteStep, RouteResult } from '../types';
import { TRAVEL_TIMES } from '../constants/logistics';

export const getDistance = (from: LocationKey, to: LocationKey): number => {
    if (from === to) return 0;
    if (TRAVEL_TIMES[from]?.[to]) return TRAVEL_TIMES[from]![to]!;
    if (TRAVEL_TIMES[to]?.[from]) return TRAVEL_TIMES[to]![from]!;
    return 30;
};

const getMinsFromTime = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

export const calculateOptimalRoute = (
    startLoc: LocationKey,
    endLoc: LocationKey,
    orders: Order[],
    startTimeStr: string = "09:00"
): RouteResult => {
    let bestSolution: RouteStep[] | null = null;
    let minTotalTime = Infinity;
    const startMinsOfDay = getMinsFromTime(startTimeStr);

    const solve = (
        currentLoc: LocationKey,
        pending: Order[],
        carrying: Order[],
        path: RouteStep[],
        time: number
    ) => {
        if (time >= minTotalTime) return;

        if (pending.length === 0 && carrying.length === 0) {
            let finalLeg = 0;
            const finalPath = [...path];

            if (currentLoc !== endLoc) {
                finalLeg = getDistance(currentLoc, endLoc);
                finalPath.push({ type: 'finish', location: endLoc });
            } else {
                finalPath.push({ type: 'finish', location: endLoc, alreadyThere: true });
            }

            const total = time + finalLeg;
            if (total < minTotalTime) {
                minTotalTime = total;
                bestSolution = finalPath;
            }
            return;
        }

        const potentialDestinations = new Set<LocationKey>();
        pending.forEach(o => potentialDestinations.add(o.pickupLoc));
        carrying.forEach(o => potentialDestinations.add(o.dropLoc));

        const nextLocs = Array.from(potentialDestinations).sort(
            (a, b) => getDistance(currentLoc, a) - getDistance(currentLoc, b)
        );

        for (const nextLoc of nextLocs) {
            const dist = getDistance(currentLoc, nextLoc);
            const arrivalTime = time + dist;
            const arrivalTimeOfDay = startMinsOfDay + arrivalTime;

            const newCarrying: Order[] = [];
            const actionsAtLoc: RouteStep[] = [];

            // Віддаємо все що можемо на цій локації
            carrying.forEach(o => {
                if (o.dropLoc === nextLoc) {
                    actionsAtLoc.push({ type: 'drop', location: nextLoc, goods: o.goods, dropTarget: o.dropLoc });
                } else {
                    newCarrying.push(o);
                }
            });

            const pendingHere = pending.filter(o => o.pickupLoc === nextLoc);
            const pendingOthers = pending.filter(o => o.pickupLoc !== nextLoc);

            let maxWaitTimeAll = 0;
            let hasUnready = false;
            const readyNowOrders: Order[] = [];
            const allOrders: Order[] = [];

            pendingHere.forEach(o => {
                allOrders.push(o);
                const rTime = getMinsFromTime(o.readyTime);
                if (rTime > 0 && rTime > arrivalTimeOfDay) {
                    hasUnready = true;
                    const wait = rTime - arrivalTimeOfDay;
                    if (wait > maxWaitTimeAll) maxWaitTimeAll = wait;
                } else {
                    readyNowOrders.push(o);
                }
            });

            // Гілка 1: Беремо всі замовлення звідси (чекаємо, якщо треба)
            {
                const bCarrying = [...newCarrying, ...allOrders];
                const bActions = [...actionsAtLoc];
                if (maxWaitTimeAll > 0) {
                    bActions.push({ type: 'wait', location: nextLoc, waitTime: maxWaitTimeAll });
                }
                allOrders.forEach(o => bActions.push({ type: 'pickup', location: nextLoc, goods: o.goods, dropTarget: o.dropLoc, readyTime: o.readyTime }));

                const newPath = [...path];
                if (path.length === 0) newPath.push({ type: 'start', location: currentLoc });
                bActions.forEach(action => newPath.push(action));

                solve(nextLoc, pendingOthers, bCarrying, newPath, arrivalTime + maxWaitTimeAll);
            }

            // Гілка 2: Забираємо ТІЛЬКИ готові (або просто віддаємо), а за неготовими повернемося пізніше
            if (hasUnready && (readyNowOrders.length > 0 || actionsAtLoc.length > 0)) {
                const bCarrying = [...newCarrying, ...readyNowOrders];
                const bActions = [...actionsAtLoc];
                readyNowOrders.forEach(o => bActions.push({ type: 'pickup', location: nextLoc, goods: o.goods, dropTarget: o.dropLoc }));

                const unreadyOrders = pendingHere.filter(o => !readyNowOrders.includes(o));
                const bPending = [...pendingOthers, ...unreadyOrders];

                const newPath = [...path];
                if (path.length === 0) newPath.push({ type: 'start', location: currentLoc });
                bActions.forEach(action => newPath.push(action));

                solve(nextLoc, bPending, bCarrying, newPath, arrivalTime);
            }
        }
    };

    solve(startLoc, [...orders], [], [], 0);

    if (bestSolution) {
        return { steps: bestSolution, totalMins: minTotalTime };
    }

    const dist = getDistance(startLoc, endLoc);
    const fallbackSteps: RouteStep[] = [{ type: 'start', location: startLoc }];
    if (startLoc !== endLoc) {
        fallbackSteps.push({ type: 'finish', location: endLoc });
    } else {
        fallbackSteps.push({ type: 'finish', location: endLoc, alreadyThere: true });
    }

    return { steps: fallbackSteps, totalMins: dist };
};