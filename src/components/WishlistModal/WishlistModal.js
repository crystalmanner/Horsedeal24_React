import React, { useState } from 'react';
import css from './WishlistModal.css';
import { Modal, Form, SecondaryButton, PrimaryButton, ResponsiveImage } from '..';
import { Form as FinalForm } from 'react-final-form';
import { createImage } from '../Wishlist/Wishlist';
import { FormattedMessage } from '../../util/reactIntl';

export const WishlistModal = ({
    modalOpened, 
    onCloseEnquiryModal, 
    onOpenEnquiryModal,
    handleNewListCreation, 
    id = '', 
    shouldNewListModalToBeOpened,
    wishlists,
    total,
}) => {
    const [inputElValue, setInputElValue] = useState('')

    const handleInputChange = (e) => {
        if(!e || !e.target) return;
        setInputElValue(e.target.value)
    }

    const newList = (
        <>
            <label>
                <input type='text' id='wishlist' name='wishlist' value={inputElValue} placeholder='Name' onChange={e => handleInputChange(e)} maxLength={50}/>
                <FormattedMessage id="Wishlist.maxSymb" />
            </label>        
            <div className={css.submitContainer}>
                <SecondaryButton onClick={e => onCloseEnquiryModal(e)}>
                    <FormattedMessage id="Wishlist.cancel" />
                </SecondaryButton>
                <PrimaryButton disabled={!inputElValue}>
                    <FormattedMessage id="Wishlist.createNewList" />
                </PrimaryButton>                                           
             </div>
        </>
    )

    const existingList = () => {
        return (<>
            <div className={css.favoriteWrapper} >
                <div className={css.favoriteLists}>
                </div> 
            </div>
            <PrimaryButton onClick={() => onOpenEnquiryModal('newListModalOpened')}>
                <FormattedMessage id="Wishlist.createNewList" />
            </PrimaryButton> 
        </>)
    }

    const modalHeader = shouldNewListModalToBeOpened ? <FormattedMessage id="Wishlist.createBookmark" /> : <FormattedMessage id="Wishlist.saveWishlist" />

    return (
        <div className={css.modal}>
            <Modal
                id={`Wishlist.enquiry.${id}`}
                isOpen={modalOpened}
                onClose={onCloseEnquiryModal}
                onManageDisableScrolling={() => {}}
            >
            <div>
            <div className={css.modalHeader}>{modalHeader}</div>
                    <FinalForm  
                        onSubmit={(values) => handleNewListCreation(values)}
                        render={() => {
                            return (
                                <Form className={css.form} onSubmit={(values) => handleNewListCreation(values)} >
                                    {shouldNewListModalToBeOpened ? newList : existingList()}
                                </Form>
                            );
                        }}
                    />            
                </div>
            </Modal>      
        </div>
    )
}

WishlistModal.defaultProps = {
    modalOpened: false, 
    onCloseEnquiryModal: () => null, 
    onOpenEnquiryModal: () => null,
    handleNewListCreation: () => null, 
    id: '', 
    shouldNewListModalToBeOpened: false,
    wishlists: { lists: {}, items: {} },
    total: {}
  };