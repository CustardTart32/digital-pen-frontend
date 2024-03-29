import { Grid, IconButton, Typography } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { FormHelperText } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";

import SurveyButton from "./SurveyButton";
import FourPointModal from "./FourPointModal";
import LoadingCircle from "./LoadingCircle";

import fire from "../../config/firebase";
const storage = fire.storage();

// Props
// id: Id of image to show (if id.length > 5, we need to download from firebase)
// updateFourPointResponse: function to update data struct that stores user responses
// handleNext: transitions to next question
// handleSubmit: submits survey responses
export default function FourPointScale(props) {
	// Scale
	// 1 -> Illegible
	// 2 -> Some words legible
	// 3 -> Most words legible
	// 4 -> Legible
	const [value, setValue] = useState("");
	const [open, setOpen] = useState(false);
	const [error, setError] = useState(false);
	const [url, setUrl] = useState(null);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const requiresDownload = useCallback(() => {
		return props.id.length > 5;
	}, [props.id]);

	useEffect(() => {
		if (requiresDownload()) {
			const getURL = (id) => {
				var pathReference = storage.ref("inkImages/" + id + ".png");

				return pathReference.getDownloadURL();
			};

			getURL(props.id)
				.then((url) => {
					// console.log("URL of id:", url);
					setUrl(url);
				})
				.catch((err) => {
					console.log(err.message);
					setUrl(null);
				});
		}
	}, [props.id, requiresDownload]);

	const renderImage = () => {
		if (requiresDownload()) {
			if (url === null) {
				return <LoadingCircle />;
			} else {
				return <img src={url} alt="" width="95%" />;
			}
		} else {
			return (
				<img
					src={
						require("../../assets/dataset_screenshots/" +
							props.id +
							".png").default
					}
					alt=""
					width="95%"
				/>
			);
		}
	};

	const handleChange = (event) => {
		setValue(event.target.value);
	};

	const handleNext = () => {
		if (value === "") {
			setError(true);
		} else {
			props.updateFourPointResponse(props.id, value);
			props.handleNext();
			setError(false);
			setValue("");
		}
	};

	const handleSubmit = () => {
		if (value === "") {
			setError(true);
		} else {
			props.updateFourPointResponse(props.id, value);
			props.handleSubmit();
		}
	};

	return (
		<>
			<FourPointModal
				open={open}
				handleOpen={handleOpen}
				handleClose={handleClose}
			/>
			<Grid
				container
				item
				direction="row"
				alignItems="center"
				justifyContent="center"
				spacing={2}
			>
				<Grid item>
					<Typography variant="h6">
						How legible would you consider this piece of
						handwriting?
					</Typography>
				</Grid>
				<Grid item>
					<IconButton
						color="secondary"
						aria-label="help"
						component="span"
						onClick={handleOpen}
					>
						<HelpIcon />
					</IconButton>
				</Grid>
			</Grid>
			<Grid item>
				<FormControl component="fieldset">
					<RadioGroup
						aria-label="text"
						name="Text"
						value={value}
						onChange={handleChange}
						row
					>
						<FormControlLabel
							value="1"
							control={<Radio />}
							label="Illegible"
						/>
						<FormControlLabel
							value="2"
							control={<Radio />}
							label="Some Words Legible"
						/>
						<FormControlLabel
							value="3"
							control={<Radio />}
							label="Most Words Legible"
						/>
						<FormControlLabel
							value="4"
							control={<Radio />}
							label="Legible"
						/>
					</RadioGroup>
					<FormHelperText
						style={{
							textAlign: "center",
							color: "red",
							visibility: error ? "visible" : "hidden",
						}}
					>
						Please select an option
					</FormHelperText>
				</FormControl>
			</Grid>
			<Grid item>
				<SurveyButton
					stage={props.stage}
					handleNext={handleNext}
					handleSubmit={handleSubmit}
				/>
			</Grid>
			<Grid
				container
				item
				direction="row"
				alignItems="center"
				justifyContent="center"
			>
				{renderImage()}
			</Grid>
		</>
	);
}
