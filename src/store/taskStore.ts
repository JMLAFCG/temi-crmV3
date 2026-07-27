import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculatePriority, TaskPriority } from '../services/priorityEngine';

export type OperationalTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
export type OperationalTaskSource = 'manual' | 'workflow' | 'risk_engine' | 'opportunity_engine' | 'system';

export interface OperationalTask {
  id: string;
  title: string;
  description?: string | null;
  status: OperationalTaskStatus;
  priority: TaskPriority;
  source: OperationalTaskSource;
  project_id?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  due_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  blocked_reason?: string | null;
  estimated_minutes: number;
  potential_value: number;
  risk_value: number;
  customer_impact: number;
  group_impact: number;
  priority_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateOperationalTaskInput {
  title: string;
  description?: string;
  project_id?: string;
  client_id?: string;
  assigned_to?: string;
  due_at?: string;
  estimated_minutes?: number;
  potential_value?: number;
  risk_value?: number;
  customer_impact?: number;
  group_impact?: number;
  source?: OperationalTaskSource;
  status?: OperationalTaskStatus;
  blocked_reason?: string;
  metadata?: Record<string, unknown>;
}

interface TaskState {
  tasks: OperationalTask[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: { projectId?: string; clientId?: string; assigneeId?: string; openOnly?: boolean }) => Promise<void>;
  createTask: (input: CreateOperationalTaskInput) => Promise<OperationalTask>;
  updateTask: (id: string, updates: Partial<CreateOperationalTaskInput & { status: OperationalTaskStatus }>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}

const scoreTask = (input: CreateOperationalTaskInput) =>
  calculatePriority({
    dueAt: input.due_at,
    potentialValue: input.potential_value,
    riskValue: input.risk_value,
    estimatedMinutes: input.estimated_minutes,
    customerImpact: input.customer_impact,
    groupImpact: input.group_impact,
    isBlocked: input.status === 'blocked',
  });

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async filters => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('operational_tasks')
        .select('*')
        .order('priority_score', { ascending: false })
        .order('due_at', { ascending: true, nullsFirst: false });

      if (filters?.projectId) query = query.eq('project_id', filters.projectId);
      if (filters?.clientId) query = query.eq('client_id', filters.clientId);
      if (filters?.assigneeId) query = query.eq('assigned_to', filters.assigneeId);
      if (filters?.openOnly) query = query.in('status', ['todo', 'in_progress', 'blocked']);

      const { data, error } = await query;
      if (error) throw error;
      set({ tasks: (data || []) as OperationalTask[] });
    } catch (error) {
      console.error('fetchTasks failed:', error);
      set({ error: 'Impossible de charger les actions opérationnelles' });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async input => {
    set({ loading: true, error: null });
    try {
      const { data: authData } = await supabase.auth.getUser();
      const scoring = scoreTask(input);
      const payload = {
        ...input,
        status: input.status || 'todo',
        source: input.source || 'manual',
        estimated_minutes: input.estimated_minutes ?? 15,
        potential_value: input.potential_value ?? 0,
        risk_value: input.risk_value ?? 0,
        customer_impact: input.customer_impact ?? 0,
        group_impact: input.group_impact ?? 0,
        priority_score: scoring.score,
        priority: scoring.priority,
        created_by: authData.user?.id || null,
        metadata: {
          ...(input.metadata || {}),
          priority_reasons: scoring.reasons,
        },
      };

      const { data, error } = await supabase
        .from('operational_tasks')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;

      const task = data as OperationalTask;
      set({ tasks: [task, ...get().tasks] });
      return task;
    } catch (error) {
      console.error('createTask failed:', error);
      set({ error: "Impossible de créer l'action" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const current = get().tasks.find(task => task.id === id);
      if (!current) throw new Error('Action introuvable');

      const merged: CreateOperationalTaskInput = {
        ...current,
        ...updates,
      };
      const scoring = scoreTask(merged);
      const payload: Record<string, unknown> = {
        ...updates,
        priority_score: scoring.score,
        priority: scoring.priority,
        metadata: {
          ...(current.metadata || {}),
          ...(updates.metadata || {}),
          priority_reasons: scoring.reasons,
        },
      };

      if (updates.status === 'in_progress' && !current.started_at) payload.started_at = new Date().toISOString();
      if (updates.status === 'done') payload.completed_at = new Date().toISOString();

      const { error } = await supabase.from('operational_tasks').update(payload).eq('id', id);
      if (error) throw error;

      set({
        tasks: get().tasks.map(task =>
          task.id === id ? ({ ...task, ...payload } as OperationalTask) : task
        ),
      });
    } catch (error) {
      console.error('updateTask failed:', error);
      set({ error: "Impossible de mettre à jour l'action" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  completeTask: async id => {
    await get().updateTask(id, { status: 'done' });
  },
}));
