import React from "react";
import { useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import Fab from "@material-ui/core/Fab";

import NavBarMark from "./NavBarMark";
import { darkTheme } from "../components/react/darkTheme";
import Comparison from "../components/react/Comparision";
import FourPointScale from "../components/react/FourPointScale";

export default function Mark() {
  const [stage, setStage] = useState(1);

  const useStyles = makeStyles((theme) => ({
    root: {
      color: darkTheme.palette.text.primary,
    },
  }));

  const handleNext = () => {
    setStage(stage + 1);
  };

  const renderSurveyQuestion = () => {
    if (stage <= 5) {
      return <Comparison />;
    } else {
      return <FourPointScale />;
    }
  };

  const renderButton = () => {
    if (stage === 10) {
      return (
        <Fab
          // color="secondary"
          variant="extended"
          href="/"
          className={classes.button}
        >
          Finish and Submit
        </Fab>
      );
    } else {
      return (
        <Fab
          color="secondary"
          variant="extended"
          onClick={handleNext}
          className={classes.button}
        >
          Next
        </Fab>
      );
    }
  };

  const classes = useStyles();

  return (
    <ThemeProvider theme={darkTheme}>
      <NavBarMark progress={stage * 10} />
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="space-evenly"
        spacing={4}
        className={classes.root}
      >
        {renderSurveyQuestion()}
        <Grid item>{renderButton()}</Grid>
      </Grid>
    </ThemeProvider>
  );
}
