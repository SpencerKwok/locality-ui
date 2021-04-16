import React from "react";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import Stack from "../../common/components/Stack/Stack";
import LocalityForm from "../../common/components/Form";

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
  description?: string;
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
      {label && <LocalityForm.Label required>{label}</LocalityForm.Label>}
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
          <LocalityForm.Label required description={props.description}>
            Image URL or Image File
          </LocalityForm.Label>
          <LocalityForm.InputGroup>
            <FormControl
              aria-label="Image URL"
              aria-details="Enter image URL here"
              id={imageId}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
              value={typeof values[imageId] === "string" ? values[imageId] : ""}
            />
          </LocalityForm.InputGroup>
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
          <LocalityForm.ErrorMessage name={imageId} />
        </Form.Group>
      </Stack>
    </Stack>
  );
}

export default Image;
