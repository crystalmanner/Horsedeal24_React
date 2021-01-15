import React, { Component } from 'react';
import css from './FavoriteIcon.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Icon } from './Icon'
import classNames from 'classnames';
import { addWishlistItem, deleteWishlistItem } from '../../containers/FavoritePage/FavoritePage.duck.js';
import { withRouter } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';

class FavoriteIconComponent extends Component {
    constructor(props) {
      super(props);
      this.state = { 
            isFavorite: false,
        };
    }
    
      handleSelectingFavoriteItem = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState({
            isFavorite: true,
        })
        
        const { onWishlistCreating, currentListing } = this.props
        onWishlistCreating(currentListing)
      }

    handleNewListingSelecting = (e) => {
        e.stopPropagation()  
        const { wishlistData, onWishlistItemDeleting, currentListing, currentUser, history, location } = this.props

        if (!currentUser) {
            const state = { from: `${location.pathname}${location.search}${location.hash}` };
      
            history.push(createResourceLocatorString('SignupPage', routeConfiguration(), {}, {}), state);
          }

        const ensureWishlist = wishlistData && wishlistData.items 
        const inWishlist = ensureWishlist && wishlistData.items[currentListing.id.uuid]
        
        if(inWishlist) {
            this.setState({
                isFavorite: false,
            })
            
            return onWishlistItemDeleting(currentListing)   
        }
        // create new wishlist when there is no one
        this.handleSelectingFavoriteItem(e)
    }

    render() {
        const { isFavorite } = this.state
        const { currentListing, wishlistData, rootClassName, children } = this.props

        const id = currentListing.id.uuid

        const ensureWishlist = wishlistData && wishlistData.items
        const inWishlist = ensureWishlist && wishlistData.items[id]
        const classes = rootClassName ? classNames(rootClassName, css.favoriteWrapper) : css.favoriteWrapper
    
        return (
            <div className={classes} onClick={e => this.handleNewListingSelecting(e)}>
                <Icon isFavorite={inWishlist || isFavorite} />
                {children || null}
            </div>
          );
    }
  }
  
  const mapStateToProps = state => {
    const { wishlistData } = state.FavoritePage
    const { currentUser } = state.user;

    return { 
        wishlistData, currentUser
     }
  };
  
  const mapDispatchToProps = dispatch => {
      return {
          onWishlistCreating: (listing) => dispatch(addWishlistItem(listing)),
          onWishlistItemDeleting: (listing) => dispatch(deleteWishlistItem(listing))
      }
  }

  const FavoriteIcon = compose(
        withRouter,
        connect(
            mapStateToProps,
            mapDispatchToProps
        )
  )(FavoriteIconComponent)

  export default FavoriteIcon;
  