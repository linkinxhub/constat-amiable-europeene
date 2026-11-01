import type {extraFields} from './final-model';
type Extra=typeof extraFields[number];
// Every historical field remains editable; groups do not alter the report schema.
export const detailGroups:readonly (readonly Extra[])[]=[
 ['policyholderFirstName','policyholderAddress','policyholderPostcode','policyholderCountry','policyholderPhone'],
 ['driverFirstName','driverBirthDate','driverPostcode','driverCountry','driverPhone','licenceNumber','licenceCategory','licenceUntil'],
 ['greenCard','insuranceFrom','insuranceUntil','agency','agencyAddress','agencyPhone','comprehensive'],
 ['registrationCountry','trailerPlate','trailerCountry'],
 ['impact'],
];
