import { User, UserRole } from '@prisma/client';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
}

export default User; 