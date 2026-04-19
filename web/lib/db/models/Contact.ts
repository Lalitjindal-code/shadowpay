import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  ownerWallet: string;
  contactWallet: string;
  nickname?: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    ownerWallet: { type: String, required: true },
    contactWallet: { type: String, required: true },
    nickname: { type: String },
  },
  { timestamps: true }
);

ContactSchema.index({ ownerWallet: 1, contactWallet: 1 }, { unique: true });

export const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
