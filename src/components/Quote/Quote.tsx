import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, DatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { endpoint_url } from "src/constants";
import { useNavigate } from "react-router-dom";
import "./Quote.scss"


export default function Quote(props: any) {
  const [dateState, setDate] = React.useState<Date | null>(new Date());
  const [galState, setGal] = React.useState<string>("10");
  const [suggestState, setSuggest] = React.useState<string>("");
  const [totalState, setTotal] = React.useState<string>("");
  const [fetchStatus, updateFetch] = React.useState<boolean>(false);
  const [fullAddress, setAddress] = React.useState<string>("")
  const [addLine2, setAddLine2] = React.useState<string>("")
  const nav_to = useNavigate()

  const [errors, setErrors] = React.useState<any>({
    date: null,
    suggested: null,
    total: null,
    gallons: null,
  });
  //dont like this
  const handleDateErrs = (): boolean => {
    let now = new Date()
    if (!dateState)
    {
      setErrors({...errors, date: "Date cannot be empty."})
      return true;
    }
    else if(dateState < new Date(now.setHours(0, 0, 0, 0)))
    {
      setErrors({...errors, date: "Date cannot be in the past."})
      return true;
    }
    else if(dateState > new Date(now.setFullYear(now.getFullYear() + 2)))
    {
      setErrors({...errors, date: "Date cannot be more than 2 years in the future."})
      return true;
    }
    return false
  }
  const handleClick = async () => {
    const res = await fetch(`${endpoint_url}/get_quote?id=${props.id}&galls=${galState}`,{
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    const quote = await res.json()
    console.log(quote)
    if("error" in quote){
      setErrors({...errors, gallons: quote["error"]})
      setTotal("")
      setSuggest("")
      return
    }
    setTotal(quote["total"])
    setSuggest(quote["suggested"])
  }
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    if(handleDateErrs())  
      return
      
    data.append("id", props.id)
    data.append("gallons", galState);
    data.append("total", totalState);
    data.append("date", dateState!.toDateString());
    data.append("suggested", suggestState);

    fetch(`${endpoint_url}/quote`, {
      method: "POST",
      body: data,
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
      .then((res) => {
        if(res.status === 200) return;
        return res.json();
      })
      .then((data) => {
        if (!data){
          alert(`Successfully made quote on ${dateState?.toDateString()} for $${totalState}. Thank you!`)
          nav_to('/history', {replace: true})
          return;
        } 
        console.log(data);
        for (const err in data) {
          setErrors((prev_errors: any) => ({
            ...prev_errors,
            [err]: data[err][0],
          }));
        }
      });
  };
  React.useEffect(() => {
    if(parseInt(galState) <= 0 || galState === ""){
      setErrors({...errors, gallons: "Please enter a number greater than 0."})
    }
    const get_full_address = async () => {
      const res = await fetch(`${endpoint_url}/get_quote_details?id=${props.id}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + props.token
        }
      })
      const add_data = await res.json()
      setAddress(add_data["full_add"])
      setAddLine2((add_data["add2"] === null) ? "" : add_data["add2"])
      updateFetch(true)
    }
    if(!fetchStatus && props.id != "")
      get_full_address()
  }, [galState]);
  if(!fetchStatus)
    return(
      <>
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
            Let's see how much your quote is.
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleFormSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  color="secondary"
                  variant="standard"
                  name="gals"
                  value={galState}
                  onChange={(newGals) => {
                    setGal(newGals.target.value);
                    if (errors.gallons !== null || errors.suggested != null || errors.total != null)
                      setErrors({
                        date: errors.date,
                        gallons: null,
                        suggested: null,
                        total: null,
                      });
                  }}
                  helperText={errors.gallons !== null ? errors.gallons : ""}
                  error={errors.gallons !== null ? true : false}
                  required
                  type="number"
                  
                  fullWidth
                  id="gals"
                  label="Gallons Requested"
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  color="secondary"
                  variant="standard"
                  disabled={true}
                  value={fullAddress} //temp
                  fullWidth
                  id="add1"
                  label="Address Line 1"
                  name="add1"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  disabled={true}
                  fullWidth
                  value={addLine2}
                  label="Address Line 2"
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    disablePast
                    value={dateState}
                    onChange={(newValue) => {
                      setDate(newValue);
                      if (errors.date !== null)
                        setErrors({ ...errors, date: null });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          errors.date !== null || dateState === null
                            ? true
                            : false
                        }
                        helperText={errors.date !== null ? errors.date : ""}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  disabled={true}
                  error={errors.suggested !== null ? true : false}
                  helperText={(errors.suggested !== null) ? errors.suggested : ""}
                  value={suggestState}
                  name="suggest"
                  fullWidth
                  id="suggest"
                  label="Suggested Price / Gallon"
                  autoFocus
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  variant="standard"
                  disabled={true}
                  error={errors.total !== null ? true : false}
                  name="total"
                  value={totalState}
                  fullWidth
                  id="total"
                  label="Total Price"
                  autoFocus
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={ ( (Object.values(errors).every(err => err === null || err === '')) && (suggestState !== "" && totalState !== "")) ? false : true }
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={handleClick}
              fullWidth
              variant="contained"
              disabled={ ( (Object.values(errors).every(err =>err === null || err === ''))) ? false : true }
              sx={{ mt: 3, mb: 2 }}
            >
              See Quote
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}
