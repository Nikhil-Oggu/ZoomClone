import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }
        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #010430 0%, #1a0f4d 100%)',
            paddingTop: '20px'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', marginBottom: '40px' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                    Meeting History
                </Typography>
                <IconButton 
                    onClick={() => routeTo("/home")}
                    sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
                >
                    <HomeIcon />
                </IconButton>
            </Box>

            {meetings.length !== 0 ? (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '20px',
                    padding: '0 40px 40px 40px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {meetings.map((meeting, index) => (
                        <Card 
                            key={index} 
                            sx={{ 
                                background: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)'
                                }
                            }}
                        >
                            <CardContent sx={{ paddingBottom: '8px' }}>
                                <Typography 
                                    sx={{ fontSize: 12, fontWeight: 600, color: '#010430', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }} 
                                    color="text.secondary" 
                                    gutterBottom
                                >
                                    Meeting Code
                                </Typography>
                                <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#010430', marginBottom: '20px', wordBreak: 'break-all' }}>
                                    {meeting.meetingCode}
                                </Typography>

                                <Typography 
                                    sx={{ fontSize: 12, fontWeight: 600, color: '#010430', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                >
                                    Date Joined
                                </Typography>
                                <Typography sx={{ color: '#666', fontSize: '16px' }}>
                                    {formatDate(meeting.date)}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button 
                                    size="small" 
                                    variant="contained"
                                    onClick={() => routeTo(`/${meeting.meetingCode}`)}
                                    fullWidth
                                    sx={{ textTransform: 'none', fontSize: '14px' }}
                                >
                                    Join Meeting
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    color: 'white'
                }}>
                    <Typography variant="h6" sx={{ opacity: 0.7 }}>
                        No meeting history yet
                    </Typography>
                </Box>
            )}
        </Box>
    )
}