import React from "react";
import styled from "styled-components";

import Stack from "../../common/components/Stack/Stack";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

function About(props: AboutProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ marginTop: 24 }}>
        <header>
          <Stack direction="column" rowAlign="center" style={{ marginTop: 24 }}>
            <h3>Chrome Extension Demo</h3>
          </Stack>
        </header>
        <main>
          <video width={Math.max(325, props.width * 0.6)} controls>
            <source
              src="https://res.cloudinary.com/hcory49pf/video/upload/v1615108481/demo/extension-v2.mp4"
              type="video/mp4"
            />
          </video>
          <h5 style={{ textAlign: "center" }}>
            Want your products on Locality? <a href="/signup">Click here</a> to
            sign up today!
          </h5>
        </main>
      </Stack>
    </Stack>
  );
}

export default About;
