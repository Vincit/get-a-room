import { useHistory } from 'react-router-dom';
import { Visibility } from '@mui/icons-material';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import { DrawerButtonSecondary } from './BookingDrawer';
import { logout } from '../services/authService';
import useCreateNotification from '../hooks/useCreateNotification';

type userSettingsProps = {
    open: boolean;
    onClose: () => void;
    toggle: (open: boolean) => void;
    name: String | undefined;
    expandedFeaturesAll: boolean;
    setExpandedFeaturesAll: (value: boolean) => void;
};

const UserDrawer = (props: userSettingsProps) => {
    const { open, onClose, toggle, name, expandedFeaturesAll, setExpandedFeaturesAll } =
        props;

    const history = useHistory();
    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

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
            onClose={onClose}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <DrawerContent>
                <DrawerButtonSecondary
                    aria-label="settings drawer "
                    data-testid="BookNowButton"
                    onClick={handleAllFeaturesCollapse}
                >
                    <Visibility aria-label="visibility" />
                    &nbsp;Show room resources
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
