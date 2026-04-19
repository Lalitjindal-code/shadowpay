import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentRequest extends Document {
  requestId: string;
  requestorWallet: string;
  shareableLink: string;
  isFulfilled: boolean;
  createdAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    requestorWallet: { type: String, required: true },
    shareableLink: { type: String, required: true },
    isFulfilled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PaymentRequest = mongoose.models.PaymentRequest || mongoose.model<IPaymentRequest>("PaymentRequest", PaymentRequestSchema);
