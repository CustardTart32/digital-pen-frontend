import React from "react";
import { useState, useEffect } from "react";
import { Grid, makeStyles, useTheme } from "@material-ui/core";
import NavBarMark from "../components/react/NavBarMark";
import Comparison from "../components/react/Comparision";
import FourPointScale from "../components/react/FourPointScale";
import { useCallback } from "react";

import fire from "../config/firebase";

const db = fire.firestore();

const useStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.text.primary,
		width: "100%",
	},
	toolbar: theme.mixins.toolbar,
}));

export default function Mark() {
	const theme = useTheme();
	const classes = useStyles(theme);

	const [stage, setStage] = useState(6);

	// Data structures to store ids and corresponding survey responses
	// ids -> [array of ids]
	// responses -> {id: -> RESPONSE <-}
	const [comparisonIds, setComparisonIds] = useState([]);
	const [comparisonReponses, setComparisonReponses] = useState({});

	const [fourPointIds, setFourPointIds] = useState([]);
	const [fourPointResponses, setFourPointResponses] = useState({});

	const handleSubmit = () => {
		console.log("Submitting");
	};

	const handleNext = () => {
		setStage(stage + 1);
	};

	const updateComparisonResponse = (yeaVote, nayVote) => {
		const newDict = comparisonReponses;

		newDict[yeaVote]["yea"] += 1;
		newDict[nayVote]["nay"] += 1;

		console.log(newDict);

		setComparisonReponses(newDict);
	};

	// Score is an id and needs to be cast to an int
	const updateFourPointResponse = (id, score) => {
		const newDict = fourPointResponses;

		newDict[id][parseInt(score)] += 1;

		console.log(newDict);

		setFourPointResponses(newDict);
	};

	// Generates a random doc id and then uses it to do a query on the collection via doc_id
	// Guaranteed to work if there exists 1 or more docs in the collection
	const getRandomDocument = async (collection) => {
		let datasetsRef = db.collection(collection);

		let random = datasetsRef.doc().id;

		let query_a = datasetsRef
			.where("__name__", ">=", random)
			.orderBy("__name__")
			.limit(1);

		let query_b = datasetsRef
			.where("__name__", "<=", random)
			.orderBy("__name__")
			.limit(1);

		let querySnapshot = await query_a.get().catch((error) => {
			console.log("Error getting documents: ", error);
		});

		if (querySnapshot.empty) {
			querySnapshot = await query_b.get().catch((error) => {
				console.log("Error getting documents: ", error);
			});
		}

		return querySnapshot.docs[0].get("name");
	};

	const getIds = useCallback(async (n) => {
		var promises = [];

		for (let i = 0; i < n; i++) {
			promises.push(getRandomDocument("datasets"));
		}

		let randomIds = await Promise.all(promises).catch((e) => {
			alert("Error getting random docs from database");
		});

		return randomIds;
	}, []);

	// Hook to generate 10 random doc ids for comparison questions
	// Uses async function
	useEffect(() => {
		getIds(10)
			.then((comparisonIds) => {
				setComparisonIds(comparisonIds);

				var responses = {};

				comparisonIds.forEach((id) => {
					responses[id] = { yea: 0, nay: 0 };
				});

				setComparisonReponses(responses);
			})
			.catch((error) => {
				alert(error);
			});
	}, [getIds]);

	// Hook to generate 5 random docs for 4 point scale questions
	useEffect(() => {
		getIds(5)
			.then((ids) => {
				console.log(ids);
				setFourPointIds(ids);

				var responses = {};

				ids.forEach((id) => {
					responses[id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
				});

				setFourPointResponses(responses);
			})
			.catch((error) => alert(error));
	}, [getIds]);

	const renderSurveyQuestion = () => {
		if (comparisonIds.length === 0 || fourPointIds.length === 0) {
			return <></>;
		}

		if (stage <= 5) {
			return (
				<Comparison
					stage={stage}
					idA={comparisonIds[stage * 2 - 2]}
					idB={comparisonIds[stage * 2 - 1]}
					handleNext={handleNext}
					updateComparisonResponse={updateComparisonResponse}
				/>
			);
		} else {
			return (
				<FourPointScale
					stage={stage}
					id={fourPointIds[stage - 6]}
					handleNext={handleNext}
					updateFourPointResponse={updateFourPointResponse}
					handleSubmit={handleSubmit}
				/>
			);
		}
	};

	return (
		<>
			<NavBarMark progress={stage * 10} />
			<Grid
				container
				direction="column"
				alignItems="center"
				justifyContent="space-evenly"
				spacing={2}
				className={classes.root}
			>
				<div className={classes.toolbar} />
				<br />
				{renderSurveyQuestion()}
			</Grid>
		</>
	);
}
