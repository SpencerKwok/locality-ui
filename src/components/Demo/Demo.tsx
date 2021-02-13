import React from "react";

import Stack from "../Stack/Stack";
import Window from "../../utils/window";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {}

function About(props: AboutProps) {
  const windowSize = Window();

  return (
    <Stack direction="horizontal" columnAlign="center">
      <Stack
        direction="vertical"
        rowAlign="center"
        style={{ marginTop: "24px" }}
      >
        <h3>Extension -&gt; Locality -&gt; Store</h3>
        <video width={windowSize.width * 0.8} controls>
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
