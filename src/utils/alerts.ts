import {
  MUSCLE_DEFINITIONS,
  type PlanAlert,
  type PlannerConfig,
  type WeeklyPlan,
  type WeeklyVolumeMap,
} from "../types/training";

export function generatePlanAlerts(
  volume: WeeklyVolumeMap,
  config: PlannerConfig,
  weeklyPlan: WeeklyPlan,
): PlanAlert[] {
  const alerts: PlanAlert[] = [];
  const totalCapacityWarning = config.trainingDays * 24;
  const totalCapacityDanger = config.trainingDays * 28;

  if (weeklyPlan.totalSets > totalCapacityDanger) {
    alerts.push({
      id: "total-volume-danger",
      severity: "danger",
      title: "Volume semanal muito alto",
      message: `${weeklyPlan.totalSets} series em ${config.trainingDays} dias pode ficar pesado demais para recuperar bem.`,
    });
  } else if (weeklyPlan.totalSets > totalCapacityWarning) {
    alerts.push({
      id: "total-volume-warning",
      severity: "warning",
      title: "Volume semanal elevado",
      message: `O plano esta com ${weeklyPlan.totalSets} series. Observe sono, cargas e queda de desempenho.`,
    });
  }

  if (volume.back >= volume.chest + 6) {
    alerts.push({
      id: "back-vs-chest",
      severity: "warning",
      title: "Costas acima de peito",
      message: "Costas esta com volume muito acima de peito. Pode ser intencional, mas acompanhe postura e equilibrio de empurrar/puxar.",
    });
  }

  if (volume.chest >= volume.back + 6) {
    alerts.push({
      id: "chest-vs-back",
      severity: "warning",
      title: "Peito acima de costas",
      message: "Peito esta bem acima de costas. Um pouco mais de puxada pode ajudar ombros e estabilidade.",
    });
  }

  if (volume.back >= 20 && volume.biceps < 14) {
    alerts.push({
      id: "biceps-support",
      severity: "info",
      title: "Biceps pode ficar para tras",
      message: "Biceps esta recebendo pouco volume para acompanhar um foco forte em costas.",
    });
  }

  if (volume.calves <= 10) {
    alerts.push({
      id: "calves-low",
      severity: "warning",
      title: "Panturrilha em volume baixo",
      message: "Panturrilha esta perto do minimo. Se ela for prioridade estetica, vale subir 1 ou 2 niveis.",
    });
  }

  if (volume.lateralDelt >= 20) {
    alerts.push({
      id: "lateral-delt-high",
      severity: "warning",
      title: "Ombro lateral alto",
      message: "Ombro lateral esta alto e pode exigir atencao a recuperacao, especialmente com muito supino e desenvolvimento.",
    });
  }

  const overloadedDay = weeklyPlan.days.find((day) => day.totalSets > 34);
  if (overloadedDay) {
    alerts.push({
      id: `overloaded-${overloadedDay.id}`,
      severity: "danger",
      title: `${overloadedDay.dayName} ficou grande demais`,
      message: `${overloadedDay.dayName} tem ${overloadedDay.totalSets} series. Considere mais dias ou reduzir focos.`,
    });
  }

  weeklyPlan.days.forEach((day) => {
    day.muscles.forEach((muscle) => {
      if (muscle.sets > 10) {
        alerts.push({
          id: `session-${day.id}-${muscle.muscleId}`,
          severity: "warning",
          title: `${MUSCLE_DEFINITIONS[muscle.muscleId].label} concentrado`,
          message: `${day.dayName} tem ${muscle.sets} series de ${muscle.muscleName}. Dividir em mais sessoes pode render melhor.`,
        });
      }
    });
  });

  if (!alerts.length) {
    alerts.push({
      id: "balanced-plan",
      severity: "info",
      title: "Plano bem distribuido",
      message: "O volume esta coerente com os dias de treino e nao ha desequilibrios grandes no momento.",
    });
  }

  return alerts;
}
