import React from 'react';
import css from './UserRating.css';

    const userRatingIcon = (classNameToAdd, index) => (
      <svg className={css[`${classNameToAdd}`]} key={index} width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.938 8.008c-.15-.412-.544-.69-.985-.69H14.38L12.507.758C12.377.31 11.967 0 11.5 0c-.467 0-.88.31-1.006.76L8.618 7.317H1.046c-.442 0-.833.278-.983.69-.15.414-.025.876.314 1.16l5.7 4.75L3.2 21.59c-.16.43-.02.916.346 1.196.362.28.87.29 1.242.02l6.71-4.79 6.713 4.79c.375.27.88.26 1.245-.02.366-.28.504-.765.343-1.196l-2.875-7.67 5.7-4.75c.34-.284.463-.746.315-1.16" fillRule="evenodd">
        </path>
      </svg>
    )
  
  const getRating = userRating => {
    let rating = userRating
    let total = []
    for(let i = 0; i < 5; i++) {
      let classToAdd = (1 > rating) ? 'empty' : 'filled'
      total.push(userRatingIcon(classToAdd, i))
      --rating
    }
    return total
  }  

  export const UserRating = ({rating}) => (
    <div className={css.userRatingContainer}>
        {getRating(rating)}
    </div>
)