import * as React from 'react';
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { IconButton } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';

const drawerBleeding = 56;

const Root = styled('div')(({ theme }) => ({
    height: '100%',
    backgroundColor:
        theme.palette.mode === 'light'
            ? grey[100]
            : theme.palette.background.default
}));

const Puller = styled(Box)(({ theme }) => ({
    width: '30%',
    height: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#F6F5F5' : grey[900],
    borderRadius: 3
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: -drawerBleeding,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    visibility: 'visible',
    right: 0,
    left: 0,
    boxShadow: '0px -2px 4px rgba(205, 197, 197, 0.25)',
    backgroundColor: '#fff'
}));

const DrawerTitle = styled(Typography)(({ theme }) => ({
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '24px',
    lineHeight: '24px',
    whiteSpace: 'nowrap'
}));

export const DrawerContent = styled(Box)(({ theme }) => ({
    px: '24px',
    pb: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    margin: '24px'
}));

interface Props {
    children: React.ReactChild;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    headerTitle: String | undefined;
    isOpen: boolean;
    toggle: (open: boolean) => void;
    disableSwipeToOpen: boolean;
}

const SwipeableEdgeDrawer = (props: Props) => {
    const {
        children,
        headerTitle,
        iconLeft,
        isOpen,
        toggle,
        disableSwipeToOpen
    } = props;

    const toggleDrawer = (newOpen: boolean) => () => {
        toggle(newOpen);
    };

    var left;
    var title;
    if (iconLeft === 'Map') {
        left = <MapIcon sx={{ color: '#219653' }} />;
        title = (
            <DrawerTitle sx={{ color: '#219653' }}>{headerTitle}</DrawerTitle>
        );
    } else {
        left = <AccessTimeIcon />;
        title = <DrawerTitle>{headerTitle}</DrawerTitle>;
    }

    return (
        <Root>
            <CssBaseline />
            <Global
                styles={{
                    '.MuiDrawer-root > .MuiPaper-root': {
                        overflow: 'visible'
                    }
                }}
            />
            <SwipeableDrawer
                data-testid="BookingDrawer"
                anchor="bottom"
                open={isOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                swipeAreaWidth={drawerBleeding}
                disableSwipeToOpen={disableSwipeToOpen}
                ModalProps={{
                    container: document.getElementById('drawer-container'),
                    keepMounted: false
                }}
            >
                <DrawerHeader>
                    {left}
                    <Puller />
                    {title}
                    <Puller />
                    <IconButton
                        aria-label="close drawer"
                        onClick={toggleDrawer(false)}
                    >
                        <CloseIcon />
                    </IconButton>
                </DrawerHeader>

                {children}
            </SwipeableDrawer>
        </Root>
    );
};

export default SwipeableEdgeDrawer;
