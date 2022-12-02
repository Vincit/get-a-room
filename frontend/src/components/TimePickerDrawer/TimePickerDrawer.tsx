import { TextField, Box } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import {
    DrawerButtonPrimary,
    DrawerButtonSecondary,
    Row
} from '../BookingDrawer/BookingDrawer';
import SwipeableEdgeDrawer, {
    DrawerContent
} from '../SwipeableEdgeDrawer/SwipeableEdgeDrawer';

interface TimePickerDrawerProps {
    open: boolean;
    toggle: (open: boolean) => void;
    startingTime: string;
    setStartingTime: (time: string) => void;
    setExpandTimePickerDrawer: (state: boolean) => void;
}

const formatTime = (h: Number, m: Number) => {
    return `${h < 10 ? `0${h}` : `${h}`}:${m < 10 ? `0${m}` : `${m}`}`;
};

const TimePickerDrawer = (props: TimePickerDrawerProps) => {
    const {
        open,
        toggle,
        startingTime,
        setStartingTime,
        setExpandTimePickerDrawer
    } = props;
    const currentTime = DateTime.now();
    const defaultValue =
        startingTime === 'Now'
            ? formatTime(currentTime.hour, currentTime.minute)
            : startingTime;

    const [time, setTime] = useState<string>(defaultValue);

    const handleSetTime = (isNow: Boolean) => {
        const h = Number(time.split(':')[0]);
        const m = Number(time.split(':')[1]);

        if (
            h < currentTime.hour ||
            isNow ||
            (h === currentTime.hour && m < currentTime.minute)
        ) {
            setStartingTime('Now');
            setTime(formatTime(currentTime.hour, currentTime.minute));
        } else {
            setStartingTime(time);
        }
        setExpandTimePickerDrawer(false);
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={'Edit starting time'}
            iconLeft={'AccessTime'}
            iconRight={'Close'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <DrawerContent
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <form
                        noValidate
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap'
                        }}
                    >
                        <TextField
                            id="time"
                            type="time"
                            value={time}
                            InputLabelProps={{
                                shrink: true
                            }}
                            inputProps={{
                                step: 300 // 5 min
                            }}
                            onChange={(e) => {
                                setTime(
                                    e?.target?.value
                                        ? e?.target?.value
                                        : `${currentTime.hour}:${currentTime.minute}`
                                );
                            }}
                            style={{ width: '150px' }}
                        />
                    </form>
                    <Row>
                        <DrawerButtonSecondary
                            aria-label="set to now"
                            onClick={() => handleSetTime(true)}
                        >
                            Set to Now
                        </DrawerButtonSecondary>
                    </Row>
                    <Row>
                        <DrawerButtonPrimary
                            aria-label="confirm"
                            onClick={() => handleSetTime(false)}
                        >
                            Confirm
                        </DrawerButtonPrimary>
                    </Row>
                </DrawerContent>
            </Box>
        </SwipeableEdgeDrawer>
    );
};

export default TimePickerDrawer;
