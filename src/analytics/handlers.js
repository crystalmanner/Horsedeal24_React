let refresh = false;
export class LoggingAnalyticsHandler {
  trackPageView(url) {
    console.log('Analytics page view:', url);
    if(url == '/' && refresh) {
      refresh = false;
      window.location.reload(true);
    } else {
      refresh = true;
    }
  }
}

export class GoogleAnalyticsHandler {
  constructor(ga) {
    if (typeof ga !== 'function') {
      throw new Error('Variable `ga` missing for Google Analytics');
    }
    this.ga = ga;
  }
  trackPageView(url) {
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications#tracking_virtual_pageviews
    this.ga('set', 'page', url);
    this.ga('send', 'pageview');
  }
}
