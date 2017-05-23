import { AppRole } from './app-role';
import { Token } from './token';

export class User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  appRoles: AppRole[];
  token: Token;
}