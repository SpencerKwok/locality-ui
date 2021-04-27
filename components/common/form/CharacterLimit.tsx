import React from "react";

export interface FormCharacterLimitProps {
  message: string;
  maxCharacters: number;
}

function FormCharacterLimit({
  message,
  maxCharacters,
}: FormCharacterLimitProps) {
  return (
    <div
      style={{
        textAlign: "right",
        color: message.length > maxCharacters ? "red" : "black",
      }}
    >{`${message.length}/${maxCharacters}`}</div>
  );
}

export default FormCharacterLimit;
