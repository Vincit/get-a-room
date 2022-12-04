import * as React from 'react';
import {useState} from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import { Typography, Box, styled } from '@mui/material';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import { setTime, getTime } from '../services/timeService';
import { start } from 'repl';
import { DrawerButtonPrimary } from './BookingDrawer';
import { DateTime } from 'luxon';

const RowCentered = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'left',
    padding: '0px',
    width: '100%'
}));

type StartTimePickerProps = {
    open: boolean;
    onClose: (close: boolean) => void;
    toggle: (open: boolean) => void;
    startTime: string; 
    onChange: (startTime: string) => void;
};


const StartTimePicker = (props: StartTimePickerProps) => {
    const { open, onClose, toggle, startTime, onChange } = props;
    const toggleDrawer = (newOpen: boolean) => () => {
        toggle(newOpen);
    };
    

    const handleChange = (
        event: React.MouseEvent, newStartTime: string) => {
        if (newStartTime !== null) {
            setTime(newStartTime); 
            onChange(newStartTime);
        }
    }; 
    return (
        <SwipeableEdgeDrawer
            headerTitle={"Edit starting time"}
            iconLeft={'FilterList'}
            iconRight={'Expand'}
            onClose={onClose}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
            mounted={false}
        >
            <DrawerContent>
                <RowCentered>
                    <Typography
                        variant="body1"
                        sx={{color: '#000000', font: 'Roboto Mono'}}
                    >
                    <label htmlFor="starttime">Choose a start time: </label>
                    <input type="time" id="starttime" name="starttime" required></input>
                    
                    </Typography>
                </RowCentered>
                <RowCentered>
                    <DrawerButtonPrimary
                    onClick={() => {
                        if (DateTime.now().minute < 10 && DateTime.now().hour >= 10) setTime(DateTime.now().hour + ":0" + DateTime.now().minute);
                        else if (DateTime.now().minute >= 10 && DateTime.now().hour < 10) setTime("0" + DateTime.now().hour + ":" + DateTime.now().minute);
                        else if (DateTime.now().minute < 10 && DateTime.now().hour < 10) setTime("0" + DateTime.now().hour + ":0" + DateTime.now().minute);
                        else setTime(DateTime.now().hour + ":" + DateTime.now().minute);
                        toggle(false);
                        onClose(false);
                    }}>Set to Now</DrawerButtonPrimary>
                    <DrawerButtonPrimary
                    onClick={() => {
                        setTime((document.getElementById("starttime") as HTMLInputElement).value);
                        toggle(false);
                        onClose(false);
                    }}>Set Time</DrawerButtonPrimary>
                </RowCentered>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
}; 
export default StartTimePicker;