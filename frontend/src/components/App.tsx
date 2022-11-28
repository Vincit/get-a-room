import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { history } from '../services/axiosConfigurer';
import { theme } from '../theme';
import { SnackbarProvider } from 'notistack';
import MainView from './MainView/MainView';
import LoginView from './login/LoginView';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactComponent as MobileBackground } from './images/Background image.svg';
import { ReactComponent as DesktopBackground } from './images/Background image desktop.svg';

const App = () => {
    // Basic solution for differiating between desktop and mobile. Switch from desktop to mobile resolution requires a page refresh
    // to show background correctly.
    let svgString = encodeURIComponent(
        renderToStaticMarkup(<MobileBackground />)
    );
    if (window.innerWidth > 600) {
        svgString = encodeURIComponent(
            renderToStaticMarkup(<DesktopBackground />)
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={1}
                dense
                style={{ marginBottom: '8vh' }}
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom'
                }}
            >
                <div
                    id="app"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,${svgString}")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <Router history={history}>
                        <Switch>
                            <Route path="/login">
                                <LoginView />
                            </Route>
                            <Route path="/">
                                <MainView />
                            </Route>
                        </Switch>
                    </Router>
                </div>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
