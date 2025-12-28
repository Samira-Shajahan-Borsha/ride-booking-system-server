import { IContact } from "./contact.interface";
import { Contact } from "./contact.model";

const submitMessage = async (payload: IContact) => {
    const result = await Contact.create(payload);
    return result;
};

export const ContactService = {
    submitMessage,
};
