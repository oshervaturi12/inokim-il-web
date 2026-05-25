import axios from "axios";
import {showAlert} from './alerts'

export const login = async (data, btnlogin) =>{
  btnlogin.textContent = 'מבצע חיבור...'
    try {
      const res = await axios.post('/api/v1/users/login',data, 'POST')
      if(res.status === 201){
        window.location.reload();
      }
    } catch (error) {
     showAlert('username or password incorrect', 6000, error.message, 'error')
     btnlogin.textContent = 'התחבר למערכת'
    }
  }
// test
  export const logout = async () =>{
    try {
     const res = await axios.post('/api/v1/users/logout')
     console.log(res)
     if(res.status === "success") location.reload();
    } catch (error) {
      showAlert('error', 'כנראה שאין אינטרנט')
    }
  }
  