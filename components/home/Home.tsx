import React from "react";

import { BaseCompany } from "../common/Schema";
import CompanyShowcase from "../company-showcase/CompanyShowcase";
import Search from "../search/Search";
import Stack from "../common/Stack";

interface HomeProps {
  companies: Array<BaseCompany>;
  isNewUser: boolean;
}

export default function Home({ companies, isNewUser }: HomeProps) {
  return (
    <div>
      <Search />
      <div>
        <Stack
          direction="column"
          rowAlign="center"
          style={{ marginTop: 16, padding: 16 }}
        >
          <h3>Check out these recently added local businesses!</h3>
          <h5>
            Want to showcase your business? <a href="/signup">Click here</a> to
            sign up today!
          </h5>
        </Stack>
        <Stack
          direction="row"
          columnAlign="center"
          style={{ margin: "0px auto 0px auto" }}
        >
          <Stack direction="column" rowAlign="center">
            <CompanyShowcase
              companies={companies.sort((a, b) => b.id - a.id)}
            />
          </Stack>
        </Stack>
      </div>
    </div>
  );
}