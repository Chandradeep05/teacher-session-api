import mongoose from 'mongoose';
import { Session, SessionStatus } from '../models/Session';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

// ── Create Session ─────────────────────────────

interface CreateSessionData {
  teacherId: string;
  startTime: string;
  endTime: string;
}

export const createSession = async (data: CreateSessionData) => {
  // Verify teacher exists
  const teacher = await Teacher.findById(data.teacherId).lean();
  if (!teacher) {
    throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
  }

  const session = await Session.create({
    teacherId: data.teacherId,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    status: SessionStatus.AVAILABLE, // Force AVAILABLE regardless of input
  });

  return session;
};

// ── Book Session (Atomic) ──────────────────────

export const bookSession = async (sessionId: string, userId: string) => {
  // Verify user exists
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Atomic update: only succeeds if session is AVAILABLE
  const session = await Session.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(sessionId), status: SessionStatus.AVAILABLE },
    { $set: { status: SessionStatus.BOOKED, userId: new mongoose.Types.ObjectId(userId) } },
    { new: true }
  );

  if (!session) {
    // Distinguish 404 (session doesn't exist) from 409 (session exists but not available)
    const exists = await Session.exists({ _id: sessionId });
    if (!exists) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }
    throw new AppError(
      'Session is not available for booking',
      409,
      'SESSION_NOT_AVAILABLE'
    );
  }

  return session;
};

// ── Complete Session (Atomic) ──────────────────

export const completeSession = async (sessionId: string) => {
  // Atomic update: only succeeds if session is BOOKED
  const session = await Session.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(sessionId), status: SessionStatus.BOOKED },
    { $set: { status: SessionStatus.COMPLETED, completedAt: new Date() } },
    { new: true }
  );

  if (!session) {
    // Distinguish 404 from 409
    const exists = await Session.exists({ _id: sessionId });
    if (!exists) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }
    throw new AppError(
      'Session cannot be completed (must be in BOOKED status)',
      409,
      'SESSION_NOT_BOOKABLE'
    );
  }

  return session;
};

// ── Get Available Sessions (Aggregation Pipeline) ──

export const getAvailableSessions = async (dateTimestamp: number) => {
  // Convert timestamp to UTC day boundaries
  const date = new Date(dateTimestamp);
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await Session.aggregate([
    {
      $match: {
        status: SessionStatus.AVAILABLE,
        startTime: { $gte: startOfDay, $lt: startOfNextDay },
      },
    },
    {
      $lookup: {
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: '$teacher' },
    { $sort: { startTime: 1 } },
    {
      $project: {
        _id: 1,
        teacherId: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        createdAt: 1,
        teacher: {
          _id: 1,
          fullName: 1,
          email: 1,
          specialization: 1,
          experience: 1,
        },
      },
    },
  ]);

  return sessions;
};

// ── Get User Session History (Aggregation Pipeline) ──

export const getUserSessionHistory = async (userId: string) => {
  // Verify user exists
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const result = await Session.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: '$teacher' },
    {
      $facet: {
        upcoming: [
          {
            $match: {
              status: SessionStatus.BOOKED,
              startTime: { $gt: new Date() },
            },
          },
          { $sort: { startTime: 1 } },
          {
            $project: {
              _id: 1,
              teacherId: 1,
              startTime: 1,
              endTime: 1,
              status: 1,
              createdAt: 1,
              teacher: {
                _id: 1,
                fullName: 1,
                email: 1,
                specialization: 1,
                experience: 1,
              },
            },
          },
        ],
        completed: [
          {
            $match: { status: SessionStatus.COMPLETED },
          },
          { $sort: { completedAt: -1 } },
          {
            $project: {
              _id: 1,
              teacherId: 1,
              startTime: 1,
              endTime: 1,
              status: 1,
              completedAt: 1,
              createdAt: 1,
              teacher: {
                _id: 1,
                fullName: 1,
                email: 1,
                specialization: 1,
                experience: 1,
              },
            },
          },
        ],
      },
    },
  ]);

  // $facet always returns a single-element array
  return result[0];
};
