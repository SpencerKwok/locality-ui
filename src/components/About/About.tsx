import React from "react";
import styled from "styled-components";

import Stack from "../../common/components/Stack/Stack";
import DescriptionImage from "../../common/components/Image/DescriptionImage";

export interface AboutProps extends React.HTMLProps<HTMLDivElement> {}

const StyledStack = styled(Stack)`
  margin-top: 24px;
  padding: 12px;
  width: ${({ width }) => width}px;
  min-width: 570px;
  max-width: 1000px;
`;

function About(props: AboutProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <StyledStack direction="column" rowAlign="center" spacing={64}>
        <header>
          <h1>About Us</h1>
        </header>
        <main>
          <DescriptionImage
            alt="Keeping the local connection"
            columnAlign="center"
            direction="row"
            spacing={24}
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1613521665/about/keeping-the-local-connection.jpg"
            rowAlign="center"
            width={300}
          >
            <h2>Keeping the local connection</h2>
            <p>
              Locality is the online marketplace for high quality local goods.
              It’s home to a range of everyday items, special gifts, and
              extraordinary finds, all of which might be found in your local
              community.
            </p>
            <p>
              In a time of global retailers, it’s our mission to keep locally
              owned small businesses at the heart of commerce. That’s why we
              built a platform that empowers them to thrive and succeed. We help
              our business communities connect with buyers looking for a more
              local, personal, and unique touch.
            </p>
          </DescriptionImage>
          <DescriptionImage
            alt="How it works"
            columnAlign="center"
            direction="row-reverse"
            spacing={24}
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1613503266/about/how-it-works.jpg"
            rowAlign="center"
            width={300}
          >
            <h2>How Locality Works</h2>
            <p>
              Our marketplace is a vibrant community of real people connecting
              over special goods. Whether your business is well-known or just
              beginning, the platform will empower you to do what you love and
              get your products in front of the right people. For buyers, we
              will help you find what you are looking for from a local source
              that leaves a positive social, environmental, or ethical impact.
            </p>
          </DescriptionImage>
          <DescriptionImage
            alt="Rise up and sell"
            columnAlign="center"
            direction="row"
            spacing={24}
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1613503277/about/rise-up-and-sell.png"
            rowAlign="center"
            width={300}
          >
            <h2>Rise Up and Sell</h2>
            <p>
              We help locally owned small businesses increase revenue and stay
              competitive against big box retailers while incurring little costs
              (all services are currently free) and minimal risks. Want to be a
              Locality lister? All it takes is one (insert photo dimensions
              here) photo to get started.
            </p>
          </DescriptionImage>
          <DescriptionImage
            alt="Buy with purpose"
            columnAlign="center"
            direction="row-reverse"
            spacing={24}
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1613521506/about/buy-with-purpose.png"
            rowAlign="center"
            width={300}
          >
            <h2>Buy with Purpose</h2>
            <p>
              Our search tool helps buyers explore local offerings without
              having to change their current search habits. Find out what causes
              you are helping to support in your own community or another’s with
              each purchase.
            </p>
          </DescriptionImage>
        </main>
      </StyledStack>
    </Stack>
  );
}

export default About;
