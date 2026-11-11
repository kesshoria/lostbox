// ============================================================
// Core domain types for "Where Did I Put It?"
// All IDs are UUIDs. All timestamps are ISO 8601 strings.
// ============================================================

export type ISODateString = string; // e.g. "2025-11-09T18:14:32.000Z"

export type ItemStatus = "home" | "borrowed" | "lost" | "discarded";

export type ActivityAction =
  | "created"
  | "updated"
  | "moved"
  | "borrowed"
  | "returned"
  | "verified"
  | "deleted";

// ============================================================
// Item — the core entity. Photos stored as Blobs in IndexedDB.
// ============================================================
export interface Item {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  locationId: string | null;
  containerId: string | null;
  quantity: number;
  tags: string[];
  photoBlob: Blob | null;
  photoThumbnailBlob: Blob | null;
  status: ItemStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastSeenAt: ISODateString | null;
}

// Used when creating a new item — system fills in id/timestamps.
export type NewItemInput = {
  name: string;
  category?: string | null;
  description?: string | null;
  locationId?: string | null;
  containerId?: string | null;
  quantity?: number;
  tags?: string[];
  photoBlob?: Blob | null;
  photoThumbnailBlob?: Blob | null;
  status?: ItemStatus;
  lastSeenAt?: ISODateString | null;
};

// Used when editing an item. All fields optional; id immutable.
export type ItemUpdate = Partial<Omit<Item, "id" | "createdAt">>;

// ============================================================
// Location — a place in the home (Bedroom, Garage, etc.)
// ============================================================
export interface Location {
  id: string;
  name: string;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type NewLocationInput = {
  name: string;
  notes?: string | null;
};

export type LocationUpdate = Partial<Omit<Location, "id" | "createdAt">>;

// ============================================================
// Container — a box/drawer/shelf inside a location.
// ============================================================
export interface Container {
  id: string;
  name: string;
  locationId: string | null;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type NewContainerInput = {
  name: string;
  locationId?: string | null;
  notes?: string | null;
};

export type ContainerUpdate = Partial<Omit<Container, "id" | "createdAt">>;

// ============================================================
// BorrowRecord — one entry per borrow event.
// An item can have many historical records, but at most one
// with returnedAt === null (the active borrow).
// ============================================================
export interface BorrowRecord {
  id: string;
  itemId: string;
  borrowerName: string;
  borrowedAt: ISODateString;
  expectedReturnAt: ISODateString | null;
  returnedAt: ISODateString | null;
  notes: string | null;
}

export type NewBorrowRecordInput = {
  itemId: string;
  borrowerName: string;
  borrowedAt?: ISODateString;
  expectedReturnAt?: ISODateString | null;
  notes?: string | null;
};

// ============================================================
// ActivityLog — immutable audit trail of item changes.
// ============================================================
export interface ActivityEntry {
  id: string;
  itemId: string;
  action: ActivityAction;
  details: string | null;
  createdAt: ISODateString;
}

// ============================================================
// Settings — key/value store for app preferences.
// ============================================================
export interface Setting {
  key: string;
  value: unknown;
}

export type ThemePref = "system" | "light" | "dark";

// ============================================================
// Backup format — used by export/import. Versioned for safety.
// ============================================================
export interface BackupFile {
  app: "where-did-i-put-it";
  version: number;
  exportedAt: ISODateString;
  items: Omit<Item, "photoBlob" | "photoThumbnailBlob">[];
  locations: Location[];
  containers: Container[];
  borrowRecords: BorrowRecord[];
  activityLog: ActivityEntry[];
  settings: Setting[];
  // Photos are stored separately to keep JSON parseable.
  // Each entry maps itemId -> base64 data URL string.
  photos: Record<string, { photo: string; thumb: string }>;
}

export const BACKUP_VERSION = 1;
