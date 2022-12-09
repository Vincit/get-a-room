import * as React from 'react';
import { Typography, styled } from '@mui/material';
import { CustomCard, GridContainer, Row } from './RoomCard';

const CardTitleText = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontStyle: 'normal',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '24px'
}));

type NoRoomsCardProps = {};

const NoRoomsCard = (props: NoRoomsCardProps) => {
    return (
        <li>
            <CustomCard>
                <GridContainer>
                    <Row>
                        <CardTitleText>No rooms available :/</CardTitleText>
                    </Row>

                    <Row>
                        <Typography>
                            Please, check out rooms available in the next 30
                            min:
                        </Typography>
                    </Row>
                </GridContainer>
            </CustomCard>
        </li>
    );
};

export default NoRoomsCard;
