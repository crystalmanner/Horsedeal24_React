import React from 'react';
import { string } from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import config from '../../config';
import {
  IconSocialMediaYoutube,
  IconSocialMediaInstagram,
  IconSocialMediaSnapchat,
  IconSocialMediaFacebook,
  Logo,
  ExternalLink,
  NamedLink,
} from '../../components';

import css from './Footer.css';

const renderSocialMediaLinks = intl => {
  const { siteYoutubePage, siteInstagramPage, siteSnapchatPage, siteFacebookPage } = config;

  return [
    <ExternalLink
      key="linkToYoutube"
      href={siteYoutubePage}
      className={css.icon}
      title={intl.formatMessage({ id: 'Footer.goToYoutube' })}
    >
      <IconSocialMediaYoutube />
    </ExternalLink>,

    <ExternalLink
      key="linkToInstagram"
      href={siteInstagramPage}
      className={css.icon}
      title={intl.formatMessage({ id: 'Footer.goToInstagram' })}
    >
      <IconSocialMediaInstagram />
    </ExternalLink>,

    <ExternalLink
      key="linkToSnapchat"
      href={siteSnapchatPage}
      className={css.icon}
      title={intl.formatMessage({ id: 'Footer.goToSnapchat' })}
    >
      <IconSocialMediaSnapchat />
    </ExternalLink>,

    <ExternalLink
      key="linkToFacebook"
      href={siteFacebookPage}
      className={css.icon}
      title={intl.formatMessage({ id: 'Footer.goToFacebook' })}
    >
      <IconSocialMediaFacebook />
    </ExternalLink>,
  ];
};

const Footer = props => {
  const { rootClassName, className, intl } = props;
  const socialMediaLinks = renderSocialMediaLinks(intl);
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.topBorderWrapper}>
        <div className={css.content}>
          <div className={css.links}>
            <div className={css.footerContainerHorizontal}>
              <div className={css.footerContainerVertical23}>
                <div className={css.verticalContainerHeader}>
                  Speziell für Dich
                </div>
                <div className={css.verticalContainerContent}>
                  <ul className={css.list}>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/ebook" className={css.link}>
                        Kostenloses E-Book
                      </a>
                    </li>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/gutscheine" className={css.link}>
                        Exklusive Gutscheine
                      </a>
                      <Link to="" className={css.greenLabel}>Neu</Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={css.footerContainerVertical23}>
                <div className={css.verticalContainerHeader}>
                  Unsere Community
                </div>
                <div className={css.verticalContainerContent}>
                  <ul className={css.list}>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/community" className={css.link}>
                        Community
                      </a>
                    </li>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/kontakt" className={css.link}>
                        Kontakt
                      </a>
                    </li>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/presse" className={css.link}>
                        Presse
                      </a>
                    </li>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/blog" className={css.link}>
                        Blog
                      </a>
                    </li>
                    <li className={css.listItem}>
                      <a href="https://www.horsedeal24.com/faq" className={css.link}>
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={css.footerContainerVertical31}>
                <div className={css.verticalContainerHeader}>
                  Reitbeteiligungen in
                </div>
                <div className={css.verticalContainerContent}>
                  <div className={css.topCitiesContainer}>
                    <div className={css.topCitiesColumn}>
                      <ul className={css.list}>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Z%C3%BCrich%2C%20Schweiz&bounds=47.6949199%2C8.984900100000004%2C47.15945%2C8.357889999999998',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchZürich" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Aargau%2C%20Schweiz&bounds=47.6209201%2C8.455169999999953%2C47.13755%2C7.713470099999995',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchAargau" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Luzern%2C%20Schweiz&bounds=47.2871001%2C8.513900000000035%2C46.7749901%2C7.836499900000035',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchLucerne" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Bern%2C%20Schweiz&bounds=47.34525989999999%2C8.455439999999953%2C46.3264299%2C6.861630099999957',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchBern" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Basel-Landschaft%2C%20Schweiz&bounds=47.56441%2C7.961800100000005%2C47.33792%2C7.325270000000046',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchBasel" />
                          </NamedLink>
                        </li>
                      </ul>
                    </div>
                    <div className={css.topCitiesColumn}>
                      <ul className={css.list}>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20St.%20Gallen%2C%20Schweiz&bounds=47.53185999999999%2C9.674049999999966%2C46.87289%2C8.795589899999982',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchStGallen" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Solothurn%2C%20Schweiz&bounds=47.50248%2C8.031239899999946%2C47.07430009999999%2C7.340520100000049',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchSolothurn" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Schwyz%2C%20Schweiz&bounds=47.22246%2C9.004549900000029%2C46.88527999999999%2C8.388769899999943',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchSchwyz" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Waadt%2C%20Schweiz&bounds=46.9867099%2C7.24925989999997%2C46.1870301%2C6.064010000000053',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchWaadt" />
                          </NamedLink>
                        </li>
                        <li className={css.listItem}>
                          <NamedLink
                            name="SearchPage"
                            to={{
                              search:
                                '?address=Kanton%20Freiburg%2C%20Schweiz&bounds=47.0067799%2C7.380170099999987%2C46.43786000000001%2C6.7423400999999785',
                            }}
                            className={css.link}
                          >
                            <FormattedMessage id="Footer.searchFreiburg" />
                          </NamedLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className={css.footerContainerVertical23}>
                <div className={css.verticalContainerHeader}>
                  <div>{socialMediaLinks}</div>
                </div>
                <div className={css.verticalContainerContent}>
                  <a href="https://shop.spreadshirt.ch/HorseDeal24" target="_blank" className={css.link}>
                   Merchandise Store</a>
                </div>
                <div className={css.verticalContainerContent}>
                <Link to="" className={css.link}>
                    <img src='/static/icons/google-play-and-app-store-logo.png' className={css.appPlayStoreIcon} alt='partners starhorse' />
                  </Link>
                </div>
              </div>
            </div>
            <div className={css.footerContainerHorizontal}>
              <div className={css.bottomLine}>
                <div className={css.bottomLineItem}>
                  <div className={css.link}>
                    <FormattedMessage id="Footer.copyright" />
                  </div>
                </div>
                <div className={css.bottomLineItem}>
                  <Link to="/about" className={css.link}>
                    Über uns
                  </Link>
                </div>
                <div className={css.bottomLineItem}>
                  <Link to="/legal" className={css.link}>
                    Impressum
                  </Link>
                </div>
                <div className={css.bottomLineItem}>
                  <Link to="/privacy-policy" className={css.link}>
                    Datenschutz
                  </Link>
                </div>
                <div className={css.bottomLineItem}>
                  <Link to="/terms-of-service" className={css.link}>
                    Nutzungsbedingungen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Footer.defaultProps = {
  rootClassName: null,
  className: null,
};

Footer.propTypes = {
  rootClassName: string,
  className: string,
  intl: intlShape.isRequired,
};

export default injectIntl(Footer);
