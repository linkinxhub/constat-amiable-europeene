import {z} from 'zod';
export const FEEDBACK_IMAGE_BYTES=180*1024;
export const feedbackSchema=z.object({id:z.string().uuid(),category:z.enum(['problem','idea','other']),message:z.string().trim().min(10).max(4000),lang:z.enum(['fr','en','de','nl']),source:z.enum(['site','platform']),images:z.array(z.string().max(250000).regex(/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/)).max(3)}).strict();
export type FeedbackInput=z.infer<typeof feedbackSchema>;
