import * as React from 'react';
import { Building } from '../types';
import {Card, CardActionArea, CardContent, FormGroup, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';



type BuildingSelectProps = {
    selectedBuildingId: string;
    setSelectedBuildingId: (buildingId: string) => any;
    buildings: Building[];
    handlePreferencesSubmit: (buildingId: string) => void;
};


const RoomList = (props: BuildingSelectProps) => {


    const {selectedBuildingId, setSelectedBuildingId, buildings, handlePreferencesSubmit} = props;
    const [alignment, setAlignment] = React.useState('names');

    const clickFunction = (buildingId: string) => {

        console.log(buildingId);
        setSelectedBuildingId(buildingId);
        handlePreferencesSubmit(buildingId);
    }



    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string | null,
      ) => {
        if (newAlignment !== null) {
            setAlignment(newAlignment);
          }
      };

    const renderRoomList = ():JSX.Element[] => {
        if (alignment == 'names'){
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
    }else{
        return buildings.map((buildingName) => {
            return(
                <Card elevation={3} key={buildingName.name} sx={{ borderRadius: 5}}>
                    <CardActionArea onClick={() => clickFunction(buildingName.id)}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs ={10}>
                                    <Typography variant="h3">
                                    {buildingName.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs = {1}>
                                    <GpsFixedIcon style={{float:"right"}}></GpsFixedIcon>
                                </Grid>
                                
                                <Grid item xs = {1}>
                                    <Typography variant="h3"> 
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
    }

    return (
        <div>
            <Stack            
            id="preferences-view"
            height="100%"
            justifyContent="space-around"
            alignItems='center'
            >
                <FormGroup>
                    <Typography textAlign="center" variant="h6">Welcome, asdfasdf</Typography>
                    <Typography textAlign="center" variant="h3">Choose office</Typography>
                </FormGroup>

                <ToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleChange}
                style={{marginBottom: 20}}
                
                >
                    <ToggleButton style={{minWidth: '150px'}} value="proximity">
                        <GpsFixedIcon style={{minWidth: '40px'}}></GpsFixedIcon>
                        Proximity
                    </ToggleButton>

                    <ToggleButton style={{minWidth: '150px'}} value="names">
                        <SortByAlphaIcon style={{minWidth: '40px'}}></SortByAlphaIcon>
                        Names
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            
            {renderRoomList()}
        </div>
    )
}


export default RoomList;