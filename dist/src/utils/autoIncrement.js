"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoIncrementPlugin = exports.Counter = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const counterSchema = new mongoose_1.Schema({
    _id: { type: String, required: true }, // The model name (e.g. 'Product', 'User')
    seq: { type: Number, default: 0 } // The current sequence number
});
exports.Counter = mongoose_1.default.model('Counter', counterSchema);
/**
 * Mongoose plugin to automatically increment an integer ID field.
 */
const autoIncrementPlugin = (schema, options) => {
    if (!options || !options.modelName) {
        throw new Error('autoIncrementPlugin requires a modelName option');
    }
    const field = options.field || '_id';
    // Only add the field if it isn't '_id' because MongoDB adds '_id' by default
    if (field !== '_id') {
        const fieldSchema = {};
        fieldSchema[field] = { type: Number, unique: true };
        schema.add(fieldSchema);
    }
    // Pre-save hook to increment the counter
    schema.pre('save', async function () {
        const doc = this;
        if (doc.isNew && doc[field] === undefined) {
            const counter = await exports.Counter.findByIdAndUpdate(options.modelName, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true });
            doc[field] = counter.seq;
        }
    });
    // Transform toJSON to include integer `id` but not necessarily MongoDB `_id` 
    if (!schema.options.toJSON) {
        schema.options.toJSON = {};
    }
    const originalTransform = schema.options.toJSON.transform;
    schema.options.toJSON.transform = function (doc, ret, options) {
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
        }
        else {
            delete result._id;
        }
        delete result.__v;
        return result;
    };
};
exports.autoIncrementPlugin = autoIncrementPlugin;
