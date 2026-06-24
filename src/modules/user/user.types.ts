export interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  authProvider: "local" | "google";
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: Date;
  isEmailVerified: boolean;
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
