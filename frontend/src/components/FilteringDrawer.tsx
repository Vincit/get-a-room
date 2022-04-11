import React, { useState } from 'react';
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
    //fontFamily: 'Roboto Mono',
    fontSize: '12px',
    lineHeight: '12px',
    fontWeight: 'bold',
    fontStyle: 'normal',
    margin: '24px 8px 8px 0'
}));

export const SpacerFirst = styled('div')(() => ({
    margin: '0 12px 0 0'
}));

export const SpacerMiddle = styled('div')(() => ({
    margin: '0 12px 0 12px'
}));

export const SpacerLast = styled('div')(() => ({
    margin: '0 0 0 8px'
}));

export const FilteringButton = styled(ToggleButton)(() => ({
    //fontFamily: 'Roboto Mono',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '16px'
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
}

const FilteringDrawer = (props: Props) => {
    const { open, toggle } = props;

    const [customFilter, setCustomFilter] = useState('');
    const [roomSize, setRoomSize] = useState<string[]>([]);
    const [resources, setResources] = useState<string[]>([]);
    const [onlyFavorites, setOnlyFavorites] = useState(false);

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
        setRoomSize(newResources);
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
                <ToggleButtonGroup
                    value={resources}
                    onChange={handleResourcesChange}
                >
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
                <ToggleButton
                    value="favourites"
                    selected={onlyFavorites}
                    onChange={() => {
                        setOnlyFavorites(!onlyFavorites);
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
