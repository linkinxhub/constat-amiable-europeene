import {sqliteTable,text,integer,index,primaryKey,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const aiSettings=sqliteTable('ai_settings',{
 id:text('id').primaryKey(),adminId:text('admin_id').notNull(),revision:integer('revision').notNull().default(0),
 encryptedKey:text('encrypted_key'),model:text('model').notNull().default(''),enabled:integer('enabled').notNull().default(0),
 updatedAt:text('updated_at').notNull(),testAfter:integer('test_after').notNull().default(0)
});
export const accounts=sqliteTable('accounts',{
 id:text('id').primaryKey(),status:text('status').notNull().default('active'),
 createdAt:text('created_at').notNull(),budgetBytes:integer('budget_bytes').notNull().default(0),
 window:integer('rate_window').notNull().default(0),writes:integer('rate_writes').notNull().default(0)
});
export const reports=sqliteTable('reports',{
 ownerId:text('owner_id').notNull().references(()=>accounts.id),id:text('id').notNull(),
 revision:integer('revision').notNull(),objectKey:text('object_key').notNull(),
 retentionUntil:integer('retention_until').notNull().default(0),title:text('title').notNull(),accidentDate:text('accident_date').notNull(),updatedAt:text('updated_at').notNull()
},t=>[primaryKey({columns:[t.ownerId,t.id]}),index('reports_owner_updated_idx').on(t.ownerId,t.updatedAt),index('reports_retention_idx').on(t.retentionUntil)]);
export const reportVersions=sqliteTable('report_versions',{
 ownerId:text('owner_id').notNull(),reportId:text('report_id').notNull(),revision:integer('revision').notNull(),
 objectKey:text('object_key').notNull(),createdAt:text('created_at').notNull(),sizeBytes:integer('size_bytes').notNull()
},t=>[primaryKey({columns:[t.ownerId,t.reportId,t.revision]})]);

export const sharedSessions=sqliteTable('shared_sessions',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),reportId:text('report_id').notNull(),
 ownerSide:text('owner_side').notNull().default('A'),autoSketchRevision:integer('auto_sketch_revision').notNull().default(0),doneA:text('done_a'),doneB:text('done_b'),participantB:text('participant_b'),inviteHash:text('invite_hash').notNull(),expiresAt:integer('expires_at').notNull(),
 summaryConsentA:integer('summary_consent_a').notNull().default(0),summaryConsentB:integer('summary_consent_b').notNull().default(0),autoSummaryRevision:integer('auto_summary_revision').notNull().default(0),
 consentA:integer('consent_a').notNull().default(0),consentB:integer('consent_b').notNull().default(0),
 translationConsentA:integer('translation_consent_a').notNull().default(0),translationConsentB:integer('translation_consent_b').notNull().default(0),
 translationWindow:integer('translation_window').notNull().default(0),translationCalls:integer('translation_calls').notNull().default(0),
 pdfLock:text('pdf_lock'),pdfLockUntil:integer('pdf_lock_until').notNull().default(0),
 aiLock:text('ai_lock'),aiLockUntil:integer('ai_lock_until').notNull().default(0),
 aiWindow:integer('ai_window').notNull().default(0),aiCalls:integer('ai_calls').notNull().default(0)
},t=>[uniqueIndex('sessions_owner_report_idx').on(t.ownerId,t.reportId),index('sessions_participant_b_idx').on(t.participantB)]);

export const sketchProposals=sqliteTable('sketch_proposals',{
 summaryId:text('summary_id'),sessionId:text('session_id').primaryKey(),sourceRevision:integer('source_revision').notNull(),objectKey:text('object_key').notNull(),
 approvedA:integer('approved_a').notNull().default(0),approvedB:integer('approved_b').notNull().default(0)
});

export const finalDocuments=sqliteTable('final_documents',{
 id:text('id').primaryKey(),sessionId:text('session_id').notNull(),revision:integer('revision').notNull(),
 style:text('style').notNull(),lang:text('lang').notNull(),digest:text('digest').notNull(),
 translated:integer('translated').notNull().default(0),
 previewKey:text('preview_key'),reportKey:text('report_key').notNull(),sketchKey:text('sketch_key'),createdAt:text('created_at').notNull(),
 signatureA:text('signature_a'),signatureB:text('signature_b'),pdfKey:text('pdf_key'),pdfHash:text('pdf_hash')
},t=>[index('final_documents_session_created').on(t.sessionId,t.createdAt),uniqueIndex('final_documents_session_digest').on(t.sessionId,t.digest)]);

// Reservations make failed writes recoverable without removing referenced versions.
export const storageObjects=sqliteTable('storage_objects',{
 objectKey:text('object_key').primaryKey(),ownerId:text('owner_id').notNull(),sizeBytes:integer('size_bytes').notNull(),
 state:text('state').notNull(),expiresAt:integer('expires_at').notNull()
},t=>[index('storage_objects_owner_idx').on(t.ownerId)]);

// Global provider-call reservations; no report content or identities stored here.
export const aiDailyUsage=sqliteTable('ai_daily_usage',{
 day:text('day').primaryKey(),
 calls:integer('calls').notNull().default(0),
 sketches:integer('sketches').notNull().default(0),
 translations:integer('translations').notNull().default(0)
});

