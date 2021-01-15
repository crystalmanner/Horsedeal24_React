/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { array, arrayOf, bool, func, shape, string, oneOf } from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import config from '../../config';
import routeConfiguration from '../../routeConfiguration';
import { LISTING_STATE_PENDING_APPROVAL, LISTING_STATE_CLOSED, propTypes } from '../../util/types';
import { types as sdkTypes } from '../../util/sdkLoader';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import {
  ensureListing,
  ensureOwnListing,
  ensureUser,
  userDisplayNameAsString,
} from '../../util/data';
import { richText } from '../../util/richText';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/UI.duck';
import { initializeCardPaymentData } from '../../ducks/stripe.duck.js';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import { getListingsById } from '../../ducks/marketplaceData.duck';

import {
  Page,
  NamedLink,
  NamedRedirect,
  LayoutSingleColumn,
  ListingCard,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  ContactAuthorPanelMaybe,
  FavoriteIcon,
  Modal,
} from '../../components';

import { TopbarContainer, NotFoundPage } from '../../containers';

import { sendEnquiry, loadData, setInitialValues } from './ListingPage.duck';
import SectionCharacteristicsMaybe from './SectionCharacteristicsMaybe';
import SectionHorseInfo from './SectionHorseInfo';
import SectionImages from './SectionImages';
import SectionAvatar from './SectionAvatar';
import SectionHeading from './SectionHeading';
import SectionDescriptionMaybe from './SectionDescriptionMaybe';
import SectionDisciplinesMaybe from './SectionDisciplinesMaybe';
import SectionReviews from './SectionReviews';
import SectionHostMaybe from './SectionHostMaybe';
import SectionRulesMaybe from './SectionRulesMaybe';
import SectionMapMaybe from './SectionMapMaybe';
import ButtonBackIcon from './ButtonBackIcon';
import WhatsAppShareButton from './WhatsAppShareButton';
import CopyLinkButton from './CopyLinkButton';
import FacebookShareButton from './FacebookShareButton';

import css from './ListingPage.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_TITLE = 16;

const { UUID } = sdkTypes;

const shareIcon = (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 width="612px" height="612px" viewBox="0 0 612 612" style={{"enableBackground" : "new 0 0 612 612"}}>
    <g>
      <g id="_x31_0_28_">
        <g>
          <path d="M218.953,197.915L285.6,117.13v290.864c0,11.281,9.139,20.44,20.4,20.44s20.4-9.139,20.4-20.44V116.355l67.299,81.559
            c7.997,8.038,20.972,8.038,28.969,0c7.996-8.038,7.996-21.053,0-29.09L321.851,46.608c-4.264-4.284-9.935-6.1-15.504-5.814
            c-5.589-0.285-11.24,1.53-15.504,5.814L189.985,168.824c-7.997,8.038-7.997,21.053,0,29.09
            C197.982,205.952,210.957,205.952,218.953,197.915z M591.6,367.235c-11.261,0-20.399,9.139-20.399,20.399v142.8H40.8v-142.8
            c0-11.261-9.139-20.399-20.4-20.399S0,376.374,0,387.635v163.2c0,11.261,9.139,20.4,20.4,20.4h571.2
            c11.261,0,20.4-9.14,20.4-20.4v-163.2C612,376.354,602.86,367.235,591.6,367.235z"/>
        </g>
      </g>
  </g>
</svg>

)

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

