import { Box, Typography } from '@mui/material';
import { DateTime, Duration } from 'luxon';

export const getTimeLeftMinutes = (endTime: string) => {
    let nextReservationTime = DateTime.fromISO(endTime).toUTC();

    let duration = Duration.fromObject(
        nextReservationTime.diffNow(['minutes']).toObject()
    );
    return Math.floor(duration.minutes - 1);
};

export const getTimeLeft = (endTime: string) => {
    let nextReservationTime = DateTime.fromISO(endTime).toUTC();
    let duration = Duration.fromObject(
        nextReservationTime.diffNow(['hours', 'minutes']).toObject()
    );
    if (duration.hours === 0 && duration.minutes < 1) {
        return '< 1 min';
    }

    return duration.hours === 0
        ? Math.floor(duration.minutes) + ' min'
        : duration.hours + ' h ' + Math.floor(duration.minutes) + ' min';
};

export const getTimeLeftMinutes2 = (endTime: string) => {
    let endOfDay = DateTime.local().endOf('day').toUTC();
    let nextReservationTime = DateTime.fromISO(endTime).toUTC();

    let duration = Duration.fromObject(
        nextReservationTime.diffNow(['minutes']).toObject()
    );

    // If nextReservationTime equals to end of the day, then that means that the
    // room has no current reservations for that day and is free all day.
    if (nextReservationTime.equals(endOfDay) || duration.hours >= 1440) {
        let bookUntilObj = DateTime.now().toObject();

        // Sets duration for booking until 17:00, if it's past that time set to 23:55
        if (
            (bookUntilObj.hour >= 17 && bookUntilObj.minute >= 0) ||
            bookUntilObj.hour > 17
        ) {
            bookUntilObj.hour = 23;
            bookUntilObj.minute = 55;
        } else {
            bookUntilObj.hour = 17;
            bookUntilObj.minute = 0;
        }

        let bookUntil = DateTime.fromObject(bookUntilObj);
        let durationToBookUntil = Duration.fromObject(
            bookUntil.diffNow(['minutes']).toObject()
        );
        return Math.round(durationToBookUntil.minutes);
    }

    if (duration.hours === 0 && duration.minutes < 1) {
        return 0;
    }
    // If there was a next meeting, this sets the duration so that the end
    // time is 5 minutes before the next meeting begins to prevent overlapping
    // errors. There could be a better fix.
    return Math.ceil(duration.minutes) - 5;
};

type TimeLeftProps = {
    endTime: string;
    timeLeftText: string;
};

const TimeLeft = (props: TimeLeftProps) => {
    const { endTime, timeLeftText } = props;

    return (
        <Box>
            <Typography data-testid="TimeLeftTest">
                {timeLeftText} {getTimeLeft(endTime)}
            </Typography>
        </Box>
    );
};

export default TimeLeft;
