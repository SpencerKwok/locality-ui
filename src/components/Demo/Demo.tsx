import React from "react";

import Stack from "../Stack/Stack";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {}

function About(props: AboutProps) {
  return (
    <Stack direction="horizontal" columnAlign="center">
      <Stack
        direction="vertical"
        rowAlign="center"
        style={{ marginTop: "24px" }}
      >
        <h1>Extension -&gt; Locality -&gt; Store</h1>
        <video controls>
          <source
            src="https://res.cloudinary.com/hcory49pf/video/upload/v1613117563/demo/extension-demo.mp4"
            type="video/mp4"
          />
        </video>
      </Stack>
    </Stack>
  );
}

export default About;
