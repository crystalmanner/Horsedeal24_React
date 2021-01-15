import { types as sdkTypes } from '../../util/sdkLoader';
const { UUID } = sdkTypes;

export const SET_WISHLIST_DATA = 'app/FavoritePage/SET_WISHLIST_DATA';

export const DISCARD_WISHLIST_LISTINGS = 'app/FavoritePage/DISCARD_WISHLIST_LISTINGS';
export const SET_WISHLIST_LISTINGS = 'app/FavoritePage/SET_WISHLIST_LISTINGS';

export const SET_NOT_FOUND_ERROR_LIST = 'app/FavoritePage/SET_NOT_FOUND_ERROR_LIST';
export const DELETE_NOT_FOUND_ERROR_LIST = 'app/FavoritePage/DELETE_NOT_FOUND_ERROR_LIST';

const initialState = {
    wishlistData: { items: {} },
    wishlistListings: [],
    someWishlistItemHasBeenDeleted: [],
};

const favoritePageReducer = (state = initialState, action = {}) => {
    const { type, payload } = action;

    switch (type) {
      case SET_WISHLIST_DATA:
        return { 
            ...state,
             wishlistData: payload 
        };
      case DISCARD_WISHLIST_LISTINGS:
        return { 
            ...state,
            wishlistListings: [] 
        };
      case SET_WISHLIST_LISTINGS:
        return { 
            ...state,
            wishlistListings: [...payload] 
        };
       case SET_NOT_FOUND_ERROR_LIST:
        return { 
            ...state,
            someWishlistItemHasBeenDeleted: [...state.someWishlistItemHasBeenDeleted, payload] 
        };
      case DELETE_NOT_FOUND_ERROR_LIST:
        return { 
            ...state,
            someWishlistItemHasBeenDeleted: state.someWishlistItemHasBeenDeleted.filter(s => s !== payload)
        };
      default:
        return state;
    }
};
  
export default favoritePageReducer;

export const setWishlistData = data => ({
    type: SET_WISHLIST_DATA,
    payload: data
});

export const discardWishlistListings = () => ({
    type: DISCARD_WISHLIST_LISTINGS
});

export const setWishlistListings = data => ({
    type: SET_WISHLIST_LISTINGS,
    payload: data
});

export const setWishlistNotFoundError = (wishlistName) => ({
    type: SET_NOT_FOUND_ERROR_LIST,
    payload: wishlistName
});

export const deleteWishlistNotFoundError = (wishlistName) => ({
    type: DELETE_NOT_FOUND_ERROR_LIST,
    payload: wishlistName
});

export const getUserWishlist = () => (dispatch, getState, sdk) => {
    const { isAuthenticated } = getState().Auth;

    if(isAuthenticated) {
        sdk.currentUser.show({}).then(respose => {
            const user = respose.data.data
            const wishlistExists = user && !!user.attributes.profile.protectedData.wishlistData
            const wishlistData = wishlistExists ? user.attributes.profile.protectedData.wishlistData : { items: {} }
            
            dispatch(setWishlistData(wishlistData))
            dispatch(discardWishlistListings())
            dispatch(queryWishlistListings(wishlistData.items)) 
        })
    } 
}

export const addWishlistItem = (listing) => (dispatch, getState, sdk) => {
    try {
        const imageExists = (listing && listing.images && listing.images.length > 0) ? listing.images[0] : null;
        const image = imageExists ? JSON.stringify(imageExists) : null

        const currentWishlist = getState().FavoritePage.wishlistData
        const wishlistDataExists = (currentWishlist && currentWishlist.items) ? currentWishlist : { items: {} }
        
        const uuid = (listing && listing.id) && listing.id.uuid || null
        
        const wishlistData = !uuid 
        ? { 
            items: {
                ...wishlistDataExists.items,
            }
        } 
        : {
            items: {
                ...wishlistDataExists.items,
                [uuid]: { uuid, image }
            }
        }
        
        return sdk.currentUser.updateProfile({ protectedData: { wishlistData }})
            .then(() => dispatch(getUserWishlist()))
    }
    catch(e) {
        console.error('Failed to create a wishlist due to the following error: ', e)
    }
}

export const deleteWishlistItem = (listing) => (dispatch, getState, sdk) => {
    try {
        const uuid = listing.id.uuid
        const wishlistData = getState().FavoritePage.wishlistData
        delete wishlistData.items[uuid]
        return sdk.currentUser.updateProfile({ protectedData: { wishlistData }})
            .then(() => dispatch(getUserWishlist()))
    }
    catch(e) {
        console.error('Failed to delete a wishlist item due to the following error: ', e)
    }
}


export const queryWishlistListings = (wishlists = {}) => (dispatch, getState, sdk) => {
    const keys = Object.keys(wishlists)
    if(typeof wishlists === 'object' && keys.length) {
        const listingIds = keys.map(s => new UUID(s)).map(id => sdk.listings.show({id})) 
        
        Promise.all(listingIds)
            .then(res => {
                const listings = res.map(s => s.data.data)
                dispatch(setWishlistListings(listings))
            })
            .catch((e) => {
                dispatch(discardWishlistListings())
            })
    }  
}

export const loadData = () => (dispatch, getState, sdk) => {
    return Promise.all([
        dispatch(getUserWishlist())
    ]);
  };
  