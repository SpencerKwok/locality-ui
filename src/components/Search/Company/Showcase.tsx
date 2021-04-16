import React, { useEffect, useState } from "react";

import ShowcaseDAO from "./ShowcaseDAO";
import Stack from "../../../common/components/Stack/Stack";
import { BaseCompany } from "../../../common/rpc/Schema";
import CompanyImage from "../../../common/components/Image/CompanyImage";

export interface CompanyShowcaseProps extends React.HTMLProps<HTMLDivElement> {}

function CompanyShowcase(props: CompanyShowcaseProps) {
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);

  useEffect(() => {
    (() => {
      ShowcaseDAO.getInstance()
        .companies({})
        .then(({ error, companies }) => {
          if (error) {
            console.log(error);
          } else if (companies) {
            companies.sort((a, b) => b.id - a.id);
            setCompanies(companies);
          }
        })
        .catch((err) => console.log(err));
    })();
  }, []);

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <h5 style={{ marginBottom: 16 }}>
        Want to showcase your business? <a href="/signup">Click here</a> to sign
        up today!
      </h5>
      <h3>Check out these recently added local businesses!</h3>

      <Stack
        direction="row"
        columnAlign="flex-start"
        rowAlign="center"
        spacing={12}
        wrap="wrap"
      >
        {companies.map((company) => (
          <a
            href={company.homepage}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "black" }}
          >
            <CompanyImage
              name={company.name}
              src={company.logo}
              style={{ maxWidth: 128, marginBottom: 12 }}
              width={128}
            />
          </a>
        ))}
      </Stack>
    </Stack>
  );
}

export default CompanyShowcase;
