import mongoose from 'mongoose';
import { makeLogger } from '../config/logger.js';

const log = makeLogger('mongo');

export async function connectMongo(uri: string) {
  await mongoose.connect(uri);
  log.info('Mongo connected');
}
