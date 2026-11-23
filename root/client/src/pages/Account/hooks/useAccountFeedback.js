import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const useAccountFeedback = (email, onCloseModal) => {
  const [sent, setSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const formik = useFormik({
    initialValues: {
      subject: "Iron feedback(v1.0.0)",
      email,
      body: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      subject: Yup.string().required("Subject is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      body: Yup.string().required("Body is required"),
    }),
    onSubmit: async (values) => {
      setIsSending(true);
      setSent(false);
      setFeedbackError("");
      try {
        await axios.post(
          "http://localhost:5000/api/feedback",
          {
            email: values.email,
            subject: values.subject,
            body: values.body,
          },
          { withCredentials: true },
        );
        setSent(true);
        formik.resetForm();
        setTimeout(onCloseModal, 1000);
      } catch (requestError) {
        console.error("Feedback email failed to send:", requestError);
        setFeedbackError(
          requestError.response?.data?.message ||
            "Unable to send feedback. Please try again.",
        );
      } finally {
        setIsSending(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSent(false);
    setFeedbackError("");
    setIsSending(false);
    onCloseModal();
  };

  return { feedbackError, formik, handleClose, isSending, sent };
};

export default useAccountFeedback;
