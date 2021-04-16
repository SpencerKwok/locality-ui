import React from "react";
import SearchClearButton, {
  SearchClearButtonProps,
} from "./ClearButton/ClearButton";
import SearchInputGroup, {
  SearchInputGroupProps,
} from "./InputGroup/InputGroup";
import SearchSubmitButton, {
  SearchSubmitButtonProps,
} from "./SubmitButton/SubmitButton";

const LocalitySearch = {
  ClearButton: (props: SearchClearButtonProps) => (
    <SearchClearButton {...props} />
  ),
  InputGroup: (props: SearchInputGroupProps) => <SearchInputGroup {...props} />,
  SubmitButton: (props: SearchSubmitButtonProps) => (
    <SearchSubmitButton {...props} />
  ),
};

export default LocalitySearch;
