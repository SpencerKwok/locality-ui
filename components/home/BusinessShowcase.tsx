import React from "react";

import { BaseBusiness } from "../common/Schema";
import BusinessImage from "../common/business-image/BusinessImage";
import Stack from "../common/Stack";

export interface BusinessShowcaseProps {
  businesses: Array<BaseBusiness>;
  width: number;
}

export default function BusinessShowcase({
  businesses,
  width,
}: BusinessShowcaseProps) {
  const numPerRow = Math.floor((width + 24) / 150);
  const startIndices = Array.from(
    { length: Math.ceil(businesses.length / numPerRow) },
    (_, i) => i * numPerRow
  );
  return (
    <Stack direction="column" rowAlign="center">
      {startIndices.map((startIndex, index) => {
        return (
          <Stack
            direction="row"
            columnAlign="flex-start"
            spacing={24}
            key={startIndex}
          >
            {(() => {
              const elements = Array<JSX.Element>();
              businesses
                .slice(startIndex, startIndex + numPerRow)
                .forEach((business) => {
                  elements.push(
                    <a
                      href={business.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      <BusinessImage
                        name={business.name}
                        src={business.logo}
                        height={225}
                        width={126}
                        loading={index <= 1 ? "eager" : "lazy"}
                      />
                    </a>
                  );
                });
              for (
                let i = 0;
                i < startIndex + numPerRow - businesses.length;
                ++i
              ) {
                elements.push(
                  <div style={{ display: "block", height: 225, width: 126 }} />
                );
              }

              return elements.map((element, index) => (
                <div key={`${startIndex}_${index}`}>{element}</div>
              ));
            })()}
          </Stack>
        );
      })}
    </Stack>
  );
}
