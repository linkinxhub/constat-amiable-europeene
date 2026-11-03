import {z} from 'zod';
export const mobilePresentationSchema=z.object({
 title:z.string().trim().min(1).max(80),
 primaryColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 designId:z.enum(['horizon','signature','minimal','premium']),
 introEnabled:z.boolean(),introDurationMs:z.number().int().min(0).max(1500),soundDefault:z.boolean()
}).strict();
export type MobilePresentation=z.infer<typeof mobilePresentationSchema>;
export const mobileDefaults:MobilePresentation={title:'Accordia',primaryColor:'#064cec',designId:'horizon',introEnabled:true,introDurationMs:900,soundDefault:false};
export const mobileCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('draft'),expectedRevision:z.number().int().nonnegative(),config:mobilePresentationSchema}).strict(),
 z.object({action:z.literal('publish'),expectedRevision:z.number().int().positive(),sourceRevision:z.number().int().positive()}).strict(),
 z.object({action:z.literal('rollback'),expectedRevision:z.number().int().positive(),sourceRevision:z.number().int().positive()}).strict()
]);
