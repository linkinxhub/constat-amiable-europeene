import {writeFileSync} from 'node:fs';
import {dictionaries} from '../features/constat/i18n.ts';
import {extraLabels,finalCopy} from '../features/constat/final-copy.ts';
import {standardCircumstances} from '../features/constat/final-model.ts';
import {vehicleKindCopy} from '../features/constat/vehicle-kind-copy.ts';
writeFileSync(new URL('../mobile/accordia/assets/copy/constat.json',import.meta.url),JSON.stringify({dictionaries,extraLabels,finalCopy,standardCircumstances,vehicleKindCopy},null,2)+'\n');
