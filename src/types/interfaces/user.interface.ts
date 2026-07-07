import { UserRole } from "../enums/user.enum";

export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: UserRole;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}
