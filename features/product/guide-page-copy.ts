import type {Lang} from '../constat/i18n';
export const guidePageCopy={
 fr:{label:'Guide',title:'Bien utiliser Accordia',intro:'Retrouvez le même guide que dans le constat : choisissez votre parcours, consultez les étapes et les solutions aux blocages. Cette page explique les fonctions ; elle ne remplit ni ne modifie votre dossier.'},
 en:{label:'Guide',title:'Using Accordia',intro:'The same guide as in the report: choose your flow, follow the steps and find solutions to common problems. This page explains features; it does not fill or change your report.'},
 de:{label:'Anleitung',title:'Accordia richtig nutzen',intro:'Dieselbe Anleitung wie im Bericht: Ablauf wählen, Schritte nachlesen und Hilfe bei Problemen finden. Diese Seite erklärt Funktionen; sie füllt oder ändert keinen Bericht.'},
 nl:{label:'Handleiding',title:'Accordia gebruiken',intro:'Dezelfde handleiding als in het dossier: kies uw route, bekijk de stappen en vind hulp bij problemen. Deze pagina legt functies uit; zij vult of wijzigt uw dossier niet.'}
} satisfies Record<Lang,{label:string;title:string;intro:string}>;
