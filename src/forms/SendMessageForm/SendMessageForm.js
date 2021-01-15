import React, { Component } from 'react';
import { string, bool, func } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { Form, FieldTextInput, SecondaryButton } from '../../components'; //,EmojiPicker } 
import { propTypes } from '../../util/types';

import css from './SendMessageForm.css';

const BLUR_TIMEOUT_MS = 100;
const ACCEPT_ATTR = 'image/*,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const AttachFileIcon = () => (
  <svg version="1.1"  x="0px" y="0px" viewBox="0 0 511.988 511.988" style={{'enableBackground':'new 0 0 511.988 511.988'}}>
    <g style={{'transform':'translate(1 1)'}} >
      <g>
        <path d="M489.305,185.463c-8.354-8.309-21.861-8.272-30.17,0.081L202.687,443.379c-33.271,33.271-87.308,33.271-120.641-0.045
          c-33.308-33.325-33.308-87.362,0.004-120.674L346.089,57.234c20.772-20.771,54.543-20.771,75.375,0.045
          c20.826,20.826,20.826,54.593-0.005,75.425L202.727,351.434c-0.014,0.014-0.026,0.03-0.04,0.044
          c-8.333,8.287-21.8,8.276-30.116-0.04c-8.33-8.33-8.33-21.831,0-30.161l105.58-105.602c8.33-8.332,8.329-21.84-0.003-30.17
          c-8.332-8.33-21.84-8.329-30.17,0.003l-105.579,105.6c-24.991,24.991-24.991,65.507,0.002,90.499
          c24.992,24.992,65.508,24.992,90.501,0c0.029-0.029,0.052-0.06,0.08-0.089l218.646-218.646c37.494-37.494,37.494-98.276,0-135.77
          c-37.499-37.472-98.277-37.472-135.749,0L51.84,292.53C1.906,342.464,1.906,423.509,51.876,473.504
          c50.003,49.977,131.049,49.977,181.022,0.004l256.489-257.875C497.695,207.279,497.658,193.772,489.305,185.463z"/>
      </g>
    </g>
  </svg>
);

const IconSendMessage = () => {
  return (
    <svg
      className={css.sendIcon}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={css.strokeMatter} fill="none" fillRule="evenodd" strokeLinejoin="round">
        <path d="M12.91 1L0 7.003l5.052 2.212z" />
        <path d="M10.75 11.686L5.042 9.222l7.928-8.198z" />
        <path d="M5.417 8.583v4.695l2.273-2.852" />
      </g>
    </svg>
  );
};

class SendMessageFormComponent extends Component {
  constructor(props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.blurTimeoutId = null;
    this.messageInput = React.createRef();
  }

  // handleEmojiSelect = (event, emoji) => {
  //   event.preventDefault()
  //   this.messageInput.current.textarea.value += emoji
  // }
   
  handleFocus() {
    this.props.onFocus();
    window.clearTimeout(this.blurTimeoutId);
  }

  handleBlur() {
    // We only trigger a blur if another focus event doesn't come
    // within a timeout. This enables keeping the focus synced when
    // focus is switched between the message area and the submit
    // button.
    this.blurTimeoutId = window.setTimeout(() => {
      this.props.onBlur();
    }, BLUR_TIMEOUT_MS);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        render={formRenderProps => {
          const {
            rootClassName,
            className,
            messagePlaceholder,
            handleSubmit,
            inProgress,
            sendMessageError,
            invalid,
            form,
            formId,
            onDrag: onDragHandler,
            onDrop: onDropHandler,
            onImageUploadHandler,
            imageUploadRequested,
          } = formRenderProps;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = inProgress;
          const submitDisabled = invalid || submitInProgress;

          return (
            <Form className={classes} onSubmit={values => handleSubmit(values, form) }
              onDragOver={(e) => onDragHandler(e, true)}
              onDragEnter={(e) => onDragHandler(e, true)}
              onDragLeave={(e) => onDragHandler(e, false)}
              onDragEnd={(e) => onDragHandler(e, false)}
              onDrop={(e) => onDropHandler(e, form)}
              id={'sendMessageForm'}>
              <FieldTextInput
                inputRootClass={css.textarea}
                type="textarea"
                id={formId ? `${formId}.message` : 'message'}
                name="message"
                placeholder={messagePlaceholder}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                inputRef={this.messageInput}
                disabled={imageUploadRequested} 
              />
              <div>
                <div className={css.errorContainer}>
                  {sendMessageError ? (
                    <p className={css.error}>
                      <FormattedMessage id="SendMessageForm.sendFailed" />
                    </p>
                  ) : null}
                </div>
                <div className={css.submitContainer}>
                  <SecondaryButton
                    rootClassName={css.submitButton}
                    disabled={submitDisabled} 
                    inProgress={submitInProgress}
                    disabled={imageUploadRequested || submitDisabled}
                    // onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                  >
                    <label className={css.attachFileIcon} htmlFor={'addImage'}>
                      <AttachFileIcon/>
                      <FormattedMessage id={'TransactionPanel.attachFilesButtonText'} />
                    </label>
                  </SecondaryButton>
                  <SecondaryButton
                    rootClassName={css.submitButton}
                    disabled={submitDisabled} 
                    inProgress={submitInProgress}
                    disabled={imageUploadRequested || submitDisabled}
                    // onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                  >
                    <IconSendMessage />
                    <FormattedMessage id="SendMessageForm.sendMessage" />
                  </SecondaryButton>
                </div> 
                <input 
                    id='addImage' 
                    name='addImage' 
                    type='file'
                    className={css.attachFileInput}
                    disabled={submitDisabled} 
                    accept={ACCEPT_ATTR} 
                    onChange={e => {
                      const files = e.target.files;
                      onImageUploadHandler(files, form);
                    }}
                  />
              </div>
              {/* <EmojiPicker handleEmojiSelect={ (event, emoji) => this.handleEmojiSelect(event, emoji)}/> */}
            </Form>
          );
        }}
      />
    );
  }
}

SendMessageFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  inProgress: false,
  messagePlaceholder: null,
  onFocus: () => null,
  onBlur: () => null,
  onDragOver: () => null,
  onDragEnter: () => null,
  onDragLeave: () => null,
  onDragEnd: () => null,
  onDrop: () => null,
  sendMessageError: null,
  imageUploadRequested: false,
};

SendMessageFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  inProgress: bool,
  imageUploadRequested: bool,
  messagePlaceholder: string,
  onSubmit: func.isRequired,
  onFocus: func,
  onBlur: func,
  onDragOver: func,
  onDragEnter: func,
  onDragLeave: func,
  onDragEnd: func,
  onDrop: func,
  sendMessageError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SendMessageForm = compose(injectIntl)(SendMessageFormComponent);

SendMessageForm.displayName = 'SendMessageForm';

export default SendMessageForm;
