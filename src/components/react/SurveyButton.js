import React from "react";
import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";

// Props
// stage: stage (1-10)
// handleNext : function to handle stage changes
export default function SurveyButton(props) {
	const renderButton = () => {
		if (props.stage === 10) {
			return (
				<Link
					to="/"
					style={{ textDecoration: "none", color: "inherit" }}
					onClick={props.handleSubmit}
				>
					<Fab variant="extended">Finish and Submit</Fab>
				</Link>
			);
		} else {
			return (
				<Fab
					color="secondary"
					variant="extended"
					onClick={props.handleNext}
				>
					Next
				</Fab>
			);
		}
	};

	return renderButton();
}
