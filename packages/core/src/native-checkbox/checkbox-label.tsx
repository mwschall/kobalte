import { FormControlLabel, FormControlLabelProps } from "../form-control";
import { useCheckboxContext } from "./checkbox-context";

export type CheckboxLabelProps = FormControlLabelProps;

export function CheckboxLabel(props: CheckboxLabelProps) {
  const context = useCheckboxContext();

  return <FormControlLabel {...context.dataset()} {...props} />;
}
