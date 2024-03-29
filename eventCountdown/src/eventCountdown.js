'use strict';

// eventCountdown.js
// Code sample by Jake LeBoeuf
// Email: design@jakeleboeuf.com
// Phone: (865) 242-1019
//
// This code sample uses the Google Calendar API to request event info
// and display a pretty countdown on the page. It is fast, lightweight
// and really easy to set up.
// Depends on jQuery and moment.js

/**
 * @eventCountdown method
 * @param {string} calendarId
 * @param {string} googleApiKey
 * @description
 *
 * The event countdown timer takes two paramaters-
 * A google calendar id, and a google api key. Once we have that
 * stuff, we'll fire off a request to googles calendar API.
 * If we find an event, we'll return upcoming event info.
 * If there are no events, we'll return false.
 *
 * Usage:
 * Use the 'event-countdown' attribute which will define the scope
 * You must set the 'calendar-id' and 'api-key' attributes.
 * Then you can use attributes within the container to tell us
 * where to drop in the info.
 * For a list of available attributes, check the project readme.
 * github.com/jakeleboeuf/portfolio/code_samples/README.md
 *
 * Example:
 * <script src="/jquery.min.js" />
 * <script src="/moment.min.js" />
 * <script src="/eventCountdown.js" />
 * <div event-countdown calendar-id="jfa04ru00fa9f39jf09afj309jf3" api-key="RofmOwI802J8dq0">
 *   <p>The next event is <a href="/" ec-name ec-link>loading...</a> and starts <span ec-countdown>loading...</span></p>
 *   <p>Address: <span ec-location>loading...</span>
 *   <p>Get there before it ends at <span ec-end>loading...</span>
 * </div>
 */

// Lets get this party started
(function(){
  // var countInterval = 6e4; // 1 minute
  var countInterval = 1e3; // 1 second

  // When the DOM is ready to party
  $(document).ready(function() {
    getEventDetails();
  });

  function getEventDetails() {
    var curTime = new Date().toISOString(),
      scope = $('[event-countdown]');

    // Make sure they are using the "event-calendar"
    // element somewhere on the page.
    if(scope.length > 0) {
      scope.each(function(i) {
        // Set up scoped vars
        var calendarId = $(scope[i]).attr('calendar-id'),
          googleApiKey = $(scope[i]).attr('api-key'),
          valid = true,

          // Set up API path
          apiPath = [
            "https://www.googleapis.com/calendar/v3/calendars/unitedpursuit.com",
            calendarId,
            "%40group.calendar.google.com/events?orderBy=startTime&singleEvents=true&timeMin=",
            curTime,
            "&key=",
            googleApiKey
          ].join("\n");

        // Some bad error checking...
        if(!calendarId) {
          $(scope[i]).append('<div class="alert alert-danger" role="alert"><p><strong>Error!</strong> A valid "calendar-id" attribute is required. Check the <a href="#" class="alert-link">docs</a> for more info.</p></div>');
          valid = false;
        }
        // Missing api key
        if(!googleApiKey) {
          $(scope[i]).append('<div class="alert alert-danger" role="alert"><p><strong>Error!</strong> A valid "api-key" attribute is required. Check the <a href="#" class="alert-link">docs</a> for more info.</p></div>');
          valid = false;
        }

        if(valid) {
          // Get calendar info from the Googs
          $.ajax({
            type: "GET",
            url:  apiPath,
            dataType: "json",
            success: function(response) {
              // It worked... now set up the things
              var calInfo = {};

              calInfo.nextStream = new Date(response.items[0].start.dateTime);
              calInfo.nextStreamEnd = new Date(response.items[0].end.dateTime);
              calInfo.name = response.items[0].summary;
              calInfo.location = response.items[0].location;
              calInfo.link = response.items[0].htmlLink;
              calInfo.now = new Date();

              // Update count accourding to countInterval
              updateCountdown(calInfo);
              setInterval(function() {
                calInfo.now = calInfo.now + countInterval;
                updateCountdown(calInfo);
              }, countInterval );
            },
            error: function(response) {
              // It didn't work. Stinks.
              $(scope[i]).prepend('<h2>Shoot, looks like something went wrong...</h2>');
            }
          }); // end ajax call
        } // end if(valid)
      }); // End scope.each
    }
  }

  // Takes a data object and spits out a
  // pretty 'time until' style response
  function updateCountdown(data) {
    $('[ec-link]').attr('href', data.link);
    $('[ec-name]').html(data.name);
    $('[ec-location]').html(data.location);
    $('[ec-countdown]').html(moment(data.nextStream).fromNow());
    $('[ec-start]').html(moment(data.nextStream).format('MMMM Do @ h:mm:ss a'));
    $('[ec-end]').html(moment(data.nextStreamEnd).format('MMMM Do @ h:mm:ss a'));
    $('[ec-now]').html(moment().format('MMMM Do @ h:mm:ss a'));
  };

})();

