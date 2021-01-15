import React, { Component } from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { array, arrayOf, bool, func, number, string } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { createSlug } from '../../util/urlHelpers';
import {
  TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
  txIsAccepted,
  txIsCanceled,
  txIsDeclined,
  txIsEnquired,
  txIsPaymentExpired,
  txIsPaymentPending,
  txIsRequested,
  txHasBeenDelivered,
} from '../../util/transaction';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes, LISTING_STATE_CLOSED } from '../../util/types';
import {
  ensureListing,
  ensureTransaction,
  ensureUser,
  userDisplayNameAsString,
} from '../../util/data';
import { isMobileSafari } from '../../util/userAgent';
import { formatMoney } from '../../util/currency';
import {
  AvatarLarge,
  BookingPanel,
  NamedLink,
  ReviewModal,
  UserDisplayName,
  ProfilePageInfoHolder,
  UserRating,
  AppointmentScheduler,
} from '../../components';
import { BookingDatesForm, SendMessageForm } from '../../forms';
import config from '../../config';

// These are internal components that make this file more readable.
import AddressLinkMaybe from './AddressLinkMaybe';
import BreakdownMaybe from './BreakdownMaybe';
import DetailCardHeadingsMaybe from './DetailCardHeadingsMaybe';
import DetailCardImage from './DetailCardImage';
import FeedSection from './FeedSection';
import SaleActionButtonsMaybe from './SaleActionButtonsMaybe';
import PanelHeading, {
  HEADING_ENQUIRED,
  HEADING_PAYMENT_PENDING,
  HEADING_PAYMENT_EXPIRED,
  HEADING_REQUESTED,
  HEADING_ACCEPTED,
  HEADING_DECLINED,
  HEADING_CANCELED,
  HEADING_DELIVERED,
} from './PanelHeading';
import { PrimaryButton } from '../';

import css from './TransactionPanel.css';

const removeNameLastSymb = name => name.split(" ").slice(0,1)[0] 

const asteriskNumber = 5
const addAsterisk = (message, regExp) => {
  let asteriskMessage = ''
  const numbers = message.match(new RegExp(regExp, 'g'))
  numbers
  .map(n => n.trim())
  .forEach(number => {
    const index = message.indexOf(number)
    if(~index) {
      const numberOfSpaces = number.split(" ").length
      const asterisk = Array.from({ length: asteriskNumber + numberOfSpaces }, x => '*').join('')
      const messageToAdd = asteriskMessage ? asteriskMessage : message

      asteriskMessage = messageToAdd.slice(0, index) + asterisk + messageToAdd.slice(index + asteriskNumber + numberOfSpaces)
    }
  });
  return asteriskMessage
}
const messageChecks = [
  /[\d\s]{8,}/,
  /[\d\w.]+@[\w\d]+.[\w\d]+/,
]

// Helper function to get display names for different roles
const displayNames = (currentUser, currentProvider, currentCustomer, intl) => {
  const authorDisplayName = <UserDisplayName user={currentProvider} intl={intl} />;
  const customerDisplayName = <UserDisplayName user={currentCustomer} intl={intl} />;

  let otherUserDisplayName = '';
  let otherUserDisplayNameString = '';
  const currentUserIsCustomer =
    currentUser.id && currentCustomer.id && currentUser.id.uuid === currentCustomer.id.uuid;
  const currentUserIsProvider =
    currentUser.id && currentProvider.id && currentUser.id.uuid === currentProvider.id.uuid;

  if (currentUserIsCustomer) {
    otherUserDisplayName = authorDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentProvider, '');
    
  } else if (currentUserIsProvider) {
    otherUserDisplayName = customerDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentCustomer, '');
  }
  otherUserDisplayNameString = removeNameLastSymb(otherUserDisplayNameString)//.split(" ").slice(0,1)[0] 

  return {
    authorDisplayName,
    customerDisplayName,
    otherUserDisplayName,
    otherUserDisplayNameString,
  };
};

