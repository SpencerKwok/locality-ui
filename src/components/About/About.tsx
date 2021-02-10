import React from "react";

import Stack from "../Stack/Stack";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {}

function About(props: AboutProps) {
  return (
    <Stack direction="horizontal" columnAlign="center">
      <div style={{ width: 400 }}>
        <Stack
          direction="vertical"
          rowAlign="center"
          style={{ marginTop: "24px" }}
        >
          <h1>About us</h1>
          <p>
            Locality aims to seamlessly integrate locally owned small businesses
            into the day-to-day lives of ordinary people by creating a search
            tool that connects locals with local products.
          </p>
        </Stack>
      </div>
    </Stack>
  );
}

export default About;
