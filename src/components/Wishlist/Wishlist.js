import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createSlug } from '../../util/urlHelpers';
import { FormattedMessage } from '../../util/reactIntl';
import css from './Wishlist.css';
import { 
    ResponsiveImage, 
    NamedLink, 
} from '../../components';
import { addWishlistItem } from '../../containers/FavoritePage/FavoritePage.duck.js';

export const createImage = (image) => {
    let imageParsed
    try {
        imageParsed = JSON.parse(image)
    }
    catch(e) {}
    return imageParsed
};

class WishlistComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        inProgress: false,
     };
  }

  render() {
    const { wishlistData, wishlistListings, } = this.props
    const  { inProgress } = this.state

    if(inProgress) {
        return <FormattedMessage id="Wishlist.inProgress" /> 
    }

    const wishlistItemContent = (alt, image, header, content) => (
        <>
            <ResponsiveImage alt={alt} image={image} variants={['landscape-crop']} />
            <div className={css.wishlistInfo}>
                <h4 className={css.wishlistHeader}>{header}</h4>
                <p className={css.wishlistTotal}>{content}</p>
            </div> 
        </>
    );

    return (
        <>
            <div className={css.headingContainer}>
                <h1 className={css.heading}>
                    <FormattedMessage id="Wishlist.header" /> 
                </h1>
            </div>
            <div className={css.wishlistsContainer}>
                {wishlistListings.map((l,i) => {
                    const image = wishlistData.items[l.id.uuid] ? createImage(wishlistData.items[l.id.uuid].image) : null;
                    return (
                        <NamedLink 
                            name="ListingPage" 
                            params={{ id: l.id.uuid, slug: createSlug(l.attributes.title) }} 
                            openInNewTab 
                            isNotRouterLink 
                            className={css.wishlistItem}
                            key={i}
                        >
                            { wishlistItemContent(`list-${i}`, image, l.attributes.title) }
                        </NamedLink>
                    )
                })}
            </div>
        </>
    );
  }
}

  
const mapStateToProps = state => {
    const { 
        wishlistData, 
        total, 
        wishlistListings,
        someWishlistItemHasBeenDeleted,
     } = state.FavoritePage

    return { 
        wishlistData, 
        total, 
        wishlistListings,
        someWishlistItemHasBeenDeleted,
     }
  };

const mapDispatchToProps = dispatch => {
    return {
        onWishlistCreating: (wishlist) => dispatch(addWishlistItem(wishlist)),
    }
}

const Wishlist = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(WishlistComponent)

export default Wishlist;
