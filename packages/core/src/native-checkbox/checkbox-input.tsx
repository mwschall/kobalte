import { callHandler, mergeDefaultProps, mergeRefs, OverrideComponentProps } from "@kobalte/utils";
import { createEffect, JSX, on, splitProps } from "solid-js";

import {
  createFormControlField,
  FORM_CONTROL_FIELD_PROP_NAMES,
  useFormControlContext,
} from "../form-control";
import { AsChildProp, Polymorphic } from "../polymorphic";
import { useCheckboxContext } from "./checkbox-context";

export interface CheckboxInputProps extends OverrideComponentProps<"input", AsChildProp> {}

/**
 * The native html input of the checkbox.
 */
export function CheckboxInput(props: CheckboxInputProps) {
  return <CheckboxInputBase type="checkbox" {...props} />;
}

export function CheckboxInputBase(props: CheckboxInputProps) {
  let ref: HTMLInputElement | undefined;

  const formControlContext = useFormControlContext();
  const context = useCheckboxContext();

  props = mergeDefaultProps(
    {
      id: formControlContext.generateId("input"),
    },
    props
  );

  const [local, formControlFieldProps, others] = splitProps(
    props,
    ["ref", "onChange"],
    FORM_CONTROL_FIELD_PROP_NAMES
  );

  const { fieldProps } = createFormControlField(formControlFieldProps);

  const onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = e => {
    callHandler(e, local.onChange);

    e.stopPropagation();

    const target = e.target as HTMLInputElement;

    context.setIsChecked(target.checked);

    // Unlike in React, inputs `checked` state can be out of sync with our toggle state.
    // for example a readonly `<input type="checkbox" />` is always "checkable".
    //
    // Also, even if an input is controlled (ex: `<input type="checkbox" checked={isChecked} />`,
    // clicking on the input will change its internal `checked` state.
    //
    // To prevent this, we need to force the input `checked` state to be in sync with the toggle state.
    target.checked = context.checked();
  };

  // indeterminate is a property, but it can only be set via javascript
  // https://css-tricks.com/indeterminate-checkboxes/
  // Unlike in React, inputs `indeterminate` state can be out of sync with our.
  // Clicking on the input will change its internal `indeterminate` state.
  // To prevent this, we need to force the input `indeterminate` state to be in sync with our.
  createEffect(
    on(
      [() => ref, () => context.indeterminate(), () => context.checked()],
      ([ref, indeterminate]) => {
        if (ref) {
          ref.indeterminate = !!indeterminate;
        }
      }
    )
  );

  return (
    <Polymorphic
      fallback="input"
      ref={mergeRefs(el => (ref = el), local.ref)}
      id={fieldProps.id()}
      name={formControlContext.name()}
      value={context.value()}
      checked={context.checked()}
      required={formControlContext.isRequired()}
      disabled={formControlContext.isDisabled()}
      readonly={formControlContext.isReadOnly()}
      aria-label={fieldProps.ariaLabel()}
      aria-labelledby={fieldProps.ariaLabelledBy()}
      aria-describedby={fieldProps.ariaDescribedBy()}
      aria-invalid={formControlContext.validationState() === "invalid" || undefined}
      aria-required={formControlContext.isRequired() || undefined}
      aria-disabled={formControlContext.isDisabled() || undefined}
      aria-readonly={formControlContext.isReadOnly() || undefined}
      onChange={onChange}
      {...formControlContext.dataset()}
      {...context.dataset()}
      {...others}
    />
  );
}
