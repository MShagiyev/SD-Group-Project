import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { endpoint_url } from "src/constants";
import { Paper } from "@mui/material";

const QuoteHistory = (props: any) => {
    const [allQuotes, setAllQuotes] = useState<Array<any>>([]);
    const [loading, setLoad] = useState<boolean>(true);
    useEffect(() => {
        fetch(`${endpoint_url}/get-history?id=${props.id}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setAllQuotes(data);
                setLoad(false);
            });
    }, []);
    if (loading) {
        return <></>;
    }
    return (
        <Paper sx={{ width: "40vh", overflow: "hidden", margin: "64px auto"}}>
            <TableContainer sx={{maxHeight: "60vh"}}>
                <Table stickyHeader aria-label="History">
                    <TableHead>
                        <TableRow>
                            <TableCell> Date of Quote </TableCell>
                            <TableCell> Quote Amount </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allQuotes.length !== 0 ? (
                            allQuotes.map((quote) => (
                                <TableRow
                                    key={quote.id}
                                    sx={{
                                            "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {quote.date}
                                    </TableCell>
                                    <TableCell>${quote.total}</TableCell>
                                </TableRow>
                                
                            ))
                        ) : (
                            <TableRow>
                                <TableCell>
                                    No quote history. Make one today.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default QuoteHistory;
