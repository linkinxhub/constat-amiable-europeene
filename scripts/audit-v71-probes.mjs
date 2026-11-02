// Read-only audit probes: reproduce a known finding without changing stored data.
import assert from 'node:assert/strict';
import {pdfFixture} from '../tests/pdf-fixture.mjs';
import {complete} from '../features/constat/model.ts';
import {finalMissingFields} from '../features/constat/completeness.ts';
import {vehicleKindValid,trailerRecorded} from '../features/constat/vehicle-kind.ts';
const report=pdfFixture();
report.vehicles[0].kind='truck';
report.vehicles[0].extra.trailerPlate='FICTIF-OLD-TRAILER';
const result={finding:'V71-02',declaredType:report.vehicles[0].kind,trailerRecorded:trailerRecorded(report.vehicles[0]),typeAccepted:vehicleKindValid(report.vehicles[0]),complete:complete(report),finalMissing:finalMissingFields(report)};
assert.equal(result.trailerRecorded,true);assert.equal(result.typeAccepted,true);assert.equal(result.complete,true);assert.deepEqual(result.finalMissing,[]);
console.log(JSON.stringify(result));
console.log('Known inconsistency reproduced. This is an audit probe, not a passing regression test for a fix.');
