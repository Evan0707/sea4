export interface User {
  username: string;
  roles: string[];
  token: string;
}

export interface UserProfile extends User {
  nom?: string | null;
  prenom?: string | null;
}

export interface JWTPayload {
  username: string;
  roles: string[];
  exp: number;
  iat: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}