import { BaseBusiness } from "common/Schema";
import BusinessImage from "components/common/business-image/BusinessImage";
import Stack from "components/common/Stack";

import type { FC } from "react";

export interface BusinessShowcaseProps {
  businesses: Array<BaseBusiness>;
  width: number;
}

const BusinessShowcase: FC<BusinessShowcaseProps> = ({ businesses, width }) => {
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
            {((): Array<JSX.Element> => {
              const elements = Array<JSX.Element>();
              businesses
                .slice(startIndex, startIndex + numPerRow)
                .forEach((business): void => {
                  elements.push(
                    <a
                      href={business.homepages.homepage}
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
};

export default BusinessShowcase;
