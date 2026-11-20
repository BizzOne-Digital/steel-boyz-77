import mongoose, { type Model, type Schema } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineModel(name: string, schema: Schema): Model<any> {
  return mongoose.models[name] ?? mongoose.model(name, schema);
}
