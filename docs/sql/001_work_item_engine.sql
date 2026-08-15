-- LABORYA / Sofia — Work Item Engine
-- Migration 001 — Fase 1
-- Escopo: criar persistência no Postgres existente, sem serviço novo.
-- Execução recomendada: revisão humana e backup antes de aplicar em qualquer ambiente.

BEGIN;

CREATE SCHEMA IF NOT EXISTS sofia;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sofia.work_items (
    work_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    worker_instance_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    priority TEXT NOT NULL DEFAULT 'normal',
    idempotency_key TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    error JSONB,
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT work_items_status_ck CHECK (status IN (
        'created', 'queued', 'running', 'waiting_customer',
        'waiting_human', 'verifying', 'verified', 'failed',
        'cancelled', 'expired'
    )),
    CONSTRAINT work_items_priority_ck CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT work_items_idempotency_key_ck CHECK (length(trim(idempotency_key)) > 0),
    CONSTRAINT work_items_correlation_id_ck CHECK (length(trim(correlation_id)) > 0),
    CONSTRAINT work_items_tenant_identity_uq UNIQUE (work_item_id, tenant_id),
    CONSTRAINT work_items_tenant_idempotency_uq UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS sofia.work_item_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NOT NULL,
    tenant_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    actor TEXT NOT NULL DEFAULT 'sofia_kernel',
    correlation_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT work_item_events_work_item_tenant_fk
        FOREIGN KEY (work_item_id, tenant_id)
        REFERENCES sofia.work_items (work_item_id, tenant_id)
        ON DELETE RESTRICT,
    CONSTRAINT work_item_events_from_status_ck CHECK (
        from_status IS NULL OR from_status IN (
            'created', 'queued', 'running', 'waiting_customer',
            'waiting_human', 'verifying', 'verified', 'failed',
            'cancelled', 'expired'
        )
    ),
    CONSTRAINT work_item_events_to_status_ck CHECK (
        to_status IS NULL OR to_status IN (
            'created', 'queued', 'running', 'waiting_customer',
            'waiting_human', 'verifying', 'verified', 'failed',
            'cancelled', 'expired'
        )
    ),
    CONSTRAINT work_item_events_idempotency_ck CHECK (length(trim(idempotency_key)) > 0),
    CONSTRAINT work_item_events_correlation_ck CHECK (length(trim(correlation_id)) > 0),
    CONSTRAINT work_item_events_transition_uq
        UNIQUE (tenant_id, work_item_id, event_type, idempotency_key)
);

CREATE INDEX IF NOT EXISTS work_items_tenant_status_idx
    ON sofia.work_items (tenant_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS work_items_tenant_business_idx
    ON sofia.work_items (tenant_id, business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS work_items_tenant_correlation_idx
    ON sofia.work_items (tenant_id, correlation_id);

CREATE INDEX IF NOT EXISTS work_item_events_tenant_created_idx
    ON sofia.work_item_events (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS work_item_events_work_item_created_idx
    ON sofia.work_item_events (work_item_id, created_at ASC);

CREATE OR REPLACE FUNCTION sofia.set_work_item_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS work_items_set_updated_at ON sofia.work_items;
CREATE TRIGGER work_items_set_updated_at
BEFORE UPDATE ON sofia.work_items
FOR EACH ROW
EXECUTE FUNCTION sofia.set_work_item_updated_at();

COMMENT ON TABLE sofia.work_items IS
    'Estado atual de cada unidade de trabalho da Sofia, isolado por tenant.';
COMMENT ON TABLE sofia.work_item_events IS
    'Histórico append-only de transições, decisões e resultados do Work Item Engine.';
COMMENT ON COLUMN sofia.work_items.tenant_id IS
    'Fronteira obrigatória de isolamento SaaS; nunca pode ser inferida depois da escrita.';
COMMENT ON COLUMN sofia.work_items.idempotency_key IS
    'Chave única por tenant para impedir duplicação em retries.';
COMMENT ON COLUMN sofia.work_item_events.payload IS
    'Snapshot mínimo do evento; não usar para substituir a verdade transacional do work_item.';

COMMIT;
