import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Building,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Edit,
  Euro,
  FileWarning,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ClientForm } from '../../components/clients/ClientForm';
import { useClientStore } from '../../store/clientStore';
import { useProjectStore } from '../../store/projectStore';

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const statusLabel: Record<string, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusClass: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getProgress = (status?: string) => {
  switch (status) {
    case 'completed':
      return 100;
    case 'in_progress':
      return 60;
    case 'pending':
      return 30;
    case 'draft':
      return 10;
    default:
      return 0;
  }
};

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    fetchClients,
    updateClient,
    deleteClient,
  } = useClientStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([fetchClients(), fetchProjects()]);
  }, [fetchClients, fetchProjects]);

  const client = clients.find(item => item.id === id);

  const clientProjects = useMemo(() => {
    if (!client) return [];
    return projects.filter(project => project.client_id === client.id || project.client_id === client.user_id);
  }, [client, projects]);

  const situation = useMemo(() => {
    if (!client) return null;

    const activeProjects = clientProjects.filter(project =>
      ['draft', 'pending', 'in_progress'].includes(project.status)
    );
    const blockedProjects = clientProjects.filter(project => project.status === 'pending');
    const completedProjects = clientProjects.filter(project => project.status === 'completed');
    const potential = activeProjects.reduce((sum, project) => sum + Number(project.budget?.total || 0), 0);
    const profileFields = [
      client.user?.email,
      client.phone,
      client.address?.street,
      client.address?.postal_code,
      client.address?.city,
    ];
    const profileCompleteness = Math.round(
      (profileFields.filter(Boolean).length / profileFields.length) * 100
    );
    const productionScore = clientProjects.length
      ? Math.round(
          clientProjects.reduce((sum, project) => sum + getProgress(project.status), 0) /
            clientProjects.length
        )
      : 0;
    const riskPenalty = blockedProjects.length * 12 + (profileCompleteness < 80 ? 10 : 0);
    const healthScore = Math.max(
      0,
      Math.min(100, Math.round(45 + profileCompleteness * 0.25 + productionScore * 0.3 - riskPenalty))
    );

    return {
      activeProjects,
      blockedProjects,
      completedProjects,
      potential,
      profileCompleteness,
      productionScore,
      healthScore,
    };
  }, [client, clientProjects]);

  const handleUpdate = async (data: any) => {
    if (!client) return;
    setSaving(true);
    try {
      await updateClient(client.id, data);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !window.confirm('Supprimer définitivement ce client ?')) return;
    setSaving(true);
    try {
      await deleteClient(client.id);
      navigate('/clients');
    } finally {
      setSaving(false);
    }
  };

  if ((clientsLoading || projectsLoading) && !client) {
    return <div className="p-8 text-center text-slate-500">Chargement de la situation client…</div>;
  }

  if (!client || !situation) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-500" size={28} />
        <h1 className="text-xl font-semibold text-slate-900">Client introuvable</h1>
        <p className="mt-2 text-sm text-slate-500">
          {clientsError || "Aucune donnée client ne correspond à cet identifiant."}
        </p>
        <Button variant="outline" onClick={() => navigate('/clients')} className="mt-5">
          Retour aux clients
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setIsEditing(false)}
          className="mb-6 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour à la synthèse
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">Modifier le client</h1>
          <ClientForm
            initialData={{
              user_first_name: client.user.first_name,
              user_last_name: client.user.last_name,
              user_email: client.user.email,
              phone: client.phone,
              company_name: client.company_name,
              siret: client.siret,
              address: client.address,
              notes: client.notes,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={saving}
          />
        </div>
      </div>
    );
  }

  const primaryAction = situation.blockedProjects[0] || situation.activeProjects[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            onClick={() => navigate('/clients')}
            className="mb-3 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={17} className="mr-2" />
            Clients
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <UserRound size={25} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                {client.user.first_name} {client.user.last_name}
              </h1>
              <p className="text-sm text-slate-500">
                {client.company_name || 'Particulier'} · client depuis le {dateFormat.format(new Date(client.created_at))}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" leftIcon={<Edit size={16} />} onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
          <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={handleDelete} isLoading={saving}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Santé" value={`${situation.healthScore}%`} icon={<ShieldCheck size={20} />} />
        <MetricCard label="Dossiers actifs" value={situation.activeProjects.length} icon={<BriefcaseBusiness size={20} />} />
        <MetricCard label="Blocages" value={situation.blockedProjects.length} icon={<FileWarning size={20} />} alert={situation.blockedProjects.length > 0} />
        <MetricCard label="Dossiers terminés" value={situation.completedProjects.length} icon={<CheckCircle2 size={20} />} />
        <MetricCard label="Potentiel actif" value={currency.format(situation.potential)} icon={<Euro size={20} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold text-slate-950">Situation opérationnelle</h2>
              <p className="text-sm text-slate-500">Lecture immédiate des dossiers et des blocages</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/projects/create')}>Nouveau dossier</Button>
          </div>

          {clientProjects.length === 0 ? (
            <div className="p-8 text-center">
              <BriefcaseBusiness className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="font-medium text-slate-700">Aucun dossier lié à ce client</p>
              <p className="mt-1 text-sm text-slate-500">La situation deviendra calculable dès le premier dossier.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clientProjects.map(project => {
                const progress = getProgress(project.status);
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 lg:grid-cols-[1fr_140px_120px_24px] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{project.title || 'Dossier sans titre'}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[project.status] || statusClass.draft}`}>
                          {statusLabel[project.status] || project.status}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="block text-slate-400">Avancement</span>
                      <strong className="text-slate-900">{progress}%</strong>
                    </div>
                    <div className="text-sm">
                      <span className="block text-slate-400">Potentiel</span>
                      <strong className="text-slate-900">{currency.format(Number(project.budget?.total || 0))}</strong>
                    </div>
                    <ChevronRight className="text-slate-400" size={20} />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Prochaine action</h2>
            {primaryAction ? (
              <button
                onClick={() => navigate(`/projects/${primaryAction.id}`)}
                className="mt-4 w-full rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <CalendarClock className={primaryAction.status === 'pending' ? 'text-amber-600' : 'text-blue-600'} size={21} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {primaryAction.status === 'pending' ? 'Débloquer le dossier' : 'Faire avancer le dossier'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{primaryAction.title}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </button>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Créer un premier dossier pour générer une priorité.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Coordonnées</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <ContactLine icon={<Mail size={17} />} value={client.user.email} href={`mailto:${client.user.email}`} />
              <ContactLine icon={<Phone size={17} />} value={client.phone || 'Téléphone non renseigné'} href={client.phone ? `tel:${client.phone}` : undefined} />
              <ContactLine
                icon={<MapPin size={17} />}
                value={[client.address?.street, client.address?.postal_code, client.address?.city].filter(Boolean).join(', ') || 'Adresse non renseignée'}
              />
              {client.company_name && <ContactLine icon={<Building size={17} />} value={client.company_name} />}
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                <span>Complétude du profil</span>
                <span>{situation.profileCompleteness}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${situation.profileCompleteness}%` }} />
              </div>
            </div>
          </section>

          {client.notes && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950">Note utile</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{client.notes}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  icon,
  alert = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  alert?: boolean;
}) => (
  <div className={`rounded-2xl border bg-white p-4 shadow-sm ${alert ? 'border-amber-300' : 'border-slate-200'}`}>
    <div className="flex items-center justify-between">
      <span className={`rounded-xl p-2 ${alert ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{icon}</span>
    </div>
    <p className="mt-4 text-2xl font-bold text-slate-950">{value}</p>
    <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
  </div>
);

const ContactLine = ({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) => {
  const content = (
    <span className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="break-all">{value}</span>
    </span>
  );
  return href ? <a href={href} className="block hover:text-slate-950">{content}</a> : content;
};

export default ClientDetailsPage;
