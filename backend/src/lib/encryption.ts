import { config } from "dotenv";
import crypto from "node:crypto";

config();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
const key = Buffer.from(ENCRYPTION_KEY,'hex');
if (key.length !== 32) {
    throw new Error("Invalid encryption key");
}

export const encrypt = (content:string)=>{
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm",key,iv);
    const encrypted = cipher.update(content, 'utf8', 'hex');
    const final = cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export const decrypt = (content: string)=>{
    const [ivH,authTugH,encrypted] =
    content.split(':');
    const iv = Buffer.from(ivH,"hex");
    const authTug = Buffer.from(authTugH,"hex");
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        iv
    )

    decipher.setAuthTag(authTug);
    const decryptedText = decipher.update(encrypted,'hex','utf8');
    const final = decipher.final('utf8');
    return decryptedText + final;
}
