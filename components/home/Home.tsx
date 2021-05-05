import React from "react";
import dynamic from "next/dynamic";

import { BaseBusiness } from "../common/Schema";
import BusinessShowcase from "./BusinessShowcase";
import Search from "../search/Search";
import Stack from "../common/Stack";

const NewUser = dynamic(() => import("../common/popups/NewUser"));

interface HomeProps {
  businesses: Array<BaseBusiness>;
  isNewUser: boolean;
  width: number;
}

export default function Home({ businesses, isNewUser, width }: HomeProps) {
  return (
    <div>
      {isNewUser && <NewUser />}
      <Search width={width * 0.6} />
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
          <BusinessShowcase
            businesses={businesses.sort((a, b) => b.id - a.id)}
            width={width}
          />
        </Stack>
      </Stack>
    </div>
  );
}
