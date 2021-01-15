import React, { Component, useRef } from 'react';
import { string, func, number, bool } from 'prop-types';
import _ from 'lodash';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser, reduceParagraphHeight, trimLongText } from '../../util/data';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import config from '../../config';
import { 
  AvatarMedium, 
  NamedLink, 
  ResponsiveImage, 
  GalleryCarouselWrapper, 
  FavoriteIcon,
} from '../../components';

import css from './ListingCard.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;
const MODAL_BREAKPOINT = 768;

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

class ListingImage extends Component {
  render() {
    return <ResponsiveImage {...this.props} />;
  }
}
const LazyImage = lazyLoadWithDimensions(ListingImage, { loadAfterInitialRendering: 3000 });

export const ListingCardComponent = props => {
  const {
    className,
    rootClassName,
    intl,
    listing,
    renderSizes,
    setActiveListing,
    ages,
    breeds,
    genders,
    maxParagraphHeight,
    noFavorite,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  
  const id = currentListing.id.uuid;
  const { price, publicData } = currentListing.attributes;
  const { breed, gender, age, ridingsNum } = publicData;
 
  const title = currentListing.attributes.title ? (currentListing.attributes.title.length > 10 ? trimLongText(currentListing.attributes.title, 10) : currentListing.attributes.title) : ''

  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const authorName = author.attributes.profile.displayName && author.attributes.profile.displayName.split(' ')[0] || '';
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;
 
  const { formattedPrice, priceTitle } = priceData(price, intl);
  

  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const unitTranslationKey = isNightly
    ? 'ListingCard.perNight'
    : isDaily
    ? 'ListingCard.perDay'
    : 'ListingCard.perUnit';

  const isWindowDefined = typeof window !== 'undefined';
  const isMobileLayout = isWindowDefined && window.innerWidth < MODAL_BREAKPOINT;
  
  const cardBreed = _.get(
    breeds.find(value => value.key === breed),
    'label',
    null
  );
  const cardGender = _.get(
    genders.find(value => value.key === gender),
    'label',
    null
  );
  
  const cardTitles = [title, cardBreed, cardGender].filter(i => typeof i === 'string').join(', ');
  
  const paragraphEl = useRef(null); 

  if (maxParagraphHeight && paragraphEl.current && paragraphEl.current.offsetHeight > maxParagraphHeight) {
    reduceParagraphHeight(paragraphEl.current, maxParagraphHeight)
  }

  return (
    <div className={classes}>
       {!noFavorite && <FavoriteIcon rootClassName={css.favoriteIcon} currentListing={currentListing} params={{ id, slug }}/>}
      {ridingsNum && (
        <button className={css.ridingsNumButton}>
          <FormattedMessage id="EditListingPricingForm.numberOfRidings" values={{ value: ridingsNum }} />
        </button>
      )}
      <NamedLink name="ListingPage" params={{ id, slug }} openInNewTab isNotRouterLink>
        <div
          className={css.threeToTwoWrapper}
          onMouseEnter={() => setActiveListing(currentListing.id)}
          onMouseLeave={() => setActiveListing(null)}
        >
          <div className={css.aspectWrapper}>
            {currentListing.images.length > 1 ? (
              <GalleryCarouselWrapper
                dragEnabled={false}
                pagination={!isMobileLayout}
                touchEnabled={!isMobileLayout}
                items={currentListing.images}
                renderSizes={renderSizes}
              />
            ) : (
              <LazyImage
                rootClassName={css.rootForImage}
                alt={title}
                image={firstImage}
                variants={['landscape-crop', 'landscape-crop2x']}
                sizes={renderSizes}
              />
            )}
          </div>
        </div>
        <div className={css.info}>
          <div className={css.avatarAuthor}>
            <AvatarMedium user={listing.author} />
          </div>
          <div className={css.price}>
            <div className={css.priceValue} title={priceTitle && priceTitle.replace(/,/,"\'").replace(/\'dd$/,"")}>
              {formattedPrice && formattedPrice.replace(/,/,"\'").replace(/\'dd$/,"")}
            </div>
            <div className={css.perUnit}>
              <FormattedMessage id={unitTranslationKey} />
            </div>
          </div>
          <div className={css.mainInfo}>
            <p className={css.title} ref={paragraphEl}>{cardTitles}</p>
            <div className={css.authorInfo}>
              <FormattedMessage id="ListingCard.hostedBy" values={{ authorName }} />
            </div>
          </div>
        </div>
      </NamedLink>
    </div>
    
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  ages: config.custom.ages,
  breeds: config.custom.breeds,
  genders: config.custom.genders,
  maxParagraphHeight: 0,
  noFavorite: false,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,  
  noFavorite: bool,
  // Responsive image sizes hint
  renderSizes: string,
  setActiveListing: func,
  maxParagraphHeight: number
};

export default injectIntl(ListingCardComponent);
