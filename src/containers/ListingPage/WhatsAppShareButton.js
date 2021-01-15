import React from 'react';
import { string } from 'prop-types';
import css from './ListingPage.css';
import ShareIcon from './ShareIcon';

const whatsapp = 'https://web.whatsapp.com/send?text'

const icon = (
  <ShareIcon>
      <path d="m23.37 21.18c-.31.87-1.8 1.66-2.52 1.77-.65.1-1.46.14-2.35-.15a21.13 21.13 0 0 1 -2.13-.78c-3.74-1.61-6.19-5.36-6.38-5.61s-1.52-2.01-1.52-3.84.97-2.73 1.31-3.1.75-.46 1-.46.5 0 .71.01c.23.01.54-.09.84.64.31.75 1.06 2.57 1.15 2.76.09.18.16.4.03.65-.12.25-.19.4-.37.62-.19.22-.39.48-.56.65-.19.19-.38.39-.16.76s.97 1.59 2.08 2.58c1.43 1.26 2.63 1.66 3 1.84.37.19.59.16.81-.09s.93-1.09 1.18-1.46.5-.31.84-.19 2.18 1.02 2.55 1.21.62.28.72.43c.09.16.09.9-.22 1.77m3.26-15.82a14.88 14.88 0 0 0 -10.57-4.36c-8.23 0-14.94 6.67-14.94 14.87a14.78 14.78 0 0 0 1.99 7.43l-2.12 7.7 7.92-2.07a14.98 14.98 0 0 0 7.14 1.81h.01c8.23 0 14.93-6.67 14.94-14.87a14.74 14.74 0 0 0 -4.37-10.52" fillRule="evenodd"></path>
  </ShareIcon>
);

const WhatsAppShareButton = props => {
  const { url, title, text } = props;
 
  return (
    <a 
        href={`${whatsapp}=${text} ${url}`}
        target='_blank'
        className={css.shareItem}
        title={title}> 
            {icon}
            <span>
              WhatsApp
            </span>
    </a>
  )
};

WhatsAppShareButton.defaultProps = { title: '' };

WhatsAppShareButton.propTypes = {
    url: string,
    title: string,
    text: string,
};

export default WhatsAppShareButton;
