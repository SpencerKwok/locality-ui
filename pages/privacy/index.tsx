import RootLayout from "../../components/common/RootLayout";

export default function Privacy() {
  return (
    <RootLayout>
      <div style={{ marginLeft: 12 }}>
        <h1>Privacy Policy</h1>
        <p>
          User data will not be sold to third parties unless required by law.
        </p>
        <p>
          User data will not be used or transferred for purposes that are
          unrelated to the item's core functionality as seen on the Locality
          about page.
        </p>
        <p>
          User data will not be used or transferred to determine
          creditworthiness or for lending purposes.
        </p>
      </div>
    </RootLayout>
  );
}
