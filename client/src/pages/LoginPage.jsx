import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

export default function LoginPage() {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // <-- step 1

  let handleSubmit = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // step 2 & 3: await login and check success
    const success = await login(
      currState === "Sign Up" ? "signup" : "login",
      { fullName, email, password, bio }
    );

    if (success) {
      // step 4: redirect after successful login/signup
      navigate("/"); // replace with your actual path
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center
        gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* left */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
      {/* right */}
      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex
            flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            className="p-2 border border-gray-500
                    focus:ring-2 focus:ring-indigo-500
                    rounded-md focus:outline-none"
            placeholder="Full name"
            onChange={(event) => setFullName(event.target.value)}
            value={fullName}
            required
          />
        )}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none
                        focus:ring-2 focus:ring-indigo-500"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
            <input
              type="password"
              placeholder="Enter Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none
                        focus:ring-2 focus:ring-indigo-500"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
          </>
        )}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(event) => setBio(event.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="provide a short bio..."
          ></textarea>
        )}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600
                 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>
        <div className="flex gap-2 items-center text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & Privacy Policy</p>
        </div>
        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account ?{" "}
              <span
                onClick={() => {
                  setCurrState("login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login Here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create Account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
