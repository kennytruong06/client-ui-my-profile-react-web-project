import { addDays, diffDays, rangeKeys } from '@/lib/date';
import { foodById } from '@/data/foods';

export const KCAL_PER_KG = 7700;
export const ACTIVITY_LEVELS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
export const LOSS_RATES = [0.25, 0.5, 0.75, 1];
export const PROTEIN_PER_KG = 1.8;
export const FAT_SHARE = 0.25;
export const FIBER_PER_1000_KCAL = 14;
export const FIBER_MIN = 25;

export function emptyProfile() {
    return { sex: 'male', age: '', heightCm: '', weightKg: '', goalKg: '', activity: 'light', lossRate: 0.5 };
}

export function profileReady(profile) {
    return Boolean(profile && Number(profile.age) > 0 && Number(profile.heightCm) > 0 && Number(profile.weightKg) > 0);
}

export function latestWeight(nutrition) {
    const dates = Object.keys(nutrition.weights).sort();
    const last = dates[dates.length - 1];
    return last ? { date: last, kg: nutrition.weights[last] } : null;
}

export function currentWeightKg(nutrition) {
    return latestWeight(nutrition)?.kg ?? (Number(nutrition.profile?.weightKg) || 0);
}

export function weightOnDate(nutrition, date) {
    const keys = Object.keys(nutrition.weights).filter((key) => key <= date).sort();
    const last = keys[keys.length - 1];
    return last ? nutrition.weights[last] : Number(nutrition.profile?.weightKg) || 0;
}

export function basisWeightOnDate(nutrition, date) {
    const start = Number(nutrition.profile?.weightKg) || 0;
    const logged = Object.keys(nutrition.weights).filter((key) => key <= date).map((key) => nutrition.weights[key]);
    const candidates = [start, ...logged].filter((kg) => kg > 0);
    return candidates.length ? Math.min(...candidates) : 0;
}

export function planForDate(nutrition, date) {
    if (!profileReady(nutrition.profile)) {
        return null;
    }
    return planOf(nutrition.profile, basisWeightOnDate(nutrition, date), weightOnDate(nutrition, date));
}

export function bmrOf(profile, weightKg) {
    const base = 10 * weightKg + 6.25 * Number(profile.heightCm) - 5 * Number(profile.age);
    return Math.round(base + (profile.sex === 'female' ? -161 : 5));
}

export function planOf(profile, weightKg, currentKg = weightKg) {
    const bmr = bmrOf(profile, weightKg);
    const tdee = Math.round(bmr * (ACTIVITY_LEVELS[profile.activity] ?? ACTIVITY_LEVELS.light));
    const wantedDeficit = Math.round((Number(profile.lossRate) * KCAL_PER_KG) / 7);
    const target = Math.max(tdee - wantedDeficit, bmr);
    const goal = Number(profile.goalKg) || 0;
    const toLose = goal > 0 ? Math.max(currentKg - goal, 0) : 0;
    const weeklyKg = ((tdee - target) * 7) / KCAL_PER_KG;
    const heightM = Number(profile.heightCm) / 100;
    const fat = Math.round((target * FAT_SHARE) / 9);
    const fiber = Math.max(FIBER_MIN, Math.round((target / 1000) * FIBER_PER_1000_KCAL));
    const protein = Math.round(weightKg * PROTEIN_PER_KG);

    return {
        bmr,
        tdee,
        target,
        deficit: tdee - target,
        clamped: tdee - wantedDeficit < bmr,
        protein,
        fiber,
        fat,
        carbs: Math.max(Math.round((target - protein * 4 - fat * 9) / 4), 0),
        bmi: heightM > 0 ? currentKg / (heightM * heightM) : null,
        toLose,
        weeksToGoal: toLose > 0 && weeklyKg > 0 ? Math.ceil(toLose / weeklyKg) : null,
        weeklyKg,
    };
}

