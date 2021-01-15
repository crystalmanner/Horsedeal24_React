import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import moment from 'moment';
import 'moment/locale/de-ch';
import {  propTypes } from '../../util/types';

import css from './BookingBreakdown.css';

const BookingPeriod = props => {
  const { startDate } = props;

  return (
    <>
        <div className={css.itemLabel}>
            <FormattedMessage id="BookingBreakdown.bookingStart" />
          </div>
          <div className={css.dayInfo}>
            {startDate}
          </div>
    </>
  );
};

const LineItemBookingPeriod = props => {
  const { booking, unitType, dateType } = props;

  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/#bookings
  const { start, displayStart } = booking.attributes;
  const formattedStartDate = moment(displayStart || start).locale('de-ch').format('dddd, D. MMMM yyyy')

  return (
    <>
      <div className={css.lineItem}>
        <BookingPeriod startDate={formattedStartDate} dateType={dateType} />
      </div>
      <hr className={css.totalDivider} />
    </>
  );
};
LineItemBookingPeriod.defaultProps = { dateType: null };

LineItemBookingPeriod.propTypes = {
  booking: propTypes.booking.isRequired,
  dateType: propTypes.dateType,
};

export default LineItemBookingPeriod;
