import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from '../environment.js';

export const AuthContext = createContext({
    user: null,
    login: (username, password) => {},
    register: (name, username, password) => {},
    logout: () => {}
});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})

export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext);
    const[userData, setUserData]= useState(AuthContext);


    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });
            if(response.status === 201){
                return response.data.message;
            }
        } catch (error) {
           throw error;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            const response = await client.post("/login", {
                username: username,
                password: password
            });
            console.log(response.data);
            if(response.status === 200){
                localStorage.setItem("token", response.data.user.token);
            }
            return response.data.message;
        } catch (error) {
            throw error;
        }
    }


    const getHistoryOfUser= async()=>{
        try{
            let request = await client.get("/get_all_activity",{
                params:{
                    token: localStorage.getItem("token")
                }
            });
            console.log("history:", request)
            return request.data;

        }
        catch(e){

            throw e;
        }
    }
    
    const addToUserHistory= async(meetingCode)=>{
        try{
            let request = await client.post("/add_to_activity",{
                token: localStorage.getItem("token"),
                meeting_code: meetingCode

            });
            console.log("added:",request)
            return request;

        }
        catch(e){
            throw e;

        }

    }

    const data = {
        userData, setUserData,addToUserHistory, handleRegister,getHistoryOfUser , handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )


}