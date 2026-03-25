"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { ToastMessage } from "@/src/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  isDefault?: boolean;
}

export type CheckoutStep = "information" | "shipping" | "payment" | "confirm";

export interface CheckoutFormValues {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  note: string;
  saveAddress: boolean;
}

interface CheckoutToast {
  message: string;
  type: "success" | "error";
}

export interface CheckoutState {
  step: CheckoutStep;
  form: CheckoutFormValues;
  shippingMethodId: string | null;
  paymentMethodId: string | null;
  submitting: boolean;
  toast: CheckoutToast | null;
  hydrated: boolean;
  /** ID of the saved address currently selected (null = manual entry). */
  selectedAddressId: string | null;
  savedAddresses: SavedAddress[];
  addressesHydrated: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type CheckoutAction =
  | {
      type: "SET_FIELD";
      payload: { field: keyof CheckoutFormValues; value: string | boolean };
    }
  | { type: "SET_STEP"; payload: CheckoutStep }
  | { type: "SET_SHIPPING"; payload: string }
  | { type: "SET_PAYMENT"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_TOAST"; payload: CheckoutToast | null }
  | { type: "HYDRATE_FORM"; payload: Partial<CheckoutFormValues> }
  | { type: "SET_SELECTED_ADDRESS"; payload: string | null }
  | { type: "ADD_ADDRESS"; payload: SavedAddress }
  | { type: "UPDATE_ADDRESS"; payload: SavedAddress }
  | { type: "DELETE_ADDRESS"; payload: string }
  | { type: "HYDRATE_ADDRESSES"; payload: SavedAddress[] };

// ─── Initial state ────────────────────────────────────────────────────────────

const EMPTY_FORM: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  province: "",
  district: "",
  ward: "",
  addressDetail: "",
  note: "",
  saveAddress: false,
};

const INITIAL_STATE: CheckoutState = {
  step: "information",
  form: EMPTY_FORM,
  shippingMethodId: null,
  paymentMethodId: null,
  submitting: false,
  toast: null,
  hydrated: false,
  selectedAddressId: null,
  savedAddresses: [],
  addressesHydrated: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addressToFormPatch(
  addr: SavedAddress
): Partial<CheckoutFormValues> {
  return {
    fullName: addr.fullName,
    phone: addr.phone,
    email: addr.email,
    province: addr.province,
    district: addr.district,
    ward: addr.ward,
    addressDetail: addr.addressDetail,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.payload.field]: action.payload.value },
      };

    case "SET_STEP":
      return { ...state, step: action.payload };

    case "SET_SHIPPING":
      return { ...state, shippingMethodId: action.payload };

