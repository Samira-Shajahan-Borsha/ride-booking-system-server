import { model, Schema } from "mongoose";
import { IContact } from "./contact.interface";

const contactSchema = new Schema<IContact>(
    {
        name: { type: String, required: [true, "Name is required"], trim: true, minLength: 2 },
        email: { type: String, required: [true, "Email is required"], trim: true },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minLength: 2,
        },
    },
    { versionKey: false, timestamps: true }
);

export const Contact = model<IContact>("Contact", contactSchema);
