# yeditepe-widget

A Scriptable-based iOS widget for Yeditepe University students. The widget provides access to course schedules, dining menus, and examination information on the Home Screen, with dedicated course views for the Lock Screen.

## Installation

1. Create a new script in Scriptable and paste the complete contents of [Yeditepe-Kampus-Widget.js](outputs/Yeditepe-Kampus-Widget.js).
2. Run the script and sign in using your university account credentials. The student API identifier is retrieved automatically from the `cci` claim in the session token.
3. Add a Scriptable widget to the Home Screen or Lock Screen and select the script in the widget configuration.

Account credentials and the session token are stored in the device’s iOS Keychain.

## Features

- Support for small, medium, and large Home Screen widgets, as well as rectangular, circular, and inline Lock Screen widgets.
- Course times, session types such as `LEC` and `LAB`, and location information.
- A configurable cutoff for removing courses before their scheduled end time, followed by a transition to the following day’s schedule two hours after the final course ends.
- Adaptive layouts that prioritize courses, followed by dining menus and examinations.
- Compact indicators for content omitted from Home Screen widgets, with access to a detailed view.
- Daily dining cache validation based on the Istanbul time zone, with offline access to data retrieved on the same calendar day.
- Embedded branding and icons, requiring no additional packages or image files.

## Configuration

The following settings are available in the `APP` object at the beginning of the script:

| Setting | Default | Description |
| --- | --- | --- |
| `courseHideMinutesBeforeEnd` | `30` | Number of minutes before a course ends at which it is removed. Set to `0` to retain courses until they end. Courses whose duration is equal to or shorter than this interval are removed when they begin. |
| `refreshMinutes` | `15` | Standard interval, in minutes, used to request widget updates. |
| `examDays` | `15` | Day range passed to the examination API query. |

The widget parameter accepts `dark`, `light`, or `auto` to select the appearance. Custom widget dimensions can be specified using parameters such as `width=338;height=354`, expressed in iOS points.

Actual widget refresh timing is managed by iOS. Configured update intervals represent requests rather than guaranteed execution times.
