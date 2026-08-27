import { create } from "zustand";
import type { Gender, Item, Role } from "./catalog";
import {
  deleteDeliveryOnServer,
  deleteEntryOnServer,
  editEntryOnServer,
  getInventorySnapshot,
  issueKitOnServer,
  issueSingleOnServer,
  receiveStock,
  type Delivery,
  type InventorySnapshot,
  type StockMovement,
} from "./inventory-api";

type Sizes = {
  pantalon: string;
  camisa: string;
  polo: string;
  zapato: string;
};

type EntryInput = {
  itemId: string;
  qty: number;
  date: string;
  supplier: string;
  note: string;
};

type Result = Promise<{ ok: true } | { ok: false; error: string }>;

type State = {
  items: Item[];
  deliveries: Delivery[];
  movements: StockMovement[];
  hydrated: boolean;
  loading: boolean;
  persistent: boolean;
  error: string;
  sync: () => Promise<void>;
  issueKit: (input: {
    name: string;
    area: string;
    date: string;
    role: Role;
    gender: Gender;
    sizes: Sizes;
  }) => Result;
  issueSingle: (input: {
    name: string;
    area: string;
    date: string;
    role: Role;
    gender: Gender;
    itemId: string;
    note: string;
  }) => Result;
  deleteDelivery: (deliveryId: string) => Result;
  receive: (input: EntryInput) => Result;
  editEntry: (input: EntryInput & { movementId: string }) => Result;
  deleteEntry: (movementId: string) => Result;
};

function applySnapshot(snapshot: InventorySnapshot) {
  return {
    items: snapshot.items,
    deliveries: snapshot.deliveries,
    movements: snapshot.movements,
    persistent: snapshot.persistent,
    hydrated: true,
    loading: false,
    error: "",
  };
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error al guardar los datos.";
}

export const useInventory = create<State>((set) => ({
  items: [],
  deliveries: [],
  movements: [],
  hydrated: false,
  loading: false,
  persistent: false,
  error: "",

  sync: async () => {
    set((s) => ({ loading: s.hydrated ? s.loading : true }));
    try {
      const data = await getInventorySnapshot();
      set(applySnapshot(data));
    } catch (error) {
      set({ hydrated: true, loading: false, error: message(error) });
    }
  },

  issueKit: async (input) => {
    try {
      const data = await issueKitOnServer({ data: input });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },

  issueSingle: async (input) => {
    try {
      const data = await issueSingleOnServer({ data: input });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },

  deleteDelivery: async (deliveryId) => {
    try {
      const data = await deleteDeliveryOnServer({ data: { deliveryId } });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },

  receive: async (input) => {
    try {
      const data = await receiveStock({ data: input });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },

  editEntry: async (input) => {
    try {
      const data = await editEntryOnServer({ data: input });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },

  deleteEntry: async (movementId) => {
    try {
      const data = await deleteEntryOnServer({ data: { movementId } });
      set(applySnapshot(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: message(error) };
    }
  },
}));
