import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { DateTime } from 'luxon';

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

const TimePickerDrawer = (props: TimePickerDrawerProps) => {
    const {
        open,
        toggle,
        startingTime,
        setStartingTime,
        setExpandTimePickerDrawer
    } = props;
    const [time, setTime] = useState<string>(DateTime.now().toFormat('hh:mm'));

    // Whenever drawer is opened, set the time to current time - otherwise it can display old time as the default
    useEffect(() => {
        if (!(open && startingTime === 'Now')) {
            return;
        }
        setTime(DateTime.now().toFormat('hh:mm'));
    }, [open, startingTime]);

    const handleSetTime = (isNow: Boolean) => {
        const h = Number(time.split(':')[0]);
        const m = Number(time.split(':')[1]);
        const currentTime = DateTime.now();

        if (
            h < currentTime.hour ||
            isNow ||
            (h === currentTime.hour && m <= currentTime.minute)
        ) {
            setStartingTime('Now');
            setTime(currentTime.toFormat('hh:mm'));
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
                                        : DateTime.now().toFormat('hh:mm')
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
