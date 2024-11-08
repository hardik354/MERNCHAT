import axios from "axios";
import { UserContextProvider } from "./UserContext.jsx";
import Routess from "./Routess.jsx"

function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <Routess />
    </UserContextProvider>
  )
}

export default App;
