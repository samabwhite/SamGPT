import mongoose from 'mongoose';
import { conversationSchema } from './conversation.js';
import pkg from 'bcryptjs';  
const { compareSync, hashSync } = pkg; 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        validate: {
            validator: username => User.doesNotExist({ username }),
            message: "Username already exists"
        }
    },
    email: {
        type: String,
        validate: {
            validator: email => User.doesNotExist({ email }),
            message: "Email already in use"
        }
    },
    password: {
        type: String,
        required: true
    },
    message_count: {
        type: Number,
        default: 0
    },
    conversations: [conversationSchema]
}, { timestamps: true });

userSchema.pre('save', function() {
    if (this.isModified('password')) {
        this.password = hashSync(this.password, 10);
    }
});

userSchema.statics.doesNotExist = async function(field) {
    return await this.where(field).countDocuments() === 0;
};

userSchema.methods.comparePasswords = function(password) {
    return compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
