import React from "react";

import Stack from "../../common/components/Stack/Stack";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

function About(props: AboutProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ marginTop: 24 }}>
        <header>
          <h3 style={{ paddingLeft: 24, paddingRight: 24 }}>
            Extension -&gt; Locality -&gt; Store
          </h3>
        </header>
        <main>
          <video width={props.width * 0.8} controls>
            <source
              src="https://res.cloudinary.com/hcory49pf/video/upload/v1613461638/demo/extension.mp4"
              type="video/mp4"
            />
          </video>
        </main>
      </Stack>
    </Stack>
  );
}

export default About;
