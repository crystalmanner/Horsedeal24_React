import React from 'react';
import { compose } from 'redux';
import css from './FavoritePage.css';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { loadData } from './FavoritePage.duck';
import {
    Page,
    UserNav,
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    Wishlist,
  } from '../../components';
import { TopbarContainer } from '../../containers';

export const FavoritePageComponent = props => {
    const {
      intl,
      params,
    } = props;
    
    // const slug = params && params.slug
    const title = intl.formatMessage({ id: 'FavoritePage.title' });
  
    return (
        <Page className={css.root} title={title} >
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="FavoritePage" />
            <UserNav selectedPageName="FavoritePage" />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.wishlistPanel}>
              <Wishlist/>
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  };

  const FavoritePage = compose(
    injectIntl
  )(FavoritePageComponent);

  FavoritePage.loadData = loadData

  export default FavoritePage;