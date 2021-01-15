import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import config from '../../config';
import { getLatestListing } from './LandingPage.duck.js';
import { getListingsById, getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Page,
  SectionHero,
  SectionHowItWorks,
  SectionLatestListings,
  SectionLocations,
  UserTestimonials,
  SectionPartners,
  SectionUserReviews,
  LandingPageAdvantages,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  ListingCard,
  Footer,
  ModalStripeInformation,
} from '../../components';
import { TopbarContainer } from '../../containers';

import facebookImage from '../../assets/HorseDeal24Facebook-1200x630.jpg';
import twitterImage from '../../assets/HorseDeal24Twitter-600x314.jpg';
import css from './LandingPage.css';


export const LandingPageComponent = props => {
  const { onManageDisableScrolling, history, intl, listings, location, scrollingDisabled } = props;

  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'LandingPage.schemaTitle' }, { siteTitle });
  const schemaDescription = intl.formatMessage({ id: 'LandingPage.schemaDescription' });
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;

  return (
    <Page
      className={css.root}
      scrollingDisabled={scrollingDisabled}
      contentType="website"
      description={schemaDescription}
      title={schemaTitle}
      facebookImages={[{ url: facebookImage, width: 1200, height: 630 }]}
      twitterImages={[
        { url: `${config.canonicalRootURL}${twitterImage}`, width: 600, height: 314 },
      ]}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        description: schemaDescription,
        name: schemaTitle,
        image: [schemaImage],
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.heroContainer}>
            <SectionHero className={css.hero} history={history} location={location} />
          </div>

          <div className={css.sections}>

            <div className={css.section + ' ' + css.landingPageAdvantages}>
              <div className={css.sectionContentLowVerticalMargin}>
                <LandingPageAdvantages />
              </div>
            </div>
            <div className={css.section}>
              <div className={css.sectionContentLowVerticalMargin}>
                <SectionLatestListings listings={listings} />
              </div>
            </div>
            <div className={css.section + ' ' + css.sectionHowItWorks}>
              <div className={css.sectionContentLowVerticalMargin}>
                <SectionHowItWorks />
              </div>
            </div>
            <div className={css.section}>
              <div className={css.sectionContentLowVerticalMargin}>
                <UserTestimonials />
              </div>
              <div className={css.sectionContentLowVerticalMargin}>
                <SectionLocations />
              </div>
            </div>
            <div className={css.section}>
              <div className={css.sectionContentLowVerticalMargin}>
                <SectionUserReviews />
              </div>
            </div>
            <div className={css.section + ' ' + css.sectionPartners}>
              <div className={css.sectionContentLowVerticalMargin}>
                <SectionPartners />
              </div>
            </div>
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

const { bool, object, array } = PropTypes;

LandingPageComponent.defaultProps = {
  listings: [],
};

LandingPageComponent.propTypes = {
  listings: array,
  scrollingDisabled: bool.isRequired,

  // from withRouter
  history: object.isRequired,
  location: object.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { latestListingsIds } = state.LandingPage;
  const pageListings = getListingsById(state, latestListingsIds);

  // const ref = { id, type: 'listing' };
  const ref2 = latestListingsIds.map(i => ({ id: i, type: 'listing' }));
  const listings = getMarketplaceEntities(state, ref2);
  return {
    listings: pageListings,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671

const LandingPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(LandingPageComponent);

LandingPage.loadData = (params, search) => {
  return getLatestListing({
    include: ['author', 'author.profileImage', 'images'],
    'fields.listing': ['title', 'geolocation', 'price', 'publicData'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      // Listing page
      'variants.landscape-crop',
      'variants.landscape-crop2x',
      'variants.landscape-crop4x',
      'variants.landscape-crop6x',

      // Social media
      'variants.facebook',
      'variants.twitter',

      // Image carousel
      'variants.scaled-small',
      'variants.scaled-medium',
      'variants.scaled-large',
      'variants.scaled-xlarge',

      // Avatars
      'variants.square-small',
      'variants.square-small2x',
    ],
    per_page: 3,
  });
};

export default LandingPage;
