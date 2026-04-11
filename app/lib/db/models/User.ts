import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string; // Stored in Uploadthing
  worldIdVerified: boolean;
  worldIdNullifier?: string;
  arciumPubkey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    worldIdVerified: { type: Boolean, default: false },
    worldIdNullifier: { type: String, unique: true, sparse: true },
    arciumPubkey: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
