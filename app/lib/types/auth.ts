export type UserRole = 'user' | 'admin';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};
