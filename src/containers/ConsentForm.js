import React from "react";
import { useState } from "react";
import { Button, Grid, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Link from "@material-ui/core/Link";
import { Backdrop, CircularProgress } from "@material-ui/core";

import { useHistory } from "react-router-dom";

import fire from "../config/firebase";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		height: "100vh",
		color: theme.palette.text.primary,
	},
	title: {
		marginLeft: "2%",
		width: "95%",
	},
	form: {
		width: "100%",
	},
	error: {
		color: theme.palette.error.main,
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: "#fff",
	},
}));

export default function ConsentForm(props) {
	const [checked, setChecked] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [progress, setProgress] = useState("none");

	var history = useHistory();
	var db = fire.firestore();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (checked === true) {
			setProgress("submitting");

			let ret = await fire
				.auth()
				.signInAnonymously()
				.catch((e) => alert("Could not generate a unique user id"));

			console.log(ret.user.uid);

			try {
				await db.collection("user_docs").doc(ret.user.uid).set({
					docs: [],
				});

				history.push(props.link);
			} catch (e) {
				alert("Error creating anonymous user id");
			}
		} else {
			setSubmitted(true);
		}
	};

	const theme = useTheme();
	const classes = useStyles(theme);

	return (
		<>
			<Backdrop
				className={classes.backdrop}
				open={progress === "submitting"}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Grid
				container
				direction="column"
				alignItems="center"
				justifyContent="flex-start"
				className={classes.root}
			>
				<Grid item>
					<h1> Declaration by Participant </h1>
				</Grid>
				<Grid item className={classes.title}>
					<h3> By checking the start questionare option below: </h3>
				</Grid>
				<Grid item>
					<ul>
						<li>
							<Typography>
								I understand I am being asked to provide consent
								to participate in this research study.
							</Typography>
						</li>
						<li>
							<Typography>
								I have read the{" "}
								<Link
									href="https://docs.google.com/document/d/1fCmtzHs3qebfjPYSdBTGJjeFTePw8ocW/edit?usp=sharing&ouid=103309654343154438571&rtpof=true&sd=true"
									target="_blank"
								>
									Participant Information Sheet
								</Link>{" "}
								, or it has been provided to me in a language
								that I understand.
							</Typography>
						</li>
						<li>
							<Typography>
								I provide my consent for the information
								collected about me to be used for the purpose of
								this research study only.
							</Typography>
						</li>
						<li>
							<Typography>
								I understand that if necessary, I can ask
								questions and the research team will respond to
								my questions.
							</Typography>
						</li>
						<li>
							<Typography>
								I freely agree to participate in this research
								study as described and understand that I am free
								to withdraw at any time during the study and
								withdrawal will not affect my relationship with
								any of the named organisations and/or the
								research team members.{" "}
							</Typography>
						</li>
					</ul>
				</Grid>
				<Grid item>
					<form id="form" onSubmit={handleSubmit}>
						<Grid
							container
							direction="column"
							spacing={1}
							alignItems="center"
							justifyContent="center"
						>
							<Grid item>
								<FormControlLabel
									control={
										<Checkbox
											checked={checked}
											onChange={() => {
												setChecked(!checked);
											}}
											color="primary"
										/>
									}
									label={
										<>
											<Typography>
												I understand that I can download
												a copy of this consent form
												using
												<Link
													href="https://docs.google.com/document/d/1fCmtzHs3qebfjPYSdBTGJjeFTePw8ocW/edit?usp=sharing&ouid=103309654343154438571&rtpof=true&sd=true"
													target="_blank"
												>
													{" "}
													this link.{" "}
												</Link>
											</Typography>
										</>
									}
								/>
							</Grid>
							{submitted === true && checked === false ? (
								<Grid>
									<Typography
										variant="body2"
										className={classes.error}
									>
										Please accept all terms and conditions
										in the form.
									</Typography>
								</Grid>
							) : (
								<></>
							)}
							<Grid item>
								<Button
									variant="contained"
									color="primary"
									type="submit"
								>
									I agree
								</Button>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Grid>
		</>
	);
}
