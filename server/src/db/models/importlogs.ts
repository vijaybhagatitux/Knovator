import { Schema, model } from 'mongoose';

const ImportLogSchema = new Schema({
  startedAt: Date,
  finishedAt: Date,
  sourceUrl: String,
  totalFetched: { type: Number, default: 0 },
  totalImported: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 },
  failures: [{ externalId: String, reason: String }],
  status: { type: String, enum: ['running','success','failed'], default: 'running' }
}, { timestamps: true });

export default model('ImportLog', ImportLogSchema);