export class TransactionPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendMessageFormFocused: false,
      isReviewModalOpen: false,
      reviewSubmitted: false,
      imageUploadRequested: false,
      dragOverFORM: false,
      formError: null,
    };
    this.isMobSaf = false;
    this.sendMessageFormName = 'TransactionPanel.SendMessageForm';

    this.onOpenReviewModal = this.onOpenReviewModal.bind(this);
    this.onSubmitReview = this.onSubmitReview.bind(this);
    this.onSendMessageFormFocus = this.onSendMessageFormFocus.bind(this);
    this.onSendMessageFormBlur = this.onSendMessageFormBlur.bind(this);
    this.onMessageSubmit = this.onMessageSubmit.bind(this);
    this.scrollToMessage = this.scrollToMessage.bind(this);
  }

  componentDidMount() {
    this.isMobSaf = isMobileSafari();
  }

  onOpenReviewModal() {
    this.setState({ isReviewModalOpen: true });
  }

  goBack = () => this.props.history.goBack();

  onSubmitReview(values) {
    const { onSendReview, transaction, transactionRole } = this.props;
    const currentTransaction = ensureTransaction(transaction);
    const { reviewRating, reviewContent } = values;
    const rating = Number.parseInt(reviewRating, 10);
    onSendReview(transactionRole, currentTransaction, rating, reviewContent)
      .then(r => this.setState({ isReviewModalOpen: false, reviewSubmitted: true }))
      .catch(e => {
        // Do nothing.
      });
  }

  onSendMessageFormFocus() {
    this.setState({ sendMessageFormFocused: true });
    if (this.isMobSaf) {
      // Scroll to bottom
      window && window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
    }
  }

  onSendMessageFormBlur() {
    this.setState({ sendMessageFormFocused: false });
  }

  onMessageSubmit(values, form) {
    let textareaValue = null
    let eventTextAreaTarget = null
    try {
      if(typeof window !== 'undefined') {
        eventTextAreaTarget = window.event.target.getElementsByTagName("textarea")[0]
        textareaValue = eventTextAreaTarget.value
      }
    }
    catch(e) {}

    let message = textareaValue ? textareaValue : values.message ? values.message.trim() : null;
    const { transaction, onSendMessage } = this.props;
    const ensuredTransaction = ensureTransaction(transaction);

    if (!message) {
      return;
    }

    messageChecks.forEach(regExp => {
      if(regExp.test(message)) {
        message = addAsterisk(message, regExp)
      }
    })

    onSendMessage(ensuredTransaction.id, message)
      .then(messageId => {
        if(eventTextAreaTarget) {
          eventTextAreaTarget.value = ''
        }
        form.reset();
        this.scrollToMessage(messageId);
      })
      .catch(e => {
        // Ignore, Redux handles the error
      });
  }

  scrollToMessage(messageId) {
    const selector = `#msg-${messageId.uuid}`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }

  onImageUploadHandler = (files) => {
    
    const { imageUploadRequested } = this.state

    if(typeof files !== "object" || !files[0] || files.length > 1 || imageUploadRequested) {
      const formError = imageUploadRequested ? 
      'File loading is in progress.' : 
      'File either has an invalid type, or the total number of files is bigger than 1.'
      this.setState({ formError })
      return 
    }

    const fileSizeExceeded = (files[0].size / 1024**2) > 10

    if(fileSizeExceeded) {
      this.setState({ formError: 'File size exceeded.'})
      return
    }

    this.setState({ 
      imageUploadRequested: true,
      formError: false,
     });
     
    const { transaction, onSendFile } = this.props;
    const ensuredTransaction = ensureTransaction(transaction);
   
    onSendFile(ensuredTransaction, files[0])
     .finally(res => {
        this.setState({ imageUploadRequested: false });
     })
  }

  onDragHandler = (e, flag) => {
    // function responsible for changing label background
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOverFORM: flag })
  }

  onDropHandler = (e, form) => {
    this.setState({ 
      dragOverFORM: false,
     })
    
    const droppedFiles = e.dataTransfer && e.dataTransfer.files
 
    if(!droppedFiles) {
      this.setState({ 
        formError: 'Selected file is invalid.',
       })
      return 
    } 
    
    this.onImageUploadHandler(droppedFiles)
  }

  render() {
    const {
      rootClassName,
      className,
      currentUser,
      transaction,
      totalMessagePages,
      oldestMessagePageFetched,
      messages,
      initialMessageFailed,
      savePaymentMethodFailed,
      fetchMessagesInProgress,
      fetchMessagesError,
      sendMessageInProgress,
      sendMessageError,
      sendReviewInProgress,
      sendReviewError,
      onManageDisableScrolling,
      onShowMoreMessages,
      transactionRole,
      intl,
      onAcceptSale,
      onDeclineSale,
      acceptInProgress,
      declineInProgress,
      acceptSaleError,
      declineSaleError,
      onSubmitBookingRequest,
      timeSlots,
      fetchTimeSlotsError,
      nextTransitions,
      userRating,
      acceptedAndActiveTransactions,
    } = this.props;
    const { 
      imageUploadRequested, 
      dragOverFORM, 
      formError,
      sendMessageFormFocused, 
    } = this.state

    const currentTransaction = ensureTransaction(transaction);
    const currentListing = ensureListing(currentTransaction.listing);
    const currentProvider = ensureUser(currentTransaction.provider);
    const currentCustomer = ensureUser(currentTransaction.customer);
    
    if(currentListing.attributes.deleted || currentProvider.attributes.deleted || currentCustomer.attributes.deleted) {
      return <div className={css.genericError}>Either provider or customer has been deleted</div>
    }
    
    const isCustomer = transactionRole === 'customer';
    const isProvider = transactionRole === 'provider';

    const transactionRolePublicData = isCustomer ? currentProvider.attributes.profile.publicData : currentCustomer.attributes.profile.publicData
    const hasLocation = (transactionRolePublicData && transactionRolePublicData.location && transactionRolePublicData.location.search) ? transactionRolePublicData.location.search : null;  
    if(transactionRolePublicData) {
      delete transactionRolePublicData['auto']
      delete transactionRolePublicData['drivingLicense']
      delete transactionRolePublicData['language']
    }
  

    const checkActiveTx = txs => txs.some(tx => ensureTransaction(tx).id.uuid === currentTransaction.id.uuid)

    const activeAndAcceptedTransactionsPresent = acceptedAndActiveTransactions && acceptedAndActiveTransactions.length && checkActiveTx(acceptedAndActiveTransactions)

    const listingLoaded = !!currentListing.id;
    const listingDeleted = listingLoaded && currentListing.attributes.deleted;
    const iscustomerLoaded = !!currentCustomer.id;
    const isCustomerBanned = iscustomerLoaded && currentCustomer.attributes.banned;
    const isCustomerDeleted = iscustomerLoaded && currentCustomer.attributes.deleted;
    const isProviderLoaded = !!currentProvider.id;
    const isProviderBanned = isProviderLoaded && currentProvider.attributes.banned;
    const isProviderDeleted = isProviderLoaded && currentProvider.attributes.deleted;

    const stateDataFn = tx => {
      if (txIsEnquired(tx)) {
        const transitions = Array.isArray(nextTransitions)
          ? nextTransitions.map(transition => {
              return transition.attributes.name;
            })
          : [];
        const hasCorrectNextTransition =
          transitions.length > 0 && transitions.includes(TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY);
        return {
          headingState: HEADING_ENQUIRED,
          showBookingPanel: isCustomer && !isProviderBanned && hasCorrectNextTransition,
        };
      } else if (txIsPaymentPending(tx)) {
        return {
          headingState: HEADING_PAYMENT_PENDING,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsPaymentExpired(tx)) {
        return {
          headingState: HEADING_PAYMENT_EXPIRED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsRequested(tx)) {
        return {
          headingState: HEADING_REQUESTED,
          showDetailCardHeadings: isCustomer,
          showSaleButtons: isProvider && !isCustomerBanned,
          showAcceptedBreakDown: isProvider && true,
        };
      } else if (txIsAccepted(tx)) {
        return {
          headingState: HEADING_ACCEPTED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showAcceptedBreakDown: true,
        };
      } else if (txIsDeclined(tx)) {
        return {
          headingState: HEADING_DECLINED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsCanceled(tx)) {
        return {
          headingState: HEADING_CANCELED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txHasBeenDelivered(tx)) {
        return {
          headingState: HEADING_DELIVERED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
        };
      } else {
        return { headingState: 'unknown' };
      }
    };
    const stateData = stateDataFn(currentTransaction);
    
    const deletedListingTitle = intl.formatMessage({
      id: 'TransactionPanel.deletedListingTitle',
    });

    const {
      authorDisplayName,
      customerDisplayName,
      otherUserDisplayName,
      otherUserDisplayNameString,
    } = displayNames(currentUser, currentProvider, currentCustomer, intl);

    const { publicData, geolocation } = currentListing.attributes;
    const location = publicData && publicData.location ? publicData.location : {};
    const listingTitle = currentListing.attributes.deleted
      ? deletedListingTitle
      : currentListing.attributes.title;

    const substitutionalLinkText = removeNameLastSymb(currentListing.author.attributes.profile.displayName)

    const unitType = config.bookingUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'TransactionPanel.perNight'
      : isDaily
      ? 'TransactionPanel.perDay'
      : 'TransactionPanel.perUnit';

    const price = currentListing.attributes.price;
    const bookingSubTitle = price
      ? `${formatMoney(intl, price)} ${intl.formatMessage({ id: unitTranslationKey })}`
      : '';

    const firstImage =
      currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

    const providerData = {
      //customer: currentUser.attributes.profile.displayName,
      provider: currentListing.author.attributes.profile.displayName,
      providerId: currentListing.author.id,
      listingData: {
        listingId: currentListing.id,
        title:  currentListing.attributes.title,
        price: currentListing.attributes.price.amount,
        img: firstImage
      }
    } 

    const saleButtons = (appointmentScheduler = false) => (
      <SaleActionButtonsMaybe
        showButtons={stateData.showSaleButtons}
        acceptInProgress={acceptInProgress}
        declineInProgress={declineInProgress}
        acceptSaleError={acceptSaleError}
        declineSaleError={declineSaleError}
        onAcceptSale={() => onAcceptSale(currentTransaction.id, providerData)}
        onDeclineSale={() => onDeclineSale(currentTransaction.id)}
        appointmentScheduler={appointmentScheduler}
      />
    );
    const listing= currentListing
    const hasListingState = !!listing.attributes.state;
    const isClosed = hasListingState && listing.attributes.state === LISTING_STATE_CLOSED;
    const showBookingDatesForm = hasListingState && !isClosed;
    const showSendMessageForm =
      !isCustomerBanned && !isCustomerDeleted && !isProviderBanned && !isProviderDeleted;

    const sendMessagePlaceholder = intl.formatMessage(
      { id: 'TransactionPanel.sendMessagePlaceholder' },
      { name: otherUserDisplayNameString }
    );

    const sendingMessageNotAllowed = intl.formatMessage({
      id: 'TransactionPanel.sendingMessageNotAllowed',
    });

    const paymentMethodsPageLink = (
      <NamedLink name="PaymentMethodsPage">
        <FormattedMessage id="TransactionPanel.paymentMethodsPageLink" />
      </NamedLink>
    );

    const classes = classNames(rootClassName || css.root, className);

    const isMobile = (typeof window !== 'undefined' && window.innerWidth < 560);

    const IsWrappedWithLink = ({ condition, wrapper, children }) => condition ? wrapper(children) : children;

    const otherPartyLinkProps = (currentProvider.id.uuid && currentCustomer.id.uuid) ? { name: 'ProfilePage', params: { id: isCustomer ? currentProvider.id.uuid : currentCustomer.id.uuid  } } : { name: 'ProfileBasePage' }
    const providerLinkProps =  { name: 'ProfilePage', params: { id: currentProvider.id.uuid } };

    const labelClasses = classNames(css.sendMessageForm, dragOverFORM ? css.sendMessageFormHovered : '' );

    return (
      <div className={classes}>
        <div className={css.container}>
          <div className={css.txInfo}>
            <DetailCardImage
              avatarWrapperClassName={classNames(css.detailAvatarMobile, isProvider && css.mobileViewHidden)}
              rootClassName={classNames(css.detailCardMobile, isProvider && css.mobileViewHidden) }
              listingTitle={listingTitle}
              image={firstImage}
              provider={currentProvider}
              isCustomer={isCustomer}
            />
            <div className={css.otherPartyWrapper}>
              <div className={css.otherPartyAvatarSection}>
                <div className={classNames(css.avatarWrapperProviderDesktop, isProvider && css.mobileViewVisible)}>
                  <AvatarLarge user={isCustomer ? currentProvider : currentCustomer} className={css.avatarDesktop} />
                </div>
              </div>
              <div>
                <div className={css.otherPartySection}>
                <NamedLink {...otherPartyLinkProps} className={css.otherPartyWrapper}>
                    <h3 className={css.otherPartyName}>
                      {otherUserDisplayNameString}
                    </h3>
                      <div className={css.otherPartyRating}>
                        <UserRating rating={userRating}/>
                      </div>
                      <p className={css.otherPartyTotalRating}>({userRating || 0})</p>
                    </NamedLink>
                </div>
                <div>
                  {hasLocation && <p className={css.otherPartyLocation}>Aus {hasLocation}</p> }
                </div>
                <div className={classNames(css.otherPartySection, isCustomer && css.mobileViewHidden)}> 
                  <ProfilePageInfoHolder publicData={transactionRolePublicData} sequence={["age", "licence"]}/>
                </div>
              </div>
            </div>    
            {/* <button className={css.backBtn} onClick={this.goBack}>
              <FormattedMessage id="TransactionPanel.backButtonLabel" />
            </button> */}
            
            {/* <PanelHeading
              panelHeadingState={stateData.headingState}
              transactionRole={transactionRole}
              providerName={authorDisplayName}
              customerName={customerDisplayName}
              customerID={transactionCustomerID}
              isCustomerBanned={isCustomerBanned}
              listingId={currentListing.id && currentListing.id.uuid}
              listingTitle={listingTitle}
              listingDeleted={listingDeleted}
              substitutionalLinkText={substitutionalLinkText}
              providerID={transactionProviderID}
            /> */}

            <div className={css.bookingDetailsMobile}>
              <AddressLinkMaybe
                rootClassName={css.addressMobile}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              />
              <BreakdownMaybe transaction={currentTransaction} transactionRole={transactionRole} />
            </div>

            {savePaymentMethodFailed ? (
              <p className={css.genericError}>
                <FormattedMessage
                  id="TransactionPanel.savePaymentMethodFailed"
                  values={{ paymentMethodsPageLink }}
                />
              </p>
            ) : null}
            <FeedSection
              rootClassName={css.feedContainer}
              currentTransaction={currentTransaction}
              currentUser={currentUser}
              fetchMessagesError={fetchMessagesError}
              fetchMessagesInProgress={fetchMessagesInProgress}
              initialMessageFailed={initialMessageFailed}
              messages={messages}
              oldestMessagePageFetched={oldestMessagePageFetched}
              onOpenReviewModal={this.onOpenReviewModal}
              onShowMoreMessages={() => onShowMoreMessages(currentTransaction.id)}
              totalMessagePages={totalMessagePages}
            />
            {showSendMessageForm ? (
              <>
               {formError && <span className={css.actionError}>{formError}</span>}
              <SendMessageForm
                formId={this.sendMessageFormName}
                rootClassName={labelClasses}
                messagePlaceholder={sendMessagePlaceholder}
                inProgress={sendMessageInProgress}
                sendMessageError={sendMessageError}
                onFocus={this.onSendMessageFormFocus}
                onBlur={this.onSendMessageFormBlur}
                onSubmit={this.onMessageSubmit}
                onDrag={this.onDragHandler}
                onDrop={this.onDropHandler}
                imageUploadRequested={imageUploadRequested}
                onImageUploadHandler={this.onImageUploadHandler}
              />
              </>
            ) : (
              <div className={css.sendingMessageNotAllowed}>{sendingMessageNotAllowed}</div>
            )}
            
            {stateData.showSaleButtons && !sendMessageFormFocused ? (
              <div className={css.mobileActionButtons}>
                {saleButtons(true)}
              </div>
            ) : null}
          </div>

          <div className={css.asideDesktop}>
            <div className={css.detailCard}>
              <IsWrappedWithLink
                condition={!isMobile && currentListing.id}
                wrapper={children => <NamedLink isNotRouterLink name="ListingPage" params={{ id:currentListing.id.uuid, slug: createSlug(listingTitle) }}>{children}</NamedLink>}
              >
                 <DetailCardImage
                    avatarWrapperClassName={css.avatarWrapperDesktop}
                    listingTitle={listingTitle}
                    image={firstImage}
                    provider={currentProvider}
                    isCustomer={isCustomer}
                  />
              </IsWrappedWithLink>

              {/* <DetailCardHeadingsMaybe
                showDetailCardHeadings={stateData.showDetailCardHeadings}
                listingTitle={listingTitle}
                subTitle={bookingSubTitle}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              /> */}

              {stateData.showBookingPanel && !sendMessageFormFocused ? (
                <BookingPanel
                  className={css.bookingPanel}
                  titleClassName={css.bookingTitle}
                  isOwnListing={false}
                  listing={currentListing}
                  title={listingTitle}
                  subTitle={bookingSubTitle}
                  authorDisplayName={authorDisplayName}
                  onSubmit={onSubmitBookingRequest}
                  onManageDisableScrolling={onManageDisableScrolling}
                  timeSlots={timeSlots}
                  fetchTimeSlotsError={fetchTimeSlotsError}
                />
              ) : null}
              {/* {isProvider && !sendMessageFormFocused && (
                <div className={css.appointmentSchedulerWrapper}>
                  <AppointmentScheduler />
                </div>
              )} */}
              <div className={css.bookExpertWrapper}>
                <div className={css.bookingHeading}>
                  <h2 className={css.bookingTitle}>{listingTitle}</h2>
                <div className={css.bookingHelp}>
                    {typeof substitutionalLinkText === 'string' && (
                    <div className={css.bookingAuthor}>
                        Von <NamedLink {...providerLinkProps}>{substitutionalLinkText}</NamedLink>
                    </div>
                    )} {bookingSubTitle}
                  </div>
                </div>
                {stateData.showBookingPanel && showBookingDatesForm ? (
                  <BookingDatesForm
                    className={css.bookingForm}
                    formId="BookingPanel"
                    submitButtonWrapperClassName={css.bookingDatesSubmitButtonWrapper}
                    unitType={unitType}
                    onSubmit={onSubmitBookingRequest}
                    price={price}
                    isOwnListing={false}
                    timeSlots={timeSlots}
                    fetchTimeSlotsError={fetchTimeSlotsError}
                  />
                ) : null}

                {/*<p className={css.smallPrint}>
                  <FormattedMessage id={'BookingDatesForm.youWontBeChargedInfo'} />
                </p>*/}
                 {stateData.showAcceptedBreakDown && (
                     <BreakdownMaybe
                     className={classNames(css.breakdownContainer, css.breakdownWithNoMargins)}
                     transaction={currentTransaction}
                     transactionRole={transactionRole}
                   />
                  )}
                {stateData.showSaleButtons && (
                    <div className={css.desktopActionButtons}>{saleButtons()}</div>
                  )}
                <div className={css.bookingDatesSubmitButtonWrapper}>
                  <NamedLink name="CalendarPage" className={classNames(css.contactButton, !activeAndAcceptedTransactionsPresent ? css.noTransactionsAvailavleBtn : '')}>
                    <FormattedMessage id="ProfilePage.noTransactionsAvailavleBtn" />
                  </NamedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ReviewModal
          id="ReviewOrderModal"
          isOpen={this.state.isReviewModalOpen}
          onCloseModal={() => this.setState({ isReviewModalOpen: false })}
          onManageDisableScrolling={onManageDisableScrolling}
          onSubmitReview={this.onSubmitReview}
          revieweeName={otherUserDisplayName}
          reviewSent={this.state.reviewSubmitted}
          sendReviewInProgress={sendReviewInProgress}
          sendReviewError={sendReviewError}
        />
      </div>
    );
  }
}

TransactionPanelComponent.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  acceptSaleError: null,
  declineSaleError: null,
  fetchMessagesError: null,
  initialMessageFailed: false,
  savePaymentMethodFailed: false,
  sendMessageError: null,
  sendReviewError: null,
  timeSlots: null,
  fetchTimeSlotsError: null,
  nextTransitions: null,
};

TransactionPanelComponent.propTypes = {
  rootClassName: string,
  className: string,

  currentUser: propTypes.currentUser,
  transaction: propTypes.transaction.isRequired,
  totalMessagePages: number.isRequired,
  oldestMessagePageFetched: number.isRequired,
  messages: arrayOf(propTypes.message).isRequired,
  initialMessageFailed: bool,
  savePaymentMethodFailed: bool,
  fetchMessagesInProgress: bool.isRequired,
  fetchMessagesError: propTypes.error,
  sendMessageInProgress: bool.isRequired,
  sendMessageError: propTypes.error,
  sendReviewInProgress: bool.isRequired,
  sendReviewError: propTypes.error,
  onManageDisableScrolling: func.isRequired,
  onShowMoreMessages: func.isRequired,
  onSendMessage: func.isRequired,
  onSendReview: func.isRequired,
  onSubmitBookingRequest: func.isRequired,
  timeSlots: arrayOf(propTypes.timeSlot),
  fetchTimeSlotsError: propTypes.error,
  nextTransitions: array,
  acceptedAndActiveTransactions: array,
  // Sale related props
  onAcceptSale: func.isRequired,
  onDeclineSale: func.isRequired,
  acceptInProgress: bool.isRequired,
  declineInProgress: bool.isRequired,
  acceptSaleError: propTypes.error,
  declineSaleError: propTypes.error,

  // from injectIntl
  intl: intlShape,
};

const TransactionPanel = compose(withRouter, injectIntl)(TransactionPanelComponent);

export default TransactionPanel;
