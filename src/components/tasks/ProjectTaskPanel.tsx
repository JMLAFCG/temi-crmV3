import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Circle, Clock3, Plus, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTaskStore } from '../../store/taskStore';

interface ProjectTaskPanelProps {
  projectId: string;
  clientId?: string | null;
  projectTitle: string;
  nextStep: string;
  potentialValue: number;
  dueAt?: string | null;
}

const priorityStyles = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
} as const;

const statusIcon = {
  todo: <Circle size={17} />,
  in_progress: <Clock3 size={17} />,
  blocked: <AlertTriangle size={17} />,
  done: <Check size={17} />,
  cancelled: <Circle size={17} />,
};

export const ProjectTaskPanel: React.FC<ProjectTaskPanelProps> = ({
  projectId,
  clientId,
  projectTitle,
  nextStep,
  potentialValue,
  dueAt,
}) => {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, completeTask } = useTaskStore();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void fetchTasks({ projectId, openOnly: false });
  }, [fetchTasks, projectId]);

  const projectTasks = useMemo(
    () => tasks.filter(task => task.project_id === projectId && task.status !== 'cancelled'),
    [projectId, tasks]
  );

  const openTasks = projectTasks.filter(task => task.status !== 'done');

  const createRecommendedTask = async () => {
    setCreating(true);
    try {
      await createTask({
        title: `Faire avancer : ${nextStep}`,
        description: `Action générée depuis le dossier « ${projectTitle} »`,
        project_id: projectId,
        client_id: clientId || undefined,
        due_at: dueAt || undefined,
        estimated_minutes: 20,
        potential_value: potentialValue,
        customer_impact: 75,
        group_impact: 60,
        source: 'workflow',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap size={19} className="text-amber-600" />
            <h2 className="text-lg font-bold text-slate-950">Prochaines actions</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {openTasks.length} action{openTasks.length > 1 ? 's' : ''} à traiter sur ce dossier.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={createRecommendedTask}
          isLoading={creating}
        >
          Générer l'action suivante
        </Button>
      </div>

      {loading && projectTasks.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-500">Chargement des actions…</div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && projectTasks.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="font-semibold text-slate-800">Aucune action enregistrée</p>
          <p className="mt-1 text-sm text-slate-500">Crée la prochaine action à partir de l'étape actuelle.</p>
        </div>
      )}

      {projectTasks.length > 0 && (
        <div className="mt-5 space-y-3">
          {projectTasks.map(task => (
            <div key={task.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  title={task.status === 'done' ? 'Action terminée' : 'Marquer comme terminée'}
                  onClick={() => task.status !== 'done' && void completeTask(task.id)}
                  className={`mt-0.5 rounded-full p-1 ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'}`}
                >
                  {statusIcon[task.status]}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-950'}`}>
                      {task.title}
                    </p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${priorityStyles[task.priority]}`}>
                      {Math.round(task.priority_score)} pts
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{task.estimated_minutes} min</span>
                    {task.due_at && <span>Échéance : {new Date(task.due_at).toLocaleDateString('fr-FR')}</span>}
                    {task.potential_value > 0 && (
                      <span>
                        Potentiel : {Number(task.potential_value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                  {task.status === 'todo' && (
                    <button
                      type="button"
                      onClick={() => void updateTask(task.id, { status: 'in_progress' })}
                      className="mt-3 text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      Commencer l'action
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectTaskPanel;
