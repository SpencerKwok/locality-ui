import React from "react";
import { Formik, FormikConfig, Form } from "formik";
import { Button, FormGroup, TextField } from "@material-ui/core";

interface Notification {
  title: string;
  description: string;
}

const onSubmit: FormikConfig<Notification>["onSubmit"] = async (values) => {
  console.log(values);
};

function App() {
  return (
    <div>
      <h1>Send Notification</h1>
      <Formik
        initialValues={{
          title: "",
          description: "",
        }}
        onSubmit={onSubmit}
      >
        {({ values, handleSubmit, handleChange, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <TextField
                id="title"
                label="Title"
                value={values.title}
                onChange={handleChange}
              />
              <TextField
                id="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
              />
            </FormGroup>
            <Button
              style={{ marginTop: "8px" }}
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              Send
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default App;
