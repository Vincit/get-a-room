import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Box, IconButton, Typography, Switch } from '@mui/material';
import Person from '@mui/icons-material/Person';
import { Visibility } from '@mui/icons-material';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import { RowCentered, DrawerButtonSecondary, Row } from './BookingDrawer';
import { logout } from '../services/authService';
import useCreateNotification from '../hooks/useCreateNotification';
import RoomCard from './RoomCard';

type userSettingsProps = {
    open: boolean;
    toggle: (open: boolean) => void;
    name: String | undefined;
    children: React.ReactNode;
};

const UserDrawer = (props: userSettingsProps) => {
    const { open, toggle, name, children } = props;
    const [isOpen, setDrawerOpen] = useState(false);

    const history = useHistory();
    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();
    const [expandedFeaturesAll, setExpandedFeaturesAll] = useState(
        false as boolean
    );

    const handleAllFeaturesCollapse = () => {
        setExpandedFeaturesAll(!expandedFeaturesAll);
    };

    const doLogout = () => {
        logout()
            .then(() => {
                createSuccessNotification('Logout successful');
                history.push('/login');
            })
            .catch(() => {
                createErrorNotification('Error in logout, try again later');
                history.push('/login');
            });
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={name}
            iconLeft={'Person'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <DrawerContent>
                <DrawerButtonSecondary
                    aria-label="settings drawer "
                    data-testid="BookNowButton"
                    onClick={handleAllFeaturesCollapse}
                >
                    <IconButton aria-label="visibility" size="small">
                        <Visibility />
                    </IconButton>
                    Show room resources
                </DrawerButtonSecondary>
                <DrawerButtonSecondary
                    aria-label="logout"
                    data-testid="BookNowButton"
                    onClick={doLogout}
                >
                    logout
                </DrawerButtonSecondary>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
};

export default UserDrawer;
