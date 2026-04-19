import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionEvent extends Document {
  signature: string;
  slot: number;
  timestamp: number;
  accounts: string[];
  type: string;
  raw: any;
  processedAt: Date;
}

const TransactionEventSchema = new Schema<ITransactionEvent>(
  {
    signature: { type: String, required: true, unique: true },
    slot: { type: Number },
    timestamp: { type: Number },
    accounts: [{ type: String }],
    type: { type: String },
    raw: { type: Schema.Types.Mixed },
    processedAt: { type: Date, default: Date.now },
  }
);

export const TransactionEvent = mongoose.models.TransactionEvent || mongoose.model<ITransactionEvent>("TransactionEvent", TransactionEventSchema);