// A preference is not an entitlement or an active subscription.
export const offerPreferences=sqliteTable('offer_preferences',{ownerId:text('owner_id').primaryKey().references(()=>accounts.id),offer:text('offer').notNull(),updatedAt:text('updated_at').notNull()});
export const retentionJobs=sqliteTable('retention_jobs',{ownerId:text('owner_id').notNull(),reportId:text('report_id').notNull()},t=>[primaryKey({columns:[t.ownerId,t.reportId]})]);
export const retentionObjects=sqliteTable('retention_objects',{objectKey:text('object_key').primaryKey(),ownerId:text('owner_id').notNull(),reportId:text('report_id').notNull()});

export const retentionMaintenance=sqliteTable('retention_maintenance',{
 id:text('id').primaryKey(),lockToken:text('lock_token'),lockUntil:integer('lock_until').notNull().default(0),nextAttempt:integer('next_attempt').notNull().default(0),
 lastStarted:integer('last_started'),lastFinished:integer('last_finished'),lastSuccess:integer('last_success'),lastError:text('last_error'),
 reports:integer('reports').notNull().default(0),objects:integer('objects').notNull().default(0),more:integer('more').notNull().default(0)
});

// Test billing evidence only; no live entitlement or accident content.
export const billingTestOrders=sqliteTable('billing_test_orders',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),reportId:text('report_id').notNull(),
 locale:text('locale').notNull(),sessionId:text('session_id'),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('billing_test_order_report').on(t.ownerId,t.reportId),uniqueIndex('billing_test_order_session').on(t.sessionId)]);
export const billingTestReceipts=sqliteTable('billing_test_receipts',{
 eventId:text('event_id').primaryKey(),orderId:text('order_id').notNull(),sessionId:text('session_id').notNull(),receivedAt:integer('received_at').notNull()
},t=>[uniqueIndex('billing_test_receipt_order').on(t.orderId),uniqueIndex('billing_test_receipt_session').on(t.sessionId)]);

export const billingTestGrants=sqliteTable('billing_test_grants',{
 orderId:text('order_id').primaryKey(),state:text('state').notNull(),credits:integer('credits').notNull(),
 expiresAt:integer('expires_at').notNull(),createdAt:integer('created_at').notNull()
});

export const billingTestUses=sqliteTable('billing_test_uses',{
 id:text('id').primaryKey(),orderId:text('order_id').notNull(),kind:text('kind').notNull(),state:text('state').notNull(),
 createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[index('billing_test_uses_order_state').on(t.orderId,t.state)]);

// Counts only: document images and extracted values are never stored here.
export const documentExtractionUsage=sqliteTable('document_extraction_usage',{
 actor:text('actor').primaryKey(),window:integer('window').notNull(),calls:integer('calls').notNull()
});

// Bounded derived proposals, separate from original declarations and signed documents.
export const synthesisProposals=sqliteTable('synthesis_proposals',{
 sequence:integer('sequence').primaryKey({autoIncrement:true}),id:text('id').notNull().unique(),
 sessionId:text('session_id').notNull(),sourceRevision:integer('source_revision').notNull(),content:text('content').notNull(),
 approvedA:integer('approved_a').notNull().default(0),approvedB:integer('approved_b').notNull().default(0)
},t=>[index('synthesis_session_sequence').on(t.sessionId,t.sequence)]);

export const feedback=sqliteTable('feedback',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),category:text('category').notNull(),message:text('message').notNull(),lang:text('lang').notNull(),source:text('source').notNull(),images:text('images').notNull(),digest:text('digest').notNull(),createdAt:integer('created_at').notNull(),resolved:integer('resolved').notNull().default(0)
},t=>[index('feedback_owner_created').on(t.ownerId,t.createdAt),index('feedback_inbox').on(t.resolved,t.createdAt)]);

export const mobileSettings=sqliteTable('mobile_settings',{revision:integer('revision').primaryKey(),state:text('state').notNull(),config:text('config').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull(),sourceRevision:integer('source_revision')});

// Reusable vehicle/insurance facts only; scoped to the authenticated account.
export const vehicleProfiles=sqliteTable('vehicle_profiles',{
 ownerId:text('owner_id').notNull().references(()=>accounts.id),id:text('id').notNull(),
 label:text('label').notNull(),vehicleJson:text('vehicle_json').notNull(),createdAt:text('created_at').notNull()
},t=>[primaryKey({columns:[t.ownerId,t.id]}),index('vehicle_profiles_owner_created_idx').on(t.ownerId,t.createdAt)]);

// Retain the minimal receipt needed to recover a deletion response lost in transit.
export const reportDeletionRequests=sqliteTable('report_deletion_requests',{
 ownerId:text('owner_id').notNull().references(()=>accounts.id),reportId:text('report_id').notNull(),
 revision:integer('revision').notNull(),requestedAt:text('requested_at').notNull()
},t=>[primaryKey({columns:[t.ownerId,t.reportId]})]);
