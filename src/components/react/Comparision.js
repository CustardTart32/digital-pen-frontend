import React from "react";
import { useState, useEffect, useCallback } from "react";
import { FormHelperText, Grid, Typography } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import SurveyButton from "./SurveyButton";
import LoadingCircle from "./LoadingCircle";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import "../../styles/carousel_styles.css";
import { Carousel } from "react-responsive-carousel";

import fire from "../../config/firebase";
const storage = fire.storage();

// Props:
// Stage: (1-10)
// idA/idB: tags for both ids (If the id string > 5, then we download the url from firebase storage)
// handleNext: Function to handle stage change
// updateComparisonResponse: Fuctiono to update parent object of responses
export default function Comparison(props) {
	const [value, setValue] = useState("");
	const [other, setOther] = useState("");
	const [error, setError] = useState(false);

	const [urlA, setUrlA] = useState(null);
	const [urlB, setUrlB] = useState(null);

	const handleChange = (event) => {
		if (event.target.value === props.idA) {
			setValue(props.idA);
			setOther(props.idB);
		} else {
			setValue(props.idB);
			setOther(props.idA);
		}
	};

	const handleNext = () => {
		if (value === "") {
			setError(true);
		} else {
			props.updateComparisonResponse(value, other);
			props.handleNext();
			setError(false);
			setValue("");
			setOther("");
		}
	};

	const requiresDownload = useCallback(() => {
		return props.idA.length > 5;
	}, [props.idA]);

	useEffect(() => {
		if (requiresDownload()) {
			const getURL = (id) => {
				var pathReference = storage.ref("inkImages/" + id + ".png");

				return pathReference.getDownloadURL();
			};

			getURL(props.idA)
				.then((url) => {
					// console.log("URL of idA:", url);
					setUrlA(url);
				})
				.catch((err) => {
					console.log(err.message);
					setUrlA(null);
				});

			getURL(props.idB)
				.then((url) => {
					// console.log("URL of idB:", url);
					setUrlB(url);
				})
				.catch((err) => {
					console.log(err.message);
					setUrlB(null);
				});
		}
	}, [props.idA, props.idB, requiresDownload]);

	const renderImage = (id, url) => {
		if (!requiresDownload()) {
			return (
				<img
					src={
						require("../../assets/dataset_screenshots/" +
							id +
							".png").default
					}
					alt=""
				/>
			);
		} else {
			return <img src={url} alt="" />;
		}
	};

	const getCarousel = () => {
		if (requiresDownload() && urlA === null && urlB == null) {
			return <LoadingCircle />;
		} else {
			return (
				<Carousel
					width="90%"
					showThumbs={false}
					autoPlay={true}
					interval={10000}
					infiniteLoop={true}
				>
					<div>
						{renderImage(props.idA, urlA)}
						<p className="legend">Submission A</p>
					</div>
					<div>
						{renderImage(props.idB, urlB)}
						<p className="legend">Submission B</p>
					</div>
				</Carousel>
			);
		}
	};

	const renderRadioButtons = () => {
		return (
			<>
				<FormControlLabel
					value={props.idA}
					control={<Radio />}
					label="Submission A"
				/>
				<FormControlLabel
					value={props.idB}
					control={<Radio />}
					label="Submission B"
				/>
			</>
		);
	};

	return (
		<>
			<Grid item>
				<Typography variant="h6">
					Which of these pieces of handwriting is more legible in your
					opinion?
				</Typography>
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
						{renderRadioButtons()}
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
				<SurveyButton stage={props.stage} handleNext={handleNext} />
			</Grid>
			<Grid
				container
				item
				direction="row"
				alignItems="center"
				justifyContent="center"
			>
				<Grid item>{getCarousel()}</Grid>
			</Grid>
		</>
	);
}
