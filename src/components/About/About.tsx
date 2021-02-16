import React from "react";

import Stack from "../Stack/Stack";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {}

function About(props: AboutProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ marginTop: 24 }}>
        <header>
          <h1>About us</h1>
        </header>
        <main style={{ width: "100%", maxWidth: 448, padding: 24 }}>
          <p>
            Locality aims to seamlessly integrate locally owned small businesses
            into the day-to-day lives of ordinary people by creating a search
            tool that connects locals with local products.
          </p>
        </main>
      </Stack>
    </Stack>
  );
}

export default About;
