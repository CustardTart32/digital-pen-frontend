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

	// Data structures to store ids and corresponding survey responses
	// ids -> [array of ids]
	// responses -> {id: -> RESPONSE <-}
	const [comparisonIds, setComparisonIds] = useState([]);
	const [comparisonReponses, setComparisonReponses] = useState({});

	const [fourPointIds, setFourPointIds] = useState([]);
	const [fourPointResponses, setFourPointResponses] = useState({});

	const handleSubmit = () => {
		console.log("Submitting");
		setSubmitting(true);
		updateDatabase("dataset_responses");
	};

	const updateDatabase = (collection) => {
		var batch = db.batch();

		for (let [key, value] of Object.entries(comparisonReponses)) {
			let docRef = db.collection(collection).doc(key);

			batch.update(docRef, {
				yea: firebase.firestore.FieldValue.increment(value["yea"]),
				nay: firebase.firestore.FieldValue.increment(value["nay"]),
			});
		}

		for (let [key, value] of Object.entries(fourPointResponses)) {
			let docRef = db.collection(collection).doc(key);

			batch.update(docRef, {
				1: firebase.firestore.FieldValue.increment(value["1"]),
				2: firebase.firestore.FieldValue.increment(value["2"]),
				3: firebase.firestore.FieldValue.increment(value["3"]),
				4: firebase.firestore.FieldValue.increment(value["4"]),
			});
		}

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
				history.push("/");
				history.go(0);
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

	// Gets a field for a particular doc
	const getDocField = async (collection, id, field) => {
		let docRef = db.collection(collection).doc(id);

		let doc = await docRef.get().catch((error) => {
			console.log("Error getting document:", error);
		});

		return doc.get(field);
	};

	// Generates a random doc id and then uses it to do a query on the collection via doc_id
	// Guaranteed to work if there exists 1 or more docs in the collection
	// Returns a field of the randomly read doc
	const getRandomDocument = async (collection, field) => {
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

		if (field === "__name__") {
			return querySnapshot.docs[0].id;
		} else {
			return querySnapshot.docs[0].get(field);
		}
	};

	// Get a doc where the field does not equal the existing value and return the field of that doc
	// TODO: Only guarenteed to work when field == __name__ and more than 2 docs are in the collection
	const getOtherDoc = async (collection, field, value) => {
		let datasetsRef = db.collection(collection);
		let random = datasetsRef.doc().id;

		let query_a = datasetsRef
			.where("__name__", ">=", random)
			.where(field, "!=", value)
			.orderBy("__name__")
			.limit(1);

		let query_b = datasetsRef
			.where("__name__", "<=", random)
			.where(field, "!=", value)
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

		if (field === "__name__") {
			return querySnapshot.docs[0].id;
		} else {
			return querySnapshot.docs[0].get(field);
		}
	};

	// For a list of values, get an equal length list of docs values where their value
	// does not equal their corresponding values in the existing list
	const getOtherDocs = useCallback(async (collection, field, values) => {
		var promises = [];

		for (let i = 0; i < values.length; i++) {
			promises.push(getOtherDoc(collection, field, values[i]));
		}

		let otherValues = await Promise.all(promises).catch((e) => {
			alert("Error getting random docs from database");
		});

		return otherValues;
	}, []);

	// Read n random docs in a given collection and return the given doc fields
	const getRandomDocs = useCallback(async (collection, field, n) => {
		var promises = [];

		for (let i = 0; i < n; i++) {
			promises.push(getRandomDocument(collection, field));
		}

		let randomIds = await Promise.all(promises).catch((e) => {
			alert("Error getting random docs from database");
		});

		return randomIds;
	}, []);

	// Hook to generate 5 random docs with 5 alternate docs as well for comparison survey questions
	// Initialises the state of the comparison responses as well
	useEffect(() => {
		const getAlternateDocs = async (collection, field) => {
			let doc_ids = await getRandomDocs(collection, field, 5).catch(
				(error) => {
					alert(error);
				}
			);

			let other_ids = await getOtherDocs(
				collection,
				field,
				doc_ids
			).catch((error) => {
				alert(error);
			});

			let comparisonIds = [];
			for (let i = 0; i < doc_ids.length; i++) {
				comparisonIds.push(doc_ids[i]);
				comparisonIds.push(other_ids[i]);
			}

			// Only needed if the doc id is not the thing we need
			if (collection === "datasets") {
				let promises = [];

				comparisonIds.forEach((id) => {
					promises.push(getDocField(collection, id, "name"));
				});

				comparisonIds = await Promise.all(promises).catch((err) => {
					alert(err);
				});
			}

			setComparisonIds(comparisonIds);

			console.log("Comparison Ids", comparisonIds);

			var responses = {};

			comparisonIds.forEach((id) => {
				responses[id] = { yea: 0, nay: 0 };
			});

			setComparisonReponses(responses);
		};

		getAlternateDocs("datasets", "__name__");
	}, [getRandomDocs, getOtherDocs]);

	// Hook to generate 5 random docs for 4 point scale questions
	useEffect(() => {
		const getIds = async (collection, field) => {
			let ids = await getRandomDocs(collection, field, 5).catch((error) =>
				alert(error)
			);

			console.log("4 point ids", ids);
			setFourPointIds(ids);

			var responses = {};

			ids.forEach((id) => {
				responses[id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
			});

			setFourPointResponses(responses);
		};

		getIds("datasets", "name");
	}, [getRandomDocs]);

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
