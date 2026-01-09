import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {

    

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {

                let result = await handleLogin(username, password)


            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{
                height: '100vh',
                background: 'linear-gradient(135deg, #010430 0%, #1a0f4d 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                <CssBaseline />
                <Paper elevation={6} sx={{
                    padding: '40px',
                    borderRadius: '15px',
                    width: '100%',
                    maxWidth: '400px',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#010430', fontWeight: 600 }}>
                            QuickCall
                        </Typography>

                        <Box sx={{ display: 'flex', gap: '10px', mb: 3, width: '100%' }}>
                            <Button 
                                variant={formState === 0 ? "contained" : "outlined"} 
                                onClick={() => setFormState(0)}
                                fullWidth
                            >
                                Sign In
                            </Button>
                            <Button 
                                variant={formState === 1 ? "contained" : "outlined"} 
                                onClick={() => setFormState(1)}
                                fullWidth
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                                variant="outlined"
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="outlined"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                variant="outlined"
                            />

                            {error && <Typography sx={{ color: "red", mt: 1, fontSize: '14px' }}>{error}</Typography>}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>

                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
    );
}