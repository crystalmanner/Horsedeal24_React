import React, { Component } from 'react';
import { object, string, bool, number, func, shape, array } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { withRouter } from 'react-router-dom';
import omit from 'lodash/omit';

import routeConfiguration from '../../routeConfiguration';
import { parseDateFromISO8601, stringifyDateToISO8601 } from '../../util/dates';
import { createResourceLocatorString } from '../../util/routes';
import {
  ModalInMobile,
  Button,
  PriceFilter,
  SelectMultipleFilter,
  RangeFilter,
  SelectSingleFilter
} from '../../components';
import SortingIcon from '../SearchFilters/SortingIcon';
import { propTypes } from '../../util/types';
import css from './SearchFiltersMobile.css';

const RADIX = 10;

class SearchFiltersMobileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isFiltersOpenOnMobile: false, initialQueryParams: null };

    this.openFilters = this.openFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.handleSelectSingle = this.handleSelectSingle.bind(this);
    this.handleSelectMultiple = this.handleSelectMultiple.bind(this);
    this.handlePrice = this.handlePrice.bind(this);
    this.handleRange = this.handleRange.bind(this);
    this.handleDateRange = this.handleDateRange.bind(this);
    this.handleKeyword = this.handleKeyword.bind(this);
    this.initialValue = this.initialValue.bind(this);
    this.initialValues = this.initialValues.bind(this);
    this.initialPriceRangeValue = this.initialPriceRangeValue.bind(this);
    this.initialDateRangeValue = this.initialDateRangeValue.bind(this);
  }

  // Open filters modal, set the initial parameters to current ones
  openFilters() {
    const { onOpenModal, urlQueryParams } = this.props;
    onOpenModal();
    this.setState({ isFiltersOpenOnMobile: true, initialQueryParams: urlQueryParams });
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    const { history, onCloseModal } = this.props;

    history.push(
      createResourceLocatorString(
        'SearchPage',
        routeConfiguration(),
        {},
        this.state.initialQueryParams
      )
    );
    onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false, initialQueryParams: null });
  }

  // Close the filter modal
  closeFilters() {
    this.props.onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false });
  }

  handleSelectSingle(urlParam, option) {
    const { urlQueryParams, history } = this.props;

    // query parameters after selecting the option
    // if no option is passed, clear the selection for the filter
    const queryParams = option
      ? { ...urlQueryParams, [urlParam]: option }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleSelectMultiple(urlParam, options) {
    const { urlQueryParams, history } = this.props;

    const queryParams =
      options && options.length > 0
        ? { ...urlQueryParams, [urlParam]: options.join(',') }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handlePrice(urlParam, range) {
    const { urlQueryParams, history } = this.props;
    const { minPrice, maxPrice } = range || {};
    const queryParams =
      minPrice != null && maxPrice != null
        ? { ...urlQueryParams, [urlParam]: `${minPrice},${maxPrice}` }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleRange = (urlParam, range) => {
    const { urlQueryParams, history } = this.props;
    const { minValue, maxValue } = range || {};

    const queryParams =
      minValue != null && maxValue != null
        ? { ...urlQueryParams, [urlParam]: `${minValue},${maxValue}` }
        : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  };

  handleDateRange(urlParam, dateRange) {
    const { urlQueryParams, history } = this.props;
    const hasDates = dateRange && dateRange.dates;
    const { startDate, endDate } = hasDates ? dateRange.dates : {};

    const start = startDate ? stringifyDateToISO8601(startDate) : null;
    const end = endDate ? stringifyDateToISO8601(endDate) : null;

    const queryParams =
      start != null && end != null
        ? { ...urlQueryParams, [urlParam]: `${start},${end}` }
        : omit(urlQueryParams, urlParam);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleKeyword(urlParam, keywords) {
    const { urlQueryParams, history } = this.props;
    const queryParams = urlParam
      ? { ...urlQueryParams, [urlParam]: keywords }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }

  handleSorting = (urlParam, option) => this.props.history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, { ...this.props.urlQueryParams, [urlParam]: option } ));

  // Reset all filter query parameters
  resetAll(e) {
    const { urlQueryParams, history, filterParamNames } = this.props;

    const queryParams = omit(urlQueryParams, filterParamNames);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  // resolve initial value for a single value filter
  initialValue(paramName) {
    return this.props.urlQueryParams[paramName];
  }

  // resolve initial values for a multi value filter
  initialValues(paramName) {
    const urlQueryParams = this.props.urlQueryParams;
    return !!urlQueryParams[paramName] ? urlQueryParams[paramName].split(',') : [];
  }

  initialPriceRangeValue(paramName) {
    const urlQueryParams = this.props.urlQueryParams;
    const price = urlQueryParams[paramName];
    const valuesFromParams = !!price ? price.split(',').map(v => Number.parseInt(v, RADIX)) : [];

    return !!price && valuesFromParams.length === 2
      ? {
          minPrice: valuesFromParams[0],
          maxPrice: valuesFromParams[1],
        }
      : null;
  }
  initialRangeValues = paramName => {
    const urlQueryParams = this.props.urlQueryParams;
    const value = urlQueryParams[paramName];
    const valuesFromParams = !!value ? value.split(',').map(v => Number.parseInt(v, RADIX)) : [];
    return !!value && valuesFromParams.length === 2
      ? {
          minValue: valuesFromParams[0],
          maxValue: valuesFromParams[1],
        }
      : null;
  };

  initialDateRangeValue(paramName) {
    const urlQueryParams = this.props.urlQueryParams;
    const dates = urlQueryParams[paramName];
    const rawValuesFromParams = !!dates ? dates.split(',') : [];
    const valuesFromParams = rawValuesFromParams.map(v => parseDateFromISO8601(v));
    const initialValues =
      !!dates && valuesFromParams.length === 2
        ? {
            dates: { startDate: valuesFromParams[0], endDate: valuesFromParams[1] },
          }
        : { dates: null };

    return initialValues;
  }

  render() {
    const {
      rootClassName,
      className,
      listingsAreLoaded,
      resultsCount,
      searchInProgress,
      showAsModalMaxWidth,
      onMapIconClick,
      onManageDisableScrolling,
      selectedFiltersCount,
      genderFilter,
      ageFilter,
      breedFilter,
      hightFilter,
      colorFilter,
      mainDisciplineFilter,
      priceFilter,
      intl,
    } = this.props;

    const { initialRangeValues, initialValues } = this;

    const classes = classNames(rootClassName || css.root, className);

    const resultsFound = (
      <FormattedMessage id="SearchFilters.foundResults" values={{ count: resultsCount }} />
    );
    const noResults = <FormattedMessage id="SearchFilters.noResultsMobile" />;
    const loadingResults = <FormattedMessage id="SearchFilters.loadingResultsMobile" />;
    const filtersHeading = intl.formatMessage({ id: 'SearchFiltersMobile.heading' });
    const modalCloseButtonMessage = intl.formatMessage({ id: 'SearchFiltersMobile.cancel' });

    const showListingsLabel = intl.formatMessage(
      { id: 'SearchFiltersMobile.showListings' },
      { count: resultsCount }
    );

    const filtersButtonClasses =
      selectedFiltersCount > 0 ? css.filtersButtonSelected : css.filtersButton;

    const genderLabel = intl.formatMessage({
      id: 'SearchFiltersMobile.genderLabel',
    });
    const breedLabel = intl.formatMessage({
      id: 'SearchFiltersMobile.breedLabel',
    });
    const colorLabel = intl.formatMessage({
      id: 'SearchFiltersMobile.colorLabel',
    });
    const mainDisciplineLabel = intl.formatMessage({
      id: 'SearchFiltersMobile.mainDisciplineLabel',
    });

    const initialGender = initialValues(genderFilter.paramName);

    const initialAge = initialRangeValues(ageFilter.paramName);

    const initialBreed = initialValues(breedFilter.paramName);

    const initialHight = initialRangeValues(hightFilter.paramName);

    const initialColor = initialValues(colorFilter.paramName);

    const initialMainDiscipline = initialValues(mainDisciplineFilter.paramName);

    const filterElementProps = {
      onSubmit: this.handleSelectSingle,
      liveEdit: true,
    };

    const genderFilterElement = genderFilter ? (
      <SelectMultipleFilter
        id="SearchFiltersMobile.genderFilter"
        name="gender"
        urlParam={genderFilter.paramName}
        label={genderLabel}
        options={genderFilter.options}
        initialValues={initialGender}
        {...filterElementProps}
      />
    ) : null;

    const ageFilterElement = ageFilter ? (
      <RangeFilter
        id="SearchFilters.ageFilter"
        urlParam={ageFilter.paramName}
        onSubmit={this.handleRange}
        buttonLabelId="SearchFilters.ageLabel"
        buttonLabelSelectedId="SearchFilters.ageSelectedLabel"
        rangeFilterFormLabelId="SearchFilters.ageLabel"
        valueTypeLabelId="SearchFilter.typeAgeValue"
        initialValues={initialAge}
        rangeFilterFormValueId="SearchFilter.typeAgeValue"
        {...ageFilter.config}
      />
    ) : null;

    const breedFilterElement = breedFilter ? (
      <SelectMultipleFilter
        id="SearchFiltersMobile.breedFilter"
        name="breed"
        urlParam={breedFilter.paramName}
        label={breedLabel}
        options={breedFilter.options}
        initialValues={initialBreed}
        {...filterElementProps}
      />
    ) : null;

    const hightFilterElement = hightFilter ? (
      <RangeFilter
        id="SearchFilters.hightFilter"
        urlParam={hightFilter.paramName}
        onSubmit={this.handleRange}
        buttonLabelId="SearchFilters.hightLabel"
        buttonLabelSelectedId="SearchFilters.hightSelectedLabel"
        rangeFilterFormLabelId="SearchFilters.hightLabel"
        valueTypeLabelId="SearchFilter.typeHeightValue"
        initialValues={initialHight}
        rangeFilterFormValueId="SearchFilter.typeHeightValue"
        {...hightFilter.config}
      />
    ) : null;

    const colorFilterElement = colorFilter ? (
      <SelectMultipleFilter
        id="SearchFiltersMobile.colorFilter"
        name="color"
        urlParam={colorFilter.paramName}
        label={colorLabel}
        options={colorFilter.options}
        initialValues={initialColor}
        {...filterElementProps}
      />
    ) : null;

    const mainDisciplineFilterElement = mainDisciplineFilter ? (
      <SelectMultipleFilter
        id="SearchFiltersMobile.mainDisciplineFilter"
        name="mainDiscipline"
        urlParam={mainDisciplineFilter.paramName}
        label={mainDisciplineLabel}
        options={mainDisciplineFilter.options}
        initialValues={initialMainDiscipline}
        {...filterElementProps}
      />
    ) : null;

    const initialPriceRange = this.initialPriceRangeValue(priceFilter.paramName);

    const priceFilterElement = priceFilter ? (
      <PriceFilter
        id="SearchFiltersMobile.priceFilter"
        urlParam={priceFilter.paramName}
        onSubmit={this.handlePrice}
        {...priceFilter.config}
        initialValues={initialPriceRange}
      />
    ) : null;

    const sortingParams = [
      {
        label: 'Neueste',
        key: 'createdAt',
      },
      {
        label: 'Älteste',
        key: '-createdAt',
      },
      {
        label: 'Geringster Preis',
        key: '-price',
      },
      {
        label: 'Höchster Preis',
        key: 'price',
      },
  ];

  const sortingPanelLabel = (this.props.urlQueryParams && this.props.urlQueryParams.sort)
   ? sortingParams.filter(s => s.key === this.props.urlQueryParams.sort)[0].label
    : intl.formatMessage({ id: 'SearchFilters.sortingPanelLabel', })

  const sortingElement = (
    <SelectSingleFilter
      id='SearchFilters.sortingElement'
      name='sortingPanel'
      urlParam='sort'
      label={sortingPanelLabel}
      popupLabelCustomStyle={{ padding: '7px 15px 7px 16px', height: '35px' }}
      elementBeforeLabel={<SortingIcon />}
      options={sortingParams}
      initialValue={null}
      showAsPopup={true}
      onSelect={this.handleSorting}
    />
  );

    return (
      <div className={classes}>
        <div className={css.searchResultSummary}>
          {listingsAreLoaded && resultsCount > 0 ? resultsFound : null}
          {listingsAreLoaded && resultsCount === 0 ? noResults : null}
          {searchInProgress ? loadingResults : null}
        </div>
        <div className={css.buttons}>
          <div className={css.sortingPanel}>
            {sortingElement}
          </div>
          <Button rootClassName={filtersButtonClasses} onClick={this.openFilters}>
            <FormattedMessage id="SearchFilters.filtersButtonLabel" className={css.mapIconText} />
          </Button>
          <div className={css.mapIcon} onClick={onMapIconClick}>
            <FormattedMessage id="SearchFilters.openMapView" className={css.mapIconText} />
          </div>
        </div>
        <ModalInMobile
          id="SearchFiltersMobile.filters"
          isModalOpenOnMobile={this.state.isFiltersOpenOnMobile}
          onClose={this.cancelFilters}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={modalCloseButtonMessage}
        >
          <div className={css.modalHeadingWrapper}>
            <span className={css.modalHeading}>{filtersHeading}</span>
            <button className={css.resetAllButton} onClick={e => this.resetAll(e)}>
              <FormattedMessage id={'SearchFiltersMobile.resetAll'} />
            </button>
          </div>
          {this.state.isFiltersOpenOnMobile ? (
            <div className={css.filtersWrapper}>
              {priceFilterElement}
              {hightFilterElement}
              {ageFilterElement}
              {mainDisciplineFilterElement}
              {breedFilterElement}
              {colorFilterElement}
              {genderFilterElement}
            </div>
          ) : null}

          <div className={css.showListingsContainer}>
            <Button className={css.showListingsButton} onClick={this.closeFilters}>
              {showListingsLabel}
            </Button>
          </div>
        </ModalInMobile>
      </div>
    );
  }
}

SearchFiltersMobileComponent.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchingInProgress: false,
  selectedFiltersCount: 0,
  filterParamNames: [],
  genderFilter: null,
  ageFilter: null,
  breedFilter: null,
  hightFilter: null,
  colorFilter: null,
  mainDisciplineFilter: null,
  priceFilter: null,
};

SearchFiltersMobileComponent.propTypes = {
  rootClassName: string,
  className: string,
  urlQueryParams: object.isRequired,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchingInProgress: bool,
  showAsModalMaxWidth: number.isRequired,
  onMapIconClick: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  selectedFiltersCount: number,
  filterParamNames: array,
  genderFilter: propTypes.filterConfig,
  ageFilter: propTypes.filterConfig,
  breedFilter: propTypes.filterConfig,
  hightFilter: propTypes.filterConfig,
  colorFilter: propTypes.filterConfig,
  mainDisciplineFilter: propTypes.filterConfig,
  priceFilter: propTypes.filterConfig,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const SearchFiltersMobile = injectIntl(withRouter(SearchFiltersMobileComponent));

export default SearchFiltersMobile;
