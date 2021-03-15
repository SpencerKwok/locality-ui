import React from "react";
import styled from "styled-components";
import { Form, FormControl } from "react-bootstrap";

import Stack from "../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  createFormErrorMessage,
} from "../../common/components/Form/Form";

export function toBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export interface ImageProps extends React.HTMLProps<HTMLDivElement> {
  handleBlur: {
    (e: React.FocusEvent<any>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  alt: string;
  imageId: string;
  values: { [field: string]: any };
}

const StyledPicture = styled.picture`
  display: flex;
  overflow: hidden;
`;

function Image(props: ImageProps) {
  const {
    handleBlur,
    handleChange,
    setFieldValue,
    alt,
    imageId,
    label,
    values,
  } = props;
  return (
    <Stack direction="column">
      {label && <FormLabel>{label}</FormLabel>}
      <Stack direction="column" spacing={12}>
        <div
          style={{
            alignItems: "center",
            border: "1px solid #449ed7",
            display: "flex",
            justifyContent: "center",
            height: 225,
            overflow: "hidden",
            width: 175,
          }}
        >
          {(() => {
            let image = values[imageId];
            try {
              const tempUrl = URL.createObjectURL(image);
              return (
                <StyledPicture>
                  <img src={tempUrl} alt={alt} width={175} />
                </StyledPicture>
              );
            } catch (err) {}
            return (
              <StyledPicture>
                {image !== undefined && (
                  <React.Fragment>
                    <source srcSet={image} type="image/webp" />
                    <img
                      src={image.replace(".webp", ".jpg")}
                      alt={alt}
                      width={175}
                    />
                  </React.Fragment>
                )}
              </StyledPicture>
            );
          })()}
        </div>
        <Form.Group>
          <FormLabel>Image URL or Image File</FormLabel>
          <FormInputGroup size="md" width="100%">
            <FormControl
              aria-label="Large"
              id={imageId}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
              value={typeof values[imageId] === "string" ? values[imageId] : ""}
            />
          </FormInputGroup>
          <Form.File
            onBlur={handleBlur}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (event.target.files && event.target.files.length > 0) {
                setFieldValue(imageId, event.target.files[0], true);
              } else {
                setFieldValue(imageId, "", true);
              }
            }}
          />
          {createFormErrorMessage(imageId)}
        </Form.Group>
      </Stack>
    </Stack>
  );
}

export default Image;
