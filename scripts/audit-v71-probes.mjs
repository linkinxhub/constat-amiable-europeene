// Read-only regression probe for the V71-02 finding; no stored data is changed.
import assert from 'node:assert/strict';
import {pdfFixture} from '../tests/pdf-fixture.mjs';
import {complete} from '../features/constat/model.ts';
import {finalMissingFields} from '../features/constat/completeness.ts';
import {vehicleKindValid,trailerRecorded} from '../features/constat/vehicle-kind.ts';
const report=pdfFixture();
report.vehicles[0].kind='truck';
report.vehicles[0].extra.trailerPlate='FICTIF-OLD-TRAILER';
const result={finding:'V71-02',declaredType:report.vehicles[0].kind,trailerRecorded:trailerRecorded(report.vehicles[0]),typeAccepted:vehicleKindValid(report.vehicles[0]),complete:complete(report),finalMissing:finalMissingFields(report)};
assert.equal(result.trailerRecorded,true);assert.equal(result.typeAccepted,false);assert.equal(result.complete,false);assert.ok(result.finalMissing.some(f=>f.field==='vehicleConfiguration'));assert.equal(report.vehicles[0].extra.trailerPlate,'FICTIF-OLD-TRAILER');
console.log(JSON.stringify(result));
console.log('V71-02 rejected without deleting trailer details.');
