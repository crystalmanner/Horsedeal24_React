/**
 * Usage without sizes:
 *   <ResponsiveImage
 *     alt="ListingX"
 *     image={imageDataFromSDK}
 *     variants={['landscape-crop', 'landscape-crop2x']}
 *   />
 *   // produces:
 *   <img
 *     alt="ListingX"
 *     src="url/to/landscape-crop.jpg"
 *     srcSet="url/to/landscape-crop.jpg 400w, url/to/landscape-crop2x.jpg 800w" />
 *
 * Usage with sizes:
 *   <ResponsiveImage
 *     alt="ListingX"
 *     image={imageDataFromSDK}
 *     variants={['landscape-crop', 'landscape-crop2x']}
 *     sizes="(max-width: 600px) 100vw, 50vw"
 *   />
 *   // produces:
 *   <img
 *     alt="ListingX"
 *     src="url/to/landscape-crop.jpg"
 *     srcSet="url/to/landscape-crop.jpg 400w, url/to/landscape-crop2x.jpg 800w"
 *     sizes="(max-width: 600px) 100vw, 50vw" />
 *
 *   // This means that below 600px image will take as many pixels there are available on current
 *   // viewport width (100vw) - and above that image will only take 50% of the page width.
 *   // Browser decides which image it will fetch based on current screen size.
 *
 * NOTE: for all the possible image variant names and their respective
 * sizes, see the API documentation.
 */

import React from 'react';
import { arrayOf, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import NoImageIcon from './NoImageIcon';
import css from './ResponsiveImage.css';

const ResponsiveImage = props => {
  const { className, rootClassName, alt, noImageMessage, image, variants, dimensions, ...rest } = props;
  const classes = classNames(rootClassName || css.root, className);
  
  if (image == null || variants.length === 0) {
    const noImageClasses = classNames(rootClassName || css.root, css.noImageContainer, className);

    // NoImageMessage is needed for listing images on top the map (those component lose context)
    // https://github.com/tomchentw/react-google-maps/issues/578
    const noImageMessageText = noImageMessage || <FormattedMessage id="ResponsiveImage.noImage" />;
    
    /* eslint-disable jsx-a11y/img-redundant-alt */
    return (
      <div className={noImageClasses}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} />
          <div className={css.noImageText}>{noImageMessageText}</div>
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/img-redundant-alt */
  }
  if(typeof image === 'string') {
    return <img src={image} alt={alt} className={classes} />
  }
  const imageVariants = image.attributes && image.attributes.variants;

  const imageVariantKeys = Object.keys(imageVariants);
  let index = -1

  variants.some((v, i) => {
    if (imageVariantKeys.indexOf(v) !== -1) {
      index = i
      return true
    }
  })

  const src = index !== -1 ? imageVariants[variants[index]].url : null

  const srcSet = variants
    .map(variantName => {
      const variant = imageVariants[variantName];
      
      if (!variant) {
        // Variant not available (most like just not loaded yet)
        return null;
      }
      return `${variant.url} ${variant.width}w`;
    })
    .filter(v => v != null)
    .join(', ');
  
  const imgProps = {
    className: classes,
    alt,
    srcSet,
    src,
    ...rest
  }

  if (dimensions) {
    if (dimensions.width) imgProps.width = dimensions.width;
    if (dimensions.height) imgProps.width = dimensions.height;
  }

  // alt prop already defined above
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...imgProps} />;
};

ResponsiveImage.defaultProps = {
  className: null,
  rootClassName: null,
  image: null,
  noImageMessage: null,
};

ResponsiveImage.propTypes = {
  className: string,
  rootClassName: string,
  alt: string.isRequired,
  image: propTypes.image,
  variants: arrayOf(string).isRequired,
  noImageMessage: string,
};

export default ResponsiveImage;
