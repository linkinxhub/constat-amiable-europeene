import {vehicleBrands} from './vehicle-brands.ts';
import type {Lang} from './i18n';
export type Preset={value:string;label:string};
export const presetCopy={fr:['Choisir dans la liste','Ou saisir / compléter librement'],en:['Choose from the list','Or enter / complete freely'],de:['Aus der Liste wählen','Oder frei eingeben / ergänzen'],nl:['Kies uit de lijst','Of zelf invullen / aanvullen']};
const impacts={fr:['Avant','Arrière','Côté gauche','Côté droit','Avant gauche','Avant droit','Arrière gauche','Arrière droit'],en:['Front','Rear','Left side','Right side','Front left','Front right','Rear left','Rear right'],de:['Vorne','Hinten','Linke Seite','Rechte Seite','Vorne links','Vorne rechts','Hinten links','Hinten rechts'],nl:['Voorzijde','Achterzijde','Linkerkant','Rechterkant','Linksvoor','Rechtsvoor','Linksachter','Rechtsachter']};
const options=(values:string[]):Preset[]=>values.map(value=>({value,label:value}));
export function fieldPresets(field:string,lang:Lang):Preset[]{
 if(['policyholderCountry','registrationCountry','trailerCountry','driverCountry'].includes(field)){
  const names=new Intl.DisplayNames([lang],{type:'region'});
  return ['BE','FR','DE','NL','LU','ES','PT','IT','CH','AT','GB','IE','PL','CZ','SK','HU','RO','BG','HR','SI','DK','SE','NO','FI','GR','TR','MA','DZ','TN'].map(value=>({value,label:names.of(value)||value}));
 }
 if(field==='model')return options(vehicleBrands);
 if(field==='insurer')return options(['AG Insurance','Allianz','AXA','Baloise','Belfius Insurance','Ethias','Generali','Groupama','HUK-COBURG','KBC','MAAF','MACIF','MAIF','Matmut','MMA','P&V','Zurich']);
 if(field==='licenceCategory')return options(['AM','A1','A2','A','B','BE','C1','C1E','C','CE','D1','D1E','D','DE','B, C, CE']);
 if(field==='impact')return options(impacts[lang]);
 if(field==='comprehensive')return options(({fr:['Oui','Non','À vérifier'],en:['Yes','No','To verify'],de:['Ja','Nein','Zu prüfen'],nl:['Ja','Nee','Te controleren']})[lang]);
 return [];
}
