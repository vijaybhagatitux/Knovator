import { Schema, model } from 'mongoose';

const JobSchema = new Schema({
  source: { type: String, index: true },
  sourceUrl: { type: String, index: true },
  externalId: { type: String, unique: true, index: true },
  title: String,
  company: String,
  location: String,
  type: String,
  description: String,
  salary: String,
  url: String,
  publishedAt: Date,
  raw: Schema.Types.Mixed
}, { timestamps: true });

export type JobDoc = typeof JobSchema extends infer T ? any : any; // light
export default model('Job', JobSchema);
