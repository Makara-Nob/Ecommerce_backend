import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';

// Schema for keeping track of counters
export interface ICounter extends Document<string> {
  seq: number;
}

const counterSchema = new Schema({
  _id: { type: String, required: true }, // The model name (e.g. 'Product', 'User')
  seq: { type: Number, default: 0 }      // The current sequence number
});

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

export interface AutoIncrementOptions {
    modelName: string;
    field?: string;
}

/**
 * Mongoose plugin to automatically increment an integer ID field.
 */
export const autoIncrementPlugin = (schema: Schema, options: AutoIncrementOptions) => {
  if (!options || !options.modelName) {
    throw new Error('autoIncrementPlugin requires a modelName option');
  }

  const field = options.field || '_id';

  // Only add the field if it isn't '_id' because MongoDB adds '_id' by default
  if (field !== '_id') {
    const fieldSchema: Record<string, any> = {};
    fieldSchema[field] = { type: Number, unique: true };
    schema.add(fieldSchema);
  }

  // Pre-save hook to increment the counter
  schema.pre('save', async function () {
    const doc = this as any;

    if (doc.isNew && doc[field] === undefined) {
      const counter = await Counter.findByIdAndUpdate(
        options.modelName,
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
      );
      doc[field] = (counter as ICounter).seq;
    }
  });

  // Transform toJSON to include integer `id` but not necessarily MongoDB `_id` 
  if(!(schema as any).options.toJSON) {
    (schema as any).options.toJSON = {};
  }
  
  const originalTransform = (schema as any).options.toJSON.transform;
  
  (schema as any).options.toJSON.transform = function(doc: any, ret: any, options: any) {
    let result = ret;
    if (typeof originalTransform === 'function') {
      result = originalTransform(doc, ret, options) || ret;
    }
    
    // Explicitly set 'id' using the auto-incremented field
    if (result[field] !== undefined) {
       result.id = result[field];
    }
    
    if (field === '_id') {
       delete result._id;
    } else {
       delete result._id;
    }
    delete result.__v;
    
    return result;
  };
};
