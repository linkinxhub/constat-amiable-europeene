import {z} from 'zod';
import {mobilePresentationSchema,type MobilePresentation} from './model.ts';

const itemSchema=mobilePresentationSchema.extend({schemaVersion:z.literal(1),revision:z.number().int().nonnegative()});
export const mobileAdminViewSchema=z.object({
 revision:z.number().int().nonnegative(),published:itemSchema,
 history:z.array(itemSchema.extend({state:z.enum(['draft','published']),actor:z.string(),createdAt:z.string(),sourceRevision:z.number().nullable()})).max(50)
});
export type MobileAdminView=z.infer<typeof mobileAdminViewSchema>;
export const presentationKeys=['title','primaryColor','designId','introEnabled','introDurationMs','soundDefault'] as const;
export function asPresentation(input:unknown):MobilePresentation{return mobilePresentationSchema.strip().parse(input)}
export function differentSettings(a:MobilePresentation,b:MobilePresentation){return presentationKeys.filter(key=>a[key]!==b[key])}
export function hasMobileEdits(view:MobileAdminView,config:MobilePresentation){
 const baseline=asPresentation(view.history[0]??view.published);
 const parsed=mobilePresentationSchema.safeParse(config);
 return differentSettings(baseline,parsed.success?parsed.data:config).length>0;
}
