import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { Session } from "next-auth";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import { WishListResponse } from "../../common/Schema";
import WishlistPage from "../../components/wishlist/WishList";
import RootLayout from "../../components/common/RootLayout";

interface WishListProps {
  wishlist: WishListResponse;
  session: Session | null;
}

function onToggleWishList(objectId: string, value: boolean) {
  if (value) {
    return PostRpcClient.getInstance().call("AddToWishList", {
      id: objectId,
    });
  } else {
    return PostRpcClient.getInstance().call("DeleteFromWishList", {
      id: objectId,
    });
  }
}

function fetcher(url: string, cookie?: string) {
  return GetRpcClient.getInstance().call("WishList", url, { cookie });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie || "";
  const session = await getSession(context);
  const wishlist = await fetcher("/api/wishlist/get", cookie);

  return {
    props: { wishlist, session },
  };
};

export default function WishList({ wishlist, session }: WishListProps) {
  const router = useRouter();

  if (typeof window !== "undefined" && !session) {
    router.push("/");
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
}
