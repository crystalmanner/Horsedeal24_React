import React from 'react';
import { string } from 'prop-types';
import css from './ListingPage.css';
import ShareIcon from './ShareIcon';

const icon = (
    <ShareIcon>
        <path d="m25.78 1.74c0 .41-.33.74-.74.74h-19.55v25.5a.74.74 0 1 1 -1.49 0v-25.75c0-.68.56-1.23 1.24-1.23h19.81c.41 0 .74.33.74.74zm3.22 3.46v25.76a.98.98 0 0 1 -.99.98h-19.8a.99.99 0 0 1 -.99-.98v-25.76c0-.54.44-.98.99-.98h19.81c.54 0 .99.45.99.98zm-17.82 3.47c0 .27.22.5.5.5h5.94a.49.49 0 1 0 0-.99h-5.94a.5.5 0 0 0 -.5.5zm13.86 13.87a.5.5 0 0 0 -.5-.5h-12.87a.49.49 0 1 0 0 .99h12.87a.5.5 0 0 0 .5-.5zm0-3.96a.5.5 0 0 0 -.5-.5h-12.87a.5.5 0 1 0 0 .99h12.87a.5.5 0 0 0 .5-.5zm0-3.96a.5.5 0 0 0 -.5-.5h-12.87a.5.5 0 1 0 0 .99h12.87a.5.5 0 0 0 .5-.5z" fillRule="evenodd"></path>
    </ShareIcon>
);

const copyLink = shareLink => {
    const documentIsDefined = typeof document !== 'undefined'; // for server-side rendering
    if(documentIsDefined) {
        const elementLink = document.createElement('textarea');
        elementLink.value = shareLink;
        document.body.appendChild(elementLink);
        elementLink.select();
        document.execCommand('copy');
        document.body.removeChild(elementLink);
    }
}

const CopyLinkButton = ({url,text}) => (
    <button className={css.shareItem} onClick={() => copyLink(url)}>
          {icon}
          <span>
            {text}
          </span>
    </button>
);

CopyLinkButton.propTypes = {
    url: string,
};

export default CopyLinkButton;