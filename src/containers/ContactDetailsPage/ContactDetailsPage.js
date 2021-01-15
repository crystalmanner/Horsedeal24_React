import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { fetchCurrentUser, sendVerificationEmail, sendVerificationOtp, closeVerificationModal } from '../../ducks/user.duck';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
  Modal,
} from '../../components';
import { ContactDetailsForm, SMSVerificationForm } from '../../forms';
import { TopbarContainer } from '../../containers';

import { isScrollingDisabled } from '../../ducks/UI.duck';
import { saveContactDetails, saveContactDetailsClear, verifyPhoneNumber } from './ContactDetailsPage.duck';
import css from './ContactDetailsPage.css';

export const ContactDetailsPageComponent = props => {
  const {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onResendVerificationOtp,
    onSubmitContactDetails,
    sendVerificationOtpInProgress,
    sendVerificationOtpError,
    verificationCode,
    showVerificationModal,
    intl,
    onManageDisableScrolling,
    onCloseVerificationModal,
    onVerifyPhoneNumber,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const currentEmail = user.attributes.email || '';
  const protectedData = user.attributes.profile.protectedData || {};
  const currentPhoneNumber = protectedData.phoneNumber || '';
  const contactInfoForm = user.id ? (
    <ContactDetailsForm
      className={css.form}
      initialValues={{ email: currentEmail, phoneNumber: currentPhoneNumber }}
      saveEmailError={saveEmailError}
      savePhoneNumberError={savePhoneNumberError}
      currentUser={currentUser}
      onResendVerificationEmail={onResendVerificationEmail}
      onResendVerificationOtp={onResendVerificationOtp}
      onSubmit={values => onSubmitContactDetails({ ...values, currentEmail, currentPhoneNumber })}
      onChange={onChange}
      inProgress={saveContactDetailsInProgress}
      ready={contactDetailsChanged}
      sendVerificationEmailInProgress={sendVerificationEmailInProgress}
      sendVerificationEmailError={sendVerificationEmailError}
      sendVerificationOtpError={sendVerificationOtpError}
      sendVerificationOtpInProgress={sendVerificationOtpInProgress}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ContactDetailsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="ContactDetailsPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <UserNav selectedPageName="ContactDetailsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperAccountSettingsSideNav currentTab="ContactDetailsPage" />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="ContactDetailsPage.heading" />
            </h1>
            {contactInfoForm}
          </div>
          {!sendVerificationOtpError &&
            <SMSVerificationForm {...props} currentPhoneNumber={currentPhoneNumber}/>
          }
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

ContactDetailsPageComponent.defaultProps = {
  saveEmailError: null,
  savePhoneNumberError: null,
  currentUser: null,
  sendVerificationEmailError: null,
};

const { bool, func } = PropTypes;

ContactDetailsPageComponent.propTypes = {
  saveEmailError: propTypes.error,
  savePhoneNumberError: propTypes.error,
  saveContactDetailsInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  contactDetailsChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitContactDetails: func.isRequired,
  scrollingDisabled: bool.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,
  onResendVerificationOtp: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser, sendVerificationEmailInProgress,
          sendVerificationEmailError, sendVerificationOtpInProgress,
          sendVerificationOtpError, verificationCode, showVerificationModal
        } = state.user;
  const {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
  } = state.ContactDetailsPage;
  return {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    sendVerificationOtpInProgress,
    sendVerificationOtpError,
    verificationCode,
    showVerificationModal
  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveContactDetailsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactDetails: values => dispatch(saveContactDetails(values)),
  onResendVerificationOtp: phoneNumber => dispatch(sendVerificationOtp(phoneNumber)),
  onManageDisableScrolling: () => null,
  onCloseVerificationModal: () => dispatch(closeVerificationModal()),
  onVerifyPhoneNumber: values => dispatch(verifyPhoneNumber(values)),
});

const ContactDetailsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ContactDetailsPageComponent);

ContactDetailsPage.loadData = () => {
  // Since verify email happens in separate tab, current user's data might be updated
  return fetchCurrentUser();
};

export default ContactDetailsPage;
