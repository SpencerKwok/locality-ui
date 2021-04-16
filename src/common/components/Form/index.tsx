import React from "react";
import FormButton, { FormButtonProps } from "./Button/Button";
import FormCharacterLimit, {
  FormCharacterLimitProps,
} from "./CharacterLimit/CharacterLimit";
import FormErrorMessage, {
  FormErrorMessageProps,
} from "./ErrorMessage/ErrorMessage";
import FormInputGroup, { FormInputGroupProps } from "./InputGroup/InputGroup";
import FormLabel, { FormLabelProps } from "./Label/Label";

const LocalityForm = {
  Button: (props: FormButtonProps) => <FormButton {...props} />,
  CharacterLimit: (props: FormCharacterLimitProps) => (
    <FormCharacterLimit {...props} />
  ),
  ErrorMessage: (props: FormErrorMessageProps) => (
    <FormErrorMessage {...props} />
  ),
  InputGroup: (props: FormInputGroupProps) => <FormInputGroup {...props} />,
  Label: (props: FormLabelProps) => <FormLabel {...props} />,
};

export default LocalityForm;
