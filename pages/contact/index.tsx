import { useState } from "react";

import ContactPage, { ContactRequest } from "../../components/contact/Contact";
import RootLayout from "../../components/common/RootLayout";
import { PostRpcClient } from "../../components/common/RpcClient";
import { useWindowSize } from "../../lib/common";

export default function Contact() {
  const [contactStatus, setContactStatus] = useState({
    error: "",
    success: false,
  });

  const size = useWindowSize();
  if (!size.width) {
    return null;
  }

  const onSubmit = async (values: ContactRequest) => {
    await PostRpcClient.getInstance()
      .call("Contact", {
        email: values.email,
        name: values.name,
        message: values.message,
      })
      .then(({ error }) => {
        if (error) {
          setContactStatus({ error, success: false });
          return;
        }
        setContactStatus({ error: "", success: true });
      })
      .catch((error) => {
        setContactStatus({ error: error.message, success: false });
      });
  };

  return (
    <RootLayout>
      <ContactPage
        error={contactStatus.error}
        success={contactStatus.success}
        width={size.width * 0.9}
        onSubmit={onSubmit}
      />
    </RootLayout>
  );
}
