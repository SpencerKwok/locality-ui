import styled from "styled-components";
import InputGroup, { InputGroupProps } from "react-bootstrap/InputGroup";

export interface FormInputGroupProps extends InputGroupProps {}

const FormInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  width: 100%;
`;

export default FormInputGroup;
