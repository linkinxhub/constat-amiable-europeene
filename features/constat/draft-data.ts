import {schema,type Report} from './model.ts';
// An exact local backup, not a signed PDF or a complete account export.
export function draftExport(report:Report){return JSON.stringify({format:'accordia-local-draft',version:1,report:schema.parse(report)},null,2)}
export function draftMatches(stored:unknown,expected:Report){const parsed=schema.safeParse(stored);return parsed.success&&JSON.stringify(parsed.data)===JSON.stringify(schema.parse(expected))}
export function draftFilename(id:string){return 'Accordia-brouillon-'+id.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)+'.json'}
