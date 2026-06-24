import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserMethods } from "./user.types.js";

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === "local";
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    dateOfBirth: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const transformed = ret as Record<string, unknown>;

        delete transformed.password;
        delete transformed.refreshTokens;
        delete transformed.__v;

        return transformed;
      },
    },
  },
);

userSchema.methods.comparePassword = async function (
  this: mongoose.Document<unknown, {}, IUser> & IUser & IUserMethods,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || "");
};

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

userSchema.virtual("hasBasicProfileInfo").get(function () {
  return !!(this.gender && this.dateOfBirth);
});

export default mongoose.model<IUser, UserModel>("User", userSchema);