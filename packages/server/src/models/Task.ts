import mongoose, { Schema, Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  labels: string[];
  owner: Types.ObjectId;
  sharedWith: Types.ObjectId[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    labels: [{ type: String, trim: true }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
