import {
  mergeDefaultProps,
  mergeRefs,
  OverrideComponentProps,
  ValidationState,
} from "@kobalte/utils";
import { Accessor, createMemo, createUniqueId, splitProps } from "solid-js";

import { createFormControl, FORM_CONTROL_PROP_NAMES, FormControlContext } from "../form-control";
import { AsChildProp, Polymorphic } from "../polymorphic";
import { createFormResetListener, createToggleState } from "../primitives";
import { CheckboxContext, CheckboxContextValue, CheckboxDataSet } from "./checkbox-context";

export interface CheckboxRootOptions extends AsChildProp {
  /** The controlled checked state of the checkbox. */
  checked?: boolean;

  /**
   * The default checked state when initially rendered.
   * Useful when you do not need to control the checked state.
   */
  defaultChecked?: boolean;

  /** Event handler called when the checked state of the checkbox changes. */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is in an indeterminate state.
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  indeterminate?: boolean;

  /**
   * The value of the checkbox, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;

  /**
   * The name of the checkbox, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: string;

  /** Whether the checkbox should display its "valid" or "invalid" visual styling. */
  validationState?: ValidationState;

  /** Whether the user must check the checkbox before the owning form can be submitted. */
  required?: boolean;

  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  /** Whether the checkbox is read only. */
  readOnly?: boolean;

  // /**
  //  * The children of the checkbox.
  //  * Can be a `JSX.Element` or a _render prop_ for having access to the internal state.
  //  */
  // children?: JSX.Element | ((state: CheckboxRootState) => JSX.Element);
}

export interface CheckboxRootProps extends OverrideComponentProps<"div", CheckboxRootOptions> {}

export function CheckboxRoot(props: CheckboxRootProps) {
  let ref: HTMLDivElement | undefined;

  const defaultId = `checkbox-${createUniqueId()}`;

  props = mergeDefaultProps(
    {
      value: "on",
      id: defaultId,
    },
    props
  );

  const [local, formControlProps, others] = splitProps(
    props,
    [
      "ref",
      "children",
      "value",
      "checked",
      "defaultChecked",
      "indeterminate",
      "onChange",
      "onPointerDown",
    ],
    FORM_CONTROL_PROP_NAMES
  );

  const { formControlContext } = createFormControl(formControlProps);

  const state = createToggleState({
    isSelected: () => local.checked,
    defaultIsSelected: () => local.defaultChecked,
    onSelectedChange: selected => local.onChange?.(selected),
    isDisabled: () => formControlContext.isDisabled(),
    isReadOnly: () => formControlContext.isReadOnly(),
  });

  createFormResetListener(
    () => ref,
    () => state.setIsSelected(local.defaultChecked ?? false)
  );

  const dataset: Accessor<CheckboxDataSet> = createMemo(() => ({
    "data-checked": state.isSelected() ? "" : undefined,
    "data-indeterminate": local.indeterminate ? "" : undefined,
  }));

  const context: CheckboxContextValue = {
    value: () => local.value!,
    dataset,
    checked: () => state.isSelected(),
    indeterminate: () => local.indeterminate ?? false,
    setIsChecked: isChecked => state.setIsSelected(isChecked),
  };

  return (
    <FormControlContext.Provider value={formControlContext}>
      <CheckboxContext.Provider value={context}>
        <Polymorphic
          fallback="div"
          ref={mergeRefs(el => (ref = el), local.ref)}
          // role="group"
          {...dataset()}
          {...others}
        />
      </CheckboxContext.Provider>
    </FormControlContext.Provider>
  );
}
