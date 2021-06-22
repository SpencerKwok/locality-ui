import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { Session } from "next-auth";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "components/common/RpcClient";
import { WishListResponse } from "common/Schema";
import WishlistPage from "components/wishlist/WishList";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";

interface WishListProps {
  wishlist: WishListResponse;
  session: Session | null;
}

function onToggleWishList(objectId: string, value: boolean): void {
  if (value) {
    void PostRpcClient.getInstance().call("AddToWishList", {
      id: objectId,
    });
  } else {
    void PostRpcClient.getInstance().call("DeleteFromWishList", {
      id: objectId,
    });
  }
}

async function fetcher(
  url: string,
  cookie?: string
): Promise<WishListResponse> {
  return GetRpcClient.getInstance().call("WishList", url, { cookie });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie;
  const session = await getSession(context);
  const wishlist = await fetcher("/api/wishlist/get", cookie);

  return {
    props: { wishlist, session },
  };
};

const WishList: FC<WishListProps> = ({ wishlist, session }) => {
  const router = useRouter();

  if (typeof window !== "undefined" && !session) {
    void router.push("/");
    return null;
  }

  return (
    <RootLayout session={session}>
      <WishlistPage
        products={wishlist.products}
        onToggleWishList={onToggleWishList}
      />
    </RootLayout>
  );
};

export default WishList;
