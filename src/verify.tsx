import { useState } from "react";
import React from "react";
import { endpoint_url } from "./constants";
import { Navigate, useLocation } from "react-router-dom";
function useAuth() {
  function getToken() {
    const userToken = localStorage.getItem("token");
    return userToken && userToken;
  }

  const [token, setToken] = useState(getToken());
  const [isValidToken, setValidToken] = useState(false); // this is causing issues
  const [isInit, setInit] = useState(false); // verifying if the user has been initialized already
  const [loading, updateLoading] = useState(true); // need this to ensure nothing but the component we want is rendered
  const [id, setID] = useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getUser(token!);
      if (data && "msg" in data) {
        setValidToken(false);
        removeToken();
      } else {
        setInit(data.init === "false" ? false : true);
        setID(data.id);
        setValidToken(true);
      }
    };
    if (token !== null && token !== "") fetchData();
    updateLoading(false);
  }, [token]);
  function assignInit(val: boolean) {
    setInit(val);
  }
  function saveToken(userToken: string) {
    localStorage.setItem("token", userToken);
    setValidToken(true);
    setToken(userToken);
  }
  function removeToken() {
    localStorage.removeItem("token");
    setValidToken(false);
    setToken(null);
  }
  async function getUser(token: string) {
    try {
      const res = await fetch(`${endpoint_url}/verify?token=${token}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const response = await res.json();
      return response;
    } catch (error) {
      console.error(
        "Error fetching the required resources. Redirecting to login page."
      );
      removeToken();
    }
  }
  // ik this doesnt matter for the scope of this project but this could have performance
  // implications as this gets called multiple times
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    if (!token || (!isValidToken && !loading)) {
      return (
        <Navigate
          replace
          to="/login"
          state={"Invalid token. Please login or signup."}
        />
      );
    }
    if (!isInit && location.pathname !== "/profile") {
      return (
        <Navigate
          replace
          to="/profile"
          state={"Please complete profile initialization before continuing."}
        />
      );
    }
    return children;
  };
  return {
    setToken: saveToken,
    token,
    id,
    isValidToken,
    removeToken,
    PrivateRoute,
    loading,
    isInit,
    setInit: assignInit,
  };
}

export default useAuth;
