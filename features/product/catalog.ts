// Public price facts only. Server validation remains authoritative; no entitlements.
const item=(amount:number,tax:'inclusive'|'exclusive',interval:'year'|'month'|null)=>Object.freeze({amount,currency:'eur' as const,tax,interval});
export const billingCatalog=Object.freeze({
  report:item(690,'inclusive',null),
  personal_year:item(1990,'inclusive','year'),
  personal_extra:item(490,'inclusive',null),
  fleet_start_month:item(1900,'exclusive','month'),
  fleet_start_year:item(19000,'exclusive','year'),
  fleet_pro_month:item(4900,'exclusive','month'),
  fleet_pro_year:item(49000,'exclusive','year'),
  fleet_extra:item(390,'exclusive',null),
});
