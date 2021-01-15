import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import { NamedLink } from '..';

import css from './UserTestimonials.css';

class LocationImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}

const UserTestimonials = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>

      <div className={css.titleWrapper}>
        <div className={css.title}>
          <FormattedMessage id="UserTestimonials.title" />
        </div>
        <div className={css.title}>
          <FormattedMessage id="UserTestimonials.secondTitle" />
        </div>
      </div>
      <div className={css.subTitle}>
        <FormattedMessage id="UserTestimonials.subTitle" />
      </div>
      <div className={css.testimonials}>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/1.png"/>
        </div>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/2.png"/>
        </div>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/3.png"/>
        </div>
      </div>
      <div className={css.testimonials}>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/4.png"/>
        </div>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/5.png"/>
        </div>
        <div className={css.photoWrapper}>
          <img className={css.photo} src="http://horsedeal24.imgix.net/6.png"/>
        </div>
      </div>
      <NamedLink name="SignupPage" className={css.bigButton}>
        <div>
          <FormattedMessage id="UserTestimonials.bigButton" />
        </div>
      </NamedLink>
    </div>
  );
};

UserTestimonials.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

UserTestimonials.propTypes = {
  rootClassName: string,
  className: string,
};

export default UserTestimonials;
