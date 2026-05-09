import React, { useContext } from 'react'
import withAuth from '../utils/withAuth';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import TextField from '@mui/material/TextField';
import { AuthContext } from '../contexts/AuthContext';

 function HomeComponent() {

  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');

  const {addToUserHistory}= useContext(AuthContext);
  let handleVideoCall = ()=>{
     addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  }
  return (

    <>
    <div className="navbar">
      <div style={{display:"flex", alignItems:"center"}}>
        <h2>WeMeet</h2>
      </div>

       <div style={{display:"flex", alignItems:"center"}}>

        <IconButton onClick={()=>{
          navigate('/history')
        }}>
          <RestoreIcon/>
          <p>History</p>
        </IconButton>
      

        <Button onClick={()=>{localStorage.removeItem("token")
          navigate("/auth")
        }} variant="contained" color="secondary">
          Logout
        </Button>
      </div>

    </div>

    <div className="meetContainer">

      <div className="leftPanel">
        <div>
          <h2>Providing Quality Video Call Just Like Quality Education</h2>

          <div style={{display:"flex", gap:"10px"}}>
            <TextField onChange={e=> setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting code" variant="outlined"></TextField>
            <Button onClick={handleVideoCall} variant='contained'>Join</Button>
          </div>
        </div>

      </div>

      <div className="rightPanel">
        <img srcSet='/vdo-call-img.png' alt='logo'></img>
      </div>

    </div>
    
    </>
  )
}

export default withAuth(HomeComponent);