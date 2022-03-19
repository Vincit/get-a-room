import * as React from 'react';
import { Building } from '../types';
import {
    Card,
    CardActionArea,
    CardContent,
    FormGroup,
    Grid,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { GpsFixed, GpsOff } from '@mui/icons-material';
//import GpsOff from '@mui/icons-material/GpsOff';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

type BuildingSelectProps = {
    selectedBuildingId: string;
    setSelectedBuildingId: (buildingId: string) => any;
    buildings: Building[];
    handlePreferencesSubmit: (buildingId: string) => void;
    name: String | undefined;
};

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
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: '16px',
                        marginBottom: '16px'
                    }}
                >
                    <CardActionArea onClick={() => clickFunction(building.id)}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Typography variant="h3">
                                        {building.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <GpsFixed
                                        style={{ float: 'right' }}
                                    ></GpsFixed>
                                </Grid>

                                <Grid item xs={2}>
                                    <Typography
                                        variant="subtitle1"
                                        style={{
                                            fontSize: '16px',
                                            width: '100px',
                                            lineHeight: '24px'
                                        }}
                                    >
                                        {building.distance
                                            ? Math.round(building.distance)
                                            : 0}{' '}
                                        km
                                    </Typography>
                                </Grid>
                            </Grid>
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
                alignItems="center"
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
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    style={{ marginBottom: 10 }}
                >
                    <ToggleButton
                        style={{ minWidth: '150px' }}
                        value="proximity"
                    >
                        <GpsFixed style={{ minWidth: '40px' }}></GpsFixed>
                        Proximity
                    </ToggleButton>

                    <ToggleButton style={{ minWidth: '150px' }} value="names">
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
