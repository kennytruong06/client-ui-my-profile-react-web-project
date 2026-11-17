import { addDays, diffDays, rangeKeys } from '@/lib/date';
import { foodById } from '@/data/foods';

export const KCAL_PER_KG = 7700;
export const ACTIVITY_LEVELS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
export const LOSS_RATES = [0.25, 0.5, 0.75, 1];
export const PROTEIN_PER_KG = 1.8;
export const FAT_SHARE = 0.25;

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

export function bmrOf(profile, weightKg) {
    const base = 10 * weightKg + 6.25 * Number(profile.heightCm) - 5 * Number(profile.age);
    return Math.round(base + (profile.sex === 'female' ? -161 : 5));
}

export function planOf(profile, weightKg) {
    const bmr = bmrOf(profile, weightKg);
    const tdee = Math.round(bmr * (ACTIVITY_LEVELS[profile.activity] ?? ACTIVITY_LEVELS.light));
    const wantedDeficit = Math.round((Number(profile.lossRate) * KCAL_PER_KG) / 7);
    const target = Math.max(tdee - wantedDeficit, bmr);
    const goal = Number(profile.goalKg) || 0;
    const toLose = goal > 0 ? Math.max(weightKg - goal, 0) : 0;
    const weeklyKg = ((tdee - target) * 7) / KCAL_PER_KG;
    const heightM = Number(profile.heightCm) / 100;
    const fat = Math.round((target * FAT_SHARE) / 9);
    const protein = Math.round(weightKg * PROTEIN_PER_KG);

    return {
        bmr,
        tdee,
        target,
        deficit: tdee - target,
        clamped: tdee - wantedDeficit < bmr,
        protein,
        fat,
        carbs: Math.max(Math.round((target - protein * 4 - fat * 9) / 4), 0),
        bmi: heightM > 0 ? weightKg / (heightM * heightM) : null,
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
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
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

export function weekSummary(nutrition, plan, endKey, days = 7) {
    const keys = rangeKeys(addDays(endKey, -(days - 1)), endKey);
    const rows = keys.map((key) => {
        const entry = nutrition.days[key];
        const logged = Boolean(entry?.meals?.length);
        const eaten = dayTotals(entry).kcal;
        return { key, logged, eaten, burn: entry?.burn ?? 0, deficit: logged ? Math.round(plan.tdee + (entry?.burn ?? 0) - eaten) : null };
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

export function eatingStateFn(nutrition, plan) {
    const first = firstLoggedDate(nutrition);
    return (key) => {
        if (!plan || !first || key < first) {
            return { state: 'none', eaten: 0, logged: false };
        }
        const entry = nutrition.days[key];
        const logged = (entry?.meals?.length ?? 0) > 0;
        const eaten = dayTotals(entry).kcal;
        const healthy = logged && eaten <= plan.target && eaten >= plan.bmr * EATING_FLOOR;
        return { state: healthy ? 'kept' : 'broken', eaten, logged };
    };
}