export function mealBase(meal) {
    const known = meal.foodId ? foodById(meal.foodId) : null;
    if (known) {
        return { amount: known.amount, unit: known.unit };
    }
    return meal.amount > 0 ? { amount: meal.amount, unit: meal.unit ?? 'g' } : null;
}

export function mealFiber(meal) {
    if (meal.fiber != null) {
        return meal.fiber;
    }
    return meal.foodId ? foodById(meal.foodId)?.fiber ?? 0 : 0;
}

export function mealName(meal, tx) {
    const known = meal.foodId ? foodById(meal.foodId) : null;
    return known ? tx(known.name) : meal.name;
}

export function dayTotals(entry) {
    const meals = entry?.meals ?? [];
    return meals.reduce((sum, meal) => ({
        kcal: sum.kcal + meal.kcal * meal.qty,
        protein: sum.protein + (meal.protein ?? 0) * meal.qty,
        carbs: sum.carbs + (meal.carbs ?? 0) * meal.qty,
        fat: sum.fat + (meal.fat ?? 0) * meal.qty,
        fiber: sum.fiber + mealFiber(meal) * meal.qty,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function verdictOf(plan, eaten, burn, hasMeals) {
    if (!hasMeals) {
        return { key: 'empty', deficit: 0 };
    }
    const deficit = Math.round(plan.tdee + burn - eaten);
    let key = 'surplus';
    if (eaten < plan.bmr * 0.85) {
        key = 'tooLow';
    } else if (deficit >= plan.deficit * 0.8 && deficit <= plan.deficit * 1.4 + 150) {
        key = 'onTrack';
    } else if (deficit > plan.deficit * 1.4 + 150) {
        key = 'aggressive';
    } else if (deficit > 0) {
        key = 'small';
    }
    return { key, deficit };
}

export function weekSummary(nutrition, endKey, days = 7) {
    const keys = rangeKeys(addDays(endKey, -(days - 1)), endKey);
    const rows = keys.map((key) => {
        const entry = nutrition.days[key];
        const dayPlan = planForDate(nutrition, key);
        const logged = Boolean(entry?.meals?.length);
        const eaten = dayTotals(entry).kcal;
        return { key, logged, eaten, burn: entry?.burn ?? 0, target: dayPlan.target, deficit: logged ? Math.round(dayPlan.tdee + (entry?.burn ?? 0) - eaten) : null };
    });
    const logged = rows.filter((row) => row.logged);
    const totalDeficit = logged.reduce((sum, row) => sum + row.deficit, 0);
    return {
        rows,
        loggedDays: logged.length,
        averageDeficit: logged.length ? Math.round(totalDeficit / logged.length) : null,
        totalDeficit,
        estimatedKg: totalDeficit / KCAL_PER_KG,
    };
}

export function weightChange(nutrition, startKey, endKey) {
    const dates = Object.keys(nutrition.weights).filter((date) => date >= startKey && date <= endKey).sort();
    if (dates.length < 2) {
        return null;
    }
    const first = dates[0];
    const last = dates[dates.length - 1];
    return { kg: nutrition.weights[last] - nutrition.weights[first], days: diffDays(first, last) };
}

export const EATING_FLOOR = 0.85;

export function firstLoggedDate(nutrition) {
    return Object.keys(nutrition.days).filter((key) => nutrition.days[key].meals.length > 0).sort()[0] ?? null;
}

export function eatingStateFn(nutrition) {
    const first = firstLoggedDate(nutrition);
    return (key) => {
        const plan = planForDate(nutrition, key);
        if (!plan || !first || key < first) {
            return { state: 'none', eaten: 0, logged: false };
        }
        const entry = nutrition.days[key];
        const logged = (entry?.meals?.length ?? 0) > 0;
        const eaten = dayTotals(entry).kcal;
        const burned = plan.tdee + (entry?.burn ?? 0);
        const healthy = logged && eaten <= burned && eaten >= plan.bmr * EATING_FLOOR;
        return { state: healthy ? 'kept' : 'broken', eaten, burned, logged };
    };
}

const roundTo = (value, step) => Math.round(value / step) * step;

export function foodBase(ref) {
    const known = ref.foodId ? foodById(ref.foodId) : null;
    if (known) {
        return { amount: known.amount, unit: known.unit, kcal: known.kcal, protein: known.protein, carbs: known.carbs, fat: known.fat, fiber: known.fiber };
    }
    return { amount: 100, unit: ref.unit ?? 'g', kcal: ref.kcal ?? 0, protein: ref.protein ?? 0, carbs: ref.carbs ?? 0, fat: ref.fat ?? 0, fiber: ref.fiber ?? 0 };
}

export function foodLabel(ref, tx) {
    const known = ref.foodId ? foodById(ref.foodId) : null;
    return known ? tx(known.name) : ref.name;
}

export function portionOf(ref, amount) {
    const base = foodBase(ref);
    const ratio = amount / base.amount;
    return { kcal: base.kcal * ratio, protein: base.protein * ratio, carbs: base.carbs * ratio, fat: base.fat * ratio, fiber: base.fiber * ratio };
}

export function plannedTotals(entries) {
    return entries.reduce((sum, entry) => {
        const portion = portionOf(entry, entry.amount);
        return { kcal: sum.kcal + portion.kcal, protein: sum.protein + portion.protein, carbs: sum.carbs + portion.carbs, fat: sum.fat + portion.fat, fiber: sum.fiber + portion.fiber };
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function reservedOf(entries, fridgeId, todayKey) {
    return entries
        .filter((entry) => entry.fridgeId === fridgeId && !entry.done && entry.date >= todayKey)
        .reduce((sum, entry) => sum + entry.amount, 0);
}

export function fridgeLeft(item, entries, todayKey) {
    return Math.round((item.amount - reservedOf(entries, item.id, todayKey)) * 10) / 10;
}

export function splitSuggestion(left, parts) {
    if (parts === 1) {
        return left;
    }
    return Math.min(Math.max(roundTo(left / parts, 5), 0), left);
}

export function foodRefOf(item) {
    if (item.foodId) {
        return { foodId: item.foodId };
    }
    return { name: item.name, unit: item.unit ?? 'g', kcal: item.kcal ?? 0, protein: item.protein ?? 0, carbs: item.carbs ?? 0, fat: item.fat ?? 0, fiber: item.fiber ?? 0 };
}

export function mealFromPlan(entry, mealId) {
    const base = foodBase(entry);
    const meal = {
        id: mealId,
        slot: entry.slot,
        qty: Math.round((entry.amount / base.amount) * 10000) / 10000,
        kcal: base.kcal,
        protein: base.protein,
        carbs: base.carbs,
        fat: base.fat,
        fiber: base.fiber,
    };
    return entry.foodId ? { ...meal, foodId: entry.foodId } : { ...meal, name: entry.name, amount: base.amount, unit: base.unit };
}

export function sameFood(a, b) {
    return a.foodId ? a.foodId === b.foodId : !b.foodId && a.name?.trim().toLowerCase() === b.name?.trim().toLowerCase() && (a.unit ?? 'g') === (b.unit ?? 'g');
}

export function shoppingItems(entries, todayKey, tx) {
    const groups = new Map();
    entries.filter((entry) => entry.toBuy && !entry.done && entry.date >= todayKey).forEach((entry) => {
        const unit = foodBase(entry).unit;
        const key = `${entry.foodId ?? entry.name}|${unit}`;
        const current = groups.get(key) ?? { key, label: foodLabel(entry, tx), unit, amount: 0, firstDate: entry.date };
        groups.set(key, { ...current, amount: current.amount + entry.amount, firstDate: entry.date < current.firstDate ? entry.date : current.firstDate });
    });
    return [...groups.values()].sort((a, b) => a.firstDate.localeCompare(b.firstDate));
}
