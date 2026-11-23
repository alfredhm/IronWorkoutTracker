import { useDisclosure } from "@chakra-ui/react";
import AccountOverview from "./components/AccountOverview";
import DeleteAccountDialog from "./components/DeleteAccountDialog";
import FeedbackModal from "./components/FeedbackModal";
import ProfileModal from "./components/ProfileModal";
import useAccountActions from "./hooks/useAccountActions";
import useAccountFeedback from "./hooks/useAccountFeedback";
import useAccountProfile from "./hooks/useAccountProfile";

const AccountPage = ({ dashboardRefresh }) => {
  const profileModal = useDisclosure();
  const feedbackModal = useDisclosure();
  const deleteDialog = useDisclosure();

  const profile = useAccountProfile(dashboardRefresh, profileModal.onClose);
  const actions = useAccountActions();
  const feedback = useAccountFeedback(
    profile.profileValues.email,
    feedbackModal.onClose,
  );

  return (
    <>
      <AccountOverview
        bodyStats={profile.bodyStats}
        email={profile.profileValues.email}
        profileLoadError={profile.profileLoadError}
        onEditProfile={profileModal.onOpen}
        onSendFeedback={feedbackModal.onOpen}
      />
      <ProfileModal
        formik={profile.profileFormik}
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        onLogout={actions.logOut}
        onDelete={deleteDialog.onOpen}
        isSaving={profile.profileFormik.isSubmitting}
        profileLoadError={profile.profileLoadError}
        profileSubmitError={profile.profileSubmitError}
        profileUpdateSuccess={profile.profileUpdateSuccess}
      />
      <DeleteAccountDialog
        cancelRef={actions.cancelDeleteRef}
        error={actions.deleteAccountError}
        isDeleting={actions.isDeletingAccount}
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onDelete={actions.handleDeleteAccount}
      />
      <FeedbackModal
        feedbackError={feedback.feedbackError}
        formik={feedback.formik}
        handleClose={feedback.handleClose}
        isOpen={feedbackModal.isOpen}
        isSending={feedback.isSending}
        sent={feedback.sent}
      />
    </>
  );
};

export default AccountPage;
