import React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { NamedLink } from '../../components';

import css from './SectionHero.css';

const SectionHero = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.heroContent}>
        <h1 className={css.heroMainTitle}>
          <FormattedMessage id="SectionHero.title" />
        </h1>
        <h2 className={css.heroSubTitle}>
          <FormattedMessage id="SectionHero.subTitle" />
        </h2>
        <div className={css.heroButtonsWrapper}>
          <NamedLink
            name="SearchPage"
            to={{
              search:
                'address=Schweiz&bounds=47.808453%2C10.492064%2C45.817981%2C5.955902',
            }}
            className={css.heroButton}
          >
            <span className={css.heroText}>
              <FormattedMessage id="SectionHero.browseButton" />
            </span>
          </NamedLink>
         {/* 
          <NamedLink
            name="NewListingPage"
            className={`${css.heroButton} ${css.heroButtonSecodary}`}
          >
            <FormattedMessage id="TopbarDesktop.createListingSecondary" />
          </NamedLink> */}

        </div>
        <span className={css.heroTrustpilotDesktop}>
          <div className="trustpilot-widget" data-locale="de-CH" data-template-id="53aa8807dec7e10d38f59f32" data-businessunit-id="5e5ea952b018650001549489" data-style-height="150px" data-style-width="100%" data-theme="dark">
              {/* <a href="https://ch.trustpilot.com/review/horsedeal24.com" target="_blank" rel="noopener">Trustpilot</a> */}
          </div>
        </span>
        <span className={css.heroTrustpilotMobile}>
        <div className="trustpilot-widget" data-locale="de-CH" data-template-id="5419b637fa0340045cd0c936" data-businessunit-id="5e5ea952b018650001549489" data-style-height="20px" data-style-width="100%" data-theme="dark">
          {/* <a href="https://ch.trustpilot.com/review/horsedeal24.com" target="_blank" rel="noopener">Trustpilot</a> */}
        </div>
        </span>
      </div>
    </div>
  );
};

SectionHero.defaultProps = { rootClassName: null, className: null };

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionHero;
