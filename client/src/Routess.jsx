import  RegisterAndLoginForm  from "./RegisterAndLoginForm.jsx"; // Ensure correct import
import { useContext } from "react";
import { UserContext } from "./UserContext.jsx";
import Chat from "./Chat.jsx";


export default function Routess() {
    const {username,id} = useContext(UserContext);

    if (username) {
        return <Chat/>;
      }


    return (
        <RegisterAndLoginForm />
    );
}

