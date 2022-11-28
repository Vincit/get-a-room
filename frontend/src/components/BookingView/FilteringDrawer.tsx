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
    filterCount: number;
    allFeatures: string[];
    onChange: (duration: number) => void;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
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
        filterCount,
        allFeatures,
        onChange,
        duration,
        setDuration
    } = props;

    const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
        '& .MuiToggleButtonGroup-grouped': {
            marginRight: '16px',
            '&:not(:first-of-type)': {
                border: 'solid',
                borderWidth: 'thin',
                borderRadius: '50px'
            },
            '&:first-of-type': {
                marginLeft: '0px',
                borderRadius: '50px'
            }
        }
    }));

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

    const handleCustomDuration = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        if (!isNaN(parseInt(value)) && typeof value === 'string') {
            setDuration(parseInt(value));
            onChange(parseInt(value));
        } else {
            setDuration(NaN);
        }
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={'Filters'}
            filterCount={filterCount}
            iconLeft={'FilterList'}
            iconRight={'Expand'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={false}
            mounted={true}
        >
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
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
                        <SmallText>Custom Duration (Minutes)</SmallText>
                    </Row>

                    <TextField
                        size="small"
                        type="number"
                        placeholder="Give duration in minutes"
                        inputProps={{ min: 0, max: 1439 }}
                        value={duration}
                        onChange={handleCustomDuration}
                    />

                    <Row>
                        <SmallText>Room Size (People)</SmallText>
                    </Row>
                    <StyledToggleButtonGroup
                        value={roomSize}
                        onChange={handleRoomSizeChange}
                    >
                        <ToggleButton value="1-2">1-2</ToggleButton>
                        <ToggleButton value="3-5">3-5</ToggleButton>
                        <ToggleButton value="6-7">6-7</ToggleButton>
                        <ToggleButton value="8-99999">8+</ToggleButton>
                    </StyledToggleButtonGroup>
                    <Row>
                        <SmallText>Resources</SmallText>
                    </Row>
                    <StyledToggleButtonGroup
                        value={resources}
                        onChange={handleResourcesChange}
                        sx={{ minHeight: '56px' }}
                    >
                        {allFeatures.map((feature) => (
                            <ToggleButton key={feature} value={feature}>
                                {feature}
                            </ToggleButton>
                        ))}
                    </StyledToggleButtonGroup>
                    <Row>
                        <SmallText>Favourites</SmallText>
                    </Row>
                    <ToggleButton
                        value="favourites"
                        selected={onlyFavourites}
                        onChange={() => setOnlyFavourites(!onlyFavourites)}
                    >
                        <FavoriteBorderIcon />
                        &nbsp; Only Favourites
                    </ToggleButton>
                </DrawerContent>
            </Box>
        </SwipeableEdgeDrawer>
    );
};

export default FilteringDrawer;
