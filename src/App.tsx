import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import Quote from "./components/Quote/Quote";
import Register from "./components/Register/Register";
import QuoteHistory from "./components/History/History";
import useAuth from "./verify";
import useThemes from "./themes";
import Navbar from "./components/Navbar/Navbar";
import {ReactComponent as LoadingIcon } from './loading_icon.svg'

function App() {
  const { main_theme, ColorModeContext, setMode } = useThemes();
  const {
    token,
    id,
    removeToken,
    setToken,
    isValidToken,
    PrivateRoute,
    loading,
    isInit,
    setInit
  } = useAuth();
  if(loading){
    return (
      <div>
        <LoadingIcon/>
      </div>
    )
  }
  return (
    <ColorModeContext.Provider value={setMode}>
      <ThemeProvider theme={main_theme}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                !isValidToken && !loading ? (
                  <Login setToken={setToken} />
                ) : (
                  <Navigate
                    to="/profile"
                    replace
                    state={"Already logged in."}
                  />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isValidToken && !loading ? (
                  <Register setToken={setToken} />
                ) : (
                  <Navigate
                    to="/profile"
                    replace
                    state={"Already logged in."}
                  />
                )
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <>
                    <Navbar removeToken={removeToken} />
                    <Profile token={token} id={id} isInit={isInit} setInit={setInit} />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/quote"
              element={
                <PrivateRoute>
                  <>
                    <Navbar removeToken={removeToken} />
                    <Quote token={token} id={id}/>
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <>
                    <Navbar removeToken={removeToken} />
                    <QuoteHistory token={token} id={id}/>
                  </>
                </PrivateRoute>
              }
            />
            {/* catches all other paths. could make a not found component if time allows but redirecting to login is sufficient for now */}
            <Route path="*" element={<Navigate replace to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
