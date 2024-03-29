import React from "react";
import { Button, Grid, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

export default function CanvasIntro() {
	const useStyles = makeStyles((theme) => ({
		root: {
			flexGrow: 1,
			height: "100vh",
			color: theme.palette.text.primary,
		},
		dotPoint: {
			width: "100%",
		},
	}));

	const theme = useTheme();
	const classes = useStyles(theme);

	return (
		<Grid
			container
			direction="column"
			alignItems="center"
			justifyContent="flex-start"
			className={classes.root}
		>
			<Grid item>
				<h1> Information </h1>
			</Grid>
			<Grid item className={classes.dotPoint}>
				<ul>
					<li>
						<Typography>
							This app collects digital handwriting from a digital
							stylus. Please ensure that you are using a digital
							stylus on a touch enabled device such as an iPad.
						</Typography>
					</li>
					<li>
						<Typography>
							This activity will consist of two stages: a practice
							and timed assessment.
						</Typography>
					</li>
					<li>
						<Typography>
							On the practice page, you will be required to copy a
							piece of text onto the digital canvas. This task is
							untimed and unrecorded and is a good way for you to
							get familiar with the test environment.
						</Typography>
					</li>
					<li>
						<Typography>
							On the test page, you will be asked to repeat the
							same task in a timed environment. Your handwiting
							will be recorded during this stage.
						</Typography>
					</li>
				</ul>
			</Grid>
			<Grid item>
				<Link
					to="/canvas/practice"
					style={{ textDecoration: "none", color: "inherit" }}
				>
					<Button variant="contained" color="primary">
						Next
					</Button>
				</Link>
			</Grid>
		</Grid>
	);
}