export class ListingPageComponent extends Component {
  constructor(props) {
    super(props);
    const { enquiryModalOpenForListingId, params } = props;

    this.slider = React.createRef();

    this.state = {
      pageClassNames: [],
      imageCarouselOpen: false,
      selectedImageIndex: 0,
      enquiryModalOpen: enquiryModalOpenForListingId === params.id,
      sliderCurrentIndex: 0,
      isSocialNetworkModalOpen: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onContactUser = this.onContactUser.bind(this);
    this.onSubmitEnquiry = this.onSubmitEnquiry.bind(this);
  }
  setSocialNetworkModal = (flag) => {
    this.setState({
      isSocialNetworkModalOpen: flag
    })
  }
  handlerSliderTransition = () => {
    this.setState({ sliderCurrentIndex: this.slider.current.state.currentSlide })
  }

  handleSubmit(values) {
    const {
      history,
      getListing,
      params,
      callSetInitialValues,
      onInitializeCardPaymentData,
    } = this.props;
    const listingId = new UUID(params.id);
    const listing = getListing(listingId);

    const { bookingDates, ...bookingData } = values;

    const initialValues = {
      listing,
      bookingData,
      bookingDates: {
        bookingStart: bookingDates.startDate,
        bookingEnd: bookingDates.endDate,
      },
      confirmPaymentError: null,
    };

    const routes = routeConfiguration();
    // Customize checkout page state with current listing and selected bookingDates
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', routes);
    callSetInitialValues(setInitialValues, initialValues);

    // Clear previous Stripe errors from store if there is any
    onInitializeCardPaymentData();

    // Redirect to CheckoutPage
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        routes,
        { id: listing.id.uuid, slug: createSlug(listing.attributes.title) },
        {}
      )
    );
  }

  onContactUser() {
    const { currentUser, history, callSetInitialValues, params, location, activeTransactionId } = this.props;
    const routes = routeConfiguration();

    if(activeTransactionId && activeTransactionId.uuid) {
      history.push(
        createResourceLocatorString('OrderDetailsPage', routes, { id: activeTransactionId.uuid }, {})
      );
    }

    if (!currentUser) {
      const state = { from: `${location.pathname}${location.search}${location.hash}` };

      // We need to log in before showing the modal, but first we need to ensure
      // that modal does open when user is redirected back to this listingpage
      callSetInitialValues(setInitialValues, { enquiryModalOpenForListingId: params.id });

      // signup and return back to listingPage.
      history.push(createResourceLocatorString('SignupPage', routeConfiguration(), {}, {}), state);
    } else {
      this.setState({ enquiryModalOpen: true });
    }
  }

  onSubmitEnquiry(values) {
    const { history, params, onSendEnquiry } = this.props;
    const routes = routeConfiguration();
    const listingId = new UUID(params.id);
    const { message } = values;

    onSendEnquiry(listingId, message.trim())
      .then(txId => {
        this.setState({ enquiryModalOpen: false });

        // Redirect to OrderDetailsPage
        history.push(
          createResourceLocatorString('OrderDetailsPage', routes, { id: txId.uuid }, {})
        );
      })
      .catch(() => {
        // Ignore, error handling in duck file
      });
  }

  render() {
    const {
      unitType,
      isAuthenticated,
      currentUser,
      getListing,
      getOwnListing,
      intl,
      onManageDisableScrolling,
      params: rawParams,
      location,
      scrollingDisabled,
      showListingError,
      reviews,
      fetchReviewsError,
      sendEnquiryInProgress,
      sendEnquiryError,
      timeSlots,
      fetchTimeSlotsError,
      listings,
    } = this.props;
    const windowIsDefined = typeof window !== 'undefined'; // for server-side rendering

    const listingId = new UUID(rawParams.id);
    const isPendingApprovalVariant = rawParams.variant === LISTING_PAGE_PENDING_APPROVAL_VARIANT;
    const isDraftVariant = rawParams.variant === LISTING_PAGE_DRAFT_VARIANT;
    const currentListing =
      isPendingApprovalVariant || isDraftVariant
        ? ensureOwnListing(getOwnListing(listingId))
        : ensureListing(getListing(listingId));
    
    const listingSlug = rawParams.slug || createSlug(currentListing.attributes.title || '');
    const params = { slug: listingSlug, ...rawParams };

    const listingType = isDraftVariant
      ? LISTING_PAGE_PARAM_TYPE_DRAFT
      : LISTING_PAGE_PARAM_TYPE_EDIT;
    const listingTab = isDraftVariant ? 'photos' : 'description';

    const isApproved =
      currentListing.id && currentListing.attributes.state !== LISTING_STATE_PENDING_APPROVAL;

    const pendingIsApproved = isPendingApprovalVariant && isApproved;

    // If a /pending-approval URL is shared, the UI requires
    // authentication and attempts to fetch the listing from own
    // listings. This will fail with 403 Forbidden if the author is
    // another user. We use this information to try to fetch the
    // public listing.
    const pendingOtherUsersListing =
      (isPendingApprovalVariant || isDraftVariant) &&
      showListingError &&
      showListingError.status === 403;
    const shouldShowPublicListingPage = pendingIsApproved || pendingOtherUsersListing;

    if (shouldShowPublicListingPage) {
      return <NamedRedirect name="ListingPage" params={params} search={location.search} />;
    }

    const {
      description = '',
      geolocation = null,
      price = null,
      title = '',
      publicData,
    } = currentListing.attributes;

    const { breed, gender, age, color, hight, mainDiscipline } = publicData;

    const thisListing = listings && listings.length && listings.filter( l => l.id.uuid === listingId.uuid)[0];
    
    const currentMainDiscipline = thisListing && thisListing.attributes.publicData.mainDiscipline;
    const listingsWithSimilarDiscipline = thisListing && listings.filter(l => l.attributes.publicData.mainDiscipline === currentMainDiscipline && l.id.uuid !== listingId.uuid); // similar mainDiscipline but without current horse

    const { sliderCurrentIndex } = this.state;
    const isMobile = (windowIsDefined && window.innerWidth < 480); // viewportSmall

    const sliderVisibleSlides = 
    isMobile && listingsWithSimilarDiscipline.length === 1 ? 1
    : isMobile && listingsWithSimilarDiscipline.length > 1 ? 1.25
    : (windowIsDefined && window.innerWidth < 900) ? 2 
    : 3; 

    const sliderBtnsVisible = !isMobile && listingsWithSimilarDiscipline && (listingsWithSimilarDiscipline.length > sliderVisibleSlides);

    const sliderBackBtnVisible = sliderCurrentIndex !== 0;
    const sliderNextBtnVisible = listingsWithSimilarDiscipline && ( sliderCurrentIndex !== (listingsWithSimilarDiscipline.length - sliderVisibleSlides))

    const richTitle = (
      <span>
        {richText(title, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_TITLE,
          longWordClass: css.longWord,
        })}
      </span>
    );

    const bookingTitle = (
      <FormattedMessage id="ListingPage.bookingTitle" values={{ title: richTitle }} />
    );
    const bookingSubTitle = intl.formatMessage({ id: 'ListingPage.bookingSubTitle' });

    const topbar = <TopbarContainer />;

    

    const SharingViaSocialNetworkModal = (props) => {
      const {id, slug, isOpen, onCloseEnquiryModal} = props
      const origin = windowIsDefined ? window.location.origin : 'https://www.horsedeal24.com'
      const shareLink = `${origin}/l/${slug}/${id}`
      
      const whatsAppTitle = intl.formatMessage({ id: 'ListingPage.whatsAppTitle' });
      const whatsAppShareText = intl.formatMessage({ id: 'ListingPage.whatsAppShareText' });

      const fbShareText = intl.formatMessage({ id: 'SocialNetworkSharing.shareFB' });
      const fbQuote = intl.formatMessage({ id: 'ListingPage.fbShareText' });

      const copyLinkShareText = intl.formatMessage({ id: 'SocialNetworkSharing.copyLink' }); //<FormattedMessage id="SocialNetworkSharing.copyLink" />
      return (
        <Modal
          id={`SocialNetworks.share.${id}`}
          isOpen={isOpen}
          onClose={onCloseEnquiryModal}
          onManageDisableScrolling={() => {}}
        >
          <div>
            <div className={css.modalHeader}>
              <FormattedMessage id="SocialNetworkSharing.shareList" />
            </div>
            <div className={css.shareContainer}>
              <FacebookShareButton url={shareLink} quote={fbQuote} text={fbShareText} />
              <WhatsAppShareButton url={shareLink} title={whatsAppTitle} text={whatsAppShareText}/>
              <CopyLinkButton url={shareLink} text={copyLinkShareText}/>
            </div>
          </div>
         </Modal>  
      );
    };

    if (showListingError && showListingError.status === 404) {
      // 404 listing not found
      return <NotFoundPage />;  
    } else if (showListingError) {
      // Other error in fetching listing

      const errorTitle = intl.formatMessage({
        id: 'ListingPage.errorLoadingListingTitle',
      });

      return (
        <Page title={errorTitle} scrollingDisabled={scrollingDisabled}>
          <LayoutSingleColumn className={css.pageRoot}>
            <LayoutWrapperTopbar>{topbar}</LayoutWrapperTopbar>
            <LayoutWrapperMain>
              <p className={css.errorText}>
                <FormattedMessage id="ListingPage.errorLoadingListingMessage" />
              </p>
            </LayoutWrapperMain>
            <LayoutWrapperFooter>
              <Footer />
            </LayoutWrapperFooter>
          </LayoutSingleColumn>
        </Page>
      );
    } else if (!currentListing.id) {
      // Still loading the listing
      const loadingTitle = intl.formatMessage({
        id: 'ListingPage.loadingListingTitle',
      });

      return (
        <Page title={loadingTitle} scrollingDisabled={scrollingDisabled}>
          <LayoutSingleColumn className={css.pageRoot}>
            <LayoutWrapperTopbar>{topbar}</LayoutWrapperTopbar>
            <LayoutWrapperMain>
            </LayoutWrapperMain>
            <LayoutWrapperFooter>
              <Footer />
            </LayoutWrapperFooter>
          </LayoutSingleColumn>
        </Page>
      );
    }

    const handleViewPhotosClick = (e, index = 0) => {
      // Stop event from bubbling up to prevent image click handler
      // trying to open the carousel as well.
      e.stopPropagation();
      this.setState({
        imageCarouselOpen: true,
        selectedImageIndex: index,
      });
    };
    const authorAvailable = currentListing && currentListing.author;
    const userAndListingAuthorAvailable = !!(currentUser && authorAvailable);
    const isOwnListing =
      userAndListingAuthorAvailable && currentListing.author.id.uuid === currentUser.id.uuid;
    const showContactUser = authorAvailable && (!currentUser || (currentUser && !isOwnListing));

    const currentAuthor = authorAvailable ? currentListing.author : null;
    const ensuredAuthor = ensureUser(currentAuthor);

    // When user is banned or deleted the listing is also deleted.
    // Because listing can be never showed with banned or deleted user we don't have to provide
    // banned or deleted display names for the function
    const authorDisplayName = userDisplayNameAsString(ensuredAuthor, '');
    
    const { formattedPrice, priceTitle } = priceData(price, intl);

    const handleBookingSubmit = values => {
      const isCurrentlyClosed = currentListing.attributes.state === LISTING_STATE_CLOSED;
      if (windowIsDefined && (isOwnListing || isCurrentlyClosed)) {
        window.scrollTo(0, 0);
      } else {
        this.handleSubmit(values);
      }
    };

    const listingImages = (listing, variantName) =>
      (listing.images || [])
        .map(image => {
          const variants = image.attributes.variants;
          const variant = variants ? variants[variantName] : null;

          // deprecated
          // for backwards combatility only
          const sizes = image.attributes.sizes;
          const size = sizes ? sizes.find(i => i.name === variantName) : null;

          return variant || size;
        })
        .filter(variant => variant != null);

      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      const cardRenderSizes = [
        '(max-width: 767px) 100vw',
        `(max-width: 1023px) ${panelMediumWidth}vw`,
        `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
        `${panelLargeWidth / 3}vw`,
      ].join(', ');     

    const facebookImages = listingImages(currentListing, 'facebook');
    const twitterImages = listingImages(currentListing, 'twitter');
    const schemaImages = JSON.stringify(facebookImages.map(img => img.url));
    const siteTitle = config.siteTitle;
    const schemaTitle = intl.formatMessage(
      { id: 'ListingPage.schemaTitle' },
      { title, price: formattedPrice, siteTitle }
    );
    const id = currentListing.id.uuid;
    const slug = createSlug(currentListing.attributes.title)
    const hostLink = (
      <NamedLink
        className={css.authorNameLink}
        name="ListingPage"
        params={params}
        to={{ hash: '#host' }}
      >
        {authorDisplayName.split(" ").slice(0,1)[0]}
      </NamedLink>
    );
    
    return (
      <Page
        title={schemaTitle}
        scrollingDisabled={scrollingDisabled}
        author={authorDisplayName}
        contentType="website"
        description={description}
        facebookImages={facebookImages}
        twitterImages={twitterImages}
        schema={{
          '@context': 'http://schema.org',
          '@type': 'ItemPage',
          description: description,
          name: schemaTitle,
          image: schemaImages,
        }}
      >
        <LayoutSingleColumn className={css.pageRoot}>
          <LayoutWrapperTopbar>{topbar}</LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div>
              <SectionImages
                title={title}
                listing={currentListing}
                isOwnListing={isOwnListing}
                editParams={{
                  id: listingId.uuid,
                  slug: listingSlug,
                  type: listingType,
                  tab: listingTab,
                }}
                selectedImageIndex={this.state.selectedImageIndex}
                imageCarouselOpen={this.state.imageCarouselOpen}
                onImageCarouselClose={() => this.setState({ imageCarouselOpen: false })}
                handleViewPhotosClick={handleViewPhotosClick}
                onManageDisableScrolling={onManageDisableScrolling}
              >
                <SharingViaSocialNetworkModal  id={id} slug={slug} isOpen={this.state.isSocialNetworkModalOpen} onCloseEnquiryModal={() => this.setSocialNetworkModal(false)}/>
                <FavoriteIcon currentListing={currentListing} params={{ id, slug }} rootClassName={classNames(css.viewPhotos, css.favoriteIcon)}>
                  <FormattedMessage id="Wishlist.makeFavorite" />
                </FavoriteIcon>
                <button className={classNames(css.viewPhotos, css.shareSocialNetworkBtn)} onClick={() => this.setSocialNetworkModal(true)}>
                  {shareIcon}
                  <FormattedMessage id="SocialNetworkSharing.share" />
                </button>
              </SectionImages>
              <div className={css.contentContainer}>
                <SectionAvatar user={currentAuthor} params={params} />
                <div className={classNames(css.mainContent, isOwnListing && css.fullWidth)}>
                  <SectionHeading
                    priceTitle={priceTitle}
                    formattedPrice={formattedPrice}
                    richTitle={richTitle}
                    hostLink={hostLink}
                    showContactUser={showContactUser}
                    onContactUser={this.onContactUser}
                  />
                  <SectionHorseInfo data={{ breed, gender, age, color, hight, mainDiscipline }} />
                  <SectionDescriptionMaybe description={description} />
                  <SectionDisciplinesMaybe disciplines={publicData.additionalDisciplines} />
                  <SectionCharacteristicsMaybe characteristics={publicData.characteristics} />
                  <SectionRulesMaybe publicData={publicData} />
                  <SectionMapMaybe
                    geolocation={geolocation}
                    publicData={publicData}
                    listingId={currentListing.id}
                  />
                  <SectionReviews reviews={reviews} fetchReviewsError={fetchReviewsError} />
                  <SectionHostMaybe
                    title={title}
                    listing={currentListing}
                    authorDisplayName={authorDisplayName}
                    onContactUser={this.onContactUser}
                    isEnquiryModalOpen={isAuthenticated && this.state.enquiryModalOpen}
                    onCloseEnquiryModal={() => this.setState({ enquiryModalOpen: false })}
                    sendEnquiryError={sendEnquiryError}
                    sendEnquiryInProgress={sendEnquiryInProgress}
                    onSubmitEnquiry={this.onSubmitEnquiry}
                    currentUser={currentUser}
                    onManageDisableScrolling={onManageDisableScrolling}
                  />
                </div>
                <ContactAuthorPanelMaybe
                  author={currentListing.author}
                  onContactUser={this.onContactUser}
                  unitType={unitType}
                  currentUser={currentUser}
                  formattedPrice={formattedPrice}
                  className={css.bookingPanel}
                />
              </div>
                  {listingsWithSimilarDiscipline && listingsWithSimilarDiscipline.length ? (
                    <div className={css.sliderOuterContainer}>
                      <h3 className={classNames(css.titleShiftedLeft, css.listingSectionTitle)}>Könnten Dir auch gefallen</h3>
                      { listingsWithSimilarDiscipline.length === 1 ? 
                        (<ListingCard
                          rootClassName={classNames(css.listingPageCard, css.listingSimilarDiscipline)}
                          listing={listingsWithSimilarDiscipline[0]}
                          renderSizes={cardRenderSizes}
                          setActiveListing={() => {}}
                          maxParagraphHeight={89}
                        />)
                        : 
                        (<CarouselProvider
                          naturalSlideWidth={100}
                          naturalSlideHeight={isMobile ? 130 : 110}
                          totalSlides={listingsWithSimilarDiscipline.length}
                          visibleSlides={sliderVisibleSlides}
                          infinite={false}
                          dragEnabled={isMobile}
                          touchEnabled={isMobile}
                        >
                          <Slider
                              className={css.sliderWrapper}
                              ref={this.slider}
                              onTransitionEnd={this.handlerSliderTransition}
                              classNameAnimation={css.sliderAnimation}
                            >
                            {listingsWithSimilarDiscipline.map( (l, index) => (
                              <Slide index={index} key={l.id.uuid}>
                                <ListingCard
                                  rootClassName={classNames(css.listingPageCard, css.listingSimilarDiscipline)}
                                  listing={l}
                                  renderSizes={cardRenderSizes}
                                  setActiveListing={() => {}}
                                  maxParagraphHeight={89}
                                />
                              </Slide>
                            ))}
                          </Slider>
                          {sliderBtnsVisible && sliderBackBtnVisible && 
                            <ButtonBack className={classNames(css.sliderButton, css.sliderButtonBack)}>
                              <ButtonBackIcon />
                            </ButtonBack>
                          }
                          {sliderBtnsVisible && sliderNextBtnVisible && 
                            <ButtonNext className={classNames(css.sliderButton, css.sliderButtonNext)}>
                              <ButtonBackIcon />
                            </ButtonNext>
                          }
                        </CarouselProvider>)
                    }
                </div>
                ) : null}
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

ListingPageComponent.defaultProps = {
  unitType: config.bookingUnitType,
  currentUser: null,
  enquiryModalOpenForListingId: null,
  showListingError: null,
  reviews: [],
  fetchReviewsError: null,
  timeSlots: null,
  fetchTimeSlotsError: null,
  sendEnquiryError: null,
  categoriesConfig: config.custom.categories,
  amenitiesConfig: config.custom.amenities,
};

ListingPageComponent.propTypes = {
  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  unitType: propTypes.bookingUnitType,
  // from injectIntl
  intl: intlShape.isRequired,

  params: shape({
    id: string.isRequired,
    slug: string,
    variant: oneOf([LISTING_PAGE_DRAFT_VARIANT, LISTING_PAGE_PENDING_APPROVAL_VARIANT]),
  }).isRequired,

  isAuthenticated: bool.isRequired,
  currentUser: propTypes.currentUser,
  getListing: func.isRequired,
  getOwnListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  enquiryModalOpenForListingId: string,
  showListingError: propTypes.error,
  callSetInitialValues: func.isRequired,
  reviews: arrayOf(propTypes.review),
  fetchReviewsError: propTypes.error,
  timeSlots: arrayOf(propTypes.timeSlot),
  fetchTimeSlotsError: propTypes.error,
  sendEnquiryInProgress: bool.isRequired,
  sendEnquiryError: propTypes.error,
  onSendEnquiry: func.isRequired,
  onInitializeCardPaymentData: func.isRequired,

  categoriesConfig: array,
  amenitiesConfig: array,
};

const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    showListingError,
    reviews,
    fetchReviewsError,
    timeSlots,
    fetchTimeSlotsError,
    sendEnquiryInProgress,
    sendEnquiryError,
    enquiryModalOpenForListingId,
    activeTransactionId,
  } = state.ListingPage;

  const {currentPageResultIds} = state.SearchPage;
 
  const { currentUser } = state.user;

  const pageListings = getListingsById(state, currentPageResultIds) || []

  const getListing = id => {
    const ref = { id, type: 'listing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };

  const getOwnListing = id => {
    const ref = { id, type: 'ownListing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };
  
  return {
    isAuthenticated,
    currentUser,
    getListing,
    getOwnListing,
    scrollingDisabled: isScrollingDisabled(state),
    enquiryModalOpenForListingId,
    showListingError,
    reviews,
    fetchReviewsError,
    timeSlots,
    fetchTimeSlotsError,
    sendEnquiryInProgress,
    sendEnquiryError,
    listings: pageListings,
    activeTransactionId,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  callSetInitialValues: (setInitialValues, values) => dispatch(setInitialValues(values)),
  onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message)),
  onInitializeCardPaymentData: () => dispatch(initializeCardPaymentData()),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const ListingPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ListingPageComponent);

ListingPage.setInitialValues = initialValues => setInitialValues(initialValues);
ListingPage.loadData = loadData;

export default ListingPage;
