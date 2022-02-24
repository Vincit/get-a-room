import { createTheme } from '@mui/material';

const ORANGE = '#f04e30';
const VINCIT_ORANGE = '#443938';

export const theme = createTheme({
    palette: {
        background: { default: '#f6f5f5' },
        primary: { main: ORANGE },
        success: { main: '#219653' },
        text: {
            primary: VINCIT_ORANGE,
            secondary: ORANGE,
            disabled: '#95807E'
        }
    },
    typography: {
        h1: { color: ORANGE },
        h2: {
            color: VINCIT_ORANGE,
            fontFamily: 'Proxima Nova, Roboto',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '36px',
            lineHeight: '36px'
        },
        h3: {
            color: VINCIT_ORANGE,
            fontFamily: 'Proxima Nova, Roboto',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '24px',
            lineHeight: '24px'
        },
        body1: {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '16px',
            lineHeight: '21px'
        },
        subtitle1: {
            color: VINCIT_ORANGE,
            fontFamily: 'Proxima Nova, Roboto',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '12px',
            lineHeight: '12px',
            textTransform: 'uppercase'
        },
        h4: { color: ORANGE, fontWeight: 'bold' },
        h5: { color: ORANGE, fontWeight: 'bold' }
    },
    zIndex: {
        snackbar: 1
    },
    components: {
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    whiteSpace: 'nowrap',

                    borderRadius: '50px',
                    border: '1px solid #F04E30',
                    boxSizing: 'border-box',
                    padding: '8px 24px',

                    color: '#F04E30',
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    lineHeight: '21px',

                    '&.Mui-selected': {
                        color: '#F6F5F5',
                        background: '#F04E30'
                    },
                    '&.Mui-selected:hover': {
                        background: '#C13217'
                    }
                }
            }
        },
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: {
                    overflowX: 'scroll',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '0 24px 0 0'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    margin: '24px 0px'
                }
            }
        }
    }
});
