import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function HistoryComponent() {

    const {getHistoryOfUser} = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    const routeTo= useNavigate();

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{

                const history = await getHistoryOfUser();
                setMeetings(history);
                console.log(meetings)

            }
            catch(e){
                console.log(e);
            }
        }
        fetchHistory();
    },[]);

    let formatDate = (dateString)=>{
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2,"0");
        const month= (date.getMonth()+1).toString().padStart(2,"0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    return (
  <div>

    <IconButton onClick={()=>{
        routeTo('/home')
    }}>
        <HomeIcon/>
    </IconButton>

    {meetings.length!==0 ?

    Array.isArray(meetings) &&
      meetings.map((e, index) => (
        
        <Card variant="outlined" key={index}>

          <CardContent>

        

            <Typography variant="h5" component="div">
              Code: {e.meetingCode}
            </Typography>

            <Typography
              sx={{ color: 'text.secondary', mb: 1.5 }}
            >
              Date: {formatDate(e.date)}
            </Typography>


          </CardContent>

          

        </Card>

      ))
      : <><h2>No meetings done yet.</h2></>
    }

  </div>
)

}
