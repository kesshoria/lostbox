// ============================================================
// Borrow records data-access layer
// ============================================================

import { db } from "./index";
import { uuid } from "@/lib/uuid";
import type { BorrowRecord } from "@/lib/types";

// All borrow records for an item, newest first.
export async function listBorrowRecordsForItem(itemId: string): Promise<BorrowRecord[]> {
  const records = await db.borrowRecords.where("itemId").equals(itemId).toArray();
  return records.sort((a, b) => b.borrowedAt.localeCompare(a.borrowedAt));
}

// The active (unreturned) borrow record for an item, if any.
export async function getActiveBorrow(itemId: string): Promise<BorrowRecord | undefined> {
  return db.borrowRecords
    .where("itemId")
    .equals(itemId)
    .filter((r) => r.returnedAt === null)
    .first();
}

// All currently-borrowed records across all items.
export async function listActiveBorrows(): Promise<BorrowRecord[]> {
  const all = await db.borrowRecords.toArray();
  return all
    .filter((r) => r.returnedAt === null)
    .sort((a, b) => b.borrowedAt.localeCompare(a.borrowedAt));
}

// Direct create — used by the items.markBorrowed transaction.
// Exported so unit tests or future flows can use it.
export async function addBorrowRecord(input: {
  itemId: string;
  borrowerName: string;
  borrowedAt: string;
  expectedReturnAt: string | null;
  notes: string | null;
}): Promise<BorrowRecord> {
  const record: BorrowRecord = {
    id: uuid(),
    itemId: input.itemId,
    borrowerName: input.borrowerName.trim(),
    borrowedAt: input.borrowedAt,
    expectedReturnAt: input.expectedReturnAt,
    returnedAt: null,
    notes: input.notes?.trim() || null,
  };
  await db.borrowRecords.add(record);
  return record;
}

// Direct return — used by the items.markReturned transaction.
export async function closeBorrowRecord(recordId: string, returnedAt: string): Promise<void> {
  await db.borrowRecords.update(recordId, { returnedAt });
}
