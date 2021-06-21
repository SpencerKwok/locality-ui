import Heart from "components/common/images/Heart";
import Popup from "reactjs-popup";
import styles from "components/common/product-image/ProductImage.module.css";
import "reactjs-popup/dist/index.css";

export interface WishlistToolTipProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function WishlistToolTip({
  onMouseEnter,
  onMouseLeave,
}: WishlistToolTipProps) {
  return (
    <Popup
      contentStyle={{
        marginTop: 16,
        marginLeft: 14,
        padding: 0,
        width: 220,
      }}
      position="right center"
      on={["hover"]}
      trigger={
        <div>
          <Heart className={styles.heart} onMouseEnter={onMouseEnter} />
        </div>
      }
    >
      <p
        style={{ textAlign: "center", padding: 8, margin: 0 }}
        onMouseLeave={onMouseLeave}
      >
        Want to save products? Sign up in the top right corner to create your
        wishlist!
      </p>
    </Popup>
  );
}
