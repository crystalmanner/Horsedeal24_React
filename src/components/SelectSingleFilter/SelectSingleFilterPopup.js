import React, { Component } from 'react';
import { string, func, arrayOf, shape, number, object } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import { Menu, MenuContent, MenuItem, MenuLabel } from '..';
import css from './SelectSingleFilterPopup.css';

const optionLabel = (options, key) => {
  const option = options.find(o => o.key === key);
  return option ? option.label : key;
};

class SelectSingleFilterPopup extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.onToggleActive = this.onToggleActive.bind(this);
    this.selectOption = this.selectOption.bind(this);
  }

  onToggleActive(isOpen) {
    this.setState({ isOpen: isOpen });
  }

  selectOption(urlParam, option) {
    this.setState({ isOpen: false });
    this.props.onSelect(urlParam, option);
  }

  render() {
    const {
      rootClassName,
      className,
      urlParam,
      label,
      options,
      initialValue,
      contentPlacementOffset,
      elementBeforeLabel,
      popupLabelCustomStyle,
    } = this.props;
    
    // resolve menu label text and class
    const menuLabel = initialValue ? optionLabel(options, initialValue) : label;
    const menuLabelClass = initialValue ? css.menuLabelSelected : css.menuLabel;

    const classes = classNames(rootClassName || css.root, className);

    return (
      <Menu
        className={classes}
        useArrow={false}
        contentPlacementOffset={contentPlacementOffset}
        onToggleActive={this.onToggleActive}
        isOpen={this.state.isOpen}
        forceLeft
      >
        <MenuLabel className={menuLabelClass} popupLabelCustomStyle={popupLabelCustomStyle}>{elementBeforeLabel} {menuLabel}</MenuLabel>
        <MenuContent className={css.menuContent}>
          {options.map(option => {
            // check if this option is selected
            const selected = initialValue === option.key;
            // menu item border class
            const menuItemBorderClass = selected ? css.menuItemBorderSelected : css.menuItemBorder;

            return (
              <MenuItem key={option.key}>
                <button
                  className={css.menuItem}
                  onClick={() => this.selectOption(urlParam, option.key)}
                >
                  <span className={menuItemBorderClass} />
                  {option.label}
                </button>
              </MenuItem>
            );
          })}
          <MenuItem key={'clearLink'}>
            <button className={css.clearMenuItem} onClick={() => this.selectOption(urlParam, null)}>
              <FormattedMessage id={'SelectSingleFilter.popupClear'} />
            </button>
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  }
}

SelectSingleFilterPopup.defaultProps = {
  rootClassName: null,
  className: null,
  initialValue: null,
  contentPlacementOffset: 0,
  elementBeforeLabel: null,
  popupLabelCustomStyle: {},
};

SelectSingleFilterPopup.propTypes = {
  rootClassName: string,
  className: string,
  urlParam: string.isRequired,
  label: string.isRequired,
  onSelect: func.isRequired,
  options: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ).isRequired,
  initialValue: string,
  contentPlacementOffset: number,
  popupLabelCustomStyle: object,
};

export default SelectSingleFilterPopup;
