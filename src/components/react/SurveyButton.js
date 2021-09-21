import React from "react";
import Fab from "@material-ui/core/Fab";

// Props
// stage: stage (1-10)
// handleNext : function to handle stage changes
export default function SurveyButton(props) {
	const renderButton = () => {
		if (props.stage === 10) {
			return (
				<Fab variant="extended" onClick={props.handleSubmit}>
					Finish and Submit
				</Fab>
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
