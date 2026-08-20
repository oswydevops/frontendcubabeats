import { Plan, User } from '../types';

export function resolveUserPlan(
  user: Pick<User, 'plan' | 'planId'> | null | undefined,
  plans: Plan[]
): Plan {
  if (!user || !plans || plans.length === 0) return plans?.[0];
  // 1. Fuente de verdad: planId, si existe
  if (user.planId) {
    const byId = plans.find(p => p.id === user.planId);
    if (byId) return byId;
  }
  // 2. Fallback SOLO para usuarios legacy sin planId (datos semilla existentes)
  const byName = plans.find(p => p.name.toLowerCase() === (user.plan || 'Gratis').toLowerCase());
  return byName || plans[0];
}
