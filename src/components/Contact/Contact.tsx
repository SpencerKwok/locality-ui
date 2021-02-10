import React from "react";

import Stack from "../Stack/Stack";

export interface ContactProps extends React.HTMLProps<HTMLDivElement> {}

function Contact(props: ContactProps) {
  return (
    <Stack direction="horizontal" columnAlign="center">
      <div style={{ width: 400 }}>
        <Stack
          direction="vertical"
          rowAlign="center"
          style={{ marginTop: "24px" }}
        >
          <p>
            If you would like to add your products on Locality, please send us
            an email at{" "}
            <a href="mailto:locality.info@yahoo.com">locality.info@yahoo.com</a>
          </p>
        </Stack>
      </div>
    </Stack>
  );
}

export default Contact;
