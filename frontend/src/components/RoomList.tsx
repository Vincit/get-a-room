import * as React from 'react';
import { Building } from '../types';
import {
    Card,
    CardActionArea,
    CardContent,
    FormGroup,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    styled
} from '@mui/material';

import Box from '@mui/material/Box';
import { GpsFixed } from '@mui/icons-material';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

type BuildingSelectProps = {
    selectedBuildingId: string;
    setSelectedBuildingId: (buildingId: string) => any;
    buildings: Building[];
    handlePreferencesSubmit: (buildingId: string) => void;
    name: String | undefined;
};

const GridContainer = styled(Box)(({ theme }) => ({
    container: true,
    flexDirection: 'column',
    alignItems: 'flex-start'
}));

const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between'
}));

const EndBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
}));

const RoomList = (props: BuildingSelectProps) => {
    const { setSelectedBuildingId, buildings, handlePreferencesSubmit, name } =
        props;
    const [alignment, setAlignment] = React.useState('names');

    const clickFunction = (buildingId: string) => {
        setSelectedBuildingId(buildingId);
        handlePreferencesSubmit(buildingId);
    };

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string | null
    ) => {
        if (newAlignment !== null) {
            setAlignment(newAlignment);
        }
    };

    const renderRoomList = (): JSX.Element[] => {
        if (alignment === 'names') {
            buildings.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            buildings.sort((a, b) => {
                if (a.distance && b.distance) {
                    return a.distance - b.distance;
                } else {
                    return 999999;
                }
            });
        }
        return buildings.map((building) => {
            return (
                <Card
                    elevation={3}
                    key={building.name}
                    sx={{ borderRadius: '10px' }}
                >
                    <CardActionArea onClick={() => clickFunction(building.id)}>
                        <CardContent>
                            <GridContainer>
                                <Row>
                                    <Typography variant="h3">
                                        {building.name}
                                    </Typography>

                                    <EndBox>
                                        {building.distance ? (
                                            <>
                                                <GpsFixed></GpsFixed>
                                                <Typography
                                                    variant="subtitle1"
                                                    align="right"
                                                    style={{
                                                        fontSize: '16px',
                                                        width: '68px',
                                                        lineHeight: '24px'
                                                    }}
                                                >
                                                    {Math.round(
                                                        building.distance
                                                    )}{' '}
                                                    km
                                                </Typography>
                                            </>
                                        ) : (
                                            <LocationOffIcon></LocationOffIcon>
                                        )}
                                    </EndBox>
                                </Row>
                            </GridContainer>
                        </CardContent>
                    </CardActionArea>
                </Card>
            );
        });
    };

    return (
        <div style={{ padding: '16px' }}>
            <Stack
                id="preferences-view"
                height="100%"
                justifyContent="space-around"
                alignItems="left"
            >
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        padding: '0px 24px'
                    }}
                >
                    <FormGroup sx={{ alignItems: 'left' }}>
                        <Typography
                            textAlign="left"
                            variant="subtitle1"
                            color={'#ce3b20'}
                            paddingTop="10px"
                            paddingBottom="5px"
                        >
                            Welcome, {name}
                        </Typography>
                        <Typography textAlign="left" variant="h2">
                            Choose office
                        </Typography>
                        <Typography
                            textAlign="left"
                            variant="subtitle1"
                            paddingTop="20px"
                            paddingBottom="10px"
                        >
                            SORT BASED ON
                        </Typography>
                    </FormGroup>
                </div>

                <ToggleButtonGroup
                    className="ToggleButtonGroupStyle"
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    style={{ overflow: 'auto' }}
                >
                    <ToggleButton
                        style={{ minWidth: '150px', maxWidth: '150px' }}
                        value="proximity"
                    >
                        <GpsFixed style={{ minWidth: '40px' }}></GpsFixed>
                        Proximity
                    </ToggleButton>

                    <ToggleButton
                        style={{ minWidth: '150px', maxWidth: '150px' }}
                        value="names"
                    >
                        <SortByAlphaIcon
                            style={{ minWidth: '40px' }}
                        ></SortByAlphaIcon>
                        Names
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {renderRoomList()}
        </div>
    );
};

export default RoomList;
