import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { DateTime, Duration } from 'luxon';

function getTimeLeft(endTime: string) {
    let end = DateTime.fromISO(endTime);
    let start = DateTime.now();

    let duration = Duration.fromObject(
        end.diff(start, ['hours', 'minutes']).toObject()
    );

    if (duration.hours === 0 && duration.minutes < 1) {
        return '< 1 min';
    }

    return duration.hours === 0
        ? Math.floor(duration.minutes) + ' min'
        : duration.hours + ' h ' + Math.floor(duration.minutes) + ' min';
}

type TimeLeftProps = {
    endTime: string;
    timeLeftText: string;
};

const TimeLeft = (props: TimeLeftProps) => {
    const { endTime, timeLeftText } = props;

    useEffect(() => {
        const interval = setInterval(() => {
            getTimeLeft(endTime);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box>
            <Typography style={{ fontStyle: 'italic' }}>
                {timeLeftText} {getTimeLeft(endTime)}
            </Typography>
        </Box>
    );
};

export default TimeLeft;