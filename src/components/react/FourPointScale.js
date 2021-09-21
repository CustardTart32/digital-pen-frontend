import { Grid, IconButton, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import HelpIcon from "@material-ui/icons/Help";

import SurveyButton from "./SurveyButton";
import FourPointModal from "./FourPointModal";

export default function FourPointScale(props) {
	// Scale
	// 1 -> Illegible
	// 2 -> Some words legible
	// 3 -> Most words legible
	// 4 -> Legible
	const [value, setValue] = useState(0);
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleChange = (event) => {
		setValue(event.target.value);
	};

	const handleNext = () => {
		props.updateFourPointResponse(props.id, value);
		props.handleNext();
		setValue(0);
	};

	const handleSubmit = () => {
		props.updateFourPointResponse(props.id, value);
		props.handleSubmit();
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
				</FormControl>
			</Grid>
			<Grid
				container
				item
				direction="row"
				alignItems="center"
				justifyContent="center"
			>
				<img
					src={
						require("../../assets/dataset_screenshots/" +
							props.id +
							".png").default
					}
					alt=""
					width="95%"
				/>
			</Grid>
			<Grid item>
				<SurveyButton
					stage={props.stage}
					handleNext={handleNext}
					handleSubmit={handleSubmit}
				/>
			</Grid>
		</>
	);
}
