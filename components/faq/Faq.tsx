import Link from "next/link";

import FaqComponent from "components/faq/FaqComponent";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";

import type { FC } from "react";

interface FaqProps {}

const Faq: FC<FaqProps> = ({}) => {
  return (
    <ThemeContext.Consumer>
      {({ size }): JSX.Element => (
        <Stack
          direction="column"
          rowAlign="center"
          style={{ marginTop: 24, marginBottom: 24 }}
        >
          <h1 style={{ marginBottom: 36, marginTop: 24 }}>
            {size.width > 600 ? "Frequently Asked Questions" : "FAQ"}
          </h1>
          <Stack direction="column" rowAlign="center" spacing={24}>
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="flex-start"
              wrap="wrap"
              spacing={24}
              style={{
                marginLeft: 24,
                width: Math.min(1008, size.width * 0.9),
              }}
            >
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="What is Locality?"
                answer={[
                  "Locality provides a search tool and online marketplace for local products.",
                  "We redirect buying from large retailers such as Amazon to locally owned small businesses instead.",
                  "You can think of us as Honey but instead of finding discounts, we find you local products.",
                ]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="Is Locality only available in British Columbia?"
                answer={[
                  "At the moment, we only list businesses and products that are based in British Columbia.",
                  <div>
                    Register{" "}
                    <Link href="/signup/user">
                      <a>here</a>
                    </Link>{" "}
                    to be notified if we expand to your region!
                  </div>,
                ]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="What does Locality cost?"
                answer={["Everything is free! No hidden fees of any kind"]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="How does Locality make money?"
                answer={[
                  "Currently, we don’t make any revenue. If we introduce a pricing structure, we will be fully communicative and transparent about it.",
                ]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="How do I add my business and products to Locality?"
                answer={[
                  <div>
                    You can sign up and begin to do so{" "}
                    <Link href="/signup/business">
                      <a>here</a>
                    </Link>
                    !
                  </div>,
                ]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="Is my business eligible to be added to Locality?"
                answer={[
                  <div>
                    <div>Our criteria:</div>
                    <ol style={{ margin: 0 }}>
                      <li>BC-based</li>
                      <li>
                        Locally owned small business (even if you’re a 1 person
                        show we’d love to have you!)
                      </li>
                    </ol>
                  </div>,
                ]}
              />
              <FaqComponent
                style={{
                  marginBottom: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
                question="Where can I contact you further?"
                answer={[
                  <div>
                    You can reach us at{" "}
                    <a href="mailto:locality.info@yahoo.com">
                      locality.info@yahoo.com
                    </a>{" "}
                    and we’ll respond within 24 hours
                  </div>,
                ]}
              />
              <div
                style={{
                  marginBottom: 24,
                  marginRight: 24,
                  width: size.width > 600 ? 480 : size.width * 0.8,
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default Faq;
