import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>QuickCall</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Button 
                        onClick={() => navigate("/history")}
                        startIcon={<RestoreIcon />}
                        sx={{ color: "white", textTransform: "none", fontSize: "16px" }}
                    >
                        History
                    </Button>

                    <Button 
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        sx={{ color: "white", textTransform: "none", fontSize: "16px" }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="meetContent">
                    <div className="meetCard">
                        <h1>Start or Join a Meeting</h1>
                        <p>Enter a meeting code to join or create a new meeting</p>
                        
                        <div className="meetInputGroup">
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                placeholder="Enter meeting code"
                                variant="outlined"
                                fullWidth
                                size="medium"
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained'
                                size="large"
                                sx={{ fontSize: "16px" }}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='meetImage'>
                    <img srcSet='/logo3.png' alt="Video Call" />
                </div>
            </div>
        </>
    )
}


export default withAuth(HomeComponent)