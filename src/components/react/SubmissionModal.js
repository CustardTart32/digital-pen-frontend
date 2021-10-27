import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { Button, Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
	modal: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	paper: {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
	},
}));

export default function SubmissionModal(props) {
	const theme = useTheme();
	const classes = useStyles(theme);

	function OutOfTime() {
		return (
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<h2 id="transition-modal-title">Your time is up</h2>
				<p id="transition-modal-description">
					If you made a mistake or did not complete the task, you may
					redo the task by clicking on the reset button below.
				</p>
				<p id="transition-modal-description">
					Otherwise, click the submit button to upload your
					handwriting.
				</p>
				<Grid
					container
					direction="row"
					justifyContent="space-evenly"
					alignItems="center"
				>
					<Button
						variant="contained"
						color="primary"
						onClick={props.handleSubmit}
					>
						Submit Handwriting
					</Button>
					<Button
						variant="contained"
						color="secondary"
						onClick={props.handleErrorReset}
					>
						Reset Test
					</Button>
				</Grid>
			</Grid>
		);
	}

	function Success() {
		return (
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<h2 id="transition-modal-title">
					Your handwriting was submitted successfully
				</h2>
				<p id="transition-modal-description">
					If you could provide your feedback on some user submitted
					handwriting, that would be great!!
				</p>
				<p id="transition-modal-description">
					This task should take approximately 1-2 minutes.
				</p>
				<Grid
					container
					direction="row"
					justifyContent="space-evenly"
					alignItems="center"
				>
					<Button
						variant="contained"
						color="primary"
						href="/mark/force"
					>
						Start Marking
					</Button>
					<Button variant="contained" color="secondary" href="/">
						Back to Home
					</Button>
				</Grid>
			</Grid>
		);
	}

	function Failure() {
		return (
			<Grid
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<h2 id="transition-modal-title">Oops, something went wrong.</h2>
				<p id="transition-modal-description">{props.error}</p>
				<Grid
					container
					direction="row"
					justifyContent="space-evenly"
					alignItems="center"
				>
					<Button
						variant="contained"
						color="primary"
						onClick={props.handleErrorReset}
					>
						Retry
					</Button>
					<Button variant="contained" color="secondary" href="/">
						Back to Home
					</Button>
				</Grid>
			</Grid>
		);
	}

	const renderModalContents = () => {
		if (props.submissionStatus === "submitted") {
			if (props.error === "") {
				return <Success />;
			} else {
				return <Failure />;
			}
		} else {
			return <OutOfTime />;
		}
	};

	return (
		<Modal
			aria-labelledby="transition-modal-title"
			aria-describedby="transition-modal-description"
			className={classes.modal}
			open={
				props.submissionStatus === "submitted" ||
				props.submissionStatus === "outOfTime"
			}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{
				timeout: 500,
			}}
		>
			<Fade
				in={
					props.submissionStatus === "submitted" ||
					props.submissionStatus === "outOfTime"
				}
			>
				<div className={classes.paper}>{renderModalContents()}</div>
			</Fade>
		</Modal>
	);
}
