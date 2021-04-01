import React, { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { Redirect } from "react-router-dom";

import ProductImage from "../../common/components/Image/ProductImage/ProductImage";
import { Product } from "../../common/rpc/Schema";
import Stack from "../../common/components/Stack/Stack";
import WishListDAO from "./WishListDAO";

export interface WishListProps extends React.HTMLProps<HTMLDivElement> {}

function WishList(props: WishListProps) {
  const [hits, setHits] = useState<Array<Product>>([]);
  const username = Cookie.get("username");
  if (!username) {
    window.location.href = "/";
    return <Redirect to="/" />;
  }

  useEffect(() => {
    (async () => {
      await WishListDAO.getInstance()
        .wishlist({})
        .then(({ error, products }) => {
          if (error) {
            console.log(error);
          } else if (products) {
            setHits(products);
          }
        });
    })();
  }, []);

  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ padding: "12px 0px 0px 12px" }}
    >
      <h1>My Wish List</h1>
      <Stack direction="row" columnAlign="flex-start" wrap="wrap" spacing={12}>
        {hits.map((hit) => {
          return (
            <Stack direction="column" rowAlign="center">
              <ProductImage
                alwaysHover
                wishlist
                company={hit.company}
                link={hit.link}
                name={hit.name}
                priceRange={hit.priceRange}
                src={hit.image}
                objectId={hit.objectID}
                onClick={() => {
                  console.log("hi");
                }}
                style={{ maxWidth: 175, marginBottom: 12 }}
              />
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default WishList;
