import Link from "next/link";
import Stack from "components/common/Stack";
import styles from "components/signup/Signup.module.css";

import type { FC } from "react";

const SignUp: FC<{}> = () => {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
        <h1>Sign Up</h1>
        <Stack
          className={styles.fadein}
          direction="column"
          rowAlign="center"
          spacing={16}
        >
          <Stack direction="row" columnAlign="center">
            <h4>What describes you best?</h4>
          </Stack>
          <div>
            <Stack direction="column" rowAlign="center" spacing={16}>
              <Link passHref href="/signup/business">
                <button className={styles.signin}>
                  I'm a local business owner looking to reach more customers!
                </button>
              </Link>
              <Link passHref href="/signup/user">
                <button className={styles.signin}>
                  I'm a local looking to support local businesses!
                </button>
              </Link>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SignUp;
