import React from 'react';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Settings,
  BarChart,
  Building,
  Calendar,
  MessageSquare,
  UserPlus,
  Euro,
  Brain,
  Book,
  Receipt,
  Shield,
} from 'lucide-react';
import { RouteKey, paths } from '../routes/paths';

export interface NavItem {
  label: string;
  route: RouteKey;
  icon?: React.ReactNode;
  badge?: number;
  roles?: string[];
  subItems?: NavItem[];
}

export const navConfig: NavItem[] = [
  {
    label: 'Tableau de bord',
    route: 'dashboard',
    icon: React.createElement(Home, { size: 20 }),
  },
  {
    label: 'Projets',
    route: 'projects',
    icon: React.createElement(Briefcase, { size: 20 }),
    badge: 24,
    roles: ['admin', 'manager', 'commercial', 'mandatary', 'client'],
    subItems: [
      {
        label: 'Projets actifs',
        route: 'projectsActive',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
      {
        label: 'En attente',
        route: 'projectsPending',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
      {
        label: 'Terminés',
        route: 'projectsCompleted',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
      {
        label: 'Nouveau projet',
        route: 'projectsCreate',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
    ],
  },
  {
    label: 'Clients',
    route: 'clients',
    icon: React.createElement(Users, { size: 20 }),
    badge: 18,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },
  {
    label: 'Entreprises',
    route: 'companies',
    icon: React.createElement(Building, { size: 20 }),
    badge: 42,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
    subItems: [
      {
        label: 'Partenaires',
        route: 'companiesPartners',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
      { label: 'Fournisseurs', route: 'companiesProviders', roles: ['admin', 'manager'] },
      {
        label: 'Ajouter une entreprise',
        route: 'companiesCreate',
        roles: ['admin', 'manager', 'commercial', 'mandatary'],
      },
    ],
  },
  {
    label: 'Apporteurs',
    route: 'providers',
    icon: React.createElement(UserPlus, { size: 20 }),
    badge: 15,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Documents',
    route: 'documents',
    icon: React.createElement(FileText, { size: 20 }),
    badge: 156,
    roles: ['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company'],
  },
  {
    label: 'Calendrier',
    route: 'calendar',
    icon: React.createElement(Calendar, { size: 20 }),
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },
  {
    label: 'Messages',
    route: 'messages',
    icon: React.createElement(MessageSquare, { size: 20 }),
    badge: 3,
    roles: ['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company'],
  },
  {
    label: 'Commissions',
    route: 'commissions',
    icon: React.createElement(Euro, { size: 20 }),
    roles: ['admin', 'manager', 'business_provider'],
    subItems: [
      { label: 'Toutes les commissions', route: 'commissions', roles: ['admin', 'manager'] },
      {
        label: 'Commissions mandataires',
        route: 'commissionsMandataries',
        roles: ['admin', 'manager', 'mandatary'],
      },
    ],
  },
  {
    label: 'Facturation',
    route: 'invoicing',
    icon: React.createElement(Receipt, { size: 20 }),
    roles: ['admin', 'manager', 'comptable'],
  },
  {
    label: 'Audit',
    route: 'audit',
    icon: React.createElement(Shield, { size: 20 }),
    roles: ['admin', 'manager'],
  },
  {
    label: 'Gestion IA',
    route: 'aiManagement',
    icon: React.createElement(Brain, { size: 20 }),
    badge: 5,
    roles: ['admin', 'manager', 'commercial', 'mandatary'],
  },
  {
    label: 'Guide Application',
    route: 'adminGuide',
    icon: React.createElement(Book, { size: 20 }),
    roles: ['admin', 'manager'],
  },
  {
    label: 'Documentation API',
    route: 'apiDocumentation',
    icon: React.createElement(Book, { size: 20 }),
    roles: ['admin', 'manager'],
  },
  {
    label: 'Administration',
    route: 'settings',
    icon: React.createElement(Settings, { size: 20 }),
    roles: ['admin', 'manager'],
    subItems: [
      { label: 'Général', route: 'settingsGeneral', roles: ['admin', 'manager'] },
      { label: 'Utilisateurs', route: 'settingsUsers', roles: ['admin', 'manager'] },
      { label: 'Rôles et permissions', route: 'settingsRoles', roles: ['admin'] },
      { label: 'Facturation', route: 'settingsBilling', roles: ['admin'] },
      { label: 'Intégrations', route: 'settingsIntegrations', roles: ['admin'] },
    ],
  },
];

// Configuration spécifique par rôle
export const getNavConfigForRole = (role: string): NavItem[] => {
  return navConfig
    .filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    })
    .map(item => ({
      ...item,
      subItems: item.subItems?.filter(subItem => {
        if (!subItem.roles) return true;
        return subItem.roles.includes(role);
      }),
    }));
};
