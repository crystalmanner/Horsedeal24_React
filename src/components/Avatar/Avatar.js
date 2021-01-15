import React from 'react';
import { string, oneOfType, bool } from 'prop-types';
import { injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import {
  ensureUser,
  ensureCurrentUser,
  userDisplayNameAsString,
  userAbbreviatedName,
} from '../../util/data';
import { ResponsiveImage, IconBannedUser, NamedLink } from '../../components/';

import css from './Avatar.css';

const AVATAR_SIZES = '(max-width: 240px) 40px, (max-width: 480px) 60px, 96px';

const AVATAR_IMAGE_VARIANTS = [
  // 240x240
  'square-small',

  // 480x480
  'square-small2x',
];

export const AvatarComponent = props => {
  const { rootClassName, className, user, renderSizes, disableProfileLink, intl } = props;
  const classes = classNames(rootClassName || css.root, className);

  const userIsCurrentUser = user && user.type === 'currentUser';
  const avatarUser = userIsCurrentUser ? ensureCurrentUser(user) : ensureUser(user);

  const isBannedUser = avatarUser.attributes.banned;
  const isDeletedUser = avatarUser.attributes.deleted;

  const bannedUserDisplayName = intl.formatMessage({
    id: 'Avatar.bannedUserDisplayName',
  });

  const deletedUserDisplayName = intl.formatMessage({
    id: 'Avatar.deletedUserDisplayName',
  });

  const defaultUserDisplayName = isBannedUser
    ? bannedUserDisplayName
    : isDeletedUser
    ? deletedUserDisplayName
    : '';

  const defaultUserAbbreviatedName = '';

  const displayName = userDisplayNameAsString(avatarUser, defaultUserDisplayName);
  const abbreviatedName = userAbbreviatedName(avatarUser, defaultUserAbbreviatedName);
  const rootProps = { className: classes, title: displayName };
  const linkProps = avatarUser.id
    ? { name: 'ProfilePage', params: { id: avatarUser.id.uuid } }
    : { name: 'ProfileBasePage' };
  const hasProfileImage = avatarUser.profileImage && avatarUser.profileImage.id;
  const profileLinkEnabled = !disableProfileLink;

  const FBProfilePictureProvided = avatarUser.attributes.profile.publicData && avatarUser.attributes.profile.publicData.FBPicture
  
  if (hasProfileImage) rootProps.className = classes + ' ' + css.hasProfileImage

  if (isBannedUser || isDeletedUser) {
    return (
      <div {...rootProps}>
        <IconBannedUser className={css.bannedUserIcon} />
      </div>
    );
  } else if(FBProfilePictureProvided && profileLinkEnabled) {
      return (
        <NamedLink {...rootProps} {...linkProps} isNotRouterLink>
          <ResponsiveImage
            rootClassName={css.avatarImage}
            alt={displayName}
            image={FBProfilePictureProvided}
            variants={AVATAR_IMAGE_VARIANTS}
            sizes={renderSizes}
          />
          <i className={css.avatarLayer}></i>
        </NamedLink>
      )
  } else if(FBProfilePictureProvided) {
    return (
      <div {...rootProps}>
        <ResponsiveImage
            rootClassName={css.avatarImage}
            alt={displayName}
            image={FBProfilePictureProvided}
            variants={AVATAR_IMAGE_VARIANTS}
            sizes={renderSizes}
          />
        <i className={css.avatarLayer}></i>
      </div>
    );
  } else if (hasProfileImage && profileLinkEnabled) {
    return (
      <NamedLink {...rootProps} {...linkProps} isNotRouterLink>
        <ResponsiveImage
          rootClassName={css.avatarImage}
          alt={displayName}
          image={avatarUser.profileImage}
          variants={AVATAR_IMAGE_VARIANTS}
          sizes={renderSizes}
        />
        <i className={css.avatarLayer}></i>
      </NamedLink>
    );
  } else if (hasProfileImage) {
    return (
      <div {...rootProps}>
        <ResponsiveImage
          rootClassName={css.avatarImage}
          alt={displayName}
          image={avatarUser.profileImage}
          variants={AVATAR_IMAGE_VARIANTS}
          sizes={renderSizes}
        />
        <i className={css.avatarLayer}></i>
      </div>
    );
  } else if (profileLinkEnabled) {
    // Placeholder avatar (initials)
    return (
      <NamedLink {...rootProps} {...linkProps} isNotRouterLink>
        <span className={css.initials}>{abbreviatedName}</span>
      </NamedLink>
    );
  } else {
    // Placeholder avatar (initials)
    return (
      <div {...rootProps}>
        <span className={css.initials}>{abbreviatedName}</span>
      </div>
    );
  }
};

AvatarComponent.defaultProps = {
  className: null,
  rootClassName: null,
  user: null,
  renderSizes: AVATAR_SIZES,
  disableProfileLink: false,
};

AvatarComponent.propTypes = {
  rootClassName: string,
  className: string,
  user: oneOfType([propTypes.user, propTypes.currentUser]),

  renderSizes: string,
  disableProfileLink: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const Avatar = injectIntl(AvatarComponent); 

export default Avatar;

export const AvatarMedium = props => (
  <Avatar rootClassName={css.mediumAvatar} renderSizes={AVATAR_SIZES} {...props} />
);
AvatarMedium.displayName = 'AvatarMedium';

export const AvatarLarge = props => (
  <Avatar rootClassName={css.largeAvatar} renderSizes={AVATAR_SIZES} {...props} />
);
AvatarLarge.displayName = 'AvatarLarge';