    case "SET_PAYMENT":
      return { ...state, paymentMethodId: action.payload };

    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };

    case "SET_TOAST":
      return { ...state, toast: action.payload };

    case "HYDRATE_FORM":
      return {
        ...state,
        form: { ...state.form, ...action.payload },
        hydrated: true,
      };

    case "SET_SELECTED_ADDRESS": {
      const id = action.payload;
      if (id === null) {
        // Deselect — clear form fields but keep note
        return {
          ...state,
          selectedAddressId: null,
          form: { ...EMPTY_FORM, note: state.form.note },
        };
      }
      const addr = state.savedAddresses.find((a) => a.id === id);
      if (!addr) return { ...state, selectedAddressId: id };
      return {
        ...state,
        selectedAddressId: id,
        form: { ...state.form, ...addressToFormPatch(addr) },
      };
    }

    case "ADD_ADDRESS": {
      const updated = [...state.savedAddresses, action.payload];
      return {
        ...state,
        savedAddresses: updated,
        selectedAddressId: action.payload.id,
        form: { ...state.form, ...addressToFormPatch(action.payload) },
      };
    }

    case "UPDATE_ADDRESS": {
      const updated = state.savedAddresses.map((a) =>
        a.id === action.payload.id ? action.payload : a
      );
      // If this was the selected address, re-patch form fields.
      const patch =
        state.selectedAddressId === action.payload.id
          ? addressToFormPatch(action.payload)
          : {};
      return {
        ...state,
        savedAddresses: updated,
        form: { ...state.form, ...patch },
      };
    }

    case "DELETE_ADDRESS": {
      const updated = state.savedAddresses.filter(
        (a) => a.id !== action.payload
      );
      const wasSelected = state.selectedAddressId === action.payload;
      return {
        ...state,
        savedAddresses: updated,
        selectedAddressId: wasSelected ? null : state.selectedAddressId,
        form: wasSelected
          ? { ...EMPTY_FORM, note: state.form.note }
          : state.form,
      };
    }

    case "HYDRATE_ADDRESSES":
      return {
        ...state,
        savedAddresses: action.payload,
        addressesHydrated: true,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface CheckoutContextValue {
  state: CheckoutState;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  setField: (field: keyof CheckoutFormValues, value: string | boolean) => void;
  setShipping: (id: string) => void;
  setPayment: (id: string) => void;
  goToStep: (step: CheckoutStep) => void;
  /** Returns true on success, false on failure. */
  submitOrder: () => Promise<boolean>;
  showToast: (message: string, type: "success" | "error") => void;
  selectAddress: (id: string | null) => void;
  addAddress: (addr: SavedAddress) => void;
  updateAddress: (addr: SavedAddress) => void;
  deleteAddress: (id: string) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const LS_KEY = "checkout_saved_address";
const LS_ADDRESSES_KEY = "checkout_saved_addresses";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CheckoutProvider({
  children,
  shippingMethods = [],
  paymentMethods = [],
  savedAddresses: initialSavedAddresses = [],
}: {
  children: ReactNode;
  shippingMethods?: ShippingMethod[];
  paymentMethods?: PaymentMethod[];
  savedAddresses?: SavedAddress[];
}) {
  const [state, dispatch] = useReducer(checkoutReducer, INITIAL_STATE);

  // Hydrate saved address form fields from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CheckoutFormValues>;
        dispatch({ type: "HYDRATE_FORM", payload: saved });
        return;
      }
    } catch {
      // ignore parse errors
    }
    dispatch({ type: "HYDRATE_FORM", payload: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once

  // Hydrate saved addresses — localStorage overrides prop (prop is the default).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ADDRESSES_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as SavedAddress[];
        if (Array.isArray(stored) && stored.length > 0) {
          dispatch({ type: "HYDRATE_ADDRESSES", payload: stored });
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    dispatch({ type: "HYDRATE_ADDRESSES", payload: initialSavedAddresses });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once

  // Persist address fields whenever saveAddress is true.
  useEffect(() => {
    if (!state.hydrated || !state.form.saveAddress) return;
    try {
      const { note: _note, saveAddress: _save, ...addressFields } = state.form;
      localStorage.setItem(LS_KEY, JSON.stringify(addressFields));
    } catch {
      // ignore storage errors
    }
  }, [state.form, state.hydrated]);

  // Persist saved addresses list whenever it changes (after first hydration).
  useEffect(() => {
    if (!state.addressesHydrated) return;
    try {
      localStorage.setItem(
        LS_ADDRESSES_KEY,
        JSON.stringify(state.savedAddresses)
      );
    } catch {
      // ignore storage errors
    }
  }, [state.savedAddresses, state.addressesHydrated]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const showToast = useCallback(
    (message: string, type: CheckoutToast["type"]) => {
      dispatch({ type: "SET_TOAST", payload: { message, type } });
    },
    []
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const setField = useCallback(
    (field: keyof CheckoutFormValues, value: string | boolean) => {
      dispatch({ type: "SET_FIELD", payload: { field, value } });
    },
    []
  );

  const setShipping = useCallback((id: string) => {
    dispatch({ type: "SET_SHIPPING", payload: id });
  }, []);

  const setPayment = useCallback((id: string) => {
    dispatch({ type: "SET_PAYMENT", payload: id });
  }, []);

  const goToStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const submitOrder = useCallback(async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      // Mock 1.5 s API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      // Success UX is handled by /checkout/success — no toast needed here.
      return true;
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
      return false;
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [showToast]);

  const selectAddress = useCallback((id: string | null) => {
    dispatch({ type: "SET_SELECTED_ADDRESS", payload: id });
  }, []);

  const addAddress = useCallback((addr: SavedAddress) => {
    dispatch({ type: "ADD_ADDRESS", payload: addr });
  }, []);

  const updateAddress = useCallback((addr: SavedAddress) => {
    dispatch({ type: "UPDATE_ADDRESS", payload: addr });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    dispatch({ type: "DELETE_ADDRESS", payload: id });
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        state,
        shippingMethods,
        paymentMethods,
        setField,
        setShipping,
        setPayment,
        goToStep,
        submitOrder,
        showToast,
        selectAddress,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}

      <ToastMessage
        isVisible={state.toast !== null}
        type={state.toast?.type ?? "success"}
        message={state.toast?.message ?? ""}
        position="top-right"
        duration={4000}
        onClose={() => dispatch({ type: "SET_TOAST", payload: null })}
      />
    </CheckoutContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside <CheckoutProvider>");
  return ctx;
}
