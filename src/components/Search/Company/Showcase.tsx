import React, { useEffect, useState } from "react";

import ShowcaseDAO from "./ShowcaseDAO";
import Stack from "../../../common/components/Stack/Stack";
import { BaseCompany } from "../../../common/rpc/Schema";
import CompanyImage from "../../../common/components/Image/CompanyImage";

export interface CompanyShowcaseProps extends React.HTMLProps<HTMLDivElement> {}

function CompanyShowcase(props: CompanyShowcaseProps) {
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);

  useEffect(() => {
    (async () => {
      await ShowcaseDAO.getInstance()
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
      <h3>Check out these recently added local businesses!</h3>
      <h6>
        Want to showcase your business? <a href="/signup">Click here</a> to sign
        up today!
      </h6>
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
