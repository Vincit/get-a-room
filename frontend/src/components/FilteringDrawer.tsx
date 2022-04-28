import React from 'react';
import { Box, styled, Typography } from '@mui/material';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InputAdornment from '@mui/material/InputAdornment';

export const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    width: '100%'
}));

export const SmallText = styled(Typography)(() => ({
    textTransform: 'uppercase',
    fontSize: '12px',
    lineHeight: '12px',
    fontWeight: 'bold',
    fontStyle: 'normal',
    margin: '24px 8px 8px 0'
}));

export const FilteringButton = styled(ToggleButton)(() => ({
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '16px',
    marginLeft: '18px'
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
    roomSize: string[];
    setRoomSize: (size: string[]) => void;
    resources: string[];
    setResources: (resource: string[]) => void;
    customFilter: string;
    setCustomFilter: (customFilter: string) => void;
    onlyFavourites: boolean;
    setOnlyFavourites: (value: boolean) => void;
    allFeatures: string[];
}

// Note: Actual filtering of the rooms is done one level up in booking view
const FilteringDrawer = (props: Props) => {
    const {
        open,
        toggle,
        roomSize,
        setRoomSize,
        resources,
        setResources,
        customFilter,
        setCustomFilter,
        onlyFavourites,
        setOnlyFavourites,
        allFeatures
    } = props;

    const handleRoomSizeChange = (
        event: React.MouseEvent<HTMLElement>,
        newRoomSize: string[]
    ) => {
        setRoomSize(newRoomSize);
    };

    const handleResourcesChange = (
        event: React.MouseEvent<HTMLElement>,
        newResources: string[]
    ) => {
        setResources(newResources);
    };

    const handleCustomFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomFilter(event.target.value);
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={'Filtering'}
            iconLeft={'FilterList'}
            iconRight={'Expand'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={false}
            mounted={true}
        >
            <DrawerContent>
                <Row>
                    <SmallText>Custom Filter</SmallText>
                </Row>
                <TextField
                    onChange={handleCustomFilter}
                    value={customFilter}
                    placeholder="Room name, resource..."
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
                <Row>
                    <SmallText>Room Size (People)</SmallText>
                </Row>
                <ToggleButtonGroup
                    value={roomSize}
                    onChange={handleRoomSizeChange}
                >
                    <ToggleButton value="1-2">1-2</ToggleButton>
                    <ToggleButton value="3-5">3-5</ToggleButton>
                    <ToggleButton value="6-7">6-7</ToggleButton>
                    <ToggleButton value="8-99999">8+</ToggleButton>
                </ToggleButtonGroup>
                <Row>
                    <SmallText>Resources</SmallText>
                </Row>
                <ToggleButtonGroup
                    value={resources}
                    onChange={handleResourcesChange}
                >
                    {allFeatures.map((feature) => (
                        <ToggleButton key={feature} value={feature}>
                            {feature}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <Row>
                    <SmallText>Favourites</SmallText>
                </Row>
                <ToggleButton
                    value="favourites"
                    selected={onlyFavourites}
                    onChange={() => {
                        setOnlyFavourites(!onlyFavourites);
                    }}
                >
                    <FavoriteBorderIcon />
                    &nbsp; Only Favourites
                </ToggleButton>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
};

export default FilteringDrawer;
