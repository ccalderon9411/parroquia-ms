export interface AuthenticatedUser {
  userId: string;
  username: string;
  personId: string;
  refreshToken?: string;
}