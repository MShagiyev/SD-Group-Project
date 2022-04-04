import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { endpoint_url, states } from "src/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as LoadingIcon } from "../../loading_icon.svg";

export default function Profile(props: any) {
  const [currState, setCurrState] = React.useState("");
  const [errors, setErrors] = React.useState<any>({
    fullName: null,
    add1: null,
    add2: null,
    state: null,
    city: null,
    zipCode: null,
  });
  const [profile, setProfile] = useState<Object>({
    fullName: "",
    add1: "",
    add2: "",
    state: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);

  // const location = useLocation(); use if i want to provide context to why someone cant go somewhere on the site
  const nav_to = useNavigate();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.append("id", props.id);
    await fetch(`${endpoint_url}/profile`, {
      method: "POST",
      body: data,
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        if (res.status === 200) return;
        const errs = res.json();
        return errs;
      })
      .then((data) => {
        if (!data) {
          props.setInit(true);
          alert("Successfully updated profile! Redirecting to quote page now.")
          nav_to("/quote", { replace: true });
          return;
        }
        console.log(data);
        for (const err in data)
          setErrors((prev_errors: any) => ({
            ...prev_errors,
            [err]: data[err][0],
          }));
      });
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrState(event.target.value);
    if (errors.state !== null) setErrors({ ...errors, state: null });
  };

  React.useEffect(() => {
    let isMounted = true;
    const get_profile = async () => {
      setLoading(true);
      const raw_data = await fetch(
        `${endpoint_url}/get_profile?id=${props.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + props.token,
          },
        }
      );
      const profile_data = await raw_data.json();
      setProfile(profile_data);
      setCurrState(profile_data["state"])
      setLoading(false);
    };

    if (props.isInit && props.id != "") get_profile();
  }, []);
  if(loading)
    return(
      <>
        <LoadingIcon/>
      </>
    )
  return (
    <div>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            {props.isInit
              ? "Let's manage your profile."
              : "First time? Let's get you setup."}
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  variant="standard"
                  autoComplete="given-name"
                  name="fullName"
                  error={errors.fullName !== null ? true : false}
                  helperText={errors.fullName !== null ? errors.fullName : ""}
                  required
                  fullWidth
                  value={profile["fullName"]}
                  onChange={(e) => {
                    if (errors.fullName !== null)
                      setErrors({ ...errors, fullName: null });
                    setProfile({...profile, fullName: e.target.value}) // this has gotta have some performance implications
                  }}
                  id="firstName"
                  label="Full Name"
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  required
                  fullWidth
                  id="add1"
                  label="Address Line 1"
                  name="add1"
                  error={errors.add1 !== null ? true : false}
                  helperText={errors.add1 !== null ? errors.add1 : ""}
                  value={profile["add1"]}
                  onChange={(e) => {
                    setProfile({...profile, add1: e.target.value})
                    if (errors.add1 !== null)
                      setErrors({ ...errors, add1: null });
                  }}
                  autoComplete="address"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  error={errors.add2 !== null ? true : false}
                  helperText={errors.add2 !== null ? errors.add2 : ""}
                  value={profile["add2"]}
                  onChange={(e) => {
                    setProfile({...profile, add2: e.target.value})
                    if (errors.add2 !== null)
                      setErrors({ ...errors, add2: null });
                  }}
                  fullWidth
                  name="add2"
                  label="Address Line 2"
                  id="add2"
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  select
                  color="secondary"
                  name="state"
                  label="State"
                  error={errors.state !== null ? true : false}
                  helperText={errors.state !== null ? errors.state : ""}
                  onChange={handleChange}
                  SelectProps={{
                    native: true,
                  }}
                  value={currState}
                  sx={{
                    minWidth: 55,
                    maxWidth: 80,
                  }}
                  autoFocus
                >
                  {states.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  name="city"
                  error={errors.city !== null ? true : false}
                  helperText={errors.city !== null ? errors.city : ""}
                  value={profile["city"]}
                  onChange={(e) => {
                    setProfile({...profile, city: e.target.value})
                    if (errors.city !== null)
                      setErrors({ ...errors, city: null });
                  }}
                  required
                  fullWidth
                  id="city"
                  label="City"
                  autoFocus
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  color="secondary"
                  variant="standard"
                  name="zipCode"
                  error={errors.zipCode !== null ? true : false}
                  helperText={errors.zipCode !== null ? errors.zipCode : ""}
                  value={profile["zipCode"]}
                  onChange={(e) => {
                    setProfile({...profile, zipCode: e.target.value})
                    if (errors.zipCode !== null)
                      setErrors({ ...errors, zipCode: null });
                  }}
                  required
                  fullWidth
                  id="zip"
                  label="Zip Code"
                  autoFocus
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={
                Object.values(errors).every((err) => err === null || err === "")
                  ? false
                  : true
              }
              sx={{ mt: 3, mb: 2 }}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}
