import mongoose, { Schema, Document, Model, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IUserMethods {
    matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUser extends Document<string>, IUserMethods {
    id: number;
    username: string;
    email: string;
    password?: string;
    fullName: string;
    position?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    userPermission: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NORMAL';
    roles: ('ADMIN' | 'STAFF' | 'CUSTOMER')[];
    createdAt: Date;
    updatedAt: Date;
}

export type IUserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, IUserModel, IUserMethods>({
    _id: Number,
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    userPermission: {
        type: String,
        enum: ['APPROVED', 'PENDING', 'REJECTED', 'NORMAL'],
        default: 'NORMAL'
    },
    roles: [{
        type: String,
        enum: ['ADMIN', 'STAFF', 'CUSTOMER']
    }]
}, {
    timestamps: true
});

// Use auto-increment plugin to generate integer `id` field
userSchema.plugin(autoIncrementPlugin, { modelName: 'User', field: '_id' });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password as string);
};

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

export default mongoose.model<IUser, IUserModel>('User', userSchema);
