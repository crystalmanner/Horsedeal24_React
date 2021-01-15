import React, { Component } from 'react';
import { compose } from 'redux';
import css from './AppointmentScheduler.css';
import { Button } from '../../components';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';

class AppointmentSchedulerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <div className={css.appointmentContainer}>
            <Button
                rootClassName={css.appointmentBtn}
                onClick={() => null}
          ><FormattedMessage id="AppointmentScheduler.appointButtonAction" /></Button>
        </div>
    );
  };
};

const AppointmentScheduler = compose(injectIntl)(AppointmentSchedulerComponent);

export default AppointmentScheduler;
