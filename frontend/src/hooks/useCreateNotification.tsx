import { bottomNavigationActionClasses, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import copy from 'copy-to-clipboard';
import Share from './useShareInMobile';
import { color } from '@mui/system';

type NotificationType = 'default' | 'error' | 'success' | 'warning' | 'info';

const useCreateNotification = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [active, setActive] = useState(false);

    const closeAction = useCallback(
        (key: number) => {
            return (
                <IconButton
                    onClick={() => closeSnackbar(key)}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            );
        },
        [closeSnackbar]
    );

    const createNotificationWithType = useCallback(
        (message: string, type: NotificationType) => {
            enqueueSnackbar(message, {
                variant: type,
                action: closeAction
            });
        },
        [enqueueSnackbar, closeAction]
    );

    const createSuccessNotification = useCallback(
        (message: string) => {
            enqueueSnackbar(
                <div>Booking was succesful!</div>,

                {
                    variant: 'success',
                    action: closeAction,
                    persist: true,
                    style: { whiteSpace: 'pre-line' },
                    preventDuplicate: false
                }
            );
        },
        [enqueueSnackbar, closeAction]
    );

    const createErrorNotification = useCallback(
        (message: string) => {
            enqueueSnackbar(message, {
                variant: 'error',
                action: closeAction,
                autoHideDuration: 30000
            });
        },
        [enqueueSnackbar, closeAction]
    );

    return {
        createSuccessNotification,
        createErrorNotification,
        createNotificationWithType
    };
};

export default useCreateNotification;
