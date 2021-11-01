import React from "react";
import { useState, useEffect } from "react";
import { Grid, makeStyles, useTheme } from "@material-ui/core";
import NavBarMark from "../components/react/NavBarMark";
import Comparison from "../components/react/Comparision";
import FourPointScale from "../components/react/FourPointScale";
import { useCallback } from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";

import { useHistory } from "react-router";

import fire from "../config/firebase";
import firebase from "firebase/app";

const db = fire.firestore();

const useStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.text.primary,
		width: "100%",
	},
	toolbar: theme.mixins.toolbar,
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: "#fff",
	},
}));

export default function Mark() {
	const theme = useTheme();
	const classes = useStyles(theme);
	const history = useHistory();

	// Stage goes from (1->10)
	const [stage, setStage] = useState(1);
	const [submitting, setSubmitting] = useState(false);

	// Variable that gets the number of ink submissions
	const [submissions, setSubmissions] = useState(null);

	// Data structures to store ids and corresponding survey responses
	// ids -> [array of ids]
	// responses -> {id: -> RESPONSE <-}
	const [comparisonIds, setComparisonIds] = useState([]);
	const [comparisonReponses, setComparisonReponses] = useState({});

	const [fourPointIds, setFourPointIds] = useState([]);
	const [fourPointResponses, setFourPointResponses] = useState({});

	const getNRandomDatasetIds = useCallback((n) => {
		const datasetIds = [
			"001",
			"001a",
			"001b",
			"001c",
			"001d",
			"001e",
			"001f",
			"001g",
		];

		// Shuffle array
		const shuffled = datasetIds.sort(() => 0.5 - Math.random());

		// Get sub-array of first n elements after shuffled
		let selected = shuffled.slice(0, n);
		return selected;
	}, []);

	const getOtherDatasetId = useCallback((id) => {
		var datasetIds = [
			"001",
			"001a",
			"001b",
			"001c",
			"001d",
			"001e",
			"001f",
			"001g",
		];

		let index = datasetIds.indexOf(id);

		if (index > -1) {
			datasetIds.splice(index, 1);
		}

		// Shuffle array
		const shuffled = datasetIds.sort(() => 0.5 - Math.random());

		// Get sub-array of first n elements after shuffled
		return shuffled[0];
	}, []);

	const getOtherDatasetIds = useCallback(
		(ids) => {
			let other = [];

			ids.forEach((id) => {
				let otherId = getOtherDatasetId(id);
				other.push(otherId);
			});

			// Get sub-array of first n elements after shuffled
			return other;
		},
		[getOtherDatasetId]
	);

	const handleSubmit = () => {
		console.log("Submitting");
		setSubmitting(true);

		if (submissions !== null) {
			if (submissions < 5) {
				updateDatabase("dataset_responses");
			} else {
				updateDatabase("user_responses");
			}
		}
	};

	const updateDatabase = (collection) => {
		var batch = db.batch();

		for (let [key, value] of Object.entries(comparisonReponses)) {
			let docRef = db.collection(collection).doc(key);

			batch.update(docRef, {
				yea: firebase.firestore.FieldValue.increment(value["yea"]),
				nay: firebase.firestore.FieldValue.increment(value["nay"]),
				total_comparisons: firebase.firestore.FieldValue.increment(
					value["nay"] + value["yea"]
				),
			});
		}

		for (let [key, value] of Object.entries(fourPointResponses)) {
			let docRef = db.collection(collection).doc(key);

			batch.update(docRef, {
				1: firebase.firestore.FieldValue.increment(value["1"]),
				2: firebase.firestore.FieldValue.increment(value["2"]),
				3: firebase.firestore.FieldValue.increment(value["3"]),
				4: firebase.firestore.FieldValue.increment(value["4"]),
				total_four_point: firebase.firestore.FieldValue.increment(
					value["1"] + value["2"] + value["3"] + value["4"]
				),
			});
		}

		let countRef;

		if (collection === "user_responses") {
			countRef = db.collection("response_count").doc("count");
		} else {
			countRef = db.collection("dataset_count").doc("count");
		}

		batch.update(countRef, {
			count: firebase.firestore.FieldValue.increment(1),
		});

		batch
			.commit()
			.then(() => {
				console.log("Successfully updated");
				setSubmitting(false);
				history.push("/");
				history.go(0);
			})
			.catch((e) => {
				alert("Error when uploading survey data");
				console.log(e);
				setSubmitting(false);
				// history.push("/");
				// history.go(0);
			});
	};

	const handleNext = () => {
		setStage(stage + 1);
	};

	const updateComparisonResponse = (yeaVote, nayVote) => {
		const newDict = comparisonReponses;

		newDict[yeaVote]["yea"] += 1;
		newDict[nayVote]["nay"] += 1;

		// console.log(newDict);

		setComparisonReponses(newDict);
	};

	// Score is an id and needs to be cast to an int
	const updateFourPointResponse = (id, score) => {
		const newDict = fourPointResponses;

		newDict[id][parseInt(score)] += 1;

		// console.log(newDict);

		setFourPointResponses(newDict);
	};

	// Get a doc where the field does not equal the existing value and return the field of that doc
	// TODO: Only guaranteed to work when field == __name__ and more than 2 docs are in the collection
	const getOtherDoc = async (collection, field, value) => {
		let datasetsRef = db.collection(collection);
		let random = datasetsRef.doc().id;

		let query_a = datasetsRef
			.where("__name__", "!=", value)
			.where("__name__", ">=", random)
			.orderBy("__name__")
			.limit(1);

		let query_b = datasetsRef
			.where("__name__", "!=", value)
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

		return querySnapshot.docs[0].id;
	};

	// For a list of values, get an equal length list of docs values where their value
	// does not equal their corresponding values in the existing list
	const getOtherDocs = useCallback(async (collection, field, values) => {
		var promises = [];

		for (let i = 0; i < values.length; i++) {
			promises.push(getOtherDoc(collection, field, values[i]));
		}

		let otherValues = await Promise.all(promises).catch((e) => {
			console.log(e);
			alert("Error getting other docs from database");
		});

		return otherValues;
	}, []);

	// Get number of submissions
	useEffect(() => {
		let db_ref = db.collection("ink");

		db_ref
			.get()
			.then((querySnapshot) => {
				console.log("Amount of submissions", querySnapshot.size);
				setSubmissions(querySnapshot.size);
			})
			.catch((err) => {
				console.log(err);
				setSubmissions(0);
			});
	}, []);

	// Hook to generate 5 random docs with 5 alternate docs as well for comparison survey questions
	// Takes in a collection and field to query on
	// Initialises the state of the comparison responses as well
	useEffect(() => {
		const getAlternateDocs = async (collection, field) => {
			let doc_ids;

			if (collection === "datasets") {
				doc_ids = getNRandomDatasetIds(5);
			} else {
				// Get 5 least used comparison ids
				let querySnapshot = await db
					.collection(collection)
					.orderBy("total_comparisons")
					.limit(5)
					.get();

				doc_ids = [];

				querySnapshot.forEach(async (doc) => {
					// doc.data() is never undefined for query doc snapshots
					// console.log(doc.id, " => ", doc.data());
					doc_ids.push(doc.id);
				});
			}

			let other_ids;

			if (collection === "datasets") {
				other_ids = getOtherDatasetIds(doc_ids);
			} else {
				other_ids = await getOtherDocs(
					collection,
					field,
					doc_ids
				).catch((error) => {
					alert(error);
				});
			}

			let comparisonIds = [];
			for (let i = 0; i < doc_ids.length; i++) {
				comparisonIds.push(doc_ids[i]);
				comparisonIds.push(other_ids[i]);
			}

			setComparisonIds(comparisonIds);

			console.log("Comparison Ids", comparisonIds);

			var responses = {};

			comparisonIds.forEach((id) => {
				responses[id] = { yea: 0, nay: 0 };
			});

			setComparisonReponses(responses);
		};

		// if (submissions !== null) {
		// 	if (submissions < 5) {
		// 		getAlternateDocs("datasets", "name");
		// 	} else {
		// 		getAlternateDocs("user_responses", "__name__");
		// 	}
		// }

		// Force app to load dataset images
		getAlternateDocs("datasets", "name");
	}, [getOtherDocs, getNRandomDatasetIds, getOtherDatasetIds, submissions]);

	// Hook to get the ink submissions for the 4 point scale
	// When rendering dataset, randomly selects 5 images from the dataset
	// When rendering images, selects 5 images with the least amount of responses
	useEffect(() => {
		const getIds = async (collection, field) => {
			let ids;

			if (collection === "datasets") {
				ids = getNRandomDatasetIds(5);
			} else {
				let querySnapshot = await db
					.collection(collection)
					.orderBy("total_four_point")
					.limit(5)
					.get();

				ids = [];

				querySnapshot.forEach(async (doc) => {
					// doc.data() is never undefined for query doc snapshots
					ids.push(doc.id);
				});
			}

			console.log("4 point ids", ids);
			setFourPointIds(ids);

			var responses = {};

			ids.forEach((id) => {
				responses[id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
			});

			setFourPointResponses(responses);
		};

		// if (submissions !== null) {
		// 	if (submissions < 5) {
		// 		getIds("datasets", "name");
		// 	} else {
		// 		getIds("user_responses", "__name__");
		// 	}
		// }

		// Force app to load dataset images
		getIds("datasets", "name");
	}, [submissions, getNRandomDatasetIds]);

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
			<Backdrop className={classes.backdrop} open={submitting}>
				<CircularProgress color="inherit" />
			</Backdrop>
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
