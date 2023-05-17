import { Accessor, createContext, useContext } from "solid-js";

import type { CheckboxDataSet } from "../checkbox/checkbox-context";

export type { CheckboxDataSet };

export interface CheckboxContextValue {
  // name: Accessor<string | undefined>;
  value: Accessor<string>;
  dataset: Accessor<CheckboxDataSet>;
  checked: Accessor<boolean>;
  indeterminate: Accessor<boolean>;
  setIsChecked: (isChecked: boolean) => void;
  // setIsFocused: (isFocused: boolean) => void;
}

export const CheckboxContext = createContext<CheckboxContextValue>();

export function useCheckboxContext() {
  const context = useContext(CheckboxContext);

  if (context === undefined) {
    throw new Error("[kobalte]: `useCheckboxContext` must be used within a `Checkbox` component");
  }

  return context;
}
