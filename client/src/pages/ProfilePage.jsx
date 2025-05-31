import { useState } from "react";
import {useNavigate} from "react-router-dom";
import assets from "../assets/assets";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
export default function ProfilePage(){
    const{authUser, updateProfile } = useContext(AuthContext);
    const[selectedImage,setSelectedImage] = useState(null);
    const navigate = useNavigate();
    const[name,setName] = useState(authUser.fullName);
    const[bio,setBio] = useState(authUser.bio);
    const handleSubmit =async (event)=>{
        event.preventDefault();
        if(!selectedImage){
            await updateProfile({fullName : name,bio});
            navigate('/');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage)
        reader.onload = async ()=>{
            const base64Image = reader.result;
            await updateProfile({profilePic : base64Image , fullName : name,bio});
            navigate('/');
            return;
        }
    }
    return(
        <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
            <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-grey-300 
                    border-2 border-gray-600 flex items-center justify-between 
                    max-sm:flex-col-reverse rounded-lg">
                <form className="flex flex-col gap-5 p-10 flex-1" onSubmit={handleSubmit}>
                    <h3 className="text-lg text-white">Profile Details</h3>
                    <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer text-white">
                        <input onChange={(event)=>setSelectedImage(event.target.files[0])} type="file" id="avatar" accept=".png ,.jpg ,.jpeg" hidden/>
                        <img className={`w-12 h-12 ${selectedImage && 'rounded-full'}`}
                        src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="" />
                        Upload Profile Image
                    </label>
                    <input type="text" required placeholder="Your name" onChange={(event)=>setName(event.target.value)} value={name}
                    className="p-2 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2
                    focus:ring-violet-500"/>
                    <textarea placeholder="write profile bio" rows={4} className="p-2 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2
                    focus:ring-violet-500"
                    onChange={(event)=>setBio(event.target.value)} value={bio} required></textarea>
                    <button type="submit" className="bg-gradient-to-r from-purple-400 to-violet-600
                    text-white p-2 rounded-full text-lg cursor-pointer">Save</button>
                </form>
                <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}` } src={authUser?.profilePic ||assets.logo_icon} alt="" />
            </div>
        </div>
    );
}