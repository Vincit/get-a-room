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
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
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
        console.log(buildingId);
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
                    sx={{ borderRadius: 5 }}
                    style={{ display: 'flex', flexDirection: 'column' }}
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
                                    <GpsFixedIcon
                                        style={{ float: 'right' }}
                                    ></GpsFixedIcon>
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
                <FormGroup>
                    <Typography textAlign="center" variant="h6">
                        Welcome, {name}
                    </Typography>
                    <Typography textAlign="center" variant="h3">
                        Choose office
                    </Typography>
                </FormGroup>

                <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    style={{ marginBottom: 20 }}
                >
                    <ToggleButton
                        style={{ minWidth: '150px' }}
                        value="proximity"
                    >
                        <GpsFixedIcon
                            style={{ minWidth: '40px' }}
                        ></GpsFixedIcon>
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
