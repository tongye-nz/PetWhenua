import { PostType, PostStatus } from '../models/post.types';

// User roles and permissions for PetWhenua

export const USER_ROLES = {
  MEMBER: 'member',
  SITE_ADMIN: 'site_admin',
  MEETUP_ADMIN: 'meetup_admin',
  VET: 'vet'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_LABELS = {
  [USER_ROLES.MEMBER]: 'Member',
  [USER_ROLES.SITE_ADMIN]: 'Site Administrator',
  [USER_ROLES.MEETUP_ADMIN]: 'Meetup Administrator',
  [USER_ROLES.VET]: 'Veterinarian'
} as const;

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.MEMBER]: 'Regular community member with access to pet management and basic features',
  [USER_ROLES.SITE_ADMIN]: 'Full system administrator with access to all features and user management',
  [USER_ROLES.MEETUP_ADMIN]: 'Organizes and manages community meetups and events',
  [USER_ROLES.VET]: 'Licensed veterinarian who can publish articles in the library and meetups'
} as const;

// Role hierarchy for permissions (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [USER_ROLES.MEMBER]: 1,
  [USER_ROLES.VET]: 2,
  [USER_ROLES.MEETUP_ADMIN]: 3,
  [USER_ROLES.SITE_ADMIN]: 4
} as const;

// Permission checks
export const hasRole = (userRole: string, requiredRole: UserRole): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
};

export const isAdmin = (userRole: string): boolean => {
  return userRole === USER_ROLES.SITE_ADMIN;
};

export const isMeetupAdmin = (userRole: string): boolean => {
  return userRole === USER_ROLES.MEETUP_ADMIN || isAdmin(userRole);
};

export const isVet = (userRole: string): boolean => {
  return userRole === USER_ROLES.VET || isAdmin(userRole);
};

export const canManageUsers = (userRole: string): boolean => {
  return isAdmin(userRole);
};

export const canManageMeetups = (userRole: string): boolean => {
  return isMeetupAdmin(userRole);
};

export const canProvideVetServices = (userRole: string): boolean => {
  return isVet(userRole);
};

// Post-specific labels and utilities
export const PostTypeLabels = {
  [PostType.Moment]: "Moment",
  [PostType.BuySell]: "Buy/Sell",
  [PostType.Meetup]: "Meetup",
  [PostType.PetWedding]: "Pet Wedding",
  [PostType.Library]: "Library",
  [PostType.Announcement]: "Announcement"
};

export const PostStatusLabels = {
  [PostStatus.Active]: "Active",
  [PostStatus.Sold]: "Sold",
  [PostStatus.Expired]: "Expired",
  [PostStatus.Inactive]: "Inactive",
  [PostStatus.Cancelled]: "Cancelled"
};
