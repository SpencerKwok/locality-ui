import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import Popup from "reactjs-popup";
import { Button } from "react-bootstrap";

import AddProductDAO from "./AddProductDAO";
import { BaseProduct } from "../../../../common/rpc/Schema";
import Stack from "../../../../common/components/Stack/Stack";

export interface AddProductProps extends React.HTMLProps<HTMLDivElement> {
  companyId: number;
  onAddProduct: () => void;
  onShopifyUpload: (products: Array<BaseProduct>) => void;
}

const fadeIn = keyframes`
  0% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
`;

const rotate = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const checkIcon = keyframes`
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: 28px;
    opacity: 1;
  }
  40% {
    height: 56px;
    width: 28px;
    opacity: 1;
  }
  100% {
    height: 56px;
    width: 28px;
    opacity: 1;
  }
`;

const CircularBorder = styled.div`
  position: relative;
  height: 125px;
  width: 125px;
  display: inline-block;
  border: 4px solid #449ed7;
  border-radius: 50%;
  animation: ${fadeIn} 0.8s ease;
`;

const AnimatedCircularBorder = styled.div`
  position: relative;
  height: 125px;
  width: 125px;
  display: inline-block;
  border: 4px solid #ffffff;
  border-radius: 50%;
  border-left-color: #449ed7;
  animation: ${rotate} 1.2s linear infinite;
`;

const Checkmark = styled.div`
  position: absolute;
  content: "";
  top: 50%;
  left: 28px;
  transform: scaleX(-1) rotate(135deg);
  height: 56px;
  width: 28px;
  border-top: 4px solid #449ed7;
  border-right: 4px solid #449ed7;
  transform-origin: left top;
  animation: ${checkIcon} 0.8s ease;
`;

const StyledButton = styled(Button)`
  background-color: #449ed7;
  border-color: #449ed7;

  &:link,
  &:visited,
  &:focus {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }

  &:hover,
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

function AddProduct(props: AddProductProps) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const uploadFromShopify = async () => {
    setError("");
    setSubmitting(true);
    setOpen(true);
    await AddProductDAO.getInstance()
      .shopifyProductUpdate({ id: props.companyId })
      .then(({ error, products }) => {
        if (error) {
          setError(error.message);
        } else if (products) {
          props.onShopifyUpload(products);
          setTimeout(() => setOpen(false), 2000);
        }
        setSubmitting(false);
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
        setTimeout(() => setOpen(false), 2000);
      });
  };

  return (
    <Stack direction="row" columnAlign="flex-start" spacing={12}>
      <Popup
        modal
        closeOnDocumentClick={error !== ""}
        closeOnEscape={error !== ""}
        open={open}
        trigger={<StyledButton>Upload from Shopify</StyledButton>}
        onOpen={uploadFromShopify}
        onClose={() => setOpen(false)}
      >
        {() => (
          <Stack
            direction="column"
            columnAlign="center"
            rowAlign="center"
            height={400}
            style={{ margin: 24 }}
          >
            {error ? (
              <p color="color:red;">{error}</p>
            ) : submitting ? (
              <Stack direction="column" rowAlign="center" spacing={64}>
                <h3>Uploading Shopify data...</h3>
                <AnimatedCircularBorder />
              </Stack>
            ) : (
              <Stack direction="column" rowAlign="center" spacing={64}>
                <h3>Upload complete!</h3>
                <CircularBorder>
                  <Checkmark />
                </CircularBorder>
              </Stack>
            )}
          </Stack>
        )}
      </Popup>
      <StyledButton onClick={props.onAddProduct}>Add Product</StyledButton>
    </Stack>
  );
}

export default AddProduct;
