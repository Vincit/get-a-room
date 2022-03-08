import React from "react";
import { Building } from '../types';
import {Box, Card, CardActionArea, CardContent, Divider, Grid, SelectChangeEvent, Stack, Typography} from '@mui/material';
import { updatePreferences } from '../services/preferencesService';
import useCreateNotification from '../hooks/useCreateNotification';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useHistory } from 'react-router-dom';


type BuildingSelectProps = {
    selectedBuildingId: string;
    setSelectedBuildingId: (buildingId: string) => any;
    buildings: Building[];

};

const RoomList = (props: BuildingSelectProps) => {
    const {selectedBuildingId, setSelectedBuildingId, buildings} = props;

    const clickFunction = (buildingName: string) => {

        console.log(buildingName);
        setSelectedBuildingId(buildingName);
    }


    const renderRoomList = ():JSX.Element[] => {
        return buildings.map((buildingName) => {
            return(
                <Card elevation={3} key={buildingName.name} sx={{ borderRadius: 5 , marginBottom: 2}}>
                    <CardActionArea onClick={() => clickFunction(buildingName.id)}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs ={10}>
                                    <Typography variant="h6">
                                    {buildingName.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs = {1}>
                                    <GpsFixedIcon style={{float:"right"}} fontSize='small'></GpsFixedIcon>
                                </Grid>
                                
                                <Grid item xs = {1}>
                                    <Typography variant="h6"> 
                                    7 km
                                    </Typography>
                                </Grid>
                                
                            </Grid>
                        </CardContent>
                    </CardActionArea>
                </Card>
            )
        })
    }

    return (
        <Box>
            {renderRoomList()}
        </Box>
    )
}


export default RoomList;