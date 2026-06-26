export interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  authProvider: "local" | "google";
  firstName: string;
  lastName: string;
  gender?: "male" | "female";
  dateOfBirth?: Date;
  timezone: string;
  isEmailVerified: boolean;
  hasBasicProfileInfo: boolean;
  tokenVersion: number;
  refreshTokens: {
    token: string;
    createdAt: Date;
    expiresAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
