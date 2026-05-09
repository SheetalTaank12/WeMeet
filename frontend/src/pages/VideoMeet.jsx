import React, { use, useEffect, useRef, useState } from 'react'
import "../styles/videoComponent.css"
import { Button, IconButton, TextField } from '@mui/material';
import VideoCamIcon from '@mui/icons-material/Videocam';
import VideoCamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import ScreenShareOffIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import server from '../environment.js';

import { io } from "socket.io-client";

const server_url = server;
var connections ={};

const peerConfigConnections = {
    "iceServer": [
        {
            "urls": "stun:stun.l.google.com:19302"
        }
    ]
}

   
export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvaiable, setVideoAvailable] = useState(true);
    let [audioAvaiable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();

    let [ screen, setScreen] = useState();

    let [showModel, setShowModel] = useState(true);

    let [screenAvaiable, setScreenAvailable] = useState();

    let [message, setMessage] = useState("");
    let [messages, setMessages] = useState([]);

    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef();
    let [videos, setVideos] = useState([]);

    const getPermissions = async()=>{
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission){
                setVideo(videoPermission);
                setVideoAvailable(true);
                localVideoRef.current.srcObject = videoPermission;
            }
            else{
                setVideoAvailable(false);
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission){
                setAudio(audioPermission);
                setAudioAvailable(true);
            }
            else{
                setAudioAvailable(false);
            }


            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }
            else{
                setScreenAvailable(false);
            }

            if(videoAvaiable || audioAvaiable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvaiable, audio:audioAvaiable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
    }



    useEffect(()=>{
      getPermissions();
     
    },[])

    let getUserMediaSuccess = (stream)=>{

        try{
            window.localStream.getTracks().forEach(track => {
                track.stop();
            });


        }
        catch(e){
            console.log(e);
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections){
            if(id === socketRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer()
            .then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
                })
                .catch(e=> console.log(e));
            }).catch(e=> console.log(e));
        }

        stream.getTracks().forEach(track => track.onended =()=>{
            setVideo(false);
            setAudio(false);
            
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            }
            catch(e){
                console.log(e);
            }

             let blackSilence = (...args) =>new MediaStream([black(...args), silence()]);
             window.localStream = blackSilence();
             localVideoRef.current.srcObject = window.localStream;    


            for (let id in connections){
                if(id === socketRef.current) continue;
                connections[id].addStream(window.localStream);
                connections[id].createOffer()
                .then((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
                    })
                    .catch(e=> console.log(e));
                }).catch(e=> console.log(e));
            }



        })
    }


    let silence = ()=>{
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
    }

    let black = ()=>{
        let width = 640;
  let height = 480;
        let canvas = Object.assign(document.createElement('canvas'), {width, height});
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let stream = canvas.captureStream();
        
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
    }

    let getUserMedia = async()=>{
        if(video && videoAvaiable || audio && audioAvaiable){
            navigator.mediaDevices.getUserMedia({video:video, audio: audio})
            .then(getUserMediaSuccess)
            .then((stream)=>{})
            .catch((e)=>{
                console.log(e);
            })
        }
        else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    
                });

            }
             catch(e){

             }

        }
    }


    useEffect(()=>{
        if(video !== undefined && audio !== undefined){
            getUserMedia();
        }
    },[video,audio])


    let gotMessageFromServer = (fromId, message)=>{
        var signal = JSON.parse(message);
        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(()=>{
                    if(signal.sdp.type === "offer"){

                        connections[fromId].createAnswer()
                        .then((description)=>{
                            connections[fromId].setLocalDescription(description)
                            .then(()=>{
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}));
                            })
                            .catch(e=> console.log(e));
                        }).catch(e=> console.log(e));
                    }
                })
                .catch(e=> console.log(e));
            }
            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e=> console.log(e));
            }
        }

    }

    let addMessage = (data, sender, socketIdSender)=>{

        setMessages((prevMessages)=> 
            [...prevMessages, {sender:sender, data:data}]);
      if(socketIdSender !== socketIdRef.current){
        setNewMessages((prev) => prev + 1);
      }

    }
    let connectToSocketServer =()=>{
        socketRef.current =io.connect(server_url, {secure: false});

        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on("connect",()=>{
            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current= socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id)=>{
                setVideos((videos)=>videos.filter((video)=> video.socketId !== id));
            })

            socketRef.current.on("user-joined",(id, clients)=>{
                clients.forEach((socketListId)=>{
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event)=>{
                        if(event.candidate !== null){
                            socketRef.current.emit("signal",socketListId, JSON.stringify({"ice": event.candidate}));

                        }
                    }

                    connections[socketListId].onaddstream = (event)=>{
                        let videoExists = videoRef?.current?.find(video=> video.socketId === socketListId);
                        if (videoExists){
                            setVideos(videos=> {
                                const updatedVideos = videos.map(video=>
                                    video.socketId === socketListId? {...video, stream: event.stream}: video
                                )

                                videoRef.current= updatedVideos;
                                return updatedVideos;
                            })
                        }
                        else{
                            let newVideo = {
                                socketId : socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            }
                            setVideos(videos=> {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current= updatedVideos;
                                return updatedVideos;
                            });
                        
                            }

                        };

                        if(window.localStream !== undefined  && window.localStream !== null){
                            connections[socketListId].addStream(window.localStream);
                        }else{

                            let blackSilence = (...args) =>new MediaStream([black(...args), silence()]);
                            window.localStream = blackSilence();
                            connections[socketListId].addStream(window.localStream);    


                        }
                    })

                    if(id === socketRef.current.id){

                        for(let id2 in connections){
                            if (id2 === socketRef.current) continue;
                            try{
                                connections[id2].addStream(window.localStream);

                            }
                            catch(e){
                            }

                            connections[id2].createOffer()
                            .then((description)=>{
                                connections[id2].setLocalDescription(description)
                                .then(()=>{
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}));
                                })
                                .catch(e=> console.log(e));
                            })
                        }
                    }
                    
                })
            })
        }

    

    let getMedia = async()=>{
         setVideo(videoAvaiable);
      setAudio(audioAvaiable);
      connectToSocketServer();
    }

    let routeTo = useNavigate();

    let connect = ()=>{
        setAskForUsername(false);
        getMedia();
    }


    let handleVideo=()=>{
        setVideo(!video);
    }

    let handleAudio=()=>{
        setAudio(!audio);
    }

    useEffect(()=>{
        if(screen !== undefined){
            getDisplayMedia();
        }
    },[screen])


    let getDisplayMediaSuccess = (stream)=>{

        try{
            window.localStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        catch(e){
            console.log(e);
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections){
            if(id === socketRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
                })
                .catch(e=> console.log(e));
            }).catch(e=> console.log(e));
        }


        stream.getTracks().forEach(track => track.onended =()=>{
            setScreen(false);
            
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            }
            catch(e){
                console.log(e);
            }

             let blackSilence = (...args) =>new MediaStream([black(...args), silence()]);
             window.localStream = blackSilence();
             localVideoRef.current.srcObject = window.localStream;    


           getUserMedia();


        })

    }
    let getDisplayMedia = async()=>{
        if(screen){
           
                if(navigator.mediaDevices.getDisplayMedia){
                    navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                    .then(getDisplayMediaSuccess)
                    .then((stream)=>{})
                    .catch(e=> console.log(e));
                }
        }
        else{
            // try{
            //     let tracks = localVideoRef.current.srcObject.getTracks();
            //     tracks.forEach(track => {
            //         track.stop();
            //     });
            // }
            // catch(e){
            //     console.log(e);
            // }
                
        }
    }

    let handleScreen=()=>{
        setScreen(!screen);
    }

    let sendMessage = ()=>{
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    let handleEndCall = ()=>{
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => {
                track.stop();
            });
        }catch(e){
            console.log(e);
        }
        routeTo("/home")

        }
    // console.log("videos: ", videos);

  return (
    <div>
        {askForUsername=== true ?
         <div>
         <h2>Enter into Lobby</h2>
         <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={(e)=>setUsername(e.target.value)} />
         <Button variant="contained" onClick={connect}>Enter</Button>

         <div>
            <video ref={localVideoRef} autoPlay muted></video>
            
           { console.log("LOCAL:", video)}
{console.log("REMOTE:", videos)}
            <h2>Local Stream ID: {video?.id}</h2>
           </div> 
            
            </div> : 
            <div className='meetVideoContainer'>

                {showModel ?
                    <div className="chatRoom">

                        <div className="chatContainer">

                             <h1>Chat</h1>
                             <div className="chattingDisplay">
                                {messages.length>0? messages.map((msg, index) => {
                                    return (
                                    <div style={{ marginBottom: '10px' }} key={index}>
                                        <strong>{msg.sender}:</strong> {msg.data}
                                    </div>
                                    )
                       }
                             ) : <p>No messages yet</p>}
                             </div>
                             <div className="chattingArea">

                                <TextField value={message} onChange={(e)=>{setMessage(e.target.value)}} id="outlined-basic" label="Type a message" variant="outlined" />

                                <Button onClick={sendMessage} variant="contained" style={{margin:"0 10px"}} >Send</Button>  



                             </div>
                        </div>

                       



                    </div>
                    : <></>
                }

                <div className="buttonsContainer">
                    <IconButton onClick={handleVideo} style={{color:"white"}}>
                        {(video === true)?<VideoCamIcon/>: <VideoCamOffIcon/>}
                    </IconButton>

                    <IconButton onClick={handleEndCall} style={{color:"red"}}>
                        <CallEndIcon/>
                    </IconButton>

                    <IconButton onClick={handleAudio} style={{color:"white"}}>
                        {(audio === true)?<MicIcon/>: <MicOffIcon/>}
                    </IconButton>

                    {screenAvaiable === true && <IconButton onClick={handleScreen} style={{color:"white"}}>
                        {screen === true? <ScreenShareIcon/>: <ScreenShareOffIcon/>}
                    </IconButton>}

                    <Badge badgeContent={newMessages} max={999} style={{color:"white"}} >
                        <IconButton onClick={()=>setShowModel(!showModel)} style={{color:"white"}}>
                            <ChatIcon/>
                        </IconButton>

                    </Badge>


                </div>
            <video className='meetUserVideo' ref={localVideoRef} autoPlay muted></video>

            <div className='conferenceVideo'>
            {videos.map((video)=>(
                 <div key={video.socketId}>
                    {console.log("video: ", video)}
                    
                  {/* <h2>Socket ID: {video?.socketId}</h2> */}
                  <video
                  data-socket={video.socketId}
                  ref={ref =>{
                    if(ref && video.stream){
                        ref.srcObject= video.stream
                    }
                  }}
                  autoPlay
                  playsinline
                  ></video>
                 </div>
                ))
            }
            </div>
            </div>}
    </div>
  )
}
