import { Message, User } from './';

export class ChatMessage extends Message {
    constructor(
        from: User,
        content: string,
        action: number
    ) {
        super(from, content, action);
    }
}