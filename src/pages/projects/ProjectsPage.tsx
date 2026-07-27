import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Plus,
  Search,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

type ProjectStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

type ProjectRow = {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  budget?: Record<string, unknown> | null;
  timeline?: Record<string, unknown> | null;
  activities?: string[] | null;
  location?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  client_id?: string | null;
  client?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
};

const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusStyles: Record<ProjectStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const money = (value: number) =>
  value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const getBudget = (project: ProjectRow) => {
  const budget = project.budget ?? {};
  const direct = Number(budget.total ?? 0);
  if (direct > 0) return direct;
  return Number(budget.materials ?? 0) + Number(budget.labor ?? 0) + Number(budget.services ?? 0);
};

const getDueDate = (project: ProjectRow) => {
  const timeline = project.timeline ?? {};
  return String(timeline.endDate ?? timeline.end_date ?? '');
};

const getProgress = (status: ProjectStatus) => {
  if (status === 'completed') return 100;
  if (status === 'in_progress') return 65;
  if (status === 'pending') return 30;
  if (status === 'cancelled') return 0;
  return 10;
};

const clientName = (project: ProjectRow) =>
  [project.client?.first_name, project.client?.last_name].filter(Boolean).join(' ') || 'Client non renseigné';

const DetailMetric = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="mb-3 flex items-center justify-between text-slate-500">
      <span className="text-sm font-medium">{label}</span>
      {icon}
    </div>
    <p className="text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

const ProjectDetails = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          budget,
          timeline,
          activities,
          location,
          created_at,
          updated_at,
          client_id,
          client:users!projects_client_id_fkey(first_name,last_name,email)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!active) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        setProject((data as ProjectRow | null) ?? null);
      }
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="py-16 text-center text-slate-500">Chargement du dossier…</div>;

  if (error || !project) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 text-red-600" />
        <p className="font-semibold text-red-900">Dossier introuvable</p>
        <p className="mt-1 text-sm text-red-700">{error ?? "Ce dossier n'existe pas ou n'est plus accessible."}</p>
        <Button variant="outline" className="mt-5" onClick={() => navigate('/projects')}>
          Retour aux dossiers
        </Button>
      </div>
    );
  }

  const progress = getProgress(project.status);
  const budget = getBudget(project);
  const dueDate = getDueDate(project);
  const city = String(project.location?.city ?? 'Non renseignée');
  const steps = [
    { label: 'Qualification', done: progress >= 20 },
    { label: 'Documents', done: progress >= 40 },
    { label: 'Étude et chiffrage', done: progress >= 60 },
    { label: 'Proposition', done: progress >= 80 },
    { label: 'Finalisation', done: progress === 100 },
  ];
  const nextStep = steps.find(step => !step.done)?.label ?? 'Dossier finalisé';

  return (
    <div className="space-y-6">
      <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950" onClick={() => navigate('/projects')}>
        <ArrowLeft size={18} /> Retour aux dossiers
      </button>

      <section className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[project.status]}`}>
                {statusLabels[project.status]}
              </span>
              <span className="text-sm text-slate-400">Dossier #{project.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{project.title || 'Sans titre'}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2"><UserRound size={16} /> {clientName(project)}</span>
              <span className="flex items-center gap-2"><MapPin size={16} /> {city}</span>
              {dueDate && <span className="flex items-center gap-2"><CalendarDays size={16} /> {new Date(dueDate).toLocaleDateString('fr-FR')}</span>}
            </div>
          </div>
          <div className="min-w-52 rounded-2xl bg-white/10 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm text-slate-300">Avancement</span>
              <span className="text-3xl font-bold">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DetailMetric label="Potentiel du dossier" value={money(budget)} icon={<WalletCards size={20} />} />
        <DetailMetric label="Prochaine étape" value={nextStep} icon={<ChevronRight size={20} />} />
        <DetailMetric label="Échéance" value={dueDate ? new Date(dueDate).toLocaleDateString('fr-FR') : 'À définir'} icon={<Clock3 size={20} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Production</h2>
              <p className="text-sm text-slate-500">Étapes de traitement du dossier</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/documents')} leftIcon={<FileText size={16} />}>
              Documents
            </Button>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.label} className={`flex items-center gap-4 rounded-xl border p-4 ${step.done ? 'border-emerald-200 bg-emerald-50' : index === steps.findIndex(item => !item.done) ? 'border-amber-200 bg-amber-50' : 'border-slate-200'}`}>
                {step.done ? <CheckCircle2 className="text-emerald-600" size={21} /> : <Clock3 className="text-slate-400" size={21} />}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.done ? 'Étape validée' : index === steps.findIndex(item => !item.done) ? 'Action attendue' : 'À venir'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">Action prioritaire</h2>
            <div className="mt-4 rounded-xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-950">Faire avancer : {nextStep}</p>
              <p className="mt-1 text-sm text-amber-800">Le dossier restera prioritaire tant que cette étape ne sera pas validée.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">Informations</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-slate-500">Client</dt><dd className="font-semibold text-slate-900">{clientName(project)}</dd></div>
              <div><dt className="text-slate-500">Localisation</dt><dd className="font-semibold text-slate-900">{city}</dd></div>
              <div><dt className="text-slate-500">Activités</dt><dd className="mt-1 flex flex-wrap gap-2">{project.activities?.length ? project.activities.slice(0, 5).map(activity => <span key={activity} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{activity}</span>) : <span className="text-slate-500">Non renseignées</span>}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('projects')
        .select(`id,title,status,budget,timeline,activities,location,created_at,client_id,client:users!projects_client_id_fkey(first_name,last_name,email)`)
        .eq('is_demo', false)
        .order('created_at', { ascending: false })
        .limit(100);
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setProjects((data as ProjectRow[]) ?? []);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [id]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(project => `${project.title} ${clientName(project)} ${String(project.location?.city ?? '')}`.toLowerCase().includes(query));
  }, [projects, searchQuery]);

  if (id) return <ProjectDetails id={id} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Production</p>
          <h1 className="text-3xl font-bold text-slate-950">Dossiers</h1>
          <p className="mt-1 text-slate-600">Suivre les montants, l'avancement et la prochaine action.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={17} />} onClick={() => navigate('/projects/create')}>Nouveau dossier</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
        <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Rechercher un dossier, un client ou une ville…" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-slate-950" />
      </div>

      {loading && <div className="py-14 text-center text-slate-500">Chargement des dossiers…</div>}
      {error && !loading && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
      {!loading && !error && filteredProjects.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Aucun dossier à afficher.</div>}

      {!loading && !error && filteredProjects.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[2fr_1.4fr_1fr_1fr_1fr_40px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
            <span>Dossier</span><span>Client</span><span>Statut</span><span>Avancement</span><span>Potentiel</span><span />
          </div>
          {filteredProjects.map(project => {
            const progress = getProgress(project.status);
            return (
              <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="grid w-full gap-3 border-b border-slate-100 px-5 py-5 text-left transition hover:bg-slate-50 md:grid-cols-[2fr_1.4fr_1fr_1fr_1fr_40px] md:items-center md:gap-4">
                <div><p className="font-bold text-slate-950">{project.title || 'Sans titre'}</p><p className="mt-1 text-xs text-slate-500">{String(project.location?.city ?? 'Localisation non renseignée')}</p></div>
                <span className="text-sm font-medium text-slate-700">{clientName(project)}</span>
                <span><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[project.status]}`}>{statusLabels[project.status]}</span></span>
                <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>{progress}%</span></div><div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} /></div></div>
                <span className="font-bold text-slate-950">{money(getBudget(project))}</span>
                <ChevronRight className="text-slate-400" size={20} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
