import React, { useState, useEffect } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

export const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    width: '100%'
}));

export const RowCentered = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0px',
    width: '100%'
}));

export const SmallText = styled(Typography)(() => ({
    textTransform: 'uppercase',
    fontSize: '12px',
    lineHeight: '12px',
    fontWeight: 'bold',
    fontStyle: 'normal',
    margin: '24px 8px 0 0'
}));

export const SpacerFirst = styled('div')(() => ({
    padding: '8px 8px 8px 0px'
}));

export const SpacerMiddle = styled('div')(() => ({
    padding: '8px'
}));

export const SpacerLast = styled('div')(() => ({
    padding: '8px 0px 8px 8px'
}));

export const SpacedToggleButton = styled(ToggleButton)(() => ({
    margin: '8px'
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
}

const FilteringDrawer = (props: Props) => {
    const { open, toggle } = props;

    return (
        <SwipeableEdgeDrawer
            headerTitle={'Filtering'}
            iconLeft={'FilterList'}
            iconRight={'Expand'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <DrawerContent>
                <Row>
                    <SmallText>Custom Filter</SmallText>
                </Row>
                <TextField />
                <Row>
                    <SmallText>Room Size (People)</SmallText>
                </Row>
                <ToggleButtonGroup>
                    <SpacerFirst>
                        <ToggleButton value="1-2">1-2</ToggleButton>
                    </SpacerFirst>
                    <SpacerMiddle>
                        <ToggleButton value="3-5">3-5</ToggleButton>
                    </SpacerMiddle>
                    <SpacerMiddle>
                        <ToggleButton value="6-7">6-7</ToggleButton>
                    </SpacerMiddle>
                    <SpacerMiddle>
                        <ToggleButton value="8+">8+</ToggleButton>
                    </SpacerMiddle>
                    <SpacerLast>
                        <ToggleButton value="Custom">Custom</ToggleButton>
                    </SpacerLast>
                </ToggleButtonGroup>
                <Row>
                    <SmallText>Resources</SmallText>
                </Row>
                <ToggleButtonGroup>
                    <SpacerFirst>
                        <ToggleButton value="Jabra">Jabra</ToggleButton>
                    </SpacerFirst>
                    <SpacerLast>
                        <ToggleButton value="Webcam">Webcam</ToggleButton>
                    </SpacerLast>
                </ToggleButtonGroup>
                <Row>
                    <SmallText>Favourites</SmallText>
                </Row>
                <ToggleButton value="favourites">Only Favourites</ToggleButton>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
};

export default FilteringDrawer;
