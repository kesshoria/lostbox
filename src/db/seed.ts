// ============================================================
// Dev-only seed data.
//
// This file is only imported from a hidden /dev route in development.
// It is never imported from any production code path. The seed
// function checks a settings flag so it can never run twice.
// ============================================================

import { db } from "./index";
import { createItem } from "./items";
import { createLocation } from "./locations";
import { createContainer } from "./containers";
import { setSetting, getSetting, SETTINGS_KEYS } from "./settings";
import { markBorrowed } from "./items";

interface SeedItem {
  name: string;
  category: string;
  description: string;
  locationName: string;
  containerName: string;
  quantity: number;
  tags: string[];
}

const SEED_ITEMS: SeedItem[] = [
  {
    name: "HDMI cable (2m)",
    category: "Cables",
    description: "Black, braided. Used for the projector.",
    locationName: "Living room",
    containerName: "Drawer under TV",
    quantity: 2,
    tags: ["cable", "electronics"],
  },
  {
    name: "Passport",
    category: "Documents",
    description: "Expires 2031.",
    locationName: "Bedroom",
    containerName: "Fireproof box",
    quantity: 1,
    tags: ["important", "travel"],
  },
  {
    name: "USB-C charger 65W",
    category: "Chargers",
    description: "GaN, compact.",
    locationName: "Living room",
    containerName: "Drawer under TV",
    quantity: 1,
    tags: ["charging", "electronics"],
  },
  {
    name: "First aid kit",
    category: "Emergency",
    description: "Red cross on lid. Refilled 2024.",
    locationName: "Garage",
    containerName: "Top shelf — left",
    quantity: 1,
    tags: ["emergency", "medical"],
  },
  {
    name: "Torx screwdriver set",
    category: "Tools",
    description: "T6–T40.",
    locationName: "Garage",
    containerName: "Tool chest — drawer 3",
    quantity: 1,
    tags: ["tools"],
  },
  {
    name: "Winter coat",
    category: "Clothing",
    description: "Navy blue.",
    locationName: "Bedroom",
    containerName: "Hall closet — left",
    quantity: 1,
    tags: ["seasonal"],
  },
  {
    name: "AirPods Pro case",
    category: "Electronics",
    description: "Just the case, earbuds usually in use.",
    locationName: "Bedroom",
    containerName: "Nightstand drawer",
    quantity: 1,
    tags: ["electronics"],
  },
  {
    name: "Spare car keys",
    category: "Keys",
    description: "Honda Civic.",
    locationName: "Kitchen",
    containerName: "Junk drawer",
    quantity: 1,
    tags: ["important"],
  },
];

const SEED_BORROW: { itemName: string; borrowerName: string }[] = [
  { itemName: "Torx screwdriver set", borrowerName: "Sam (neighbor)" },
];

export async function seedIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  const alreadySeeded = await getSetting<boolean>(SETTINGS_KEYS.hasSeeded);
  if (alreadySeeded) {
    return { seeded: false, count: 0 };
  }

  const count = await db.items.count();
  if (count > 0) {
    // Don't seed if the user already has items, even if the flag is missing.
    await setSetting(SETTINGS_KEYS.hasSeeded, true);
    return { seeded: false, count: 0 };
  }

  // Create locations + containers, deduped by name.
  const locationCache = new Map<string, string>();
  const containerCache = new Map<string, string>();

  for (const seed of SEED_ITEMS) {
    let locationId = locationCache.get(seed.locationName);
    if (!locationId) {
      const loc = await createLocation({ name: seed.locationName });
      locationId = loc.id;
      locationCache.set(seed.locationName, locationId);
    }

    const containerKey = `${seed.locationName}::${seed.containerName}`;
    let containerId = containerCache.get(containerKey);
    if (!containerId) {
      const c = await createContainer({
        name: seed.containerName,
        locationId,
      });
      containerId = c.id;
      containerCache.set(containerKey, containerId);
    }

    await createItem({
      name: seed.name,
      category: seed.category,
      description: seed.description,
      locationId,
      containerId,
      quantity: seed.quantity,
      tags: seed.tags,
    });
  }

  // Seed one borrowed item.
  for (const borrow of SEED_BORROW) {
    const item = await db.items.where("name").equals(borrow.itemName).first();
    if (item) {
      const borrowedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const expectedReturnAt = new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000,
      ).toISOString();
      await markBorrowed(
        item.id,
        borrow.borrowerName,
        borrowedAt,
        expectedReturnAt,
        "Will return next weekend.",
      );
    }
  }

  await setSetting(SETTINGS_KEYS.hasSeeded, true);
  return { seeded: true, count: SEED_ITEMS.length };
}
