import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

type NotificationType = 'default' | 'error' | 'success' | 'warning' | 'info';

const useCreateNotification = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
                <div>Booking was successful!</div>,

                {
                    variant: 'success',
                    action: closeAction,
                    persist: true,
                    style: { whiteSpace: 'pre-line' },
                    preventDuplicate: false
                }
            );
            enqueueSnackbar(message, {
                variant: 'success',
                action: closeAction
            });
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
