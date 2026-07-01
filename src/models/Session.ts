import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SessionStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
}

export interface ISession extends Document {
  teacherId: Types.ObjectId;
  userId: Types.ObjectId | null;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.AVAILABLE,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: supports API 3 (available sessions for a date)
sessionSchema.index({ status: 1, startTime: 1 });

// Index: supports API 6 (user session history)
sessionSchema.index({ userId: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
