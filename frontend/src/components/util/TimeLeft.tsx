import { Box, Typography } from '@mui/material';
import { DateTime, Duration } from 'luxon';

export const getTimeLeft = (endTime: string) => {
    let endOfDay = DateTime.local().endOf('day').toUTC();
    let nextReservationTime = DateTime.fromISO(endTime).toUTC();

    let duration = Duration.fromObject(
        nextReservationTime.diffNow(['hours', 'minutes']).toObject()
    );

    // If nextReservationTime equals to end of the day, then that means that the
    // room has no current reservations for that day and is free all day.
    if (nextReservationTime.equals(endOfDay) || duration.hours >= 24) {
        return 'All day';
    }

    if (duration.hours === 0 && duration.minutes < 1) {
        return '< 1 min';
    }

    return duration.hours === 0
        ? Math.floor(duration.minutes) + ' min'
        : duration.hours + ' h ' + Math.floor(duration.minutes) + ' min';
};

export const getTimeLeftMinutes = (endTime: string) => {
    let endOfDay = DateTime.local().endOf('day').toUTC();
    let nextReservationTime = DateTime.fromISO(endTime).toUTC();

    let duration = Duration.fromObject(
        nextReservationTime.diffNow(['minutes']).toObject()
    );

    // If nextReservationTime equals to end of the day, then that means that the
    // room has no current reservations for that day and is free all day.
    if (nextReservationTime.equals(endOfDay) || duration.hours >= 1440) {
        let bookUntilObj = DateTime.local().toObject();

        //Sets duration for booking until 17:00, if it's past that time set to 23:59
        if (bookUntilObj.hour >= 17 && bookUntilObj.minute >= 0) {
            bookUntilObj.hour = 23;
            bookUntilObj.minute = 59;
        } else {
            bookUntilObj.hour = 17;
            bookUntilObj.minute = 0;
        }

        let bookUntil = DateTime.fromObject(bookUntilObj);
        let durationToBookUntil = Duration.fromObject(
            bookUntil.diffNow(['minutes']).toObject()
        );
        return durationToBookUntil.minutes;
    }

    if (duration.hours === 0 && duration.minutes < 1) {
        return 0;
    }

    return Math.round(duration.minutes) - 1;
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
