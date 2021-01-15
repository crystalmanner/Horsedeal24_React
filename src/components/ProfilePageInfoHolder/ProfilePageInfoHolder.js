import React from 'react';
import css from './ProfilePageInfoHolder.css';

const otherInfoConfig = {
    age: {
      custom: 'Alter',
      type: 'text'
    },
    experience: {
      custom: 'Erfahrung',
      type: 'text'
    }, 
    language: {
      custom: 'Sprache',
      type: 'text'
    }, 
    licence: {
      custom: 'Lizenz',
      type: 'text'
    }, 
    drivingLicense: {
      custom: 'Führerschein',
      type: 'boolean'
    }, 
    auto:{
      custom: 'Auto',
      type: 'boolean'
    }, 
  }

export const ProfilePageInfoHolder = props => {
    const { publicData, sequence } = props
    const infoItems = typeof publicData === 'object' && !!Object.keys(publicData).length && Object.keys(publicData).filter(v => v !== 'location')
   
    if(infoItems && sequence) {
      infoItems.forEach((e,i,a) => {
        let index = sequence.indexOf(e)
        if(~index && index !== i) {
            const toChange = a.splice(i,1)[0]
            a.splice(index, 0, toChange)
        }
      })
    }
    return (
        <div className={css.otherInfoContainer}>
                    {infoItems && infoItems.map((i,j) => {
                      if(otherInfoConfig[i]) {
                        return (
                        <div className={css.otherInfoItem} key={j}>
                            <div>{otherInfoConfig[i].custom}</div>
                            <div>{otherInfoConfig[i].type === 'boolean' ? (!publicData[i] ? 'Nein' : 'Ja') : publicData[i]}</div>
                        </div>
                    )
                }
             })}
        </div>
    )
}