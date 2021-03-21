import React, { useState } from "react";
import styled from "styled-components";
import Popup from "reactjs-popup";
import { Button } from "react-bootstrap";
import "reactjs-popup/dist/index.css";

import Stack from "../../../common/components/Stack/Stack";

const HelpButton = styled(Button)`
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 11px;
`;

const CloseButton = styled.button`
  cursor: pointer;
  position: absolute;
  display: block;
  padding: 2px 5px;
  line-height: 20px;
  right: -10px;
  top: -10px;
  font-size: 24px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #cfcece;
`;

export interface HelpProps extends React.HTMLProps<HTMLDivElement> {}

function Help(props: HelpProps) {
  return (
    <Popup trigger={<HelpButton>Need Help?</HelpButton>} modal>
      {(close: () => void) => (
        <div style={{ padding: 24 }}>
          <CloseButton onClick={close}>&times;</CloseButton>
          <Stack direction="column" rowAlign="center">
            <h1>FAQ</h1>
          </Stack>
          <Stack direction="column" rowAlign="flex-start">
            <h3>What is an "Image URL"?</h3>
            <p>
              An image URL is the URL that goes directly to the image you would
              like to use to display your product. You can get this URL by right
              clicking a picture on your website and selecting "Copy Image
              Location"
            </p>
            <h3>What is a "Link to Product"?</h3>
            <p>
              A product link is the URL that goes directly to your product on
              your website. This allows us to redirect people to your site.
            </p>
            <h3>What do I put in the description?</h3>
            <p>
              Any information that better explains what your product is! We use
              the description to help users find products that best match their
              search. Usually the product's description on your website is
              sufficient.
            </p>
          </Stack>
        </div>
      )}
    </Popup>
  );
}

export default Help;
