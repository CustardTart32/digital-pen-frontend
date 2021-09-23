import React, { useEffect } from "react";
import { useState } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import CanvasPractice from "./containers/CanvasPractice";
import CanvasTimed from "./containers/CanvasTimed";
import Home from "./containers/Home";
import Mark from "./containers/Mark";
import CanvasIntro from "./containers/CanvasIntro";
import ConsentForm from "./containers/ConsentForm";

import fire from "./config/firebase";

export default function App() {
	const [uid, setUid] = useState(fire.auth().currentUser);

	useEffect(() => {
		const unsubscribe = fire.auth().onAuthStateChanged((user) => {
			if (user) {
				setUid(user.uid);
			} else {
				setUid(null);
			}
		});

		return () => {
			unsubscribe();
		};
	}, []);

	// TODO: If possible, find a better way to solve the unscrollable survey rather than a hard refresh of the page
	return (
		<Router>
			<Switch>
				<Route path="/canvas/intro">
					{uid == null ? <Redirect to="/" /> : <CanvasIntro />}
				</Route>
				<Route path="/mark/force">
					<Mark />
				</Route>
				<Route path="/mark">
					{uid === null ? <Redirect to="/" /> : <Mark />}
				</Route>
				<Route path="/canvas/practice">
					{uid === null ? (
						<Redirect to="/" />
					) : (
						<CanvasPractice uid={uid} />
					)}
				</Route>
				<Route path="/canvas/test">
					{uid === null ? (
						<Redirect to="/" />
					) : (
						<CanvasTimed uid={uid} />
					)}
				</Route>
				<Route path="/consent/canvas">
					{uid === null ? (
						<ConsentForm link={"/canvas/intro"} />
					) : (
						<Redirect to="/canvas/intro" />
					)}
				</Route>
				<Route path="/consent/mark">
					{uid === null ? (
						<ConsentForm link={"/mark"} />
					) : (
						<Redirect to="/mark" />
					)}
				</Route>
				<Route path="/" exact>
					<Home />
				</Route>
			</Switch>
		</Router>
	);
}
