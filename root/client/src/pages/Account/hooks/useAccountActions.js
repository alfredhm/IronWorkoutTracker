import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useAccountActions = () => {
  const navigate = useNavigate();
  const cancelDeleteRef = useRef(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const logOut = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError("");
    setIsDeletingAccount(true);
    try {
      await axios.delete("http://localhost:5000/api/users/me", {
        withCredentials: true,
      });
      navigate("/login", { replace: true });
    } catch (requestError) {
      console.error("Failed to delete account:", requestError);
      const responseMessage =
        requestError.response?.data?.message || requestError.response?.data;
      const missingDeleteRoute =
        requestError.response?.status === 404 &&
        typeof responseMessage === "string" &&
        /<!doctype html|<html|Cannot DELETE/i.test(responseMessage);
      setDeleteAccountError(
        missingDeleteRoute
          ? "The running API does not include account deletion yet. Restart the backend and try again."
          : typeof responseMessage === "string"
          ? responseMessage
          : "Unable to delete your account. Please try again.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return {
    cancelDeleteRef,
    deleteAccountError,
    handleDeleteAccount,
    isDeletingAccount,
    logOut,
  };
};

export default useAccountActions;
