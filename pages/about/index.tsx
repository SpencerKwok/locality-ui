import AboutPage from "../../components/about/About";
import RootLayout from "../../components/common/RootLayout";
import { useWindowSize } from "../../lib/common";

export default function About() {
  const size = useWindowSize();
  if (!size.width) {
    return <RootLayout />;
  }

  return (
    <RootLayout>
      <AboutPage isMobile={size.width <= 720} width={size.width} />
    </RootLayout>
  );
}
