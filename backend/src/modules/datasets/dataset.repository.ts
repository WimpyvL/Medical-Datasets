import { randomUUID } from 'node:crypto';
import { pool } from '../../config/database.js';
import { DatasetSource, DatasetSnapshotRecord, DatasetSourceRecord } from './dataset.types.js';

interface SnapshotInsertInput {
  sourceId: number;
  storageLocation: string;
  status: 'pending' | 'completed' | 'failed';
}

export async function ensureDatasetTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dataset_sources (
      id SERIAL PRIMARY KEY,
      source TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dataset_snapshots (
      id UUID PRIMARY KEY,
      source_id INTEGER NOT NULL REFERENCES dataset_sources(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      storage_location TEXT NOT NULL,
      checksum TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dataset_items (
      id BIGSERIAL PRIMARY KEY,
      snapshot_id UUID NOT NULL REFERENCES dataset_snapshots(id) ON DELETE CASCADE,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const source of Object.values(DatasetSource)) {
    await pool.query(
      `INSERT INTO dataset_sources (source) VALUES ($1) ON CONFLICT (source) DO NOTHING`,
      [source]
    );
  }
}

export async function listDatasetSources(): Promise<DatasetSourceRecord[]> {
  const result = await pool.query(`
    SELECT ds.id,
           ds.source,
           ds.description,
           ds.created_at,
           json_build_object(
             'id', snap.id,
             'source', ds.source,
             'status', snap.status,
             'storageLocation', snap.storage_location,
             'checksum', snap.checksum,
             'metadata', snap.metadata,
             'error', snap.error,
             'createdAt', snap.created_at,
             'completedAt', snap.completed_at
           ) AS latest_snapshot
    FROM dataset_sources ds
    LEFT JOIN LATERAL (
      SELECT * FROM dataset_snapshots s WHERE s.source_id = ds.id ORDER BY created_at DESC LIMIT 1
    ) snap ON TRUE
    ORDER BY ds.source
  `);

  return result.rows.map((row) => ({
    id: row.id,
    source: row.source as DatasetSource,
    description: row.description,
    createdAt: row.created_at,
    latestSnapshot: row.latest_snapshot
      ? {
          id: row.latest_snapshot.id,
          source: row.latest_snapshot.source as DatasetSource,
          status: row.latest_snapshot.status,
          storageLocation: row.latest_snapshot.storageLocation,
          checksum: row.latest_snapshot.checksum,
          metadata: row.latest_snapshot.metadata ?? {},
          error: row.latest_snapshot.error,
          createdAt: row.latest_snapshot.createdAt,
          completedAt: row.latest_snapshot.completedAt
        }
      : null
  }));
}

export async function getSourceRow(source: DatasetSource): Promise<{ id: number } | null> {
  const result = await pool.query(`SELECT id FROM dataset_sources WHERE source = $1`, [source]);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

export async function insertSnapshot(input: SnapshotInsertInput): Promise<string> {
  const id = randomUUID();
  await pool.query(
    `
      INSERT INTO dataset_snapshots (id, source_id, status, storage_location)
      VALUES ($1, $2, $3, $4)
    `,
    [id, input.sourceId, input.status, input.storageLocation]
  );
  return id;
}

export async function updateSnapshot(
  id: string,
  payload: {
    status: 'completed' | 'failed';
    checksum?: string | null;
    metadata?: Record<string, unknown>;
    error?: string | null;
    storageLocation?: string;
  }
): Promise<void> {
  await pool.query(
    `
      UPDATE dataset_snapshots
      SET status = $2,
          checksum = COALESCE($3, checksum),
          metadata = COALESCE($4::jsonb, metadata),
          error = $5,
          storage_location = COALESCE($6, storage_location),
          completed_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      payload.status,
      payload.checksum ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
      payload.error ?? null,
      payload.storageLocation ?? null
    ]
  );
}

export async function getLatestSnapshot(source: DatasetSource): Promise<DatasetSnapshotRecord | null> {
  const result = await pool.query(
    `
      SELECT s.id,
             ds.source,
             s.status,
             s.storage_location,
             s.checksum,
             s.metadata,
             s.error,
             s.created_at,
             s.completed_at
      FROM dataset_snapshots s
      INNER JOIN dataset_sources ds ON ds.id = s.source_id
      WHERE ds.source = $1
      ORDER BY s.created_at DESC
      LIMIT 1
    `,
    [source]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    source: row.source as DatasetSource,
    status: row.status,
    storageLocation: row.storage_location,
    checksum: row.checksum,
    metadata: row.metadata ?? {},
    error: row.error,
    createdAt: row.created_at,
    completedAt: row.completed_at
  };
}
