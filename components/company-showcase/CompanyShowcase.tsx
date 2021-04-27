import React from "react";

import { BaseCompany } from "../common/Schema";
import CompanyImage from "../common/company-image/CompanyImage";
import Stack from "../common/Stack";
import { useWindowSize } from "../../lib/common";

export interface CompanyShowcaseProps {
  companies: Array<BaseCompany>;
}

function CompanyShowcase({ companies }: CompanyShowcaseProps) {
  const size = useWindowSize();
  if (!size.width) {
    return <div></div>;
  }

  const numPerRow = Math.floor((size.width * 0.9 + 24) / 150);
  const startIndices = Array.from(
    { length: Math.ceil(companies.length / numPerRow) },
    (_, i) => i * numPerRow
  );
  return (
    <Stack direction="column" rowAlign="center">
      {startIndices.map((startIndex) => {
        return (
          <Stack
            direction="row"
            columnAlign="flex-start"
            spacing={24}
            key={startIndex}
          >
            {(() => {
              const elements = Array<JSX.Element>();
              companies
                .slice(startIndex, startIndex + numPerRow)
                .forEach((company) => {
                  elements.push(
                    <a
                      href={company.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      <CompanyImage
                        name={company.name}
                        src={company.logo}
                        height={225}
                        width={126}
                      />
                    </a>
                  );
                });
              for (
                let i = 0;
                i < startIndex + numPerRow - companies.length;
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

export default CompanyShowcase;
