import { LinkedDescriptionImage } from "components/common/description-image/DescriptionImage";
import Link from "next/link";
import Stack from "components/common/Stack";
import styles from "components/signup/Signup.module.css";

export default function SignUp() {
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
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="flex-end"
              spacing={32}
            >
              <Link passHref href="/signup/business">
                <LinkedDescriptionImage
                  direction="column"
                  rowAlign="center"
                  src="https://res.cloudinary.com/hcory49pf/image/upload/v1616922337/signup/storefront.webp"
                  width={320}
                  spacing={12}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    width: 320,
                  }}
                >
                  <div style={{ width: 240 }}>
                    I'm a local business owner looking to reach more customers!
                  </div>
                </LinkedDescriptionImage>
              </Link>
              <Link passHref href="/signup/user">
                <LinkedDescriptionImage
                  direction="column"
                  rowAlign="center"
                  src="https://res.cloudinary.com/hcory49pf/image/upload/v1616922148/signup/customer.webp"
                  width={320}
                  spacing={12}
                  style={{
                    cursor: "pointer",
                    width: 320,
                    textAlign: "center",
                  }}
                >
                  <div style={{ width: 200 }}>
                    I'm a local looking to support local businesses!
                  </div>
                </LinkedDescriptionImage>
              </Link>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
}
